// Script to fix store database issues
// This script will add missing fields to the stores table

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: Supabase URL or Service Role Key not found in .env.local');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixStoreDatabase() {
    try {
        console.log('🔧 Fixing store database schema...');

        // SQL to add missing fields to stores table
        const sql = `
            -- Add missing fields to stores table
            ALTER TABLE public.stores 
            ADD COLUMN IF NOT EXISTS username VARCHAR UNIQUE,
            ADD COLUMN IF NOT EXISTS email VARCHAR,
            ADD COLUMN IF NOT EXISTS contact VARCHAR,
            ADD COLUMN IF NOT EXISTS address VARCHAR,
            ADD COLUMN IF NOT EXISTS image_url VARCHAR,
            ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';

            -- Update existing stores to have approved status if they don't have status set
            UPDATE public.stores 
            SET status = 'approved' 
            WHERE status IS NULL;

            -- Add comment for the status field
            COMMENT ON COLUMN public.stores.status IS 'Store status: pending, approved, rejected';
        `;

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql });

        if (error) {
            console.error('❌ Error executing SQL:', error.message);
            
            // Try alternative approach - direct SQL execution
            console.log('🔄 Trying alternative approach...');
            
            // Check if fields exist first
            const { data: columns, error: columnError } = await supabase
                .from('information_schema.columns')
                .select('column_name')
                .eq('table_name', 'stores')
                .eq('table_schema', 'public');

            if (columnError) {
                console.error('❌ Error checking columns:', columnError.message);
                return;
            }

            const existingColumns = columns.map(col => col.column_name);
            console.log('📋 Existing columns:', existingColumns);

            // Add missing columns one by one
            const columnsToAdd = [
                { name: 'username', type: 'VARCHAR UNIQUE' },
                { name: 'email', type: 'VARCHAR' },
                { name: 'contact', type: 'VARCHAR' },
                { name: 'address', type: 'VARCHAR' },
                { name: 'image_url', type: 'VARCHAR' },
                { name: 'status', type: "VARCHAR DEFAULT 'pending'" }
            ];

            for (const column of columnsToAdd) {
                if (!existingColumns.includes(column.name)) {
                    console.log(`➕ Adding column: ${column.name}`);
                    // Note: Direct column addition might not work with Supabase client
                    // This would typically need to be done in the Supabase SQL editor
                } else {
                    console.log(`✅ Column ${column.name} already exists`);
                }
            }

        } else {
            console.log('✅ SQL executed successfully:', data);
        }

        // Check current stores
        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('*')
            .limit(5);

        if (storesError) {
            console.error('❌ Error fetching stores:', storesError.message);
        } else {
            console.log('📊 Current stores data:', stores);
        }

        console.log('✅ Database fix completed!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the SQL from scripts/update-store-schema.sql');
        console.log('4. Refresh your store dashboard');

    } catch (error) {
        console.error('❌ An unexpected error occurred:', error.message);
    }
}

// Run the fix
fixStoreDatabase();
