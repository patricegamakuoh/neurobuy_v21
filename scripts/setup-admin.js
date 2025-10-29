// Admin setup script
// This script helps you set up admin rights
// Run this after logging in to your app

const ADMIN_SETUP_INSTRUCTIONS = `
🔧 ADMIN SETUP INSTRUCTIONS:

1. First, make sure you're logged in to your app
2. Go to your Supabase project dashboard
3. Navigate to SQL Editor
4. Run this SQL query (replace 'your-email@example.com' with your actual email):

-- Update existing user to admin role
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';

-- If the user doesn't exist in the users table yet, create the record:
INSERT INTO public.users (id, email, role)
SELECT auth.uid(), 'your-email@example.com', 'ADMIN'
WHERE auth.email() = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';

5. After running the SQL, refresh your app and try accessing /admin again

📝 NOTES:
- Make sure you replace 'your-email@example.com' with your actual email address
- The email must match exactly what you used to sign up
- You need to be logged in for this to work
`;

console.log(ADMIN_SETUP_INSTRUCTIONS);