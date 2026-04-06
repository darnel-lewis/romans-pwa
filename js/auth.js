/* ============================================
   auth.js — Supabase Magic Link Authentication
   ============================================ */

const SUPABASE_URL = 'https://udjavqrklqzvaripmizn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_daeSVPe-Slv3LUUvrLcXLg_Tw94vLMc';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current user state
let currentUser = null;

/**
 * Send a magic link to the user's email
 */
async function sendMagicLink(email) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Ensure the user has rows in our users and progress tables.
 * Called after successful authentication.
 */
async function ensureUserProfile(user) {
  // Upsert into users table
  const { error: userError } = await supabaseClient
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      display_name: user.email.split('@')[0]
    }, { onConflict: 'id' });

  if (userError) {
    console.error('Error creating user profile:', userError);
  }

  // Upsert into progress table
  const { error: progressError } = await supabaseClient
    .from('progress')
    .upsert({
      user_id: user.id,
      completed_days: [],
      last_activity: new Date().toISOString()
    }, { onConflict: 'user_id', ignoreDuplicates: true });

  if (progressError) {
    console.error('Error creating progress row:', progressError);
  }
}

/**
 * Get the current session and user
 */
async function getSession() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error('Session error:', error);
    return null;
  }
  return session;
}

/**
 * Sign the user out
 */
async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
  }
  currentUser = null;
}

/**
 * Listen for auth state changes (login, logout, token refresh).
 * Calls the provided callback with (event, session).
 */
function onAuthStateChange(callback) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      currentUser = session.user;
    } else {
      currentUser = null;
    }
    callback(event, session);
  });
}
