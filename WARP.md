# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tech Stack & Architecture

This is a Next.js 15 application built with:
- **Framework**: Next.js 15.5.6 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Build Tool**: Turbopack (Next.js built-in bundler)
- **Fonts**: Geist Sans and Geist Mono (optimized with next/font)

### Project Structure

```
src/
├── app/                 # App Router directory (Next.js 13+ routing)
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page component
│   ├── globals.css     # Global styles with Tailwind
│   └── favicon.ico     # Site favicon
public/                 # Static assets (images, icons)
```

The project uses Next.js App Router architecture with:
- **Root Layout** (`src/app/layout.tsx`): Defines the HTML structure and global font variables
- **Pages** as React components in the `app/` directory
- **Metadata** API for SEO configuration
- **TypeScript path alias**: `@/*` maps to `./src/*`

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build production application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Alternative Package Managers
The project supports multiple package managers:
- `yarn dev` / `pnpm dev` / `bun dev` - Alternative dev commands

## Key Configuration Files

- **TypeScript**: `tsconfig.json` with Next.js plugin and path aliases
- **ESLint**: `eslint.config.mjs` with Next.js configuration
- **Next.js**: `next.config.ts` (currently minimal configuration)
- **PostCSS**: `postcss.config.mjs` for Tailwind processing
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`

## Development Notes

### Styling Approach
- Uses Tailwind CSS v4 with CSS custom properties
- Font variables defined in root layout: `--font-geist-sans` and `--font-geist-mono`
- Responsive design patterns with `sm:` breakpoints

### Next.js Features in Use
- App Router (not Pages Router)
- `next/font` for optimized font loading
- `next/image` for optimized images
- TypeScript throughout
- CSS Modules support via globals.css

### File Editing Guidelines
- Main entry point: `src/app/page.tsx`
- Layout changes: `src/app/layout.tsx`
- Global styles: `src/app/globals.css`
- Static assets go in `public/` directory
- Use TypeScript path alias `@/` for src imports