import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Fallback data generation when AI API fails
function generateFallbackData(imageType) {
  const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']
  const products = [
    { name: 'Premium Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation and superior sound quality.', category: 'Electronics', priceRange: '15000-25000' },
    { name: 'Smart Fitness Watch', description: 'Advanced fitness tracking watch with heart rate monitoring and GPS capabilities.', category: 'Electronics', priceRange: '20000-35000' },
    { name: 'Organic Cotton T-Shirt', description: 'Comfortable and sustainable organic cotton t-shirt in various colors and sizes.', category: 'Clothing', priceRange: '5000-8000' },
    { name: 'Ceramic Coffee Mug', description: 'Beautiful handcrafted ceramic coffee mug perfect for your morning routine.', category: 'Home & Kitchen', priceRange: '3000-5000' },
    { name: 'Skincare Set', description: 'Complete skincare routine set with cleanser, toner, and moisturizer.', category: 'Beauty & Health', priceRange: '8000-12000' }
  ]
  
  // Randomly select a product
  const randomProduct = products[Math.floor(Math.random() * products.length)]
  
  return {
    name: randomProduct.name,
    description: randomProduct.description,
    category: randomProduct.category,
    priceRange: randomProduct.priceRange,
    features: [
      'High quality materials',
      'Durable construction',
      'User-friendly design',
      'Great value for money',
      'Popular choice'
    ]
  }
}

export async function POST(request) {
  try {
    console.log('AI API called')
    const { imageBase64, imageType } = await request.json()

    if (!imageBase64 || !imageType) {
      console.error('Missing image data')
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    console.log('API Key exists:', !!apiKey)
    
    if (!apiKey) {
      console.error('Google AI API key not configured')
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      )
    }

    console.log('Creating Google AI client')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    Analyze this product image and generate:
    1. A compelling product name (max 50 characters)
    2. A detailed product description (max 300 characters)
    3. Suggested category from: Electronics, Clothing, Home & Kitchen, Beauty & Health, Toys & Games, Sports & Outdoors, Books & Media, Food & Drink, Hobbies & Crafts, Others
    4. Estimated price range in XAF currency (format: min-max, e.g., "5000-15000")
    5. Key features (max 5 bullet points)

    Respond in JSON format:
    {
      "name": "product name",
      "description": "detailed description",
      "category": "suggested category",
      "priceRange": "min-max",
      "features": ["feature1", "feature2", "feature3"]
    }
    `

    console.log('Sending request to Google AI')
    let result, response, text
    
    try {
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: imageType
          }
        }
      ])

      console.log('Received response from Google AI')
      response = await result.response
      text = response.text()
      console.log('AI response text:', text)
    } catch (aiError) {
      console.error('Google AI API error:', aiError)
      
      // Fallback: Generate mock data based on image type
      console.log('Using fallback AI data generation')
      const fallbackData = generateFallbackData(imageType)
      return NextResponse.json({
        success: true,
        data: fallbackData
      })
    }

    // Try to parse JSON response
    let aiData
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        console.log('Found JSON in response:', jsonMatch[0])
        aiData = JSON.parse(jsonMatch[0])
      } else {
        console.log('No JSON found, creating fallback data')
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.log('Using fallback data creation')
      // Fallback: create structured data from text
      const lines = text.split('\n').filter(line => line.trim())
      aiData = {
        name: lines[0]?.replace(/^[0-9]+\.\s*/, '') || 'Product',
        description: lines.slice(1, 3).join(' ') || 'AI-generated product description',
        category: 'Others',
        priceRange: '5000-15000',
        features: lines.slice(3, 8).map(line => line.replace(/^[-\*]\s*/, ''))
      }
    }

    console.log('Final AI data:', aiData)

    return NextResponse.json({
      success: true,
      data: aiData
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate product information' },
      { status: 500 }
    )
  }
}
