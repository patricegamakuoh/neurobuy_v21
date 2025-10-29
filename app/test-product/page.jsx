'use client'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TestProductPage() {
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)

  const testDatabaseConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/database')
      const data = await response.json()
      setDebugInfo(data)
      console.log('Debug info:', data)
    } catch (error) {
      console.error('Debug error:', error)
      toast.error('Failed to test database connection')
    } finally {
      setLoading(false)
    }
  }

  const testProductCreation = async () => {
    setLoading(true)
    try {
      const testProduct = {
        name: "Test Product",
        description: "This is a test product",
        mrp: 100,
        price: 80,
        category: "Electronics",
        stock: 10
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testProduct)
      })

      const data = await response.json()
      console.log('Product creation response:', data)
      
      if (response.ok) {
        toast.success('Test product created successfully!')
      } else {
        toast.error(`Failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Product creation error:', error)
      toast.error('Failed to create test product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Creation Debug</h1>
      
      <div className="space-y-4">
        <button
          onClick={testDatabaseConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
        </button>

        <button
          onClick={testProductCreation}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Creating...' : 'Test Product Creation'}
        </button>
      </div>

      {debugInfo && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-4">Debug Information:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Test Database Connection" to check if your database is working</li>
          <li>Click "Test Product Creation" to try creating a test product</li>
          <li>Check the browser console (F12) for detailed error messages</li>
          <li>Check the server terminal for backend error logs</li>
        </ol>
      </div>
    </div>
  )
}
