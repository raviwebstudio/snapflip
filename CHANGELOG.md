# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-07-03
### Added
- Project foundation initialized with Vite, React 19, TypeScript, and Tailwind CSS.
- Project directories and structural guidelines established.
- Core libraries installed: React Router DOM, TanStack Query, Zustand, Lucide React.
- Configured ESLint and Prettier setup.
- Configured skeleton pages for Routing system.

## [0.2.0] - 2026-07-03
### Added
- Added directories: `src/tests`, `src/schemas`, `src/mocks`, and component landing subfolders (`src/components/landing`, `src/components/music`, `src/components/shared`).
- Created reusable landing layout component (`src/layouts/LandingLayout.tsx`) and wired it in the router.
- Prepared skeleton subcomponents for the Landing page: `Hero`, `Navbar`, `Features`, `CTA`, `Footer` under `src/components/landing/`.
- Renamed page `src/pages/Components` to `src/pages/Playground` and updated corresponding path to `/playground`.
- Reorganized `docs/` directories into indexed folders.

### Removed
- Removed unused logo/hero assets (`src/assets/hero.png`).

