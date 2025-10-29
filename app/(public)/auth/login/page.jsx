import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
            card: 'shadow-lg'
          }
        }}
      />
    </div>
  )
}
