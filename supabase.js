
const supabaseUrl = "https://lssjpyikumgycgpmiqub.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pweWlrdW1neWNncG1pcXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjY4MjUsImV4cCI6MjA5MzMwMjgyNX0.lu5mMuLrMO8pOpuPMwNx9paJkJRDrJu1BGX17cKqcX8";

window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);