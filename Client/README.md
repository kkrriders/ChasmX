# ChasmX Frontend

Modern Next.js-based workflow builder and management interface with AI integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your backend API URL

# 3. Run development server
npm run dev
```

Application runs at: http://localhost:3000

## 📁 Project Structure

```
Client/
├── app/                    # Next.js 13+ App Router
│   ├── page.tsx           # Landing page (NEW!)
│   ├── workflows/         # Workflow pages
│   ├── dashboard/         # Main dashboard
│   └── ...                # Other pages
├── components/
│   ├── home/              # Landing page components (NEW!)
│   │   ├── hero-section.tsx
│   │   ├── node-demo.tsx
│   │   ├── features-card-section.tsx
│   │   └── tech-stack-carousel.tsx
│   ├── builder/           # Enhanced workflow builder
│   │   ├── builder-canvas.tsx
│   │   ├── command-palette.tsx
│   │   ├── keyboard-shortcuts-dialog.tsx
│   │   ├── template-library.tsx
│   │   └── ...            # 15+ builder components
│   ├── guided-tour.tsx    # User onboarding (NEW!)
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components
├── lib/                   # Utilities
│   ├── api.ts             # API client
│   └── config.ts          # Configuration
├── docs/                  # Documentation
└── README.md             # This file
```

## 🎨 Key Features

### ⭐ NEW - Professional Landing Page
- ✅ Interactive workflow demo with animations
- ✅ Modern hero section with Framer Motion
- ✅ Features showcase and pricing cards
- ✅ Tech stack carousel
- ✅ Fully responsive design

### ⭐ NEW - Enhanced Workflow Builder
- ✅ Command palette (Cmd+K)
- ✅ Keyboard shortcuts dialog
- ✅ Template library
- ✅ Multi-node configuration
- ✅ Workflow history (undo/redo)
- ✅ Context menus
- ✅ Data inspector
- ✅ Execution panel
- ✅ Variables panel
- ✅ Workflow validation

### ⭐ NEW - Guided Tour
- ✅ Step-by-step onboarding for new users
- ✅ Smart localStorage tracking
- ✅ Interactive tooltips

### Core Features
- ✅ Visual workflow builder with drag-and-drop
- ✅ Authentication with JWT
- ✅ Dashboard with metrics
- ✅ Built with shadcn/ui components
- ✅ TypeScript support
- ✅ Tailwind CSS styling

## 🔧 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

## 📚 Documentation

See `/docs` folder for detailed documentation.

---

**Built with:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
