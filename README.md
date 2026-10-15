# FoodLoop

FoodLoop connects restaurants and stores with extra food to nearby community pantries. The repository contains the Node/MongoDB API and a React web app with account registration and sign-in.

## Start locally

1. In `Food-Loop-Backend`, install dependencies, copy `.env.example` to `.env`, set `MONGO_URI`, and replace `JWT_SECRET` with a private random value at least 32 characters long. Start the API with `npm run dev`.
2. In `Food-Loop-Frontend`, install dependencies and start the app with `npm run dev`.
3. Open the local URL printed by Vite. It proxies `/api` requests to `http://localhost:3000` by default. Set `VITE_API_BASE_URL` in the frontend `.env` to use another API URL.

## Account flow

Organizations create their own FoodLoop account from the welcome page by choosing Restaurant / Store or Pantry, entering organization details, email, and password. An account belongs to one organization. Sign-in keeps the access token in the browser session; the backend scopes organization and donation actions to the account's role and organization. Accounts sign out from the left sidebar.

## Frontend structure

- `Food-Loop-Frontend/src/App.jsx` renders the authenticated restaurant/store or pantry dashboard.
- `Food-Loop-Frontend/src/AuthContext.jsx` manages login, registration, current session, and sign-out.
- `Food-Loop-Frontend/src/components/AuthPage.jsx` contains the sign-in and organization registration page.
- `Food-Loop-Frontend/src/components/` contains reusable navigation, donation cards/forms, metrics, and empty/error states.
- `Food-Loop-Frontend/src/hooks/useFoodLoop.js` loads dashboard donations and exposes donation actions.
- `Food-Loop-Frontend/src/api/client.js` attaches the access token and maps API endpoints.
- `Food-Loop-Backend/src/routes/authRoutes.js` handles account registration, login, and session lookup.
- `Food-Loop-Backend/src/middleware/auth.js` verifies access tokens and enforces roles.
