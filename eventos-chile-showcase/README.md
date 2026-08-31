# Eventos Chile — Cultural events management frontend

Frontend in **React + Vite** for a cultural events management platform. It lets you explore events, register and manage content from a panel, with role-based authentication.

## Live demo

[https://eventos-chile-20.vercel.app](https://eventos-chile-20.vercel.app)

## Who it's for

It's a portfolio project that shows how to build the frontend of a real platform: event listing, detail, role-based administration and image upload. It serves as a reference for anyone who wants to see how I structure a React app with a separate backend.

## Stack

| Layer | Technology |
|------|------------|
| UI | React 18 |
| Build | Vite |
| Routing | React Router |
| HTTP | Axios |
| Styles | Bootstrap 5 |
| Testing | Vitest |

## What it demonstrates

- **Layered architecture**: `components`, `pages`, `services`, `context` and `utils` well separated.
- **Authentication and roles**: access control by user type on the frontend.
- **State management**: React contexts for session and shared data.
- **Image upload**: integration with cloud storage (Supabase) for event and profile images.
- **Testing**: suite with Vitest and component tests.

## Decisions and tradeoffs

- **React + Vite** instead of Next.js: the frontend is an SPA that consumes a separate API; it doesn't need server-side rendering.
- **Bootstrap 5** for UI: prioritizes development speed and consistency over a custom design system.
- **Frontend/backend separation**: the frontend doesn't know the database; it communicates with the API over HTTP. This lets each part scale separately.

## What I learned

- How to structure a large, maintainable frontend with clear responsibilities per folder.
- How to integrate client-side JWT authentication (route guards, session storage).
- How to handle client-side image upload and optimization before sending them to storage.
- How to write tests for React components and services.

## Privacy

Public, read-only copy of the frontend. It doesn't include credentials, the backend URL or real environment variables (replaced with placeholders).

---

**Other languages:** [Español](./README.es.md)
