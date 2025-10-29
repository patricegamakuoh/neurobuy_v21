'use client'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function SetupStoragePage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const setupStorage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup/storage', {
        method: 'POST'
      })
      const data = await response.json()
      
      setResults(data)
      
      if (response.ok) {
        toast.success('Storage setup completed!')
      } else {
        toast.error(data.error || 'Storage setup failed')
      }
    } catch (error) {
      console.error('Setup error:', error)
      toast.error('Failed to setup storage')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Storage Setup</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Issue Detected</h2>
        <p className="text-yellow-700">
          The error "Bucket not found" means your Supabase Storage buckets don't exist yet. 
          This page will help you create them automatically.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={setupStorage}
          disabled={loading}
          className="bg-emerald-600 text-white px-6 py-3 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Create Storage Buckets'}
        </button>

        <div className="text-sm text-slate-600">
          <p><strong>Note:</strong> You need to be logged in as an admin to run this setup.</p>
        </div>
      </div>

      {results && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-4">Setup Results:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-red-50 rounded">
        <h2 className="text-lg font-semibold mb-2 text-red-800">RLS Policy Fix Required</h2>
        <p className="text-sm text-red-700 mb-4">
          If you're getting "row-level security policy" errors, you need to fix the storage policies:
        </p>
        <div className="bg-white p-3 rounded border">
          <h3 className="font-semibold text-red-800 mb-2">Quick Fix (Recommended):</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
            <li>Go to your Supabase Dashboard</li>
            <li>Navigate to SQL Editor</li>
            <li>Run the commands from <code className="bg-gray-100 px-1 rounded">scripts/alternative-storage-fix.sql</code></li>
            <li>Click "Run" to execute</li>
          </ol>
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Alternative:</strong> The new upload system should work without SQL changes. Try adding a product first!</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Manual Setup (Alternative)</h2>
        <p className="text-sm text-blue-700 mb-4">
          If the automatic setup doesn't work, you can create the buckets manually:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>Go to your Supabase Dashboard</li>
          <li>Navigate to Storage</li>
          <li>Create a new bucket named "product-images" (make it public)</li>
          <li>Create a new bucket named "store-logos" (make it public)</li>
          <li>Set appropriate file size limits (5MB recommended)</li>
          <li><strong>Important:</strong> Disable RLS or create permissive policies</li>
        </ol>
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded">
        <h2 className="text-lg font-semibold mb-2">After Setup</h2>
        <p className="text-sm text-green-700">
          Once the buckets are created, try adding a product again. The image upload should work properly.
        </p>
      </div>
    </div>
  )
}
