# Soulmatch Server

Express + TypeScript API with modular controller-service architecture.

## Structure

```
src/
├── config/           # Env vars, MongoDB connection
├── middleware/       # Auth (verifyToken, verifyAdmin)
├── types/            # Shared TypeScript interfaces
├── modules/          # Feature modules
│   ├── auth/
│   ├── users/
│   ├── biodatas/
│   ├── contact-requests/
│   ├── premium-requests/
│   ├── success-stories/
│   ├── favourites/
│   ├── payment/
│   └── admin/
├── app.ts
└── index.ts
```

Each module has:
- `*.controller.ts` – HTTP handlers
- `*.service.ts` – Business logic & DB access
- `*.routes.ts` – Route definitions
- `index.ts` – Exports

## Scripts

- `npm run dev` – Start with ts-node-dev
- `npm run build` – Compile TypeScript to `dist/`
- `npm start` – Run `dist/index.js`

## Breaking change

Admin premium requests: `GET /request-premium` (admin list) → `GET /admin/request-premium`
