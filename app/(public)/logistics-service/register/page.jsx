'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import PageTitle from '@/components/PageTitle'
import toast from 'react-hot-toast'

// Import the simplified map component
const MapboxMap = dynamic(() => import('@/components/MapboxMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading...</div>
})

export default function LogisticsRegisterPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
  })
  const [selectedRegions, setSelectedRegions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [storeData, setStoreData] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedProvinces, setSelectedProvinces] = useState([])

  const regions = {
    'Cameroon': {
      'Adamawa': ['Ngaoundéré', 'Meiganga', 'Banyo', 'Tibati'],
      'Centre': ['Yaoundé', 'Mbankomo', 'Ngomedzap', 'Makak'],
      'East': ['Bertoua', 'Abong-Mbang', 'Bélabo', 'Batouri'],
      'Far North': ['Maroua', 'Kousseri', 'Mora', 'Kaélé'],
      'Littoral': ['Douala', 'Bonaléa', 'Édéa', 'Melong'],
      'North': ['Garoua', 'Lagdo', 'Poli', 'Guider'],
      'Northwest': ['Bamenda', 'Bafut', 'Wum', 'Bali'],
      'South': ['Ebolowa', 'Kribi', 'Akonolinga', 'Sangmélima'],
      'Southwest': ['Buea', 'Limbe', 'Kumba', 'Tiko'],
      'West': ['Bafoussam', 'Dschang', 'Foumban', 'Mbouda']
    },
    'Nigeria': {
      'Lagos State': ['Lagos', 'Ikeja', 'Victoria Island', 'Lekki'],
      'Federal Capital Territory': ['Abuja', 'Gwarinpa', 'Wuse', 'Maitama'],
      'Kano State': ['Kano', 'Tarauni', 'Fagge', 'Dala'],
      'Rivers State': ['Port Harcourt', 'Owerri', 'Elele', 'Omoku'],
      'Kaduna State': ['Kaduna', 'Zaria', 'Kafanchan', 'Ikara']
    },
    'Ghana': {
      'Greater Accra': ['Accra', 'Tema', 'Teshie', 'Nungua'],
      'Ashanti': ['Kumasi', 'Obuasi', 'Mampong', 'Konongo'],
      'Northern': ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla'],
      'Western': ['Takoradi', 'Cape Coast', 'Elmina', 'Sekondi']
    },
    'Kenya': {
      'Nairobi': ['Nairobi', 'Westlands', 'Karen', 'Runda'],
      'Mombasa': ['Mombasa', 'Likoni', 'Nyali', 'Shanzu'],
      'Kisumu': ['Kisumu', 'Kombewa', 'Maseno', 'Ahero'],
      'Nakuru': ['Nakuru', 'Naivasha', 'Gilgil', 'Molo']
    },
    'Senegal': {
      'Dakar': ['Dakar', 'Thiès', 'Rufisque', 'Guédiawaye'],
      'Thiès': ['Thiès', 'Mbour', 'Tivaouane', 'Khor'],
      'Ziguinchor': ['Ziguinchor', 'Bignona', 'Oussouye', 'Sédhiou'],
      'Saint-Louis': ['Saint-Louis', 'Richard Toll', 'Podor', 'Dagana']
    },
    'Ivory Coast': {
      'Abidjan': ['Abidjan', 'Cocody', 'Yopougon', 'Marcory'],
      'Yamoussoukro': ['Yamoussoukro', 'Toumodi', 'Tiébissou', 'Didiévi'],
      'Bouaké': ['Bouaké', 'Katiola', 'Sakassou', 'M\'bahiakro'],
      'Daloa': ['Daloa', 'Issia', 'Vavoua', 'Guéguéré']
    }
  }

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      if (user && isLoaded) {
        try {
          const response = await fetch('/api/stores')
          if (response.ok) {
            const { store } = await response.json()
            setStoreData(store)
          }
        } catch (error) {
          console.error('Error fetching store data:', error)
        }
      }
    }

    fetchStoreData()
  }, [user, isLoaded])

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <button onClick={() => router.push('/sign-in')} className="px-6 py-2 bg-emerald-600 text-white rounded">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const handleRegionToggle = (city) => {
    setSelectedRegions(prev => 
      prev.includes(city) ? prev.filter(r => r !== city) : [...prev, city]
    )
  }

  const handleCountryChange = (country) => {
    setSelectedCountry(country)
    setSelectedProvinces([])
    setSelectedRegions([]) // Clear selected cities when country changes
  }

  const handleProvinceToggle = (province) => {
    setSelectedProvinces(prev => {
      if (prev.includes(province)) {
        // Remove province and all its cities from selection
        const provinceCities = regions[selectedCountry]?.[province] || []
        const updatedCities = selectedRegions.filter(city => !provinceCities.includes(city))
        setSelectedRegions(updatedCities)
        return prev.filter(p => p !== province)
      } else {
        return [...prev, province]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.companyName || !formData.phone || selectedRegions.length === 0) {
      toast.error('Please fill all required fields')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/logistics/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: formData.email || user.emailAddresses[0]?.emailAddress,
          regions: selectedRegions
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Registration submitted! Pending approval.')
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen mx-6 my-8">
      <div className="max-w-3xl mx-auto">
        <PageTitle heading="Register Logistics Service" text="Provide delivery services to sellers" />

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            ℹ️ Logistics Provider Registration
          </h3>
          <p className="text-sm text-blue-700">
            Anyone can register to become a logistics provider. Your registration will be reviewed by an admin. Once approved, sellers will be able to find and contact you for their delivery needs.
          </p>
        </div>

        {/* Note for store owners */}
        {storeData && storeData.status === 'approved' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              <strong>Note:</strong> As a store owner, you can also use logistics services by going back to the <Link href="/logistics-service" className="underline font-medium">Logistics Services</Link> page to find delivery partners.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Name *</label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email || user.emailAddresses[0]?.emailAddress || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="+237 XXX XXX XXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Regions *</label>
            
            {/* Country Selector */}
            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-1">Select Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Choose a country...</option>
                {Object.keys(regions).map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Provinces Checkboxes */}
            {selectedCountry && (
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">Select Provinces/States (Optional)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {Object.keys(regions[selectedCountry] || {}).map(province => (
                    <label key={province} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedProvinces.includes(province)}
                        onChange={() => handleProvinceToggle(province)}
                        className="rounded"
                      />
                      <span className="text-sm">{province}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Cities Checkboxes - Show all selected provinces' cities */}
            {selectedProvinces.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">Select Cities</label>
                <div className="space-y-3 max-h-64 overflow-y-auto p-2 border rounded-md">
                  {selectedProvinces.map(province => (
                    <div key={province} className="border-b pb-2 last:border-b-0">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">{province}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {regions[selectedCountry]?.[province]?.map(city => (
                          <label key={city} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={selectedRegions.includes(city)}
                              onChange={() => handleRegionToggle(city)}
                              className="rounded"
                            />
                            <span className="text-sm">{city}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Cities Summary */}
            {selectedRegions.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600 mb-2">Selected Cities ({selectedRegions.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRegions.map(city => (
                    <span key={city} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map Display */}
            {selectedRegions.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">📍 Service Coverage Map</label>
                <MapboxMap locations={selectedRegions} />
                <p className="text-xs text-gray-500 mt-2">
                  Green pins show your selected service locations on the map above.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Register Service'}
          </button>
        </form>
      </div>
    </div>
  )
}
