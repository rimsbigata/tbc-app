-- ============================================
-- TBC Badminton Club - Complete Supabase Setup
-- ============================================
-- This script contains all queries needed to set up
-- the Supabase database for TBC Badminton Club
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  skill_level INTEGER DEFAULT 3,
  wins INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  partner_history TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'playing', 'resting')),
  improvement_score INTEGER DEFAULT 0,
  total_play_time_minutes INTEGER DEFAULT 0,
  last_available_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courts table
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  current_match_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue table (for queuing management)
CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queue' CHECK (status IN ('bench', 'queue', 'court')),
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_a UUID[] NOT NULL,
  team_b UUID[] NOT NULL,
  team_a_snapshots JSONB DEFAULT '[]',
  team_b_snapshots JSONB DEFAULT '[]',
  team_a_score INTEGER,
  team_b_score INTEGER,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
  winner TEXT CHECK (winner IN ('teamA', 'teamB')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fees table
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  fee_type TEXT CHECK (fee_type IN ('shuttle', 'court', 'entrance')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (for match logic parameters)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (for tracking play sessions on specific dates)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participation join table (many-to-many relationship between sessions and players)
CREATE TABLE IF NOT EXISTS session_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, player_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_queue_player_id ON queue(player_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_entry_time ON queue(entry_time);
CREATE INDEX IF NOT EXISTS idx_matches_court_id ON matches(court_id);
CREATE INDEX IF NOT EXISTS idx_matches_timestamp ON matches(timestamp);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_fees_player_id ON fees(player_id);
CREATE INDEX IF NOT EXISTS idx_fees_date ON fees(date);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_participation_session_id ON session_participation(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participation_player_id ON session_participation(player_id);

-- ============================================
-- REALTIME
-- ============================================

-- Enable Realtime on queue table
ALTER PUBLICATION supabase_realtime ADD TABLE queue;

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('default_winning_score', '21', 'Default winning score for matches'),
  ('auto_advance_enabled', 'true', 'Enable auto-advance to next match in queue'),
  ('max_queue_size', '20', 'Maximum number of players in queue'),
  ('match_duration_minutes', '15', 'Expected match duration in minutes')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- TRIGGERS
-- ============================================

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_queue_updated_at ON queue;
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fees_updated_at ON fees;
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- UNIQUE CONSTRAINT
-- ============================================

-- Add UNIQUE constraint to full_name column for upsert operations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'players_full_name_key'
    ) THEN
        ALTER TABLE players ADD CONSTRAINT players_full_name_key UNIQUE (full_name);
        RAISE NOTICE 'Added unique constraint on full_name';
    ELSE
        RAISE NOTICE 'Unique constraint on full_name already exists';
    END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participation ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR AUTHENTICATED USERS
-- ============================================

-- Players
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON players;
CREATE POLICY "Allow read access for authenticated users" ON players
  FOR SELECT USING (auth.role() = 'authenticated');

-- Queue
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON queue;
CREATE POLICY "Allow read access for authenticated users" ON queue
  FOR SELECT USING (auth.role() = 'authenticated');

-- Courts
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON courts;
CREATE POLICY "Allow read access for authenticated users" ON courts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Matches
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON matches;
CREATE POLICY "Allow read access for authenticated users" ON matches
  FOR SELECT USING (auth.role() = 'authenticated');

-- Fees
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON fees;
CREATE POLICY "Allow read access for authenticated users" ON fees
  FOR SELECT USING (auth.role() = 'authenticated');

-- Settings
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON settings;
CREATE POLICY "Allow read access for authenticated users" ON settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Payment methods
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON payment_methods;
CREATE POLICY "Allow read access for authenticated users" ON payment_methods
  FOR SELECT USING (auth.role() = 'authenticated');

-- Sessions
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON sessions;
CREATE POLICY "Allow read access for authenticated users" ON sessions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Session participation
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON session_participation;
CREATE POLICY "Allow read access for authenticated users" ON session_participation
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES FOR ANON ROLE (Local Development)
-- ============================================

-- Players
DROP POLICY IF EXISTS "Allow full access for anon role" ON players;
CREATE POLICY "Allow full access for anon role" ON players
  FOR ALL USING (auth.role() = 'anon');

-- Courts
DROP POLICY IF EXISTS "Allow full access for anon role" ON courts;
CREATE POLICY "Allow full access for anon role" ON courts
  FOR ALL USING (auth.role() = 'anon');

-- Queue
DROP POLICY IF EXISTS "Allow full access for anon role" ON queue;
CREATE POLICY "Allow full access for anon role" ON queue
  FOR ALL USING (auth.role() = 'anon');

-- Matches
DROP POLICY IF EXISTS "Allow full access for anon role" ON matches;
CREATE POLICY "Allow full access for anon role" ON matches
  FOR ALL USING (auth.role() = 'anon');

-- Sessions
DROP POLICY IF EXISTS "Allow full access for anon role" ON sessions;
CREATE POLICY "Allow full access for anon role" ON sessions
  FOR ALL USING (auth.role() = 'anon');

-- Session participation
DROP POLICY IF EXISTS "Allow full access for anon role" ON session_participation;
CREATE POLICY "Allow full access for anon role" ON session_participation
  FOR ALL USING (auth.role() = 'anon');

-- Fees
DROP POLICY IF EXISTS "Allow full access for anon role" ON fees;
CREATE POLICY "Allow full access for anon role" ON fees
  FOR ALL USING (auth.role() = 'anon');

-- Payment methods
DROP POLICY IF EXISTS "Allow full access for anon role" ON payment_methods;
CREATE POLICY "Allow full access for anon role" ON payment_methods
  FOR ALL USING (auth.role() = 'anon');

-- Settings
DROP POLICY IF EXISTS "Allow full access for anon role" ON settings;
CREATE POLICY "Allow full access for anon role" ON settings
  FOR ALL USING (auth.role() = 'anon');

-- ============================================
-- RLS POLICIES FOR SERVICE ROLE (Admin)
-- ============================================

-- Players
DROP POLICY IF EXISTS "Allow full access for service role" ON players;
CREATE POLICY "Allow full access for service role" ON players
  FOR ALL USING (auth.role() = 'service_role');

-- Queue
DROP POLICY IF EXISTS "Allow full access for service role" ON queue;
CREATE POLICY "Allow full access for service role" ON queue
  FOR ALL USING (auth.role() = 'service_role');

-- Courts
DROP POLICY IF EXISTS "Allow full access for service role" ON courts;
CREATE POLICY "Allow full access for service role" ON courts
  FOR ALL USING (auth.role() = 'service_role');

-- Matches
DROP POLICY IF EXISTS "Allow full access for service role" ON matches;
CREATE POLICY "Allow full access for service role" ON matches
  FOR ALL USING (auth.role() = 'service_role');

-- Fees
DROP POLICY IF EXISTS "Allow full access for service role" ON fees;
CREATE POLICY "Allow full access for service role" ON fees
  FOR ALL USING (auth.role() = 'service_role');

-- Settings
DROP POLICY IF EXISTS "Allow full access for service role" ON settings;
CREATE POLICY "Allow full access for service role" ON settings
  FOR ALL USING (auth.role() = 'service_role');

-- Payment methods
DROP POLICY IF EXISTS "Allow full access for service role" ON payment_methods;
CREATE POLICY "Allow full access for service role" ON payment_methods
  FOR ALL USING (auth.role() = 'service_role');

-- Sessions
DROP POLICY IF EXISTS "Allow full access for service role" ON sessions;
CREATE POLICY "Allow full access for service role" ON sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Session participation
DROP POLICY IF EXISTS "Allow full access for service role" ON session_participation;
CREATE POLICY "Allow full access for service role" ON session_participation
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- SETUP COMPLETE
-- ============================================
