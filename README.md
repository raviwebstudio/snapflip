# SnapFlip

SnapFlip is a modern web application for creating and viewing interactive flipbooks.

## Premium 3D Book Engine
SnapFlip features a custom GPU-accelerated 3D Book Engine that delivers a premium wedding album experience. Features include:
- **Hardcover Opening/Closing Animations**: Swings open and shut like a physical book.
- **Natural 3D Page Curl**: Realistic bending physics using pure CSS 3D transforms.
- **Book Spine & Depth**: Distinct outer spine with gradient-based 3D depth, inner page shadows, and gutter shading.
- **Flexible Controls**: Click to turn, corner hover hints, touch swipes, keyboard arrow navigation, and next/prev buttons.
- **Dual Layout Modes**: Auto-adapts to a two-page spread on desktop and a single-page view on mobile/tablet devices.

## Album Size Engine
Supports multiple physical book sizes and aspect ratios, ensuring pages are rendered with correct dimensions independent of the photos themselves:
- **Auto Detect**: Recommends the optimal page dimensions based on orientation analysis of uploaded photos.
- **Standardized Sizes**: Supports A5 (Portrait/Landscape), A4 (Portrait/Landscape), Square (8x8, 10x10, 12x12), and Portrait/Landscape inches (8x12, 10x15, 12x18, 16x24).
- **Custom Sizes**: Support for custom width and height specifications with customizable units (mm, cm, inch, px).

## Image Orientation Pipeline
Guarantees photo integrity without forced rotations, stretching, or cropping:
- **Dimension & Aspect Ratio Preservation**: Images are fit inside album pages using `object-fit: contain` with a dark matte background, maintaining original proportions.
- **EXIF Extraction**: Natural dimensions (width, height) are analyzed on upload to support layout recommendations.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Zustand, Lucide React

## Setup instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build the project:
   ```bash
   npm run build
   ```
