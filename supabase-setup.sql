-- ============================================
-- Romans PWA — Supabase Database Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Create tables
-- ----------------

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE progress (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  completed_days int[] DEFAULT '{}',
  last_activity timestamptz DEFAULT now()
);

-- 2. Enable Row-Level Security
-- ----------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- ----------------------

-- Users table: users can read and manage their own row
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Progress table: users can read and manage their own progress
CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- DONE. After running this:
-- 1. Go to Authentication > Providers > Email
--    - Enable Email provider
--    - Enable Email Confirmations (magic link)
-- 2. Go to Authentication > URL Configuration
--    - Set Site URL to your Vercel URL
--    - Add Vercel URL to Redirect URLs
-- ============================================
