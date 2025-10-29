'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminStores() {
    const [stores, setStores] = useState([])
    const [allStores, setAllStores] = useState([]) // Store counts for tabs
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending') // 'pending', 'approved', 'rejected', 'all'
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectStoreId, setRejectStoreId] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const fetchStores = async (status = null) => {
        try {
            // Always fetch all stores first to get counts for tabs
            const allResponse = await fetch('/api/admin/stores')
            if (allResponse.ok) {
                const { stores: allStoresData } = await allResponse.json()
                setAllStores(allStoresData || [])
            }

            // Fetch filtered stores based on tab
            let url = '/api/admin/stores'
            if (status && status !== 'all') {
                url += `?status=${status}`
            }
            
            const response = await fetch(url)
            
            if (response.ok) {
                const data = await response.json()
                const stores = data.stores || []
                
                // If there's a fallback flag, show a gentle message
                if (data.fallback) {
                    console.warn('Database connection issue, showing empty list')
                }
                
                setStores(stores)
            } else {
                const error = await response.json()
                console.error('API Error:', error)
                
                if (response.status === 401) {
                    toast.error('Please login to access admin panel')
                } else if (response.status === 403) {
                    toast.error('Admin access required. You need admin privileges.')
                } else {
                    toast.error(error.error || `Failed to fetch stores (${response.status})`)
                }
                // Set empty array on error so UI doesn't break
                setStores([])
            }
        } catch (error) {
            console.error('Error fetching stores:', error)
            toast.error('Failed to fetch stores')
            setStores([]) // Set empty array on error so UI doesn't break
        } finally {
            setLoading(false)
        }
    }

    const updateStoreStatus = async (storeId, status, reason = null) => {
        try {
            const response = await fetch('/api/admin/stores', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeId,
                    status,
                    rejectionReason: reason
                })
            })

            if (response.ok) {
                const { message } = await response.json()
                toast.success(message)
                // Close modal and reset
                setShowRejectModal(false)
                setRejectionReason('')
                setRejectStoreId(null)
                // Refresh the current tab
                fetchStores(activeTab === 'all' ? null : activeTab)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to update store status')
            }
        } catch (error) {
            console.error('Error updating store status:', error)
            toast.error('An error occurred')
        }
    }

    const handleRejectClick = (storeId) => {
        setRejectStoreId(storeId)
        setShowRejectModal(true)
    }

    const handleConfirmReject = () => {
        if (rejectStoreId) {
            updateStoreStatus(rejectStoreId, 'rejected', rejectionReason)
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setLoading(true)
        fetchStores(tab === 'all' ? null : tab)
    }

    useEffect(() => {
        fetchStores('pending') // Load pending stores by default
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Store <span className="text-slate-800 font-medium">Management</span></h1>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 mb-8 border-b border-slate-200">
                {[
                    { key: 'pending', label: 'Pending Review', count: allStores.filter(s => s.status === 'pending').length },
                    { key: 'approved', label: 'Approved', count: allStores.filter(s => s.status === 'approved').length },
                    { key: 'rejected', label: 'Rejected', count: allStores.filter(s => s.status === 'rejected').length },
                    { key: 'all', label: 'All Stores', count: allStores.length }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
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

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 max-w-6xl">
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Admin Actions */}
                            {store.status === 'pending' && (
                                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600">
                                            This store application is pending review. Click below to approve or reject.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleRejectClick(store.id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => updateStoreStatus(store.id, 'approved')}
                                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            Approve Store
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Status Display for non-pending */}
                            {store.status !== 'pending' && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-sm text-slate-600">
                                            Store Status: <span className={`font-medium ${
                                                store.status === 'approved' ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                                            </span>
                                        </p>
                                    </div>
                                    {store.status === 'approved' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateStoreStatus(store.id, 'rejected')}
                                                className="px-3 py-1 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                                            >
                                                Revoke Approval
                                            </button>
                                        </div>
                                    )}
                                    {store.status === 'rejected' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateStoreStatus(store.id, 'approved')}
                                                className="px-3 py-1 text-sm font-medium text-emerald-600 border border-emerald-300 rounded hover:bg-emerald-50 transition-colors"
                                            >
                                                Approve Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                        <h2 className="text-2xl text-slate-400 font-medium mb-2">
                            No {activeTab === 'all' ? '' : activeTab} stores found
                        </h2>
                        <p className="text-slate-500">
                            {activeTab === 'pending' 
                                ? 'No store applications are currently pending review.'
                                : activeTab === 'approved'
                                ? 'No stores have been approved yet.'
                                : activeTab === 'rejected'
                                ? 'No stores have been rejected.'
                                : 'No stores have been created yet.'
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Reject Store Application</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Please provide a reason for rejection:
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Incomplete information, incorrect contact details, missing documents..."
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectionReason('')
                                    setRejectStoreId(null)
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={!rejectionReason.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : <Loading />}