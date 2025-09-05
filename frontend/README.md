# Кіт Кухар - Next.js Frontend

This is the Next.js version of the Кіт Кухар recipe application, migrated from Create React App.

## Migration Status

✅ **Completed:**
- Core Next.js structure with TypeScript
- Authentication system with AuthContext
- Page routing (App Router pattern)
- Component migration with Next.js patterns
- Bootstrap styling integration
- API client configuration
- Protected routes system
- Basic CRUD operations structure

🔄 **Partially Implemented:**
- Recipe display and management (basic functionality)
- Star rating system (placeholder)
- Admin panel structure (placeholder)

❌ **Still Needed (API Integration Required):**
- Complete API integration for all CRUD operations
- Media upload functionality
- Comment system
- Advanced recipe features (cooking steps with media)
- Complete tag and category management
- User management features

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (typically on port 8000)

### Installation

1. Install dependencies:
   ```bash
   cd frontend-nextjs
   npm install
   ```

2. Copy environment configuration:
   ```bash
   cp .env.local.example .env.local
   ```

3. Update `.env.local` with your API URL if different from default:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Changes from CRA

### Routing
- **Before (React Router):** `<Route path="/recipes" element={<RecipesPage />} />`
- **After (Next.js):** File-based routing in `/pages/recipes/index.tsx`

### Navigation
- **Before:** `<Link to="/recipes">Recipes</Link>`
- **After:** `<Link href="/recipes">Recipes</Link>` (Next.js Link component)

### Static Assets
- Files moved from `public/` in CRA to `public/` in Next.js
- Direct access via `/favicon.ico`, `/maskot.svg`, etc.

### Environment Variables
- **Before:** `REACT_APP_API_URL`
- **After:** `NEXT_PUBLIC_API_BASE_URL`

### SSR Considerations
- Authentication state management updated for SSR compatibility
- localStorage access wrapped with browser checks
- API calls configured for both server and client environments

## Project Structure

```
frontend-nextjs/
├── components/           # Reusable React components
│   ├── auth/            # Authentication components
│   └── Layout.tsx       # Main layout wrapper
├── contexts/            # React contexts (Auth)
├── pages/              # Next.js pages (file-based routing)
│   ├── api/            # API routes (if needed)
│   ├── recipes/        # Recipe-related pages
│   └── _app.tsx        # App wrapper
├── styles/             # Global styles
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── config/             # Configuration files
```

## Breaking Changes

1. **Routing System:**
   - File-based routing instead of React Router
   - Dynamic routes use `[id].tsx` syntax
   - No more `<Routes>` and `<Route>` components

2. **Navigation:**
   - Must use Next.js `Link` component
   - `href` prop instead of `to`

3. **Environment Variables:**
   - Must be prefixed with `NEXT_PUBLIC_` for client-side access

4. **Static Files:**
   - All in `/public` directory
   - Direct access without `/public` prefix

5. **Code Splitting:**
   - Automatic with Next.js
   - No manual `lazy()` imports needed for pages

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## API Integration Notes

The current implementation includes:
- Basic API client with error handling and logging
- Authentication token management
- Placeholder endpoints for all major features

To complete the integration:
1. Verify all API endpoints match your backend
2. Implement remaining CRUD operations
3. Add proper error handling for all API calls
4. Implement file upload functionality
5. Add pagination for recipe lists

## Migration from CRA

If you want to migrate additional features:

1. **Components:** Copy from `frontend/src/components/` and update imports
2. **Pages:** Convert to Next.js page format in `/pages`
3. **Routing:** Replace React Router with Next.js file-based routing
4. **Environment:** Update environment variable names
5. **Testing:** Update test configurations for Next.js

For more details, see the [Next.js documentation](https://nextjs.org/docs).