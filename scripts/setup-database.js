require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Service role key available:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database tables...');

  try {
    // Create the quiz_results table
    console.log('Creating quiz_results table...');
    
    // Using the REST API to create the table
    const { error: createError } = await supabase
      .from('quiz_results')
      .insert({ 
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        quiz_id: '00000000-0000-0000-0000-000000000000',
        score: 0,
        total_questions: 0,
        completed_at: new Date().toISOString(),
        time_spent: 0,
        answers: []
      })
      .select();
    
    if (createError) {
      if (createError.code === '42P07') {
        console.log('✅ quiz_results table already exists');
      } else if (createError.code === '42P01') {
        console.log('Table does not exist. Creating it now...');
        
        // We need to use the Supabase dashboard to create the table
        console.log(`
Please create the quiz_results table manually in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to "Table Editor" in the sidebar
3. Click "Create a new table"
4. Set the table name to "quiz_results"
5. Add the following columns:
   - id: uuid (primary key, default: gen_random_uuid())
   - user_id: uuid (not null)
   - quiz_id: uuid (not null)
   - score: integer (not null)
   - total_questions: integer (not null)
   - completed_at: timestamptz (default: now())
   - time_spent: integer
   - answers: jsonb
   - created_at: timestamptz (default: now())
6. Click "Save" to create the table

After creating the table, set up RLS policies:
1. Go to "Authentication" > "Policies"
2. Find the quiz_results table
3. Enable RLS
4. Add a policy for INSERT with the condition: auth.uid() = user_id
5. Add a policy for SELECT with the condition: auth.uid() = user_id
        `);
      } else {
        console.error('Error creating table:', createError);
      }
    } else {
      console.log('✅ quiz_results table created or already exists');
    }
    
    // Check if the table exists now
    const { data: tableExists, error: checkError } = await supabase
      .from('quiz_results')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking table:', checkError);
    } else {
      console.log('✅ quiz_results table is accessible');
    }
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 