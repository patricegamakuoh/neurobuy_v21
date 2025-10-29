'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const LogisticsService = ({ onLogisticsSelect, selectedRegion }) => {
  const [logistics, setLogistics] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    fetchLogistics()
  }, [selectedRegion])

  const fetchLogistics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        availableOnly: 'true'
      })
      
      if (selectedRegion) {
        params.append('region', selectedRegion)
      }

      const response = await fetch(`/api/logistics?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogistics(data.logistics || [])
      } else {
        toast.error('Failed to fetch logistics providers')
      }
    } catch (error) {
      console.error('Error fetching logistics:', error)
      toast.error('Error loading logistics providers')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectLogistics = (logisticsProvider) => {
    onLogisticsSelect(logisticsProvider)
    toast.success(`Selected ${logisticsProvider.companyName} for delivery`)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Available Logistics Partners</h3>
      
      {logistics.length === 0 ? (
        <p className="text-gray-500 text-sm">No logistics providers available for this region.</p>
      ) : (
        <div className="space-y-3">
          {logistics.map((provider) => (
            <div 
              key={provider.id} 
              className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectLogistics(provider)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{provider.companyName}</h4>
                  <p className="text-sm text-gray-600">Contact: {provider.contactName}</p>
                  <p className="text-sm text-gray-500">Email: {provider.email}</p>
                  <p className="text-sm text-gray-500">Phone: {provider.phone}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Regions:</div>
                  <div className="text-xs">
                    {provider.regions.slice(0, 2).join(', ')}
                    {provider.regions.length > 2 && ` +${provider.regions.length - 2} more`}
                  </div>
                </div>
              </div>
              
              {provider.pricing && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Pricing:</span> Available on request
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LogisticsService
