// Script to check admin status
// Run this in your browser console or as a Node.js script

async function checkAdminStatus() {
    try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        
        console.log('Admin Check Result:', data);
        
        if (data.isAdmin) {
            console.log('✅ You have admin rights!');
            console.log('You can access the admin dashboard at: http://localhost:3000/admin');
        } else {
            console.log('❌ You do not have admin rights.');
            if (data.error) {
                console.log('Error:', data.error);
            }
        }
        
        return data;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return { isAdmin: false, error: error.message };
    }
}

// Run the check
checkAdminStatus();
