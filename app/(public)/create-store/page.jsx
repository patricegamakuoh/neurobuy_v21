'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useUser } from "@clerk/nextjs"

export default function CreateStore() {
    const { user, isLoaded: userLoaded } = useUser()
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })
    const [rejectionReason, setRejectionReason] = useState("")

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = useCallback(async () => {
        if (!userLoaded) {
            return // Wait for Clerk to load
        }
        
        if (!user) {
            setLoading(false)
            return // User not logged in
        }

        try {
            // Check if user already has a store
            const response = await fetch('/api/stores')
            
            if (response.ok) {
                const { store } = await response.json()
                console.log('Store data from API:', store)
                if (store) {
                    setAlreadySubmitted(true)
                    setStatus(store.status)
                    setRejectionReason(store.rejectionReason || "")
                    console.log('Setting status to:', store.status)
                    setMessage(
                        store.status === 'pending' 
                            ? 'Your store application is pending admin review. You will be notified once it\'s approved.'
                            : store.status === 'approved'
                            ? 'Your store has been approved! You can now start adding products.'
                            : 'Your store application was not approved. Please review the reasons below and resubmit your application.'
                    )
                }
            }
        } catch (error) {
            console.error('Error fetching seller status:', error)
        } finally {
            setLoading(false)
        }
    }, [user, userLoaded])

    const handleResubmit = async () => {
        try {
            setSubmitting(true)
            
            // Delete the rejected store first
            const deleteResponse = await fetch('/api/stores', {
                method: 'DELETE'
            })

            if (deleteResponse.ok) {
                setAlreadySubmitted(false)
                setStatus("")
                setMessage("")
                setStoreInfo({
                    name: "",
                    username: "",
                    description: "",
                    email: "",
                    contact: "",
                    address: "",
                    image: ""
                })
                toast.success('Store deleted. You can now create a new one.')
            } else {
                const errorData = await deleteResponse.json()
                toast.error(errorData.error || 'Failed to delete store')
            }
        } catch (error) {
            console.error('Error deleting store:', error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        if (submitting) return // Prevent double submission
        
        // Validate form data
        if (!storeInfo.name || !storeInfo.username || !storeInfo.description || 
            !storeInfo.email || !storeInfo.contact || !storeInfo.address) {
            toast.error('Please fill in all required fields')
            return
        }

        setSubmitting(true)
        
        try {
            let imageUrl = null

            // Upload image if provided
            if (storeInfo.image && storeInfo.image instanceof File) {
                const uploadFormData = new FormData()
                uploadFormData.append('file', storeInfo.image)

                const uploadResponse = await fetch('/api/upload/store-image', {
                    method: 'POST',
                    body: uploadFormData
                })

                const uploadData = await uploadResponse.json()

                if (uploadResponse.ok && uploadData.url) {
                    imageUrl = uploadData.url
                } else {
                    console.error('Image upload failed:', uploadData.error)
                    toast.error('Failed to upload image')
                }
            }

            // Prepare form data
            const formData = {
                name: storeInfo.name,
                username: storeInfo.username,
                description: storeInfo.description,
                email: storeInfo.email,
                contact: storeInfo.contact,
                address: storeInfo.address,
                image: imageUrl
            }

            const response = await fetch('/api/stores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setAlreadySubmitted(true)
                setStatus('pending')
                setMessage('Store created successfully! Your store application is pending admin review.')
                toast.success(data.message || 'Store created successfully!')
            } else {
                toast.error(data.error || 'Failed to create store. Please try again.')
            }
        } catch (error) {
            console.error('Error submitting store:', error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        fetchSellerStatus()
    }, [fetchSellerStatus])

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={onSubmitHandler} className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="text-slate-800 font-medium">Store</span></h1>
                            <p className="max-w-lg">To become a seller on NeuroBuy, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} className="rounded-lg mt-2 h-16 w-auto" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                        </label>

                        <p>Username</p>
                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter your store username" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Name</p>
                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter your store name" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Description</p>
                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={5} placeholder="Enter your store description" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <p>Email</p>
                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="Enter your store email" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Contact Number</p>
                        <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="Enter your store contact number" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Address</p>
                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={5} placeholder="Enter your store address" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
                    <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
                    
                    {status === "approved" && (
                        <div className="mt-5">
                            <p className="text-slate-400 mb-4">Your store is ready! You can now:</p>
                            <div className="flex gap-4">
                                <a href="/store" className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition">
                                    Go to Dashboard
                                </a>
                                <a href="/store/add-product" className="bg-slate-600 text-white px-6 py-2 rounded hover:bg-slate-700 transition">
                                    Add Products
                                </a>
                            </div>
                        </div>
                    )}

                    {status === "rejected" && (
                        <div className="mt-8 max-w-2xl">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-red-800 mb-3">Application Rejection Details</h3>
                                
                                {rejectionReason ? (
                                    <div className="bg-white rounded-lg p-4 mb-4 border border-red-300">
                                        <p className="text-sm font-medium text-red-800 mb-2">Admin Feedback:</p>
                                        <p className="text-red-700 text-sm whitespace-pre-wrap">{rejectionReason}</p>
                                    </div>
                                ) : (
                                    <p className="text-red-600 text-sm mb-4">
                                        No specific reason was provided. Common reasons for rejection include:
                                    </p>
                                )}
                                
                                {!rejectionReason && (
                                    <ul className="list-disc list-inside space-y-2 text-red-700 text-sm mb-4">
                                        <li>Incomplete or inaccurate business information</li>
                                        <li>Inappropriate store name or description</li>
                                        <li>Missing or invalid contact information</li>
                                        <li>Does not meet our vendor requirements</li>
                                        <li>Duplicate username or already exists</li>
                                    </ul>
                                )}
                                
                                <p className="mt-4 text-red-600 text-sm">
                                    <strong>Need help?</strong> Contact our support team at <a href="mailto:support@neurobuy.com" className="underline">support@neurobuy.com</a>
                                </p>
                            </div>
                            
                            <button 
                                onClick={handleResubmit}
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Deleting...' : 'Delete and Resubmit Application'}
                            </button>
                            <p className="mt-3 text-xs text-slate-500">
                                Note: Clicking this button will delete your rejected store and allow you to create a new application.
                            </p>
                        </div>
                    )}

                    {status === "pending" && (
                        <div className="mt-5 text-center">
                            <p className="text-slate-400">Please wait for admin approval. This typically takes 1-2 business days.</p>
                        </div>
                    )}
                </div>
            )}
        </>
    ) : (<Loading />)
}