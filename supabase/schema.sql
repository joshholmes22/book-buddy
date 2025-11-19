-- Book Buddy Database Schema
-- Run these commands in your Supabase SQL editor to set up the database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn TEXT UNIQUE,
  title TEXT,
  author TEXT,
  cover_url TEXT,
  genre TEXT[],
  status TEXT CHECK (status IN ('unread','reading','read','borrowed')),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  borrowed_to TEXT,
  borrowed_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genres table
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL
);

-- Function to get random books by genre
CREATE OR REPLACE FUNCTION get_books_by_genre(selected_genres TEXT[])
RETURNS SETOF books AS $$
  SELECT * FROM books
  WHERE (genre && selected_genres) AND status = 'unread'
  ORDER BY RANDOM()
  LIMIT 3;
$$ LANGUAGE SQL STABLE;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for books table
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books USING GIN(genre);
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);

-- Row Level Security (RLS) - Enable when you add auth
-- For now, we'll allow all operations since there's no auth yet
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Temporary policy to allow all operations (remove when adding auth)
CREATE POLICY "Allow all operations on books" ON books
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on genres" ON genres
  FOR ALL USING (true) WITH CHECK (true);
