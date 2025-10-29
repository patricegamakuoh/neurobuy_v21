'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import LogisticsService from '@/components/LogisticsService'
import PageTitle from '@/components/PageTitle'

export default function LogisticsServicePage() {
  const { user, isLoaded } = useUser()
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedLogistics, setSelectedLogistics] = useState(null)
  const [userData, setUserData] = useState(null)
  const [storeData, setStoreData] = useState(null)

  const handleLogisticsSelect = (logisticsProvider) => {
    setSelectedLogistics(logisticsProvider)
  }

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && isLoaded) {
        try {
          const response = await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              name: user.fullName,
              imageUrl: user.imageUrl,
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            setUserData(data.user)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }

    fetchUserData()
  }, [user, isLoaded])

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

  // Reset dependent fields when parent changes
  const handleCountryChange = (country) => {
    setSelectedCountry(country)
    setSelectedProvince('')
    setSelectedRegion('')
    setSelectedDistrict('')
  }

  const handleProvinceChange = (province) => {
    setSelectedProvince(province)
    setSelectedRegion('')
    setSelectedDistrict('')
  }

  const regions = {
    'Cameroon': {
      'Adamawa': { cities: ['Ngaoundéré', 'Meiganga', 'Banyo', 'Tibati'], districts: ['Djérem', 'Faro-et-Déo', 'Mayo-Banyo', 'Mbéré', 'Vina'] },
      'Centre': { cities: ['Yaoundé', 'Mbankomo', 'Ngomedzap', 'Makak'], districts: ['Yaoundé I', 'Yaoundé II', 'Yaoundé III', 'Yaoundé IV', 'Yaoundé V', 'Yaoundé VI', 'Yaoundé VII'] },
      'East': { cities: ['Bertoua', 'Abong-Mbang', 'Bélabo', 'Batouri'], districts: ['Bouba-Njida', 'Djam-et-Lobo', 'Kadey', 'Lom-et-Djerem'] },
      'Far North': { cities: ['Maroua', 'Kousseri', 'Mora', 'Kaélé'], districts: ['Diamaré', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava'] },
      'Littoral': { cities: ['Douala', 'Bonaléa', 'Édéa', 'Melong'], districts: ['Douala I', 'Douala II', 'Douala III', 'Douala IV', 'Douala V'] },
      'North': { cities: ['Garoua', 'Lagdo', 'Poli', 'Guider'], districts: ['Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey'] },
      'Northwest': { cities: ['Bamenda', 'Bafut', 'Wum', 'Bali'], districts: ['Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia'] },
      'South': { cities: ['Ebolowa', 'Kribi', 'Akonolinga', 'Sangmélima'], districts: ['Dja-et-Lobo', 'Mvila', 'Océan', 'Vallée-du-Ntem'] },
      'Southwest': { cities: ['Buea', 'Limbe', 'Kumba', 'Tiko'], districts: ['Fako', 'Lebialem', 'Manyu', 'Meme', 'Ndian'] },
      'West': { cities: ['Bafoussam', 'Dschang', 'Foumban', 'Mbouda'], districts: ['Bamboutos', 'Hauts-Plateaux', 'Koung-Khi', 'Menoua', 'Mifi', 'Ndé', 'Noun'] }
    },
    'Nigeria': {
      'Lagos State': { cities: ['Lagos', 'Ikeja', 'Victoria Island', 'Lekki'], districts: ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa'] },
      'Federal Capital Territory': { cities: ['Abuja', 'Gwarinpa', 'Wuse', 'Maitama'], districts: ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'] },
      'Kano State': { cities: ['Kano', 'Tarauni', 'Fagge', 'Dala'], districts: ['Gwale', 'Kano Municipal', 'Kumbotso', 'Nassarawa', 'Ungogo'] },
      'Rivers State': { cities: ['Port Harcourt', 'Owerri', 'Elele', 'Omoku'], districts: ['Abua-Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni'] },
      'Kaduna State': { cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Ikara'], districts: ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara'] }
    },
    'Ghana': {
      'Greater Accra': { cities: ['Accra', 'Tema', 'Teshie', 'Nungua'], districts: ['Accra Metropolitan', 'Tema Metropolitan', 'Ga East', 'Ga South', 'Ledzokuku-Krowor'] },
      'Ashanti': { cities: ['Kumasi', 'Obuasi', 'Mampong', 'Konongo'], districts: ['Kumasi Metropolitan', 'Old Tafo', 'Suame', 'Asokwa', 'Kwadaso'] },
      'Northern': { cities: ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla'], districts: ['Tamale Metropolitan', 'Sagnarigu', 'Savelugu-Nanton', 'Yendi Municipal', 'Karaga'] },
      'Western': { cities: ['Takoradi', 'Cape Coast', 'Elmina', 'Sekondi'], districts: ['Sekondi-Takoradi Metropolitan', 'Cape Coast Metropolitan', 'Komenda-Edina-Eguafo-Abirem', 'Mfantseman', 'Gomoa'] }
    },
    'Kenya': {
      'Nairobi': { cities: ['Nairobi', 'Westlands', 'Karen', 'Runda'], districts: ['Dagoretti', 'Embakasi', 'Kamukunji', 'Kasarani', 'Kibra'] },
      'Mombasa': { cities: ['Mombasa', 'Likoni', 'Nyali', 'Shanzu'], districts: ['Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni'] },
      'Kisumu': { cities: ['Kisumu', 'Kombewa', 'Maseno', 'Ahero'], districts: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyando'] },
      'Nakuru': { cities: ['Nakuru', 'Naivasha', 'Gilgil', 'Molo'], districts: ['Nakuru Town East', 'Nakuru Town West', 'Molo', 'Naivasha', 'Kuresoi'] }
    },
    'Senegal': {
      'Dakar': { cities: ['Dakar', 'Thiès', 'Rufisque', 'Guédiawaye'], districts: ['Almadies', 'Dakar Plateau', 'Grand Dakar', 'Grand Yoff', 'Hann Bel-Air'] },
      'Thiès': { cities: ['Thiès', 'Mbour', 'Tivaouane', 'Khor'], districts: ['Mbour', 'Thiès', 'Tivaouane', 'Thiadiaye', 'Notto'] },
      'Ziguinchor': { cities: ['Ziguinchor', 'Bignona', 'Oussouye', 'Sédhiou'], districts: ['Ziguinchor', 'Bignona', 'Oussouye', 'Tendouck'] },
      'Saint-Louis': { cities: ['Saint-Louis', 'Richard Toll', 'Podor', 'Dagana'], districts: ['Saint-Louis', 'Dagana', 'Podor', 'Linguère'] }
    },
    'Ivory Coast': {
      'Abidjan': { cities: ['Abidjan', 'Cocody', 'Yopougon', 'Marcory'], districts: ['Abobo', 'Adjamé', 'Attecoubé', 'Cocody', 'Marcory'] },
      'Yamoussoukro': { cities: ['Yamoussoukro', 'Toumodi', 'Tiébissou', 'Didiévi'], districts: ['Yamoussoukro', 'Attiégouakro', 'N\'Gattakro'] },
      'Bouaké': { cities: ['Bouaké', 'Katiola', 'Sakassou', 'M\'bahiakro'], districts: ['Bouaké', 'Katiola', 'Sakassou', 'Brobo'] },
      'Daloa': { cities: ['Daloa', 'Issia', 'Vavoua', 'Guéguéré'], districts: ['Daloa', 'Issia', 'Vavoua', 'Haut-Sassandra'] }
    }
  }
  
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access logistics services.</p>
        </div>
      </div>
    )
  }

  // Determine if user is a store owner
  const isStoreOwner = storeData && storeData.status === 'approved'

  // If not a store owner, redirect to registration
  if (!isStoreOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only store owners can find logistics providers.</p>
          <Link href="/logistics-service/register" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            Become a Logistics Provider
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mx-6">
      <div className="max-w-7xl mx-auto">
        <PageTitle heading="Find Delivery Partners" text="Browse and connect with logistics partners for your deliveries" />
        
        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Country Selector */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Countries</option>
              {Object.keys(regions).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Province/State Selector */}
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
              Province/State
            </label>
            <select
              id="province"
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={!selectedCountry}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{selectedCountry ? 'All' : 'Select country'}</option>
              {selectedCountry && Object.keys(regions[selectedCountry] || {}).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* City Selector */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="city"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              disabled={!selectedProvince}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{selectedProvince ? 'All Cities' : 'Select province'}</option>
              {selectedCountry && selectedProvince && regions[selectedCountry]?.[selectedProvince]?.cities?.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
              District
            </label>
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedRegion}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{selectedRegion ? 'All Districts' : 'Select city'}</option>
              {selectedCountry && selectedProvince && regions[selectedCountry]?.[selectedProvince]?.districts?.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 text-center space-y-4">
          {isStoreOwner ? (
            <>
              {/* Store owners see both options */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/logistics-service/register"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Become a Logistics Provider
                </Link>
                <div className="text-gray-500 font-medium">OR</div>
                <div className="text-gray-600 font-medium">
                  Find logistics providers below ⬇️
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Non-store owners only see registration */}
              <Link 
                href="/logistics-service/register"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Become a Logistics Provider
              </Link>
            </>
          )}
        </div>

        {/* Only show logistics providers list for store owners */}
        {isStoreOwner && (
          <LogisticsService 
            onLogisticsSelect={handleLogisticsSelect}
            selectedRegion={selectedRegion}
          />
        )}

        {selectedLogistics && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Selected Logistics Partner
            </h3>
            <div className="text-green-700">
              <p><strong>Company:</strong> {selectedLogistics.companyName}</p>
              <p><strong>Contact:</strong> {selectedLogistics.contactName}</p>
              <p><strong>Email:</strong> {selectedLogistics.email}</p>
              <p><strong>Phone:</strong> {selectedLogistics.phone}</p>
              <p><strong>Regions:</strong> {selectedLogistics.regions.join(', ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
