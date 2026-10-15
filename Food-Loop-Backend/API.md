# FoodLoop API

Base URL: `http://localhost:3000`. Set `MONGO_URI` and a private `JWT_SECRET` of at least 32 characters in the backend `.env` file. Copy `.env.example` as a starting point. Set `FRONTEND_ORIGINS` to the comma-separated browser origins allowed to call the API.

Passwords are hashed before storage. Sign-in and registration return a bearer token that expires after 12 hours. Send it as `Authorization: Bearer <token>` for protected routes. Accounts belong to one restaurant/store or pantry; role checks and ownership checks are enforced by the API.

## Accounts

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an organization and its account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Load the signed-in account |

Registration body:

```json
{
  "role": "restaurant",
  "name": "Harvest Table",
  "email": "team@example.com",
  "password": "at-least-eight-characters",
  "address": { "line1": "10 Main St", "city": "Verona", "state": "WI", "postalCode": "53593" }
}
```

`role` accepts `restaurant`, `store` (treated as restaurant), or `pantry`. Registration returns `{ "token": "...", "user": { "id", "email", "role", "organization" } }`. Duplicate email returns `409`; invalid input returns `400`; missing JWT configuration returns `503`.

## Donations

| Method | Path | Who can use it | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/donations` | Either role | List records visible to the signed-in organization |
| `GET` | `/api/donations/available` | Pantry | List donations available to claim |
| `GET` | `/api/donations/:id` | Either role | Get an owned, assigned, or available donation |
| `GET` | `/api/donations/restaurant/:restaurantId` | Restaurant | List that account's donations |
| `GET` | `/api/donations/pantry/:pantryId` | Pantry | List that account's assigned donations |
| `GET` | `/api/donations/pantry/:pantryId/active` | Pantry | List its claimed donations |
| `POST` | `/api/donations` | Restaurant | Create an available donation |
| `PATCH` | `/api/donations/:id` | Restaurant | Edit food details while available |
| `PATCH` | `/api/donations/:id/claim` | Pantry | Claim as the signed-in pantry |
| `PATCH` | `/api/donations/:id/complete` | Assigned pantry | Mark a claimed donation complete |
| `PATCH` | `/api/donations/:id/release` | Assigned pantry | Return a claim to the available pool |
| `PATCH` | `/api/donations/:id/cancel` | Owning restaurant | Cancel an available donation |
| `DELETE` | `/api/donations/:id` | Owning restaurant | Delete an available donation |

Donation creation body uses the account's restaurant automatically:

```json
{ "foodItem": { "name": "Vegetable soup", "ingredients": ["carrots", "beans"], "amount": 12, "picture": null } }
```

The server assigns the restaurant and pantry IDs from the authenticated account. Donation lifecycle: `available -> claimed -> done`; available donations can also be cancelled, and claimed donations can be released back to `available`.

## Organizations

`GET /api/restaurants` and `GET /api/pantries` return only the signed-in account's organization. `GET /:id` and `PATCH /:id` are restricted to the account's own organization. Create accounts through `/api/auth/register`; collection `POST` is disabled. Organization deletion is disabled until account cleanup is implemented.

Errors use `{ "message": "..." }`. Common statuses: `400` invalid input, `401` missing/expired login, `403` wrong account role, `404` missing or unowned record, `409` duplicate email or invalid lifecycle action, `503` missing auth setup.
