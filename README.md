# ResponseRift

ResponseRift is a JSON-driven mock REST API built with Next.js App Router. Its main API engine is [`app/api/[...slug]/route.ts`](./app/api/[...slug]/route.ts), which reads user-defined JSON files from `app/data` and turns them into usable REST endpoints with relationship-aware nested routes.

The project is designed for frontend prototyping, demos, API testing, local development workflows, and teams that want realistic mock data without setting up a database or backend service.

## What is new

The current architecture is centered around dynamic mock APIs created from JSON files:

- Add a file such as `app/data/posts.json`, `app/data/authors.json`, or `app/data/products.json`
- ResponseRift automatically exposes the resource under `/api/<resource>`
- Relationship routes are inferred from the JSON shape by convention
- APIs are accessible from browsers, Postman, API testers, `fetch`, React, Next.js, and other frontend frameworks
- Pretty JSON responses are returned across the API surface for easier inspection during development
- CORS is enabled for `/api/*`

The explicit routes under `app/api/users/...`, `app/api/posts/...`, and similar folders remain in the project as developer demo/reference routes. The primary engine is still the catch-all route backed by the `app/data` folder.

## Core features

- Dynamic REST endpoints generated from JSON files in `app/data`
- Collection and single-item endpoints such as `/api/posts` and `/api/posts/1`
- Convention-based nested relationship routes
- Pretty JSON output for easier debugging and inspection
- CORS-enabled API access for browser and client-side applications
- Demo resource routes for common entities such as users, posts, products, carts, orders, albums, photos, todos, reviews, categories, and tags
- Zero database setup
- Fast local development with Next.js

## Use cases

ResponseRift is useful when you need a mock API that behaves like a real backend without the overhead of building one first.

- Frontend development before the production backend is ready
- API integration testing in React, Next.js, Vue, Angular, Svelte, mobile apps, or plain JavaScript
- Local mock services for admin dashboards, product prototypes, and internal tools
- Demo environments where realistic endpoints matter more than persistence
- Teaching or learning REST concepts with editable local JSON data
- Reproducing resource relationships such as users, posts, comments, carts, orders, products, and profiles

## How it works

ResponseRift loads JSON files from `app/data` through [`lib/mock-api/loadMockData.ts`](./lib/mock-api/loadMockData.ts). The dynamic route at [`app/api/[...slug]/route.ts`](./app/api/[...slug]/route.ts) then exposes those files as REST resources.

Examples:

- `app/data/posts.json` -> `/api/posts`
- `app/data/users.json` -> `/api/users`
- `app/data/profile.json` -> `/api/profile`
- `app/data/profiles.json` -> `/api/profiles`

If your JSON follows common naming conventions, ResponseRift can also infer nested relationships.

Examples:

- `posts[].userId` with `users[].id` -> `/api/users/1/posts` and `/api/posts/1/user`
- `comments[].postId` with `posts[].id` -> `/api/posts/1/comments`
- `reviews[].productId` with `products[].id` -> `/api/products/1/reviews`
- `albums[].userId` with `users[].id` -> `/api/users/1/albums`
- `photos[].albumId` with `albums[].id` -> `/api/albums/1/photos`

The route resolver also handles common embedded patterns such as:

- `post.tags` matched against `tags.id` or `tags.name`
- `post.category` matched against `categories.name`
- `cart.products[].productId` matched against `products.id`

## Installation

Prerequisites:

- Node.js 18 or newer
- npm

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

Default local URL:

```txt
http://localhost:3000
```

## Local development workflow

The standard workflow is simple:

1. Create or update JSON files inside `app/data`
2. Start the dev server with `npm run dev`
3. Open the generated endpoints under `/api/...`
4. Use the API from Postman, browser fetch, frontend apps, or API testing tools

Example endpoints:

```txt
http://localhost:3000/api/users
http://localhost:3000/api/posts
http://localhost:3000/api/products
http://localhost:3000/api/profile
http://localhost:3000/api/users/1/posts
http://localhost:3000/api/posts/1/comments
```

## Creating your own JSON resource

The main entry point for custom mock APIs is the `app/data` folder.

If you add `app/data/posts.json`, ResponseRift will expose `/api/posts`.

Example file:

```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "Getting started with mock APIs",
    "body": "This is a sample post served directly from app/data/posts.json.",
    "tags": ["api", "mock", "frontend"],
    "category": "API Design",
    "createdAt": "2026-01-10T09:00:00Z"
  },
  {
    "id": 2,
    "userId": 2,
    "title": "Using JSON files as local backend data",
    "body": "ResponseRift turns this file into a REST resource without a database.",
    "tags": ["json", "testing"],
    "category": "Developer Tools",
    "createdAt": "2026-01-11T10:30:00Z"
  }
]
```

That file gives you:

```txt
/api/posts
/api/posts/1
/api/posts/2
```

## Creating related resources

To model relationships, create separate JSON files and connect them with consistent keys.

Example:

### `app/data/users.json`

```json
[
  {
    "id": 1,
    "name": "Ava Reed",
    "username": "avareed",
    "email": "ava@example.com"
  },
  {
    "id": 2,
    "name": "Noah Kent",
    "username": "noahkent",
    "email": "noah@example.com"
  }
]
```

### `app/data/posts.json`

```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "First post",
    "body": "Connected to user 1"
  },
  {
    "id": 2,
    "userId": 1,
    "title": "Second post",
    "body": "Also connected to user 1"
  },
  {
    "id": 3,
    "userId": 2,
    "title": "Third post",
    "body": "Connected to user 2"
  }
]
```

Resulting routes:

```txt
/api/users
/api/users/1
/api/posts
/api/posts/1
/api/users/1/posts
/api/users/2/posts
/api/posts/1/user
```

## Relationship conventions

To get the best results from the dynamic route engine, follow these conventions:

- Use `id` for the primary key of each item
- Use foreign keys like `userId`, `postId`, `productId`, `albumId`, `cartId`
- Use plural filenames for collections when possible, such as `users.json`, `posts.json`, `products.json`
- Keep relationship names consistent across files
- For category-style lookups, use a stable string field such as `category` and match it against a collection like `categories.json`
- For tag-style lookups, use arrays like `tags` and match them by `id` or `name`

Examples:

- `authorId` links to `authors[].id`
- `companyId` links to `companies[].id`
- `projectId` links to `projects[].id`

## Browser, frontend, and API client usage

ResponseRift is configured so the API does not block normal frontend or API client usage.

- Browser requests are allowed
- `fetch` works from client-side JavaScript
- React and Next.js apps can call the endpoints directly
- Postman and API testers work with preflight-enabled CORS handling
- `OPTIONS` requests are handled at the `/api/*` boundary

Example using plain JavaScript:

```js
async function loadPosts() {
  const response = await fetch("http://localhost:3000/api/posts");
  const data = await response.json();
  console.log(data);
}

loadPosts();
```

Example using React or Next.js client code:

```tsx
useEffect(() => {
  fetch("http://localhost:3000/api/users/1/posts")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}, []);
```

## Data persistence

ResponseRift is intended for mock and local-development use.

- Source of truth is `app/data/*.json`
- Route handlers use in-memory copies for mutations in most explicit demo routes
- Changes made through `POST`, `PUT`, or `DELETE` are generally not written back to disk
- A server restart resets the in-memory state to the JSON files on disk

This is useful for testing and demos, but it is not meant to replace a production database.

## API overview

ResponseRift ships with reference/demo routes for common resources.

| Resource | List | Single | Methods | Common query params |
|---|---|---|---|---|
| Users | `/api/users` | `/api/users/:id` | GET, POST, PUT, DELETE | `limit`, `offset`, `q` |
| Posts | `/api/posts` | `/api/posts/:id` | GET, POST, PUT, DELETE | `userId`, `tag`, `category`, `limit`, `offset` |
| Products | `/api/products` | `/api/products/:id` | GET, POST, PUT, DELETE | `category`, `limit`, `offset` |
| Carts | `/api/carts` | `/api/carts/:id` | GET, POST, PUT, DELETE | `userId` |
| Orders | `/api/orders` | `/api/orders/:id` | GET, POST, PUT, DELETE | `userId`, `status`, `limit`, `offset` |
| Reviews | `/api/reviews` | `/api/reviews/:id` | GET, POST, PUT, DELETE | `productId`, `userId`, `limit`, `offset` |
| Categories | `/api/categories` | `/api/categories/:id` | GET, POST, PUT, DELETE | `limit`, `offset`, `q` |
| Tags | `/api/tags` | `/api/tags/:id` | GET, POST, PUT, DELETE | `limit`, `offset`, `q` |
| Photos | `/api/photos` | `/api/photos/:id` | GET, POST, PUT, DELETE | `albumId`, `q`, `limit`, `offset` |
| Albums | `/api/albums` | `/api/albums/:id` | GET, POST, PUT, DELETE | `userId`, `q`, `limit`, `offset` |
| Todos | `/api/todos` | `/api/todos/:id` | GET, POST, PUT, DELETE | `userId`, `completed`, `q`, `limit`, `offset` |

## Nested route examples

These reference/demo routes are available in the project today:

- `/api/users/:id/posts`
- `/api/users/:id/albums`
- `/api/users/:id/todos`
- `/api/users/:id/reviews`
- `/api/users/:id/profiles`
- `/api/users/:id/carts`
- `/api/users/:id/orders`
- `/api/posts/:id/comments`
- `/api/posts/:id/user`
- `/api/posts/:id/categories`
- `/api/posts/:id/tags`
- `/api/products/:id/reviews`
- `/api/products/:id/categories`
- `/api/products/:id/carts`
- `/api/albums/:id/photos`
- `/api/albums/:id/user`
- `/api/photos/:id/album`
- `/api/carts/:id/products`
- `/api/carts/:id/user`
- `/api/carts/:id/orders`
- `/api/orders/:id/cart`
- `/api/orders/:id/user`
- `/api/reviews/:id/product`
- `/api/reviews/:id/user`
- `/api/todos/:id/user`

## Request examples

List posts:

```bash
curl "http://localhost:3000/api/posts?limit=10&offset=0"
```

Get a single user:

```bash
curl "http://localhost:3000/api/users/1"
```

Get posts for a user:

```bash
curl "http://localhost:3000/api/users/1/posts"
```

Get tags for a post:

```bash
curl "http://localhost:3000/api/posts/1/tags"
```

Get products inside a cart:

```bash
curl "http://localhost:3000/api/carts/1/products"
```

Create a user:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "content-type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","username":"jane"}'
```

Create a post:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "content-type: application/json" \
  -d '{
    "userId": 1,
    "title": "My New Post",
    "body": "This is a sample post body.",
    "tags": ["api", "mock"],
    "category": "API Design"
  }'
```

## Validation and errors

Typical response patterns:

- Validation issues return `400`
- Missing resources return `404`
- JSON responses are formatted for readability

Examples:

```json
{ "errors": ["Missing or invalid \"name\""] }
```

```json
{ "error": "User not found" }
```

## Project structure

```txt
app/
  api/
    [...slug]/route.ts
    users/
    posts/
    products/
    carts/
    orders/
    reviews/
    albums/
    photos/
    todos/
    categories/
    tags/
  data/
    users.json
    posts.json
    products.json
    carts.json
    orders.json
    reviews.json
    albums.json
    photos.json
    todos.json
    categories.json
    tags.json
lib/
  mock-api/
    loadMockData.ts
proxy.ts
```

## Notes for developers

- The dynamic route engine is the main extensibility layer
- The explicit `app/api/**` routes are reference implementations and demos
- For new mock resources, prefer adding JSON files first
- Keep your data model conventions clean if you want nested relationships to resolve automatically
- If you need production-grade persistence, authorization, or business rules, this project should remain the mock layer rather than the final backend

## License

This repository includes an MIT license. See [`LICENSE.txt`](./LICENSE.txt) for details.
