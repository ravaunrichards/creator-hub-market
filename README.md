# Creator Hub Market — v0.1.0

An original, responsive multi-vendor marketplace starter inspired by common ecommerce patterns. This is not affiliated with Amazon and does not copy its branding. It is a standalone project; it does not connect to any other Creator Hub projects.

## Requirements
- Node.js 20 or newer
- npm (no third-party packages required)

## Run locally
```bash
npm run check
npm test
npm start
```
Then open http://localhost:4174 on the same device. To test on a phone on the same Wi-Fi, run the server on a trusted network and open the computer's LAN address with port 4174; do not expose the starter publicly without adding production controls.

## Included
- Responsive mobile and desktop storefront
- Search, category filters, sorting, product detail summaries, and local page favourites
- Cart quantities and subtotal calculation
- Product catalogue API and server-side validation of order item IDs, quantities, email, and buyer name
- Order preview endpoint and session-memory order tracking
- Security headers, JSON size guard, no external runtime dependencies
- Basic automated tests

## Important limitations
This is an early starter, not a production marketplace. Products are sample catalogue entries. Orders are held in server memory and disappear on restart. No real payments are collected; PayPal is not integrated. No seller accounts, seller portal, admin dashboard, inventory database, tax/shipping calculation, refunds, email notifications, delivery integrations, product image storage, ratings moderation, or dispute handling are implemented. The order lookup endpoint is not authenticated and must not be exposed publicly as-is. Replace the in-memory data store with a persistent database, protect customer order access, implement authorization and audit logging, and integrate a verified payment provider before any public launch. Do not promise delivery or accept real customer payments with this starter.

## Configuration
`PORT` defaults to `4174`. No secrets or credentials are required for the starter. Never commit real payment or database secrets to source control.
