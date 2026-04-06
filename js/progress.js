/* ============================================
   progress.js — Completion Tracking via Supabase
   ============================================ */

let completedDays = [];

/**
 * Fetch the user's completed days from Supabase
 */
async function fetchProgress() {
  if (!currentUser) return [];

  const { data, error } = await supabaseClient
    .from('progress')
    .select('completed_days')
    .eq('user_id', currentUser.id)
    .single();

  if (error) {
    console.error('Error fetching progress:', error);
    return [];
  }

  completedDays = data?.completed_days || [];
  return completedDays;
}

/**
 * Mark a day as complete. Appends the day number to completed_days
 * and updates last_activity.
 */
async function markDayComplete(dayNumber) {
  if (!currentUser) return false;

  // Don't duplicate
  if (completedDays.includes(dayNumber)) return true;

  const updated = [...completedDays, dayNumber].sort((a, b) => a - b);

  const { error } = await supabaseClient
    .from('progress')
    .update({
      completed_days: updated,
      last_activity: new Date().toISOString()
    })
    .eq('user_id', currentUser.id);

  if (error) {
    console.error('Error updating progress:', error);
    return false;
  }

  completedDays = updated;
  return true;
}

/**
 * Check if a specific day is unlocked.
 * Day 1 is always unlocked. Day N requires days 1..N-1 completed.
 */
function isDayUnlocked(dayNumber) {
  if (dayNumber === 1) return true;
  for (let i = 1; i < dayNumber; i++) {
    if (!completedDays.includes(i)) return false;
  }
  return true;
}

/**
 * Check if a day is completed
 */
function isDayCompleted(dayNumber) {
  return completedDays.includes(dayNumber);
}

/**
 * Get completed days array
 */
function getCompletedDays() {
  return [...completedDays];
}

/**
 * Get the total number of completed days
 */
function getCompletedCount() {
  return completedDays.length;
}
