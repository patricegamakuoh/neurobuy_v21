'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { UploadIcon, SaveIcon, TrashIcon } from "lucide-react"

export default function StoreSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [storeInfo, setStoreInfo] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [editedInfo, setEditedInfo] = useState({
        store_name: '',
        description: '',
        email: '',
        contact: '',
        address: ''
    })

    const fetchStoreInfo = async () => {
        try {
            const response = await fetch('/api/stores')
            if (response.ok) {
                const { store } = await response.json()
                setStoreInfo(store)
                if (store?.image_url) {
                    setImagePreview(store.image_url)
                }
                // Initialize edited info with current store data
                setEditedInfo({
                    store_name: store?.store_name || '',
                    description: store?.description || '',
                    email: store?.email || '',
                    contact: store?.contact || '',
                    address: store?.address || ''
                })
            } else {
                toast.error('Failed to fetch store information')
            }
        } catch (error) {
            console.error('Error fetching store info:', error)
            toast.error('Error fetching store information')
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveLogo = async () => {
        if (!selectedImage) {
            toast.error('Please select an image first')
            return
        }

        setSaving(true)
        try {
            // Upload the image first
            const formData = new FormData()
            formData.append('file', selectedImage)
            formData.append('type', 'store-logo')

            const uploadResponse = await fetch('/api/upload/simple', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image')
            }

            const uploadData = await uploadResponse.json()
            const imageUrl = uploadData.url

            // Update store with new logo
            const updateResponse = await fetch('/api/stores/update-logo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_url: imageUrl
                })
            })

            if (updateResponse.ok) {
                toast.success('Store logo updated successfully!')
                setStoreInfo({ ...storeInfo, image_url: imageUrl })
                setSelectedImage(null)
                // Refresh the page to update the sidebar
                window.location.reload()
            } else {
                const errorData = await updateResponse.json()
                toast.error(errorData.error || 'Failed to update store logo')
            }
        } catch (error) {
            console.error('Error updating store logo:', error)
            toast.error('Failed to update store logo')
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveLogo = async () => {
        if (!window.confirm('Are you sure you want to remove the store logo?')) {
            return
        }

        setSaving(true)
        try {
            const updateResponse = await fetch('/api/stores/update-logo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_url: null
                })
            })

            if (updateResponse.ok) {
                toast.success('Store logo removed successfully!')
                setStoreInfo({ ...storeInfo, image_url: null })
                setImagePreview(null)
                setSelectedImage(null)
                // Refresh the page to update the sidebar
                window.location.reload()
            } else {
                const errorData = await updateResponse.json()
                toast.error(errorData.error || 'Failed to remove store logo')
            }
        } catch (error) {
            console.error('Error removing store logo:', error)
            toast.error('Failed to remove store logo')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditedInfo(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSaveStoreInfo = async () => {
        if (!editedInfo.store_name.trim()) {
            toast.error('Store name is required')
            return
        }

        setSaving(true)
        try {
            const response = await fetch('/api/stores/update-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedInfo)
            })

            if (response.ok) {
                toast.success('Store information updated successfully!')
                setStoreInfo({ ...storeInfo, ...editedInfo })
                setEditMode(false)
                // Refresh the page to update the sidebar
                window.location.reload()
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to update store information')
            }
        } catch (error) {
            console.error('Error updating store info:', error)
            toast.error('Failed to update store information')
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setEditedInfo({
            store_name: storeInfo?.store_name || '',
            description: storeInfo?.description || '',
            email: storeInfo?.email || '',
            contact: storeInfo?.contact || '',
            address: storeInfo?.address || ''
        })
        setEditMode(false)
    }

    useEffect(() => {
        fetchStoreInfo()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Store <span className="text-slate-800 font-medium">Settings</span></h1>

            <div className="mt-8 max-w-2xl">
                {/* Store Logo Section */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h2 className="text-lg font-medium text-slate-800 mb-4">Store Logo</h2>
                    
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Current Logo Preview */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Store Logo Preview"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-store-logo.svg'
                                        }}
                                    />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <UploadIcon size={24} className="mx-auto mb-2" />
                                        <span className="text-xs">No Logo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Upload New Logo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Recommended: 200x200px, JPG, PNG, or WebP format
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {selectedImage && (
                                    <button
                                        onClick={handleSaveLogo}
                                        disabled={saving}
                                        className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 text-sm rounded hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <SaveIcon size={14} />
                                        {saving ? 'Saving...' : 'Save Logo'}
                                    </button>
                                )}

                                {storeInfo?.image_url && (
                                    <button
                                        onClick={handleRemoveLogo}
                                        disabled={saving}
                                        className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <TrashIcon size={14} />
                                        Remove Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Information Section */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-slate-800">Store Information</h2>
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="bg-gray-500 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-600 transition"
                            >
                                Edit Information
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveStoreInfo}
                                    disabled={saving}
                                    className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 text-sm rounded hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SaveIcon size={14} />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="bg-gray-500 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-600 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {storeInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Store Name *</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="store_name"
                                        value={editedInfo.store_name}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Enter store name"
                                        required
                                    />
                                ) : (
                                    <p className="text-slate-900 mt-1">{storeInfo.store_name || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Status</label>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                    storeInfo.status === 'approved' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {storeInfo.status || 'pending'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                {editMode ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedInfo.email}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Enter email address"
                                    />
                                ) : (
                                    <p className="text-slate-900 mt-1">{storeInfo.email || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Contact</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="contact"
                                        value={editedInfo.contact}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Enter contact number"
                                    />
                                ) : (
                                    <p className="text-slate-900 mt-1">{storeInfo.contact || 'Not set'}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Address</label>
                                {editMode ? (
                                    <textarea
                                        name="address"
                                        value={editedInfo.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Enter store address"
                                    />
                                ) : (
                                    <p className="text-slate-900 mt-1">{storeInfo.address || 'Not set'}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                {editMode ? (
                                    <textarea
                                        name="description"
                                        value={editedInfo.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="mt-1 w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Enter store description"
                                    />
                                ) : (
                                    <p className="text-slate-900 mt-1">{storeInfo.description || 'No description'}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500">No store information available</p>
                    )}
                </div>
            </div>
        </div>
    )
}
