const supabaseUrl = "https://lssjpyikumgycgpmiqub.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pweWlrdW1neWNncG1pcXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjY4MjUsImV4cCI6MjA5MzMwMjgyNX0.lu5mMuLrMO8pOpuPMwNx9paJkJRDrJu1BGX17cKqcX8";

window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);// ===============================
// SUPABASE INITIALIZATION
// ===============================

// Your Supabase project credentials
const supabaseUrl = "https://lssjpyikumgycgpmiqub.supabase.co";
const supabaseKey = "YOUR_ANON_KEY_HERE"; 
// ⚠️ Replace this with your real anon/public key from Supabase dashboard

// Create Supabase client (ONLY ONCE in the entire project)
window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);