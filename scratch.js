const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRooms() {
  const { data, error } = await supabase.from('chat_rooms').select('*').eq('type', 'public');
  console.log('Public rooms:', data);
  console.log('Error:', error);
}

checkRooms();
