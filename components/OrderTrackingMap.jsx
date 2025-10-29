'use client'
import { useEffect, useRef, useState } from 'react'

export default function OrderTrackingMap({ 
  pickupLocation, 
  deliveryLocation, 
  currentLocation,
  height = '400px' 
}) {
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    const loadMap = async () => {
      if (typeof window === 'undefined' || mapRef.current) return

      try {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)

          const L = window.L

          // Initialize map
          const map = L.map('tracking-map', {
            center: [7.3697, 12.3547],
            zoom: 6
          })

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)

          mapRef.current = map
          setMapLoaded(true)
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error('Error loading map:', error)
      }
    }

    loadMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const L = window.L
    const map = mapRef.current

    // Clear existing markers and routes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    const markers = []

    // Add pickup location
    if (pickupLocation && pickupLocation.lat && pickupLocation.lng) {
      const pickupIcon = L.divIcon({
        className: 'custom-pin pickup-pin',
        html: `
          <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
            <div style="background-color: #10b981; color: white; padding: 12px; border-radius: 50%; font-size: 24px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: bounce 2s infinite;">
              📦
            </div>
          </div>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 50]
      })
      const pickupMarker = L.marker([pickupLocation.lat, pickupLocation.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<b>📦 Pickup Location</b><br>${pickupLocation.address || ''}<br>Lat: ${pickupLocation.lat}, Lng: ${pickupLocation.lng}`)
      markers.push(pickupMarker)
    }

    // Add current location (if in transit)
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      // Determine icon based on location type
      const status = currentLocation.status || 'domestic' // 'international', 'domestic', 'last-mile'
      let iconHTML = ''
      
      if (status === 'international') {
        // Plane for international transit
        iconHTML = `
          <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
            <div style="background-color: #3b82f6; color: white; padding: 12px; border-radius: 50%; font-size: 28px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: movePlan 3s ease-in-out infinite;">
              ✈️
            </div>
          </div>
        `
      } else if (status === 'last-mile') {
        // Delivery bike for last-mile delivery
        iconHTML = `
          <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
            <div style="background-color: #f59e0b; color: white; padding: 12px; border-radius: 50%; font-size: 28px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: rotateBike 2s ease-in-out infinite;">
              🏍️
            </div>
          </div>
        `
      } else {
        // Truck for domestic transit
        iconHTML = `
          <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
            <div style="background-color: #f59e0b; color: white; padding: 12px; border-radius: 50%; font-size: 28px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: moveTruck 2s ease-in-out infinite;">
              🚚
            </div>
          </div>
        `
      }
      
      const currentIcon = L.divIcon({
        className: 'custom-pin current-pin',
        html: iconHTML,
        iconSize: [60, 60],
        iconAnchor: [30, 50]
      })
      const statusText = status === 'international' ? '✈️ International Transit' : status === 'last-mile' ? '🏍️ Last-Mile Delivery' : '🚚 Domestic Transit'
      const currentMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: currentIcon })
        .addTo(map)
        .bindPopup(`<b>${statusText}</b><br>In Transit<br>Lat: ${currentLocation.lat}, Lng: ${currentLocation.lng}`)
      markers.push(currentMarker)
    }

    // Add delivery location
    if (deliveryLocation && deliveryLocation.lat && deliveryLocation.lng) {
      const deliveryIcon = L.divIcon({
        className: 'custom-pin delivery-pin',
        html: `
          <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
            <div style="background-color: #ef4444; color: white; padding: 12px; border-radius: 50%; font-size: 28px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;">
              🏠
            </div>
          </div>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 50]
      })
      const deliveryMarker = L.marker([deliveryLocation.lat, deliveryLocation.lng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup(`<b>🏠 Delivery Location</b><br>${deliveryLocation.address || ''}<br>Lat: ${deliveryLocation.lat}, Lng: ${deliveryLocation.lng}`)
      markers.push(deliveryMarker)
    }

    // Draw route line if we have multiple locations
    if (markers.length >= 2) {
      const routePoints = markers.map(marker => marker.getLatLng())
      const routeLine = L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map)
      markers.push(routeLine)
    }

    // Fit bounds to show all markers
    if (markers.length > 0) {
      try {
        if (markers.length === 1) {
          // If only one marker, just center on it
          map.setView(markers[0].getLatLng(), 10)
        } else if (markers.length > 1) {
          // For multiple markers, fit bounds
          const group = new L.featureGroup(markers)
          const bounds = group.getBounds()
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      } catch (error) {
        console.error('Error fitting bounds:', error)
        // Fallback: center on first marker if available
        if (markers.length > 0) {
          map.setView(markers[0].getLatLng(), 10)
        }
      }
    }
  }, [pickupLocation, deliveryLocation, currentLocation, mapLoaded])

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
      <div id="tracking-map" className="w-full h-full" style={{ zIndex: 0 }}></div>
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading tracking map...</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-white px-3 py-2 rounded-lg shadow-lg text-xs" style={{ zIndex: 1000 }}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base">📦</span>
            <span className="font-medium">Pickup Location</span>
          </div>
          {currentLocation && (
            <div className="flex items-center gap-2">
              {currentLocation.status === 'international' && <span className="text-base">✈️</span>}
              {currentLocation.status === 'last-mile' && <span className="text-base">🏍️</span>}
              {(!currentLocation.status || currentLocation.status === 'domestic') && <span className="text-base">🚚</span>}
              <span className="font-medium">
                {currentLocation.status === 'international' && 'International Transit'}
                {currentLocation.status === 'last-mile' && 'Last-Mile Delivery'}
                {(!currentLocation.status || currentLocation.status === 'domestic') && 'Domestic Transit'}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-base">🏠</span>
            <span className="font-medium">Delivery Location</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes movePlan {
          0% {
            transform: translateX(-5px) translateY(-5px);
          }
          25% {
            transform: translateX(5px) translateY(0px);
          }
          50% {
            transform: translateX(5px) translateY(5px);
          }
          75% {
            transform: translateX(-5px) translateY(0px);
          }
          100% {
            transform: translateX(-5px) translateY(-5px);
          }
        }
        
        @keyframes moveTruck {
          0% {
            transform: translateX(-8px);
          }
          50% {
            transform: translateX(8px);
          }
          100% {
            transform: translateX(-8px);
          }
        }
        
        @keyframes rotateBike {
          0% {
            transform: rotate(-15deg) translateX(-5px);
          }
          50% {
            transform: rotate(15deg) translateX(5px);
          }
          100% {
            transform: rotate(-15deg) translateX(-5px);
          }
        }
      `}</style>
    </div>
  )
}
