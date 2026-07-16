import { BlobReader, ZipReader } from "jsr:@zip-js/zip-js@^2.7.53"
import postgres from "npm:postgres@^3.4.4"
import { pipeline } from "node:stream/promises"
import { Readable } from "node:stream"

// Database columns configuration
const COUNTRY_LOCATIONS_COLS = [
  "geoname_id",
  "locale_code",
  "continent_code",
  "continent_name",
  "country_iso_code",
  "country_name",
  "is_in_european_union",
]

const COUNTRY_BLOCKS_COLS = [
  "network",
  "geoname_id",
  "registered_country_geoname_id",
  "represented_country_geoname_id",
  "is_anonymous_proxy",
  "is_satellite_provider",
  "is_anycast",
]

const CITY_LOCATIONS_COLS = [
  "geoname_id",
  "locale_code",
  "continent_code",
  "continent_name",
  "country_iso_code",
  "country_name",
  "subdivision_1_iso_code",
  "subdivision_1_name",
  "subdivision_2_iso_code",
  "subdivision_2_name",
  "city_name",
  "metro_code",
  "time_zone",
  "is_in_european_union",
]

const CITY_BLOCKS_COLS = [
  "network",
  "geoname_id",
  "registered_country_geoname_id",
  "represented_country_geoname_id",
  "is_anonymous_proxy",
  "is_satellite_provider",
  "postal_code",
  "latitude",
  "longitude",
  "accuracy_radius",
  "is_anycast",
]

const ASN_BLOCKS_COLS = [
  "network",
  "autonomous_system_number",
  "autonomous_system_organization",
]

// Processes a CSV file entry from the ZIP, streaming directly to PostgreSQL COPY FROM STDIN
async function processCsvEntry(
  entry: any,
  sqlClient: any,
  tableName: string,
  columns: string[]
) {
  const transformStream = new TransformStream()
  const readingPromise = entry.getData(transformStream.writable)

  const parts = tableName.split(".")
  const schema = parts[0]
  const table = parts[1]

  // Get initial count before copying
  const countBeforeRes = await sqlClient`
    select count(*) as count from ${sqlClient(schema)}.${sqlClient(table)}
  `
  const countBefore = parseInt(countBeforeRes[0].count, 10)

  // Construct target column list and initialize COPY stream
  const colsEscaped = columns.map((c) => `"${c}"`).join(", ")
  const copyStream = await sqlClient.unsafe(
    `COPY ${schema}.${table} (${colsEscaped}) FROM STDIN WITH (FORMAT csv, HEADER true)`
  ).writable()

  let writerAborted = false
  try {
    // Convert Web ReadableStream to Node Readable stream and pipe to copy stream
    const nodeReadable = Readable.fromWeb(transformStream.readable)
    await pipeline(nodeReadable, copyStream)
  } catch (err) {
    writerAborted = true
    try {
      await transformStream.writable.abort(err)
    } catch {
      // ignore
    }
    throw err
  } finally {
    try {
      await readingPromise
    } catch (err) {
      if (!writerAborted) {
        throw err
      }
    }
  }

  // Get final count to calculate inserted rows
  const countAfterRes = await sqlClient`
    select count(*) as count from ${sqlClient(schema)}.${sqlClient(table)}
  `
  const countAfter = parseInt(countAfterRes[0].count, 10)
  return countAfter - countBefore
}

Deno.serve(async (req) => {
  // 1. Default Parameters
  let edition = "GeoLite2-Country"
  let licenseKey = Deno.env.get("MAXMIND_LICENSE_KEY") ?? ""
  let mode = "full" // full (swap staging) or incremental (upsert directly)

  // 2. Parse Query Parameters (available on both GET and POST requests)
  try {
    const url = new URL(req.url)
    const ed = url.searchParams.get("edition")
    const lic = url.searchParams.get("license_key")
    const md = url.searchParams.get("mode")
    if (ed) edition = ed
    if (lic) licenseKey = lic
    if (md) mode = md
  } catch {
    // Ignore URL parsing errors
  }

  // 3. Parse JSON Body (if present in POST/PUT)
  if (req.method === "POST" || req.method === "PUT") {
    try {
      const contentType = req.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const body = await req.json()
        if (body.edition) edition = body.edition
        if (body.license_key) licenseKey = body.license_key
        if (body.mode) mode = body.mode
      }
    } catch {
      // Ignore body parsing errors
    }
  }

  if (!licenseKey) {
    return new Response(
      JSON.stringify({ error: "Missing MaxMind License Key (license_key)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const validEditions = ["GeoLite2-Country", "GeoLite2-City", "GeoLite2-ASN"]
  if (!validEditions.includes(edition)) {
    return new Response(
      JSON.stringify({
        error: `Invalid edition. Must be one of: ${validEditions.join(", ")}`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const isIncremental = mode === "incremental"
  const dbUrl = Deno.env.get("SUPABASE_DB_URL")
  if (!dbUrl) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_DB_URL environment variable is missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  const sql = postgres(dbUrl, {
    // Disable ssl check for local Docker network, enable if required or let postgresjs handle it
    ssl: dbUrl.includes("127.0.0.1") || dbUrl.includes("localhost") || dbUrl.includes("db:") ? false : "require",
  })

  const downloadUrl = `https://download.maxmind.com/app/geoip_download?edition_id=${edition}-CSV&suffix=zip&license_key=${licenseKey}`

  try {
    console.log(`Starting seeder process for ${edition} in ${mode} mode...`)

    // 2. Download the GeoLite2 ZIP archive
    console.log(`Downloading database from MaxMind...`)
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(
        `Failed to download MaxMind database: ${response.statusText} (${response.status})`
      )
    }

    const zipBlob = await response.blob()
    const zipReader = new ZipReader(new BlobReader(zipBlob))
    const entries = await zipReader.getEntries()
    console.log(`Successfully downloaded ZIP containing ${entries.length} files.`)

    // Define table targets - always use staging tables for initial COPY
    const tables = {
      countryLocations: "geolite.country_locations_staging",
      countryBlocks: "geolite.country_blocks_staging",
      cityLocations: "geolite.city_locations_staging",
      cityBlocks: "geolite.city_blocks_staging",
      asnBlocks: "geolite.asn_blocks_staging",
    }

    // 3. TRUNCATE the staging tables first to ensure a clean staging area
    console.log(`Truncating staging tables for a clean import...`)
    if (edition === "GeoLite2-Country") {
      await sql`truncate table geolite.country_locations_staging, geolite.country_blocks_staging`
    } else if (edition === "GeoLite2-City") {
      await sql`truncate table geolite.city_locations_staging, geolite.city_blocks_staging`
    } else if (edition === "GeoLite2-ASN") {
      await sql`truncate table geolite.asn_blocks_staging`
    }

    const report: Record<string, number> = {}

    // 4. Decompress and Stream CSV Entries
    for (const entry of entries) {
      const filename = entry.filename

      if (edition === "GeoLite2-Country") {
        if (filename.endsWith("GeoLite2-Country-Locations-en.csv")) {
          console.log(`Seeding Country Locations...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.countryLocations,
            COUNTRY_LOCATIONS_COLS
          )
          report.countryLocations = count
          console.log(`Seeded ${count} country locations.`)
        } else if (filename.endsWith("GeoLite2-Country-Blocks-IPv4.csv")) {
          console.log(`Seeding Country IPv4 Blocks...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.countryBlocks,
            COUNTRY_BLOCKS_COLS
          )
          report.countryBlocksIPv4 = count
          console.log(`Seeded ${count} country IPv4 blocks.`)
        } else if (filename.endsWith("GeoLite2-Country-Blocks-IPv6.csv")) {
          console.log(`Seeding Country IPv6 Blocks...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.countryBlocks,
            COUNTRY_BLOCKS_COLS
          )
          report.countryBlocksIPv6 = count
          console.log(`Seeded ${count} country IPv6 blocks.`)
        }
      } else if (edition === "GeoLite2-City") {
        if (filename.endsWith("GeoLite2-City-Locations-en.csv")) {
          console.log(`Seeding City Locations...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.cityLocations,
            CITY_LOCATIONS_COLS
          )
          report.cityLocations = count
          console.log(`Seeded ${count} city locations.`)
        } else if (filename.endsWith("GeoLite2-City-Blocks-IPv4.csv")) {
          console.log(`Seeding City IPv4 Blocks...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.cityBlocks,
            CITY_BLOCKS_COLS
          )
          report.cityBlocksIPv4 = count
          console.log(`Seeded ${count} city IPv4 blocks.`)
        } else if (filename.endsWith("GeoLite2-City-Blocks-IPv6.csv")) {
          console.log(`Seeding City IPv6 Blocks...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.cityBlocks,
            CITY_BLOCKS_COLS
          )
          report.cityBlocksIPv6 = count
          console.log(`Seeded ${count} city IPv6 blocks.`)
        }
      } else if (edition === "GeoLite2-ASN") {
        if (filename.endsWith("GeoLite2-ASN-Blocks-IPv4.csv")) {
          console.log(`Seeding ASN IPv4 Blocks...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.asnBlocks,
            ASN_BLOCKS_COLS
          )
          report.asnBlocksIPv4 = count
          console.log(`Seeded ${count} ASN IPv4 blocks.`)
        } else if (filename.endsWith("GeoLite2-ASN-Blocks-IPv6.csv")) {
          console.log(`Seeding ASN IPv6 Blocks...`)
          const count = await processCsvEntry(
            entry,
            sql,
            tables.asnBlocks,
            ASN_BLOCKS_COLS
          )
          report.asnBlocksIPv6 = count
          console.log(`Seeded ${count} ASN IPv6 blocks.`)
        }
      }
    }

    await zipReader.close()

    // 5. Apply changes from Staging Tables to Production Tables
    console.log(`Applying changes from staging to production (${mode} mode)...`)
    await sql.begin(async (sqlTrans) => {
      if (edition === "GeoLite2-Country") {
        if (isIncremental) {
          await sqlTrans`
            insert into geolite.country_locations select * from geolite.country_locations_staging
            on conflict (geoname_id) do update set
              locale_code = excluded.locale_code,
              continent_code = excluded.continent_code,
              continent_name = excluded.continent_name,
              country_iso_code = excluded.country_iso_code,
              country_name = excluded.country_name,
              is_in_european_union = excluded.is_in_european_union
          `
          await sqlTrans`
            insert into geolite.country_blocks select * from geolite.country_blocks_staging
            on conflict (network) do update set
              geoname_id = excluded.geoname_id,
              registered_country_geoname_id = excluded.registered_country_geoname_id,
              represented_country_geoname_id = excluded.represented_country_geoname_id,
              is_anonymous_proxy = excluded.is_anonymous_proxy,
              is_satellite_provider = excluded.is_satellite_provider,
              is_anycast = excluded.is_anycast
          `
        } else {
          await sqlTrans`truncate table geolite.country_locations`
          await sqlTrans`insert into geolite.country_locations select * from geolite.country_locations_staging`
          await sqlTrans`truncate table geolite.country_blocks`
          await sqlTrans`insert into geolite.country_blocks select * from geolite.country_blocks_staging`
        }
        await sqlTrans`truncate table geolite.country_locations_staging, geolite.country_blocks_staging`
      } else if (edition === "GeoLite2-City") {
        if (isIncremental) {
          await sqlTrans`
            insert into geolite.city_locations select * from geolite.city_locations_staging
            on conflict (geoname_id) do update set
              locale_code = excluded.locale_code,
              continent_code = excluded.continent_code,
              continent_name = excluded.continent_name,
              country_iso_code = excluded.country_iso_code,
              country_name = excluded.country_name,
              subdivision_1_iso_code = excluded.subdivision_1_iso_code,
              subdivision_1_name = excluded.subdivision_1_name,
              subdivision_2_iso_code = excluded.subdivision_2_iso_code,
              subdivision_2_name = excluded.subdivision_2_name,
              city_name = excluded.city_name,
              metro_code = excluded.metro_code,
              time_zone = excluded.time_zone,
              is_in_european_union = excluded.is_in_european_union
          `
          await sqlTrans`
            insert into geolite.city_blocks select * from geolite.city_blocks_staging
            on conflict (network) do update set
              geoname_id = excluded.geoname_id,
              registered_country_geoname_id = excluded.registered_country_geoname_id,
              represented_country_geoname_id = excluded.represented_country_geoname_id,
              is_anonymous_proxy = excluded.is_anonymous_proxy,
              is_satellite_provider = excluded.is_satellite_provider,
              postal_code = excluded.postal_code,
              latitude = excluded.latitude,
              longitude = excluded.longitude,
              accuracy_radius = excluded.accuracy_radius,
              is_anycast = excluded.is_anycast
          `
        } else {
          await sqlTrans`truncate table geolite.city_locations`
          await sqlTrans`insert into geolite.city_locations select * from geolite.city_locations_staging`
          await sqlTrans`truncate table geolite.city_blocks`
          await sqlTrans`insert into geolite.city_blocks select * from geolite.city_blocks_staging`
        }
        await sqlTrans`truncate table geolite.city_locations_staging, geolite.city_blocks_staging`
      } else if (edition === "GeoLite2-ASN") {
        if (isIncremental) {
          await sqlTrans`
            insert into geolite.asn_blocks select * from geolite.asn_blocks_staging
            on conflict (network) do update set
              autonomous_system_number = excluded.autonomous_system_number,
              autonomous_system_organization = excluded.autonomous_system_organization
          `
        } else {
          await sqlTrans`truncate table geolite.asn_blocks`
          await sqlTrans`insert into geolite.asn_blocks select * from geolite.asn_blocks_staging`
        }
        await sqlTrans`truncate table geolite.asn_blocks_staging`
      }
    })
    console.log(`Changes applied successfully.`)

    // Close Database Connection
    await sql.end()

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${edition} in ${mode} mode.`,
        report,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Seeder failed:", error)
    try {
      await sql.end()
    } catch {
      // Ignore if connection already closed
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred during seeding.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
