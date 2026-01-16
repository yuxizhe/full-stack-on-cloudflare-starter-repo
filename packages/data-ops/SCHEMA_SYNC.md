# Schema Synchronization Guide

This guide explains how to pull the latest schema from the Cloudflare D1 database.

## Prerequisites

- Wrangler CLI configured with Cloudflare authentication
- Access to the D1 database: `claude-test` (ID: `da1052c4-3afc-42e2-9dad-6eeeff54342b`)

## Method 1: Using Wrangler D1 Export (Recommended)

This method exports the complete schema including all tables and indexes.

### Step 1: Export Schema

```bash
cd apps/data-service
npx wrangler d1 export claude-test --remote --output=../../packages/data-ops/schema.sql
```

This will:
- Connect to the remote D1 database
- Export all tables, indexes, and constraints
- Save to `packages/data-ops/schema.sql`

### Step 2: Update Drizzle Schema

After exporting, manually update `packages/data-ops/src/db/schema.ts` to match the exported SQL schema. Pay attention to:

1. **Data types**: Use correct Drizzle types (`text`, `numeric`, `real`)
2. **Indexes**: Add index definitions using the `index()` function
3. **Constraints**: Ensure primary keys and NOT NULL constraints match

### Step 3: Rebuild Package

```bash
cd ../../
pnpm run build-package
```

## Method 2: Using Drizzle Kit Pull (Alternative)

This method uses Drizzle Kit's introspection feature.

### Prerequisites

Set environment variables:
```bash
export CLOUDFLARE_ACCOUNT_ID=3c181a61e54b069ab102a8c08e966237
export CLOUDFLARE_DATABASE_ID=da1052c4-3afc-42e2-9dad-6eeeff54342b
export CLOUDFLARE_D1_TOKEN=$CLOUDFLARE_API_TOKEN
```

### Execute Pull

```bash
cd packages/data-ops
pnpm run pull
```

This runs `drizzle-kit pull` which will:
- Connect to D1 via Cloudflare API
- Introspect the database schema
- Generate schema files in `src/drizzle-out/`

**Note**: This method may encounter network issues with the Cloudflare API. If it fails, use Method 1.

## Current Database Schema

**Database**: `claude-test`
**Database ID**: `da1052c4-3afc-42e2-9dad-6eeeff54342b`
**Account ID**: `3c181a61e54b069ab102a8c08e966237`

### Tables

1. **links** - URL shortening links
2. **destination_evaluations** - AI evaluation results
3. **link_clicks** - Click analytics with geolocation

### Indexes

- `idx_link_clicks_id`
- `idx_link_clicks_account_id`
- `idx_link_clicks_clicked_time`
- `idx_destination_evaluations_account_time` (composite)

## Timestamp Field Notes

D1 uses `numeric` type for timestamps (stored as strings in format: `YYYY-MM-DD HH:MM:SS`).

When working with timestamps in queries:
```typescript
// Convert Date to D1 numeric format
const now = new Date().toISOString().replace('T', ' ').split('.')[0];

// For comparisons
const cutoffTime = new Date(Date.now() - hours * 3600000);
const cutoffStr = cutoffTime.toISOString().replace('T', ' ').split('.')[0];
```

## Troubleshooting

### "getaddrinfo EAI_AGAIN" error

This is a network/DNS issue. Solutions:
1. Use Method 1 (wrangler export) instead
2. Wait and retry with exponential backoff
3. Check proxy settings

### Type mismatches after pull

Ensure timestamp fields use `numeric` type, not `integer`:
```typescript
created: numeric("created")
  .notNull()
  .default(sql\`(CURRENT_TIMESTAMP)\`)
```

## Best Practices

1. **Always backup** the current `schema.ts` before pulling
2. **Review changes** carefully before committing
3. **Test queries** after schema updates
4. **Rebuild package** and test in development before deploying
5. **Document schema changes** in commit messages
