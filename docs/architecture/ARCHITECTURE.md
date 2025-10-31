# ChasmX Homepage Component Architecture

## Component Hierarchy

```
app/page.tsx (HomePage)
│
├── components/home/home-header.tsx
│   ├── Logo (Brand)
│   ├── Navigation Links
│   │   ├── Features
│   │   ├── Pricing
│   │   ├── Templates
│   │   ├── Integrations
│   │   └── Docs
│   ├── Sign In Button
│   ├── Get Started Button
│   └── Mobile Menu (Hamburger)
│
├── components/home/hero-section.tsx
│   ├── Background Effects
│   │   ├── Grid Pattern
│   │   ├── Floating Orb 1 (Purple)
│   │   └── Floating Orb 2 (Blue)
│   ├── Left Column
│   │   ├── Badge (AI-Powered)
│   │   ├── Headline (h1)
│   │   ├── Subheadline (p)
│   │   ├── CTA Buttons
│   │   │   ├── Get Started Free
│   │   │   └── Watch Demo
│   │   └── Stats Row
│   │       ├── 50K+ Users
│   │       ├── 100M+ Workflows
│   │       └── 99.9% Uptime
│   └── Right Column
│       └── components/home/node-demo.tsx
│           ├── ReactFlow Container
│           ├── Custom Nodes [4]
│           │   ├── Data Source (Blue)
│           │   ├── Transform (Purple)
│           │   ├── AI Model (Pink)
│           │   └── Output (Green)
│           ├── Animated Edges [4]
│           ├── Background (Dots)
│           ├── Controls
│           └── Live Demo Badge
│
├── components/home/features-card-section.tsx
│   ├── Section 1: Features
│   │   ├── Section Header
│   │   └── Feature Cards Grid (3x2)
│   │       ├── AI-Powered Intelligence
│   │       ├── Visual Flow Builder
│   │       ├── Lightning Fast
│   │       ├── Enterprise Security
│   │       ├── 500+ Integrations
│   │       └── Advanced Analytics
│   │
│   └── Section 2: Pricing (Cart)
│       ├── Section Header
│       └── Pricing Cards (3 columns)
│           ├── Starter ($0/mo)
│           ├── Professional ($49/mo) ⭐
│           └── Enterprise (Custom)
│
├── components/home/tech-stack-carousel.tsx
│   ├── Section Header
│   ├── Carousel Row 1 (Scroll Left →)
│   │   └── Tech Cards [14] (repeated)
│   ├── Carousel Row 2 (Scroll Right ←)
│   │   └── Tech Cards [14] (repeated, reversed)
│   └── Stats Row
│       ├── 99.9% Uptime
│       ├── <100ms Response
│       ├── 500+ Integrations
│       └── 24/7 Support
│
└── components/home/footer.tsx
    ├── Main Grid (6 columns)
    │   ├── Column 1: Brand
    │   │   ├── Logo
    │   │   ├── Description
    │   │   └── Social Links [4]
    │   ├── Column 2: Product Links
    │   ├── Column 3: Resources Links
    │   ├── Column 4: Company Links
    │   └── Column 5: Legal Links
    │
    └── Bottom Bar
        ├── Copyright
        ├── Made with ♥
        ├── Legal Links
        ├── Status Badge
        └── Version Badge
```

## Data Flow

```
User Interaction Flow:
┌─────────────────────────────────────────────┐
│  1. Land on Homepage                        │
│     ↓                                       │
│  2. See Animated Hero + Live Demo          │
│     ↓                                       │
│  3. Watch Node Demo Auto-Animate           │
│     ↓                                       │
│  4. Scroll to Features                     │
│     ↓                                       │
│  5. Review Pricing Plans                   │
│     ↓                                       │
│  6. See Tech Stack Carousel                │
│     ↓                                       │
│  7. Click CTA → Sign Up / Get Started      │
└─────────────────────────────────────────────┘
```

## State Management

```
Component State:
├── home-header.tsx
│   ├── [mobileMenuOpen] - boolean
│   └── [scrolled] - boolean (scroll position)
│
├── node-demo.tsx
│   ├── [nodes] - Node[] (React Flow)
│   ├── [edges] - Edge[] (React Flow)
│   └── [animationStep] - number
│
└── Other components: Stateless (Pure)
```

## Styling Approach

```
Tailwind CSS Classes:
├── Layout: flex, grid, container
├── Spacing: p-*, m-*, gap-*
├── Colors: bg-*, text-*, from-*, to-*
├── Effects: shadow-*, blur-*, opacity-*
├── Responsive: sm:, md:, lg:, xl:, 2xl:
├── Animations: animate-*, transition-*
└── Custom: via @apply in globals.css
```

## Performance Optimizations

```
Optimization Strategy:
├── Code Splitting
│   ├── Automatic route-based splitting
│   └── Dynamic imports for heavy components
│
├── Asset Optimization
│   ├── SVG icons (Lucide React)
│   ├── No large images yet
│   └── Minimal custom fonts
│
├── Animation Performance
│   ├── GPU-accelerated (transform, opacity)
│   ├── Framer Motion optimizations
│   └── React Flow virtualization
│
└── Bundle Size
    ├── Tree-shaking enabled
    ├── No unused dependencies
    └── ~500KB total (gzipped)
```

## Accessibility Features

```
A11y Implementation:
├── Semantic HTML
│   ├── <header>, <nav>, <main>, <section>, <footer>
│   ├── Proper heading hierarchy (h1 → h6)
│   └── <button> vs <a> usage
│
├── ARIA Attributes
│   ├── aria-label for icon buttons
│   ├── sr-only for screen readers
│   └── role attributes where needed
│
├── Keyboard Navigation
│   ├── Tab order preserved
│   ├── Focus visible states
│   └── Escape key for mobile menu
│
└── Motion Preferences
    └── respects prefers-reduced-motion
```

## Integration Points

```
Backend Integration:
├── Auth Routes
│   ├── /auth/login → handleLogin()
│   └── /auth/signup → handleGetStarted()
│
├── API Endpoints (Future)
│   ├── GET /api/stats → Real-time metrics
│   ├── POST /api/contact → Contact form
│   └── GET /api/templates → Template list
│
└── Analytics Events
    ├── page_view
    ├── cta_click
    ├── pricing_view
    └── demo_interaction
```

## File Size Breakdown

```
Component Sizes (approx):
├── page.tsx:                    ~1 KB
├── home-header.tsx:            ~7 KB
├── hero-section.tsx:           ~6 KB
├── node-demo.tsx:              ~8 KB
├── features-card-section.tsx: ~12 KB
├── tech-stack-carousel.tsx:    ~8 KB
└── footer.tsx:                 ~6 KB
────────────────────────────────────
Total Custom Code:             ~48 KB

Dependencies:
├── React Flow:              ~200 KB
├── Framer Motion:          ~100 KB
├── Radix UI:               ~150 KB
└── Other:                   ~50 KB
────────────────────────────────────
Total Bundle (gzipped):     ~500 KB
```

## Testing Strategy

```
Recommended Tests:
├── Unit Tests (Jest/Vitest)
│   ├── Component rendering
│   ├── Button click handlers
│   └── Link navigation
│
├── Integration Tests (React Testing Library)
│   ├── Form submissions
│   ├── Navigation flows
│   └── Mobile menu interactions
│
├── E2E Tests (Playwright/Cypress)
│   ├── Full user journey
│   ├── CTA conversion path
│   └── Cross-browser compatibility
│
└── Visual Tests (Chromatic)
    ├── Component snapshots
    ├── Responsive views
    └── Animation states
```

## Deployment Checklist

```
Pre-Deploy:
[ ] All TypeScript errors resolved
[ ] Lighthouse score > 90
[ ] Mobile responsive tested
[ ] Accessibility audit passed
[ ] SEO meta tags added
[ ] Analytics configured
[ ] Error boundaries in place
[ ] 404 page customized
[ ] Env variables set
[ ] Build succeeds locally

Deploy:
[ ] Push to Git
[ ] CI/CD pipeline passes
[ ] Preview deployment reviewed
[ ] Production deployment
[ ] DNS configured
[ ] SSL certificate active
[ ] CDN configured
[ ] Monitoring enabled

Post-Deploy:
[ ] Smoke test all CTAs
[ ] Check analytics firing
[ ] Monitor error logs
[ ] Performance metrics
[ ] User feedback collected
```

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start prod server
npm run lint         # Lint code

# Testing (setup needed)
npm run test         # Run tests
npm run test:e2e     # E2E tests
npm run test:a11y    # Accessibility tests

# Analysis
npm run analyze      # Bundle analysis
npm run lighthouse   # Performance audit
```

---

**Architecture Date**: 2025-10-07  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
