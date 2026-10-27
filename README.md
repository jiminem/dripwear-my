# dripwear.my

Responsive custom teamwear catalog based on DRIP PRICELIST (2026).pdf. The catalog includes 6 cuttings, 16 collars and 4 fabrics with artwork extracted from the supplied PDF.

Run npm.cmd run dev on Windows. To use port 4174, set the PORT environment variable to 4174 before starting.

There is no cart, checkout or order storage. All product and quotation enquiries open WhatsApp to the number in config.js. Products are maintained in catalog-data.js; this catalog uses the supplied pricelist rather than a Shopify API connection.

The estimator applies quantity-based unit pricing plus cutting and collar adjustments. Fabric charges, design, shipping and final terms must be confirmed with admin. The original PDF is linked in the catalog.

Checks: npm.cmd run check. Catalog data, pricing boundaries and direct enquiry flows have been checked with a DOM stub; browser visual testing was unavailable.

## Admin and albums

Open /admin.html to sign in. On first launch, the server prints a one-time private setup link. Use that link to choose an admin password of at least 12 characters. No default password exists. Setup is disabled after the account is created. Sessions expire after eight hours and after server restart. Passwords use scrypt; sessions use HttpOnly SameSite cookies and mutations require CSRF and same-origin verification.

The admin can edit hero copy, the catalog heading, the WhatsApp number, and up to 100 albums. Each album supports a title, category (Feedback, Collaboration, Sponsor), description, cover and up to 100 PNG/JPEG/WebP photos (8 MB each). Photos can have captions and be reordered. Albums may be saved as drafts or published. Uploaded files have random names and are publicly served; don't upload private images. Removing a photo or album hides the reference but leaves the file on disk. Only published albums with photos appear on the storefront.

Settings, password hash and aggregate activity counts persist in .private/. Photo files persist in uploads/. Both are ignored by Git and must be backed up separately. Static serving uses an allowlist: .private, server source and arbitrary project files are not served. Do not replace this server with a generic static file server.

Analytics are aggregate event counts for page views, WhatsApp clicks and album opens, recorded by Malaysia calendar day. They are not unique visitor or sales figures. No visitor identity or IP address is stored in analytics. The login rate limiter holds temporary IP-based counters in server memory.

This runs locally on 127.0.0.1. For public hosting, retain the backend and persistent storage, configure HTTPS and NODE_ENV=production (Secure cookies), and use a trusted reverse proxy. A static-only host cannot run this admin. Catalog prices remain in catalog-data.js; the admin currently edits the listed storefront text and albums.

Run npm.cmd test for isolated backend authentication, permissions, uploads, publication and analytics checks. Tests use their own data directory and do not create the real admin account.

## Vercel production

The production build copies an explicit list of public files to dist/. API routes execute api/entry.js and cloud-backend.cjs. Private Vercel Blob storage persists the password hash, sessions, settings, album metadata, uploaded photos and aggregate analytics. Conditional writes with fresh ETags prevent concurrent updates from silently overwriting state. This storage pattern is intended for a small storefront; migrate high-volume analytics to a database if traffic grows.

Required production environment: BLOB_READ_WRITE_TOKEN, connected from the project's private Blob store. Existing local admin data can be migrated once with scripts/migrate-cloud.cjs, run with production environment variables. It refuses to replace existing cloud state. Never commit .private/, .env*, uploads/ or .vercel/.

The existing admin password is preserved by migration. HTTPS production sessions use Secure, HttpOnly, SameSite cookies. Draft images are visible only to a signed-in admin in production; published album images are public through the media API. Online image uploads support up to 3 MB each because of serverless request limits.

GitHub: https://github.com/jiminem/dripwear-my (private). Vercel project: dripwear-my under jiminems-projects. Main is the production branch.

Checks: npm.cmd run check, npm.cmd test, npm.cmd run build. Isolated live-storage checks: vercel env run -e production -- node tests/cloud-integration.cjs. They use their own private state object and remove the test data afterward.

Analytics dashboard refreshes every 15 seconds while visible, with a Malaysia-time last-updated indicator. Live collection excludes signed-in admin sessions, known bot user agents and local/mobile previews. Event IDs deduplicate re-submissions for 10 minutes. These are actual event counts, not unique visitors or sales; unknown bots can still be counted. The one-time operator reset script backs up previous totals privately before clearing analytics.
