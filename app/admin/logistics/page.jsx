'use client'
import { useEffect, useState } from "react"
import { Truck, Check, X, Eye } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminLogisticsPage() {
  const [allApplications, setAllApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectionModal, setRejectionModal] = useState({ open: false, appId: null, message: "" })
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedApp, setSelectedApp] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/logistics/register", {
        method: "GET",
      })
      
      if (response.ok) {
        const data = await response.json()
        setAllApplications(data.applications || [])
      } else if (response.status === 401) {
        toast.error("Please sign in to access this page")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to load applications")
      }
    } catch (error) {
      console.error("Error fetching logistics applications:", error)
      toast.error("Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const response = await fetch("/api/logistics/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        toast.success("Application approved!")
        fetchApplications()
      } else {
        toast.error("Failed to approve")
      }
    } catch (error) {
      console.error("Error approving:", error)
      toast.error("Failed to approve")
    }
  }

  const handleReject = async () => {
    if (!rejectionModal.message.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    try {
      const response = await fetch("/api/logistics/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: rejectionModal.appId,
          rejectionMessage: rejectionModal.message
        }),
      })

      if (response.ok) {
        toast.success("Application rejected")
        setRejectionModal({ open: false, appId: null, message: "" })
        fetchApplications()
      } else {
        toast.error("Failed to reject")
      }
    } catch (error) {
      console.error("Error rejecting:", error)
      toast.error("Failed to reject")
    }
  }

  const getFilteredApplications = () => {
    switch (activeTab) {
      case "pending":
        return allApplications.filter(app => app.status === "pending")
      case "approved":
        return allApplications.filter(app => app.status === "approved")
      case "rejected":
        return allApplications.filter(app => app.status === "rejected")
      default:
        return allApplications
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>,
      approved: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Approved</span>,
      rejected: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Rejected</span>,
    }
    return badges[status] || badges.pending
  }

  const getStatusCounts = () => {
    return {
      all: allApplications.length,
      pending: allApplications.filter(app => app.status === "pending").length,
      approved: allApplications.filter(app => app.status === "approved").length,
      rejected: allApplications.filter(app => app.status === "rejected").length,
    }
  }

  const counts = getStatusCounts()
  const filteredApps = getFilteredApplications()

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">Logistics <span className="text-slate-800 font-medium">Provider Management</span></h1>
      
      {/* Tabs */}
      <div className="flex gap-1 mt-6 mb-8 border-b border-slate-200">
        {[
          { key: 'pending', label: 'Pending Review', count: counts.pending },
          { key: 'approved', label: 'Approved', count: counts.approved },
          { key: 'rejected', label: 'Rejected', count: counts.rejected },
          { key: 'all', label: 'All Logistics', count: counts.all }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label} 
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {filteredApps.length ? (
        <div className="flex flex-col gap-4 mt-4">
          {filteredApps.map((app) => (
            <div key={app.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 max-w-6xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{app.companyName}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-gray-600 text-sm">馃摟 {app.email}</p>
                  <p className="text-gray-600 text-sm">馃摓 {app.phone}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-700">
                      <strong>Contact Person:</strong> {app.contactName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Service Regions:</strong> {Array.isArray(app.regions) ? app.regions.join(", ") : "N/A"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Pricing:</strong> {app.pricing || "N/A"}
                    </p>
                  </div>
                  {app.status === "rejected" && app.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs text-red-800">
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedApp(app)
                      setViewModalOpen(true)
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    title="View Details"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {app.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectionModal({ open: true, appId: app.id, message: "" })}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Truck className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-600">No {activeTab === "all" ? "" : activeTab} applications</p>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Application Details</h3>
            <div className="space-y-3">
              <div>
                <strong>Company Name:</strong> {selectedApp.companyName}
              </div>
              <div>
                <strong>Status:</strong> {getStatusBadge(selectedApp.status)}
              </div>
              <div>
                <strong>Email:</strong> {selectedApp.email}
              </div>
              <div>
                <strong>Phone:</strong> {selectedApp.phone}
              </div>
              <div>
                <strong>Contact Person:</strong> {selectedApp.contactName || "N/A"}
              </div>
              <div>
                <strong>Service Regions:</strong> 
                <div className="mt-1">
                  {Array.isArray(selectedApp.regions) ? (
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {selectedApp.regions.map((region, idx) => (
                        <li key={idx}>{region}</li>
                      ))}
                    </ul>
                  ) : "N/A"}
                </div>
              </div>
              <div>
                <strong>Pricing:</strong> {selectedApp.pricing || "N/A"}
              </div>
              {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <strong>Rejection Reason:</strong> {selectedApp.rejectionReason}
                </div>
              )}
              <div>
                <strong>Applied On:</strong> {new Date(selectedApp.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejection. This will be sent to the applicant.</p>
            <textarea
              value={rejectionModal.message}
              onChange={(e) => setRejectionModal({ ...rejectionModal, message: e.target.value })}
              placeholder="Enter rejection reason..."
              className="w-full h-32 p-3 border rounded-lg mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRejectionModal({ open: false, appId: null, message: "" })}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
