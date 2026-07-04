# SnapFlip Project Roadmap

## Phase 0: Foundation Setup (Complete)
- [x] Initialize Vite + React + TypeScript + Tailwind CSS project
- [x] Set up directory structures
- [x] Create mock pages and React Router paths
- [x] Integrate TanStack React Query, Zustand, Lucide React, and shadcn/ui
- [x] Configure ESLint and Prettier
- [x] Freeze Phase 0 foundation

## Phase 0.5: Sprint 0 — Album Viewer Production Readiness (Complete)
- [x] **Premium 3D Book Engine**: Replaced flat `page-flip` library with a GPU-accelerated CSS 3D book flip engine (hardcover opening, page curling, depth shadows, 60fps).
- [x] **Album Size Engine**: Implemented support for A4/A5/Square/standard inch sizes and dynamic custom width/height; added AUTO recommended size detection.
- [x] **Image Orientation Engine**: Replaced cropping/stretching with `object-fit: contain` rendering inside sizing boundaries, preserving photo dimensions and EXIF aspect ratios.
- [x] **Verification & Clean Build**: Ensured build/lint passes with zero warnings/errors in code and zero runtime/console errors.

## Phase 1: Prototype Development
- [x] Implement mock data
- [x] Build dashboard, album creation, and viewer interfaces
- [x] Integrate client-side state

## Phase 2: Core Features & Integration (Pre-Backend Freeze Status)
- [ ] Integrate Supabase database and authentication (Ready to start)
- [ ] Integrate Cloudinary for image hosting (Signed-off client wrapper)
- [ ] Integrate Razorpay for payments
