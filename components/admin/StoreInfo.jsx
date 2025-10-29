'use client'
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"

const StoreInfo = ({store}) => {
    // Handle the data structure from the API
    const storeData = {
        name: store.storeName || store.store_name || store.name || 'Unknown Store',
        username: store.username || 'No username',
        description: store.description || 'No description provided',
        email: store.email || 'No email provided',
        contact: store.contact || 'No contact provided',
        address: store.address || 'No address provided',
        image_url: store.imageUrl || store.image_url,
        status: store.status || 'unknown',
        created_at: store.createdAt || store.created_at,
        user: store.users || store.user || {}
    }

    return (
        <div className="flex-1 space-y-2 text-sm">
            {/* Store Logo/Image */}
            {storeData.image_url ? (
                <Image 
                    width={100} 
                    height={100} 
                    src={storeData.image_url} 
                    alt={storeData.name} 
                    className="max-w-20 max-h-20 object-contain shadow rounded-full max-sm:mx-auto" 
                />
            ) : (
                <div className="max-w-20 max-h-20 bg-slate-100 rounded-full flex items-center justify-center shadow">
                    <span className="text-slate-400 text-xs">No logo</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <h3 className="text-xl font-semibold text-slate-800">{storeData.name}</h3>
                {storeData.username && <span className="text-sm text-slate-500">@{storeData.username}</span>}

                {/* Status Badge */}
                <span
                    className={`text-xs font-semibold px-4 py-1 rounded-full ${
                        storeData.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : storeData.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : storeData.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {storeData.status}
                </span>
            </div>

            <p className="text-slate-600 my-5 max-w-2xl">{storeData.description}</p>
            
            {storeData.address && (
                <p className="flex items-center gap-2">
                    <MapPin size={16} /> {storeData.address}
                </p>
            )}
            
            {storeData.contact && (
                <p className="flex items-center gap-2">
                    <Phone size={16} /> {storeData.contact}
                </p>
            )}
            
            {storeData.email && (
                <p className="flex items-center gap-2">
                    <Mail size={16} /> {storeData.email}
                </p>
            )}

            <p className="text-slate-700 mt-5">
                Applied on <span className="text-xs">
                    {storeData.created_at ? new Date(storeData.created_at).toLocaleDateString() : 'Unknown date'}
                </span> by
            </p>

            <div className="flex items-center gap-2 text-sm">
                {/* User Avatar */}
                {storeData.user.image ? (
                    <Image 
                        width={36} 
                        height={36} 
                        src={storeData.user.image} 
                        alt={storeData.user.name || 'User'} 
                        className="w-9 h-9 rounded-full" 
                    />
                ) : (
                    <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs text-slate-500">?</span>
                    </div>
                )}
                
                <div>
                    <p className="text-slate-600 font-medium">
                        {storeData.user.name || storeData.user.email || 'Unknown User'}
                    </p>
                    <p className="text-slate-400">
                        {storeData.user.email || 'No email'}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo