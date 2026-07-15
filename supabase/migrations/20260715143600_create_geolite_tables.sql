CREATE SCHEMA IF NOT EXISTS geolite;

GRANT USAGE ON SCHEMA geolite TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA geolite TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA geolite TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA geolite TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geolite GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geolite GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA geolite GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 1. Country Tables
CREATE TABLE IF NOT EXISTS geolite.country_locations (
    geoname_id bigint PRIMARY KEY,
    locale_code text,
    continent_code text,
    continent_name text,
    country_iso_code text,
    country_name text,
    is_in_european_union boolean
);

CREATE TABLE IF NOT EXISTS geolite.country_blocks (
    network cidr PRIMARY KEY,
    geoname_id bigint,
    registered_country_geoname_id bigint,
    represented_country_geoname_id bigint,
    is_anonymous_proxy boolean,
    is_satellite_provider boolean
);

-- 2. City Tables
CREATE TABLE IF NOT EXISTS geolite.city_locations (
    geoname_id bigint PRIMARY KEY,
    locale_code text,
    continent_code text,
    continent_name text,
    country_iso_code text,
    country_name text,
    subdivision_1_iso_code text,
    subdivision_1_name text,
    subdivision_2_iso_code text,
    subdivision_2_name text,
    city_name text,
    metro_code text,
    time_zone text,
    is_in_european_union boolean
);

CREATE TABLE IF NOT EXISTS geolite.city_blocks (
    network cidr PRIMARY KEY,
    geoname_id bigint,
    registered_country_geoname_id bigint,
    represented_country_geoname_id bigint,
    is_anonymous_proxy boolean,
    is_satellite_provider boolean,
    postal_code text,
    latitude double precision,
    longitude double precision,
    accuracy_radius integer
);

-- 3. ASN Tables
CREATE TABLE IF NOT EXISTS geolite.asn_blocks (
    network cidr PRIMARY KEY,
    autonomous_system_number bigint,
    autonomous_system_organization text
);

-- GIST Indexes for rapid subnet container lookups (e.g. network >>= '1.2.3.4')
CREATE INDEX IF NOT EXISTS idx_country_blocks_network ON geolite.country_blocks USING gist (network);
CREATE INDEX IF NOT EXISTS idx_city_blocks_network ON geolite.city_blocks USING gist (network);
CREATE INDEX IF NOT EXISTS idx_asn_blocks_network ON geolite.asn_blocks USING gist (network);

-- 4. Staging Tables (for atomic, zero-downtime swaps)
CREATE TABLE IF NOT EXISTS geolite.country_locations_staging (LIKE geolite.country_locations INCLUDING ALL);
CREATE TABLE IF NOT EXISTS geolite.country_blocks_staging (LIKE geolite.country_blocks INCLUDING ALL);
CREATE TABLE IF NOT EXISTS geolite.city_locations_staging (LIKE geolite.city_locations INCLUDING ALL);
CREATE TABLE IF NOT EXISTS geolite.city_blocks_staging (LIKE geolite.city_blocks INCLUDING ALL);
CREATE TABLE IF NOT EXISTS geolite.asn_blocks_staging (LIKE geolite.asn_blocks INCLUDING ALL);

-- Enable RLS on all tables
ALTER TABLE geolite.country_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.country_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.city_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.city_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.asn_blocks ENABLE ROW LEVEL SECURITY;

ALTER TABLE geolite.country_locations_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.country_blocks_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.city_locations_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.city_blocks_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolite.asn_blocks_staging ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for all authenticated and anon users (read-only IP checks)
CREATE POLICY select_country_locations ON geolite.country_locations FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY select_country_blocks ON geolite.country_blocks FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY select_city_locations ON geolite.city_locations FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY select_city_blocks ON geolite.city_blocks FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY select_asn_blocks ON geolite.asn_blocks FOR SELECT TO authenticated, anon USING (true);
