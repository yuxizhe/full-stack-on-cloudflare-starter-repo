# Database Schema Documentation

This document describes the D1 database schema and how to use it with Drizzle ORM.

## Database Configuration

The project uses Cloudflare D1 database: `claude-test` (ID: `da1052c4-3afc-42e2-9dad-6eeeff54342b`)

## Tables

### 1. `links` - URL Shortening Links

Stores URL shortening links and their configurations.

**Columns:**
- `link_id` (text, PRIMARY KEY) - Unique identifier for the link
- `account_id` (text, NOT NULL) - Owner account ID
- `destinations` (text, NOT NULL) - JSON string of destination URLs
- `created` (timestamp, NOT NULL) - Creation timestamp (auto-generated)
- `updated` (timestamp, NOT NULL) - Last update timestamp (auto-generated)
- `name` (text, NOT NULL) - Display name for the link

### 2. `destination_evaluations` - AI Evaluation Results

Stores AI-powered evaluation results for destination URLs.

**Columns:**
- `id` (text, PRIMARY KEY) - Unique evaluation ID
- `link_id` (text, NOT NULL) - Associated link ID
- `account_id` (text, NOT NULL) - Owner account ID
- `destination_url` (text, NOT NULL) - URL being evaluated
- `status` (text, NOT NULL) - Evaluation status (e.g., "safe", "suspicious", "malicious")
- `reason` (text, NOT NULL) - AI explanation for the evaluation
- `created_at` (timestamp, NOT NULL) - Creation timestamp (auto-generated)

### 3. `link_clicks` - Click Analytics

Stores analytics data for link clicks with geolocation information.

**Columns:**
- `id` (text, NOT NULL) - Link ID
- `account_id` (text, NOT NULL) - Account ID
- `country` (text, NULLABLE) - Country code from geolocation
- `destination` (text, NOT NULL) - Destination URL clicked
- `clicked_time` (timestamp, NOT NULL) - When the click occurred
- `latitude` (real, NULLABLE) - Geolocation latitude
- `longitude` (real, NULLABLE) - Geolocation longitude

## Usage Examples

### Initialize Database

```typescript
import { initDatabase, getDb } from "@repo/data-ops/database";

// In your Worker's fetch handler
export default class DataService extends WorkerEntrypoint<Env> {
  async fetch(request: Request) {
    // Initialize database connection
    initDatabase(this.env.DB);

    // Now you can use the database
    const db = getDb();
    // ...
  }
}
```

### Create a Link

```typescript
import { createLink } from "@repo/data-ops/queries";

const newLink = await createLink({
  linkId: "abc123",
  accountId: "user-123",
  destinations: JSON.stringify(["https://example.com"]),
  name: "My Link",
  created: new Date(),
  updated: new Date(),
});
```

### Get Links for an Account

```typescript
import { getLinksByAccount } from "@repo/data-ops/queries";

const links = await getLinksByAccount("user-123", 50);
```

### Record a Click

```typescript
import { recordLinkClick } from "@repo/data-ops/queries";

await recordLinkClick({
  id: "abc123",
  accountId: "user-123",
  country: "US",
  destination: "https://example.com",
  clickedTime: new Date(),
  latitude: 37.7749,
  longitude: -122.4194,
});
```

### Get Click Analytics

```typescript
import { getClickCount, getClicksByCountry } from "@repo/data-ops/queries";

// Get total clicks
const totalClicks = await getClickCount("abc123");

// Get clicks by country
const clicksByCountry = await getClicksByCountry("abc123");
// Returns: [{ country: "US", count: 42 }, { country: "UK", count: 18 }, ...]
```

### Create Destination Evaluation

```typescript
import { createDestinationEvaluation } from "@repo/data-ops/queries";

const evaluation = await createDestinationEvaluation({
  id: "eval-123",
  linkId: "abc123",
  accountId: "user-123",
  destinationUrl: "https://example.com",
  status: "safe",
  reason: "This URL appears to be safe based on AI analysis.",
  createdAt: new Date(),
});
```

## Available Query Functions

### Links
- `createLink(data)` - Create a new link
- `getLinkById(linkId)` - Get link by ID
- `getLinksByAccount(accountId, limit?)` - Get all links for an account
- `updateLink(linkId, data)` - Update a link
- `deleteLink(linkId)` - Delete a link

### Destination Evaluations
- `createDestinationEvaluation(data)` - Create evaluation
- `getDestinationEvaluationById(id)` - Get evaluation by ID
- `getEvaluationsByLink(linkId)` - Get all evaluations for a link
- `getEvaluationsByAccount(accountId, limit?)` - Get evaluations by account
- `getEvaluationByDestination(linkId, destinationUrl)` - Get specific evaluation

### Link Clicks
- `recordLinkClick(data)` - Record a click
- `getClicksByLink(linkId, limit?)` - Get clicks for a link
- `getClicksByAccount(accountId, limit?)` - Get clicks by account
- `getClickCount(linkId)` - Get total click count
- `getClicksByCountry(linkId)` - Get click statistics by country
- `getRecentClicks(linkId, hoursAgo)` - Get recent clicks within time range

## TypeScript Types

All tables export TypeScript types:

```typescript
import type {
  Link,
  NewLink,
  DestinationEvaluation,
  NewDestinationEvaluation,
  LinkClick,
  NewLinkClick
} from "@repo/data-ops/database";
```

- Types ending with `New*` are for insertions (some fields optional)
- Regular types are for selections (all fields present)
