import { BlobReader, ZipReader } from "jsr:@zip-js/zip-js@^2.7.53";
import { CsvParseStream } from "jsr:@std/csv@^1.0.4";
import postgres from "npm:postgres@^3.4.4";

// Database columns configuration
const COUNTRY_LOCATIONS_COLS = [
  "geoname_id",
  "locale_code",
  "continent_code",
  "continent_name",
  "country_iso_code",
  "country_name",
  "is_in_european_union",
];

const COUNTRY_BLOCKS_COLS = [
  "network",
  "geoname_id",
  "registered_country_geoname_id",
  "represented_country_geoname_id",
  "is_anonymous_proxy",
  "is_satellite_provider",
];

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
];

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
];

const ASN_BLOCKS_COLS = [
  "network",
  "autonomous_system_number",
  "autonomous_system_organization",
];

// Cleans CSV row values and parses them to appropriate SQL data types
function cleanRow(row: Record<string, string>, columns: string[]) {
  const cleaned: Record<string, any> = {};
  for (const key of columns) {
    const val = row[key];
    if (val === undefined || val === "") {
      cleaned[key] = null;
      continue;
    }

    if (
      [
        "geoname_id",
        "registered_country_geoname_id",
        "represented_country_geoname_id",
        "autonomous_system_number",
      ].includes(key)
    ) {
      cleaned[key] = BigInt(val);
    } else if (
      [
        "is_anonymous_proxy",
        "is_satellite_provider",
        "is_in_european_union",
      ].includes(key)
    ) {
      cleaned[key] = val === "1";
    } else if (["latitude", "longitude"].includes(key)) {
      cleaned[key] = parseFloat(val);
    } else if (["accuracy_radius"].includes(key)) {
      cleaned[key] = parseInt(val, 10);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Injects a batch of records into PostgreSQL
async function insertBatch(
  sqlClient: any,
  tableName: string,
  columns: string[],
  batch: any[],
  isIncremental = false
) {
  if (!isIncremental) {
    const parts = tableName.split(".");
    const schema = parts[0];
    const table = parts[1];
    await sqlClient`
      insert into ${sqlClient(schema)}.${sqlClient(table)} ${sqlClient(batch, columns)}
    `;
    return;
  }

  // Custom ON CONFLICT clauses for incremental updates to production tables
  if (tableName === "geolite.country_locations") {
    await sqlClient`
      insert into geolite.country_locations ${sqlClient(batch, columns)}
      on conflict (geoname_id) do update set
        locale_code = excluded.locale_code,
        continent_code = excluded.continent_code,
        continent_name = excluded.continent_name,
        country_iso_code = excluded.country_iso_code,
        country_name = excluded.country_name,
        is_in_european_union = excluded.is_in_european_union
    `;
  } else if (tableName === "geolite.country_blocks") {
    await sqlClient`
      insert into geolite.country_blocks ${sqlClient(batch, columns)}
      on conflict (network) do update set
        geoname_id = excluded.geoname_id,
        registered_country_geoname_id = excluded.registered_country_geoname_id,
        represented_country_geoname_id = excluded.represented_country_geoname_id,
        is_anonymous_proxy = excluded.is_anonymous_proxy,
        is_satellite_provider = excluded.is_satellite_provider
    `;
  } else if (tableName === "geolite.city_locations") {
    await sqlClient`
      insert into geolite.city_locations ${sqlClient(batch, columns)}
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
    `;
  } else if (tableName === "geolite.city_blocks") {
    await sqlClient`
      insert into geolite.city_blocks ${sqlClient(batch, columns)}
      on conflict (network) do update set
        geoname_id = excluded.geoname_id,
        registered_country_geoname_id = excluded.registered_country_geoname_id,
        represented_country_geoname_id = excluded.represented_country_geoname_id,
        is_anonymous_proxy = excluded.is_anonymous_proxy,
        is_satellite_provider = excluded.is_satellite_provider,
        postal_code = excluded.postal_code,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        accuracy_radius = excluded.accuracy_radius
    `;
  } else if (tableName === "geolite.asn_blocks") {
    await sqlClient`
      insert into geolite.asn_blocks ${sqlClient(batch, columns)}
      on conflict (network) do update set
        autonomous_system_number = excluded.autonomous_system_number,
        autonomous_system_organization = excluded.autonomous_system_organization
    `;
  } else {
    throw new Error(`Unknown table for incremental insert: ${tableName}`);
  }
}

// Processes a CSV file entry from the ZIP, parsing and inserting in batches
async function processCsvEntry(
  entry: any,
  sqlClient: any,
  tableName: string,
  columns: string[],
  isIncremental = false,
  batchSize = 2000
) {
  const transformStream = new TransformStream();
  const readingPromise = entry.getData(transformStream.writable);

  const recordsStream = transformStream.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new CsvParseStream({ skipFirstRow: true }));

  let batch: any[] = [];
  let totalInserted = 0;

  for await (const row of recordsStream) {
    const cleaned = cleanRow(row, columns);
    batch.push(cleaned);

    if (batch.length >= batchSize) {
      await insertBatch(sqlClient, tableName, columns, batch, isIncremental);
      totalInserted += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(sqlClient, tableName, columns, batch, isIncremental);
    totalInserted += batch.length;
  }

  await readingPromise;
  return totalInserted;
}

Deno.serve(async (req) => {
  // 1. Authorization Check (Service Role Key Only)
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (authHeader !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Parse Request Parameters
  let edition = "GeoLite2-Country";
  let licenseKey = Deno.env.get("MAXMIND_LICENSE_KEY") ?? "";
  let mode = "full"; // full (swap staging) or incremental (upsert directly)

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body.edition) edition = body.edition;
      if (body.license_key) licenseKey = body.license_key;
      if (body.mode) mode = body.mode;
    } catch {
      // Fallback to defaults if body parsing fails
    }
  } else {
    // GET request parameter parsing
    const url = new URL(req.url);
    const ed = url.searchParams.get("edition");
    const lic = url.searchParams.get("license_key");
    const md = url.searchParams.get("mode");
    if (ed) edition = ed;
    if (lic) licenseKey = lic;
    if (md) mode = md;
  }

  if (!licenseKey) {
    return new Response(
      JSON.stringify({ error: "Missing MaxMind License Key (license_key)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const validEditions = ["GeoLite2-Country", "GeoLite2-City", "GeoLite2-ASN"];
  if (!validEditions.includes(edition)) {
    return new Response(
      JSON.stringify({
        error: `Invalid edition. Must be one of: ${validEditions.join(", ")}`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const isIncremental = mode === "incremental";
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_DB_URL environment variable is missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const sql = postgres(dbUrl, {
    // Disable ssl check for local Docker network, enable if required or let postgresjs handle it
    ssl: dbUrl.includes("127.0.0.1") || dbUrl.includes("localhost") || dbUrl.includes("db:") ? false : "require",
  });

  const downloadUrl = `https://download.maxmind.com/app/geoip_download?edition_id=${edition}-CSV&suffix=zip&license_key=${licenseKey}`;

  try {
    console.log(`Starting seeder process for ${edition} in ${mode} mode...`);

    // 3. Download the GeoLite2 ZIP archive
    console.log(`Downloading database from MaxMind...`);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download MaxMind database: ${response.statusText} (${response.status})`
      );
    }

    const zipBlob = await response.blob();
    const zipReader = new ZipReader(new BlobReader(zipBlob));
    const entries = await zipReader.getEntries();
    console.log(`Successfully downloaded ZIP containing ${entries.length} files.`);

    // Define table targets based on mode
    const suffix = isIncremental ? "" : "_staging";
    const tables = {
      countryLocations: `geolite.country_locations${suffix}`,
      countryBlocks: `geolite.country_blocks${suffix}`,
      cityLocations: `geolite.city_locations${suffix}`,
      cityBlocks: `geolite.city_blocks${suffix}`,
      asnBlocks: `geolite.asn_blocks${suffix}`,
    };

    // 4. If full reload mode, TRUNCATE the staging tables first
    if (!isIncremental) {
      console.log(`Truncating staging tables for a clean import...`);
      if (edition === "GeoLite2-Country") {
        await sql`truncate table geolite.country_locations_staging, geolite.country_blocks_staging`;
      } else if (edition === "GeoLite2-City") {
        await sql`truncate table geolite.city_locations_staging, geolite.city_blocks_staging`;
      } else if (edition === "GeoLite2-ASN") {
        await sql`truncate table geolite.asn_blocks_staging`;
      }
    }

    const report: Record<string, number> = {};

    // 5. Decompress and Stream CSV Entries
    for (const entry of entries) {
      const filename = entry.filename;

      if (edition === "GeoLite2-Country") {
        if (filename.endsWith("GeoLite2-Country-Locations-en.csv")) {
          console.log(`Seeding Country Locations...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.countryLocations,
            COUNTRY_LOCATIONS_COLS,
            isIncremental
          );
          report.countryLocations = count;
          console.log(`Seeded ${count} country locations.`);
        } else if (filename.endsWith("GeoLite2-Country-Blocks-IPv4.csv")) {
          console.log(`Seeding Country IPv4 Blocks...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.countryBlocks,
            COUNTRY_BLOCKS_COLS,
            isIncremental
          );
          report.countryBlocksIPv4 = count;
          console.log(`Seeded ${count} country IPv4 blocks.`);
        } else if (filename.endsWith("GeoLite2-Country-Blocks-IPv6.csv")) {
          console.log(`Seeding Country IPv6 Blocks...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.countryBlocks,
            COUNTRY_BLOCKS_COLS,
            isIncremental
          );
          report.countryBlocksIPv6 = count;
          console.log(`Seeded ${count} country IPv6 blocks.`);
        }
      } else if (edition === "GeoLite2-City") {
        if (filename.endsWith("GeoLite2-City-Locations-en.csv")) {
          console.log(`Seeding City Locations...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.cityLocations,
            CITY_LOCATIONS_COLS,
            isIncremental
          );
          report.cityLocations = count;
          console.log(`Seeded ${count} city locations.`);
        } else if (filename.endsWith("GeoLite2-City-Blocks-IPv4.csv")) {
          console.log(`Seeding City IPv4 Blocks...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.cityBlocks,
            CITY_BLOCKS_COLS,
            isIncremental
          );
          report.cityBlocksIPv4 = count;
          console.log(`Seeded ${count} city IPv4 blocks.`);
        } else if (filename.endsWith("GeoLite2-City-Blocks-IPv6.csv")) {
          console.log(`Seeding City IPv6 Blocks...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.cityBlocks,
            CITY_BLOCKS_COLS,
            isIncremental
          );
          report.cityBlocksIPv6 = count;
          console.log(`Seeded ${count} city IPv6 blocks.`);
        }
      } else if (edition === "GeoLite2-ASN") {
        if (filename.endsWith("GeoLite2-ASN-Blocks-IPv4.csv")) {
          console.log(`Seeding ASN IPv4 Blocks...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.asnBlocks,
            ASN_BLOCKS_COLS,
            isIncremental
          );
          report.asnBlocksIPv4 = count;
          console.log(`Seeded ${count} ASN IPv4 blocks.`);
        } else if (filename.endsWith("GeoLite2-ASN-Blocks-IPv6.csv")) {
          console.log(`Seeding ASN IPv6 Blocks...`);
          const count = await processCsvEntry(
            entry,
            sql,
            tables.asnBlocks,
            ASN_BLOCKS_COLS,
            isIncremental
          );
          report.asnBlocksIPv6 = count;
          console.log(`Seeded ${count} ASN IPv6 blocks.`);
        }
      }
    }

    await zipReader.close();

    // 6. Atomically Swap Staging Tables to Production Tables
    if (!isIncremental) {
      console.log(`Performing atomic database swap transaction...`);
      await sql.begin(async (sqlTrans) => {
        if (edition === "GeoLite2-Country") {
          await sqlTrans`truncate table geolite.country_locations`;
          await sqlTrans`insert into geolite.country_locations select * from geolite.country_locations_staging`;
          await sqlTrans`truncate table geolite.country_blocks`;
          await sqlTrans`insert into geolite.country_blocks select * from geolite.country_blocks_staging`;
          // Clean up staging tables
          await sqlTrans`truncate table geolite.country_locations_staging, geolite.country_blocks_staging`;
        } else if (edition === "GeoLite2-City") {
          await sqlTrans`truncate table geolite.city_locations`;
          await sqlTrans`insert into geolite.city_locations select * from geolite.city_locations_staging`;
          await sqlTrans`truncate table geolite.city_blocks`;
          await sqlTrans`insert into geolite.city_blocks select * from geolite.city_blocks_staging`;
          // Clean up staging tables
          await sqlTrans`truncate table geolite.city_locations_staging, geolite.city_blocks_staging`;
        } else if (edition === "GeoLite2-ASN") {
          await sqlTrans`truncate table geolite.asn_blocks`;
          await sqlTrans`insert into geolite.asn_blocks select * from geolite.asn_blocks_staging`;
          // Clean up staging tables
          await sqlTrans`truncate table geolite.asn_blocks_staging`;
        }
      });
      console.log(`Atomic swap completed successfully.`);
    }

    // Close Database Connection
    await sql.end();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${edition} in ${mode} mode.`,
        report,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Seeder failed:", error);
    try {
      await sql.end();
    } catch {
      // Ignore if connection already closed
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred during seeding.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
