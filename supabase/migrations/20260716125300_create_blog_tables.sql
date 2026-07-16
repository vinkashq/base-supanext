CREATE SCHEMA IF NOT EXISTS blog;

GRANT USAGE ON SCHEMA blog TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA blog TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA blog TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA blog TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA blog GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA blog GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA blog GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS blog.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES blog.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tags Table
CREATE TABLE IF NOT EXISTS blog.tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Posts Table

-- Create the post_status enum (supabase.sql doesn't support enums in migrations)
CREATE TYPE blog.post_status AS ENUM ('draft', 'published', 'archived', 'trashed');

CREATE TABLE IF NOT EXISTS blog.posts (
  id SERIAL PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES blog.categories(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image_url VARCHAR(500),
  status blog.post_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Post Tags Table
CREATE TABLE IF NOT EXISTS blog.post_tags (
  post_id INTEGER REFERENCES blog.posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES blog.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
