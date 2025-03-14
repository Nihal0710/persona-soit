// Simple script to check if environment variables are properly loaded
require('dotenv').config({ path: '.env.local' });

console.log('Checking Supabase environment variables...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set:', supabaseUrl);
}

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set:', supabaseKey.substring(0, 10) + '...');
}

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing (needed for admin operations)');
} else {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY is set:', serviceRoleKey.substring(0, 10) + '...');
}

console.log('\nMake sure these variables are properly set in your .env.local file');
console.log('If running in development, restart your dev server after updating the .env.local file'); 
