# Restaurant Ordering

Restaurant Ordering is a small full-stack restaurant menu and ordering demo. It has a customer-facing menu, a management console for maintaining the menu, and an Express server that provides the shared API and real-time change notifications.

The project is intended for local development and assessment. The server stores data in memory, so changes and orders are reset when the server restarts.

## What the project does

Customers can:

- Browse menu items by category.
- Search and filter the menu.
- Add fixed-price items to a cart.
- Enter a price for items where the restaurant allows customer-set pricing.
- Adjust quantities and remove items.
- See the 10% house discount and order total.
- Submit an order and receive a success or conflict message.

Restaurant staff can use the management application to:

- Add, edit, enable, disable, and delete menu items.
- Add, edit, and delete categories that have no menu items assigned to them.
- Search and filter menu items.
- Review submitted orders and their calculated totals.

Menu changes are broadcast through Socket.IO, so the customer and management applications can refresh their data when another user changes the menu.

## Project structure

```text
.
|-- client/       Angular workspace with both browser applications
|   `-- projects/
|       |-- menu/  Customer-facing restaurant menu
|       `-- setup/ Management source used by the `management` Angular target
|-- common/       Shared TypeScript types and the house discount constant
|-- server/       Express API, in-memory data, validation, and Socket.IO
`-- README.md
```

The repository uses npm workspaces. Shared types should be added to `common` rather than duplicated in the client or server.

## Requirements

- Node.js compatible with the repository's npm version.
- npm 11.17.0 or a compatible npm release.

Install dependencies from the repository root:

```bash
npm install
```

## Running the applications

Start the customer app, management app, and API together from the repository root:

```bash
npm run dev
```

The applications are available at:

- Customer menu: <http://localhost:4200>
- Management console: <http://localhost:4201>
- API: <http://localhost:3000>

The root development command runs the two Angular development servers and the server workspace concurrently. Stop the command with `Ctrl+C`.

To run only one part of the system, use the workspace commands:

```bash
npm run dev --workspace server
npm run dev:menu --workspace client
npm run dev:management --workspace client
```

The client development servers proxy API requests through the local server configuration. The menu client uses `http://localhost:3000` as its server URL.

## Building

Build both production Angular applications:

```bash
npm run build --workspace client
```

Build one application:

```bash
npm run build:menu --workspace client
npm run build:management --workspace client
```

Build output is written under `client/dist/` and is ignored by Git.

## Testing and verification

Run the complete repository lint and type-check command:

```bash
npm run lint
```

This checks Prettier formatting and strict TypeScript compilation for the client and server.

Run the client unit tests:

```bash
npm run test:unit --workspace client
```

Run the client tests with coverage thresholds:

```bash
npm run test:unit:coverage --workspace client
```

Run the Angular test target in a non-watch mode:

```bash
npm run test:menu --workspace client -- --watch=false
```

Run the server validation tests:

```bash
npm run test --workspace server
```

The client also has build-watch commands for development work:

```bash
npm run watch:menu --workspace client
npm run watch:management --workspace client
```

## Managing menu data

Open <http://localhost:4201/categories> to manage categories, <http://localhost:4201/menu-items> to manage menu items, and <http://localhost:4201/orders> to review orders.

Category deletion is blocked while menu items still reference the category. Menu item changes are validated for required fields, unique IDs, valid categories, and valid prices. Disabling an item keeps it visible in the customer cart for removal while preventing checkout and calculations from including it.

The customer checkout performs a final refresh and the server repeats availability and price validation. If an item was removed, disabled, repriced, or changed between cart and checkout, the order is rejected with item-level reasons so the customer can review the cart.

## API overview

The server listens on port 3000 and exposes these routes:

| Method   | Route            | Purpose                                 |
| -------- | ---------------- | --------------------------------------- |
| `GET`    | `/categories`    | List categories with menu-item counts   |
| `POST`   | `/category`      | Create a category                       |
| `PUT`    | `/category/:id`  | Update a category                       |
| `DELETE` | `/category/:id`  | Delete an unused category               |
| `GET`    | `/menu-items`    | List menu items                         |
| `POST`   | `/menu-item`     | Create a menu item                      |
| `PUT`    | `/menu-item/:id` | Update a menu item                      |
| `DELETE` | `/menu-item/:id` | Delete a menu item                      |
| `GET`    | `/orders`        | List placed orders, newest first        |
| `POST`   | `/orders`        | Create an order with an idempotency key |

The server emits `menu-changed` after category or menu-item mutations and `orders-changed` after a successful order. Repeating an order request with the same idempotency key returns the existing order instead of creating a duplicate.

## Data and reset behavior

Initial categories and menu items are defined in `server/src/data/index.ts`. Orders and management changes are held in process memory. Restarting the server restores the initial menu and clears placed orders.

There is no authentication or persistent database in this demo.

## Design decisions and production readiness

The project separates the customer menu, management console, Express API, and shared domain types. Angular signals keep feature state local, CDK virtual scrolling supports larger menus, Socket.IO keeps menu and order views in sync, and checkout validates prices and availability on both client and server. Idempotency keys prevent duplicate orders.

The demo deliberately uses in-memory data, a fixed discount, a small fully loaded dataset, and no authentication, payments, inventory, delivery workflow, or persistent order lifecycle. Restarting the server resets menu changes and orders.

For production, it would need a durable database with transactions and unique idempotency constraints, authentication and staff authorization, secure environment configuration, stronger validation and rate limiting, structured logging and monitoring, resilient multi-instance real-time updates, end-to-end and load testing, deployment automation, backups, and a complete accessibility and security review.

## Formatting and coding conventions

The project uses two-space indentation, single quotes in TypeScript, Prettier formatting, strict TypeScript settings, standalone Angular components, signals for local reactive state, and native JavaScript private members where appropriate.

Before submitting changes, run:

```bash
npm run lint
npm run build --workspace client
npm run test:unit --workspace client
npm run test --workspace server
```
