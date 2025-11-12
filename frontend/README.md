# Frontend - Next.js App

[![CI/CD](https://github.com/mohammadaminrez/Full-Stack-Application-Monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/mohammadaminrez/Full-Stack-Application-Monorepo/actions)

Next.js 14 app with a small UI component library, dark mode, and full test coverage.

🚀 **[Live Demo](https://web-production-9514b.up.railway.app/)** | 📖 [Main Docs](../README.md) | 🔧 [Backend](../backend/README.md)

---

## What's Built

- Next.js 14 with App Router (using both server and client components)
- 5 UI components with full accessibility
- Dark mode that persists
- Form validation with helpful error messages
- All components tested and documented in Storybook

---

## Project Structure

```
app/          - pages (home, login, register, protected users page)
components/ui - 5 reusable components
lib/api.ts    - Axios setup with automatic JWT injection
cypress/e2e/  - 3 E2E test suites
.storybook/   - component docs and visual testing
```

---

## Components

All 5 components are TypeScript, tested, accessible, responsive, and theme-aware.

**Button** - 5 styles (primary, secondary, outline, ghost, danger), 3 sizes, loading state
**InputField** - validation, error messages, label support
**Card** - 2 variants (default, bordered), configurable padding
**Modal** - overlay, keyboard navigation, focus trap
**Tabs** - dynamic content panels, keyboard navigation

View in Storybook: `npm run storybook` then visit http://localhost:6006

---

## Pages

- `/` - landing page
- `/login` - email/password form
- `/register` - sign up (validates: 8+ chars, uppercase, lowercase, number)
- `/users` - protected page showing users (JWT required)

---

## Running Locally

**With Docker:**
```bash
docker-compose up web
```

**Without Docker:**
```bash
npm install
cp .env.example .env.local
npm run dev  # http://localhost:3001
```

---

## Testing

```bash
npm test                  # 5 unit tests (Vitest)
npm run cypress           # 3 E2E test suites
npm run storybook         # component docs
npm run chromatic         # visual regression
```

**Visual tests:** https://69149bd7273a23278e7b0974-qycxktqtfp.chromatic.com/
**Coverage:** https://app.codecov.io/github/mohammadaminrez/Full-Stack-Application-Monorepo

---

## Tech Used

Next.js 14, React 18, TypeScript, Tailwind CSS, React Hook Form + Zod, Axios, Vitest, Cypress, Storybook, Chromatic

---

## Features

- JWT auth with automatic token refresh
- Dark/light mode with persistence
- Mobile-first responsive design (works on 320px+ screens)
- WCAG 2.1 AA accessible
- Form validation with clear error states
- Toast notifications
- Protected routes
- Component documentation ([Chromatic visual tests](https://69149bd7273a23278e7b0974-qycxktqtfp.chromatic.com/))
- Railway deployment ([dashboard](https://railway.com/invite/Tp5AKxHSOnp))

---

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Change this to your backend URL.

---

Mohammad Amin Rezaei Sepehr
[@mohammadaminrez](https://github.com/mohammadaminrez)
