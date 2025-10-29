'use client'
import { useEffect, useRef, useState } from 'react'

// Coordinates for major African cities
const cityCoordinates = {
  // Cameroon
  'Ngaoundéré': { lat: 7.3167, lng: 13.5833 },
  'Meiganga': { lat: 6.5167, lng: 14.4500 },
  'Banyo': { lat: 6.7667, lng: 11.8167 },
  'Tibati': { lat: 6.4667, lng: 12.6333 },
  'Yaoundé': { lat: 3.8667, lng: 11.5167 },
  'Mbankomo': { lat: 3.8000, lng: 11.3833 },
  'Ngomedzap': { lat: 3.2500, lng: 11.2167 },
  'Makak': { lat: 3.8833, lng: 11.4500 },
  'Bertoua': { lat: 4.5833, lng: 14.0833 },
  'Abong-Mbang': { lat: 3.9667, lng: 13.1833 },
  'Bélabo': { lat: 4.9167, lng: 13.2833 },
  'Batouri': { lat: 4.4333, lng: 14.3667 },
  'Maroua': { lat: 10.5961, lng: 14.3156 },
  'Kousseri': { lat: 12.0833, lng: 15.0333 },
  'Mora': { lat: 11.0461, lng: 14.1403 },
  'Kaélé': { lat: 10.1167, lng: 14.4333 },
  'Douala': { lat: 4.0511, lng: 9.7678 },
  'Bonaléa': { lat: 4.2833, lng: 10.0500 },
  'Édéa': { lat: 3.8000, lng: 10.1333 },
  'Melong': { lat: 5.1167, lng: 9.9500 },
  'Garoua': { lat: 9.3014, lng: 13.3975 },
  'Lagdo': { lat: 9.0500, lng: 13.6667 },
  'Poli': { lat: 8.4833, lng: 13.2167 },
  'Guider': { lat: 9.9167, lng: 13.9500 },
  'Bamenda': { lat: 6.1667, lng: 10.1667 },
  'Bafut': { lat: 6.0833, lng: 10.0667 },
  'Wum': { lat: 6.3667, lng: 10.0667 },
  'Bali': { lat: 5.8833, lng: 10.0000 },
  'Ebolowa': { lat: 2.9333, lng: 11.1500 },
  'Kribi': { lat: 2.9500, lng: 9.9167 },
  'Akonolinga': { lat: 3.7833, lng: 12.2167 },
  'Sangmélima': { lat: 2.9333, lng: 11.9833 },
  'Buea': { lat: 4.1533, lng: 9.2428 },
  'Limbe': { lat: 4.0167, lng: 9.2000 },
  'Kumba': { lat: 4.6333, lng: 9.4333 },
  'Tiko': { lat: 4.0833, lng: 9.3833 },
  'Bafoussam': { lat: 5.4667, lng: 10.4167 },
  'Dschang': { lat: 5.4500, lng: 10.0667 },
  'Foumban': { lat: 5.7167, lng: 10.9167 },
  'Mbouda': { lat: 5.6167, lng: 10.2500 },
  // Nigeria
  'Lagos': { lat: 6.5244, lng: 3.3792 },
  'Ikeja': { lat: 6.5244, lng: 3.3420 },
  'Victoria Island': { lat: 6.4281, lng: 3.4219 },
  'Lekki': { lat: 6.4500, lng: 3.4833 },
  'Abuja': { lat: 9.0765, lng: 7.3986 },
  'Gwarinpa': { lat: 9.1500, lng: 7.4000 },
  'Wuse': { lat: 9.0833, lng: 7.4833 },
  'Maitama': { lat: 9.0833, lng: 7.4833 },
  'Kano': { lat: 12.0022, lng: 8.5917 },
  'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
  'Kaduna': { lat: 10.5264, lng: 7.4389 },
  // Ghana
  'Accra': { lat: 5.6037, lng: -0.1870 },
  'Tema': { lat: 5.6796, lng: 0.0249 },
  'Kumasi': { lat: 6.6885, lng: -1.6244 },
  'Tamale': { lat: 9.4008, lng: -0.8347 },
  'Takoradi': { lat: 4.8895, lng: -1.7514 },
  // Kenya
  'Nairobi': { lat: -1.2921, lng: 36.8219 },
  'Mombasa': { lat: -4.0435, lng: 39.6682 },
  // Senegal
  'Dakar': { lat: 14.7167, lng: -17.4672 },
  'Thiès': { lat: 14.7894, lng: -16.9260 },
  // Ivory Coast
  'Abidjan': { lat: 5.3600, lng: -4.0083 },
  'Yamoussoukro': { lat: 6.8276, lng: -5.2893 },
  'Bouaké': { lat: 7.6939, lng: -5.0303 },
  'Daloa': { lat: 6.8794, lng: -6.4503 },
}

export default function MapboxMap({ locations = [] }) {
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    const loadMap = async () => {
      if (typeof window === 'undefined' || mapRef.current) return

      try {
        // Use OpenStreetMap with Leaflet via CDN
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)

          const L = window.L

          // Initialize map
          const map = L.map('logistics-map', {
            center: [7.3697, 12.3547], // Center on Cameroon
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
    if (!mapLoaded || !mapRef.current || locations.length === 0) return

    const L = window.L
    const map = mapRef.current

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Add markers for selected locations
    const markers = []
    locations.forEach((location) => {
      const coords = cityCoordinates[location]
      if (coords) {
        const marker = L.marker([coords.lat, coords.lng])
          .addTo(map)
          .bindPopup(`<b>${location}</b><br>Lat: ${coords.lat}, Lng: ${coords.lng}`)
        markers.push(marker)
      }
    })

    // Position map to show markers
    if (markers.length > 0) {
      try {
        // Always use setView instead of fitBounds to avoid errors
        if (markers.length === 1) {
          // Center on the single marker
          const latLng = markers[0].getLatLng()
          if (latLng && typeof latLng.lat === 'number' && typeof latLng.lng === 'number' && !isNaN(latLng.lat) && !isNaN(latLng.lng)) {
            map.setView([latLng.lat, latLng.lng], 12)
          }
        } else {
          // For multiple markers, calculate center and zoom
          let sumLat = 0, sumLng = 0
          let validCount = 0
          
          markers.forEach(marker => {
            const latLng = marker.getLatLng()
            if (latLng && typeof latLng.lat === 'number' && typeof latLng.lng === 'number' && !isNaN(latLng.lat) && !isNaN(latLng.lng)) {
              sumLat += latLng.lat
              sumLng += latLng.lng
              validCount++
            }
          })
          
          if (validCount > 0) {
            const centerLat = sumLat / validCount
            const centerLng = sumLng / validCount
            
            // Zoom based on number of markers
            const zoomLevel = validCount === 1 ? 12 : validCount <= 3 ? 6 : 5
            map.setView([centerLat, centerLng], zoomLevel)
          }
        }
      } catch (error) {
        console.error('Error positioning map:', error)
        // Fallback to default Cameroon view
        map.setView([7.3697, 12.3547], 6)
      }
    }
  }, [locations, mapLoaded])

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <div id="logistics-map" className="w-full h-full" style={{ zIndex: 0 }}></div>
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center" style={{ zIndex: 1 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading interactive map...</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 right-2 bg-white px-3 py-2 rounded-lg shadow-lg text-xs" style={{ zIndex: 1000 }}>
        <strong>Locations:</strong> {locations.length}
      </div>
    </div>
  )
}
