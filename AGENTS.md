## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + Base UI
- **Router**: TanStack Router (file-based routing)
- **State/Data**: TanStack Query + Convex (backend/database)
- **Auth**: Better-Auth with Google OAuth via Convex
- **Build**: Vite + Bun

## Project Structure

```
convex/          # Backend functions and schema
src/
  components/    # React components (1 component per file)
  routes/        # File-based routes (TanStack Router)
  lib/           # Utility functions
  queries/       # TanStack Query hooks
  types.ts       # Global TypeScript types
```

## Key Features

- Google authentication with username
- Create/manage expense groups
- Send/accept friend requests
- Add/edit/delete expenses with split calculations
- Track who owes what within groups

## Environment Variables

- `VITE_CONVEX_URL` - Convex deployment URL

## Package Usage

- **TanStack Router**: File-based routing in `src/routes/`. Routes auto-generate from file structure.
- **TanStack Query**: Data fetching in `src/queries/`. Use `useQuery()` and `useMutation()` hooks.
- **Convex**: Backend functions in `convex/` directory. Define queries/mutations using `query()` and `mutation()` from `convex/server`.
  - **Mutation Pattern**: Use `useMutation({ mutationFn: useConvexMutation(api.module.function) })` format. See `expense-item.tsx` for reference.
- **Better-Auth**: Authentication via `useAuth()` hook from `@convex-dev/better-auth/react`. Protected routes use `_protected.tsx` prefix.
- **Tailwind CSS**: Utility classes directly in className. No custom config needed (CSS-based).
- **shadcn/ui**: UI components in `src/components/ui/`. Use existing components like Button, Dialog, Input, etc.
- **Hugeicons**: Icon library from `@hugeicons/react`. Import icons as React components.
- **Theme**: Refer to `src/styles.css` for theme variables, colors, fonts, and design tokens. Maintain consistency with existing color scheme (stone/neutral palette) and typography.

# Scripts execution

- Use bun for any script
- If committing any changes, write a commit message not more than 6 words and use all lower case
- Before commiting, run `bun run lint` and `bun run fmt`
- Do not run `bun run build` unless asked
- Never run `bunx convex dev`
- After every change, run `bun run fmt`

# Components

- Each .tsx file should have only 1 component
- Each component should server one purpose
- Use the name "Props" for all Props
- Prefer types over interfaces if possible
