## ResponseRift - Next.js JSON API

A comprehensive mock REST API built with Next.js App Router. ResponseRift serves realistic resources from JSON files and supports filtering, pagination, nested routes, and in-memory mutations (non-persistent). Perfect for frontend prototyping, demos, and API testing.

### Highlights
- **12+ comprehensive resources**: users, posts, comments, products, carts, orders, reviews, categories, tags, photos, albums, todos
- **Full CRUD operations**: GET, POST, PUT, DELETE on all resources
- **Advanced filtering**: Filter by user, category, completion status, album, etc.
- **Nested routes**: User-specific posts/albums/todos, album photos, post comments
- **Search capabilities**: Text search across relevant fields
- **Pagination support**: Limit/offset pagination on list endpoints
- **In-memory mutations**: Non-persistent changes (resets on server restart)
- **Zero configuration**: No database, no environment variables needed
- **Modern tech stack**: Built with Next.js 15, TypeScript, and Tailwind CSS

---

## Quick Start (Local)

Prerequisites: Node 18+ and npm

```bash
npm run dev
# App: http://localhost:3000
# API root examples:
#   http://localhost:3000/api/users
#   http://localhost:3000/api/products
#   http://localhost:3000/api/photos
#   http://localhost:3000/api/albums
#   http://localhost:3000/api/todos
```

Notes:
- Data is loaded from `app/data/*.json` at startup and cloned in-memory for mutations.
- Changes made via POST/PUT/DELETE are not persisted to disk.

---

## Data Model & Persistence

- Source files: `app/data/*.json`
- Mutations: handled in-memory within each route file; server restart resets state
- No auth, no rate-limits, no CORS special handling (Next.js defaults)

---

## Endpoints Overview

| Resource | List | Single | Methods | Common query params |
|---|---|---|---|---|
| Users | `/api/users` | `/api/users/:id` | GET, POST, PUT, DELETE | `limit`, `offset`, `q` (search `id,name,username,email`) |
| Posts | `/api/posts` | `/api/posts/:id` | GET, POST, PUT, DELETE | `userId`, `tag`, `category`, `limit`, `offset` |
| Comments (by Post) | `/api/posts/:id/comments` | — | GET, POST | — |
| Products | `/api/products` | `/api/products/:id` | GET, POST, PUT, DELETE | `category`, `limit`, `offset` |
| Reviews (by Product) | `/api/products/:id/reviews` | — | GET, POST | — |
| Carts | `/api/carts` | `/api/carts/:id` | GET, POST, PUT, DELETE | `userId` |
| Orders | `/api/orders` | `/api/orders/:id` | GET, POST, PUT, DELETE | `userId`, `status`, `limit`, `offset` |
| Reviews | `/api/reviews` | `/api/reviews/:id` | GET, POST, PUT, DELETE | `productId`, `userId`, `limit`, `offset` |
| Categories | `/api/categories` | `/api/categories/:id` | GET, POST, PUT, DELETE | `limit`, `offset`, `q` (name/description) |
| Tags | `/api/tags` | `/api/tags/:id` | GET, POST, PUT, DELETE | `limit`, `offset`, `q` (name) |
| Photos | `/api/photos` | `/api/photos/:id` | GET, POST, PUT, DELETE | `albumId`, `q`, `limit`, `offset` |
| Albums | `/api/albums` | `/api/albums/:id` | GET, POST, PUT, DELETE | `userId`, `q`, `limit`, `offset` |
| Todos | `/api/todos` | `/api/todos/:id` | GET, POST, PUT, DELETE | `userId`, `completed`, `q`, `limit`, `offset` |

### Nested Resources (User-specific)

| Resource | Endpoint | Methods | Description |
|---|---|---|---|
| User Posts | `/api/users/:id/posts` | GET, POST | Get/create posts for a specific user |
| User Albums | `/api/users/:id/albums` | GET, POST | Get/create albums for a specific user |
| User Todos | `/api/users/:id/todos` | GET, POST | Get/create todos for a specific user |
| User Reviews | `/api/users/:id/reviews` | GET, POST | Get/create reviews by a specific user |
| Album Photos | `/api/albums/:id/photos` | GET, POST | Get/create photos in a specific album |

Notes:
- Posts `tag` filtering checks membership in `post.tags`. The dataset mixes tag IDs-as-strings and names; pass the exact value present in the post (e.g., `"1"` or `"json"`). Use `/api/tags` to resolve tag names/IDs.
- List endpoints return envelopes like `{ total, limit, offset, results }` where implemented; `carts` returns `{ total, results }`.

---

## Request/Response Examples

### Users
List (pagination + search):
```bash
curl "http://localhost:3000/api/users?limit=5&offset=0&q=anna"
```

Get by ID:
```bash
curl http://localhost:3000/api/users/1
```

Create:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "content-type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","username":"jane"}'
```

Update:
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "content-type: application/json" \
  -d '{"name":"Jane Updated"}'
```

### Posts & Comments
List posts:
```bash
curl "http://localhost:3000/api/posts?userId=5&tag=1&limit=10&offset=0"
```

Post comments for a post:
```bash
curl http://localhost:3000/api/posts/1/comments
```

Create a comment:
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "content-type: application/json" \
  -d '{"userId":2, "body":"Nice post!"}'
```

### Products
Filter by category with pagination:
```bash
curl "http://localhost:3000/api/products?category=Tech%20Gadgets&limit=5&offset=0"
```

Create:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "content-type: application/json" \
  -d '{
    "title":"Sample",
    "description":"Sample product",
    "price":9.99,
    "image":"https://picsum.photos/seed/sample/400/300",
    "category":"Misc",
    "stock":10
  }'
```

### Orders
Filter by status:
```bash
curl "http://localhost:3000/api/orders?status=Processing&limit=5&offset=0"
```

### Reviews
Filter by product and user:
```bash
curl "http://localhost:3000/api/reviews?productId=1&userId=2&limit=5&offset=0"
```

### Categories & Tags
Search:
```bash
curl "http://localhost:3000/api/categories?q=home&limit=5"
curl "http://localhost:3000/api/tags?q=json&limit=5"
```

### Photos & Albums
Get photos by album:
```bash
curl "http://localhost:3000/api/photos?albumId=1&limit=10"
```

Get albums by user:
```bash
curl "http://localhost:3000/api/albums?userId=1&limit=5"
```

Create a new photo:
```bash
curl -X POST http://localhost:3000/api/photos \
  -H "content-type: application/json" \
  -d '{
    "albumId": 1,
    "title": "My Photo",
    "url": "https://example.com/photo.jpg",
    "thumbnailUrl": "https://example.com/thumb.jpg"
  }'
```

### Todos
Get todos by user and completion status:
```bash
curl "http://localhost:3000/api/todos?userId=1&completed=false&limit=10"
```

Create a new todo:
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "content-type: application/json" \
  -d '{
    "userId": 1,
    "title": "Buy groceries",
    "completed": false
  }'
```

### Nested Resources

User-specific posts:
```bash
curl "http://localhost:3000/api/users/1/posts?limit=5"
```

User-specific albums:
```bash
curl "http://localhost:3000/api/users/1/albums?limit=5"
```

User-specific todos:
```bash
curl "http://localhost:3000/api/users/1/todos?completed=false&limit=10"
```

User-specific reviews:
```bash
curl "http://localhost:3000/api/users/1/reviews?limit=5"
```

Photos in an album:
```bash
curl "http://localhost:3000/api/albums/1/photos?limit=10"
```

Create a post for a user:
```bash
curl -X POST http://localhost:3000/api/users/1/posts \
  -H "content-type: application/json" \
  -d '{
    "title": "My New Post",
    "body": "This is the content of my post.",
    "category": "Personal"
  }'
```

---

## Validation & Errors

- Validation errors return `400` with `{ errors: string[] }`.
- Not found returns `404` with `{ error: string }`.
- Invalid JSON bodies return `400` with `{ error: string }`.

Examples:
```json
{ "errors": ["Missing or invalid \"name\""] }
```
```json
{ "error": "User not found" }
```

---

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Contributing

PRs welcome! To contribute:

- Use `app/data/*.json` as the single source of truth
- Keep list responses in `{ total, limit, offset, results }` format
- All writes are **in-memory only** (no persistence)

---

## License

**MIT © [amritkarma](https://github.com/amritkarma/responserift/blob/main/LICENSE.txt)**

This project is open-source and intended for **learning, prototyping, and testing**.

---

## ⭐️ Like it?

Give it a ⭐️ on GitHub:  
[https://github.com/amritkarma/responserift](https://github.com/amritkarma/responserift)

