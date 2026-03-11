# bytally

bytally is an expense splitting application built with TanStack Start and Convex. Split bills with friends, track group expenses, and settle up easily.

## Features

### Expense Groups

- Create and manage expense groups
- Add members via friend requests
- Group dashboard with expense overview
- Track who owes what within each group

### Friend Management

- Send and accept friend requests
- View pending requests
- Manage your friend list

### Expense Tracking

- Add expenses with titles and descriptions
- Equal or manual split modes
- Track who paid and who owes
- Settle expenses to mark them as paid

### Authentication

- Google OAuth via Better Auth
- Username support

## Tech Stack

**Frontend**

- [TanStack Start](https://tanstack.com/start), [Router](https://tanstack.com/router), [Query](https://tanstack.com/query)
- [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/)

**Backend**

- [Convex](https://www.convex.dev/) (real-time database and backend)
- [Better Auth](https://www.better-auth.com/) (authentication)
- [Zod](https://zod.dev/) (schema validation)

**Development**

- Oxlint for linting and Oxfmt for formatting

## Installation

### Prerequisites

- Node.js 18+
- Any package manager (bun used here)
- Git

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bytally.git
   cd bytally
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up Convex:

   ```bash
   npx convex dev
   ```

   Follow the prompts to create a new Convex project and get your deployment URL.

4. Create a `.env.local` file in the root directory:

   ```env
   # Convex (Required)
   CONVEX_DEPLOYMENT=dev:your_project_name
   VITE_CONVEX_URL=https://your_project_url.convex.cloud
   VITE_CONVEX_SITE_URL=https://your_project_url.convex.site

   # Site URL (Required)
   VITE_SITE_URL=http://localhost:3000

   # BetterAuth (Required for authentication)
   BETTER_AUTH_SECRET=your_better_auth_secret

   # Google OAuth (Required for authentication)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

5. Run the development server:

   ```bash
   bun run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Sign in with your Google account
2. Create an expense group and invite friends
3. Add expenses and choose split mode (equal or manual)
4. Track who owes what and settle up

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/bytally/issues)
