# 🚀 Quick Start Guide

## Installation & Setup (2 minutes)

```bash
# Navigate to project
cd /Users/asheeque/Desktop/workspace/food/food-app

# Install dependencies
npm install

# Start development server
npm run dev
```

**Visit:** http://localhost:3000

---

## 🌐 Available Routes

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ Ready | Landing page with features overview |
| `/auth/login` | ✅ Ready | Login form (client-side) |
| `/dashboard` | ✅ Ready | Main dashboard with metrics & orders |
| `/dashboard/restaurants` | ⏳ Template ready | Buyer view (needs content) |
| `/dashboard/suppliers` | ⏳ Template ready | Supplier view (needs content) |
| `/dashboard/live-orders` | ⏳ Template ready | Order tracking (needs content) |
| `/dashboard/inventory` | ⏳ Template ready | Stock management (needs content) |
| `/dashboard/settings` | ⏳ Template ready | User settings (needs content) |
| `/dashboard/profile` | ⏳ Template ready | User profile (needs content) |

---

## 📱 Responsive Design

The app is fully responsive and tested on:
- **Mobile:** 390px (iPhone 12-13)
- **Tablet:** 768px (iPad)
- **Desktop:** 1280px+ (MacBook, Windows)

On mobile, the sidebar collapses and shows a floating action button (FAB) menu.

---

## 🎨 Design System Demo

Open the browser DevTools and try these classes:

```html
<!-- Colors -->
<div class="bg-primary text-white">Primary Green</div>
<div class="bg-secondary text-white">Secondary Forest</div>
<div class="text-error">Error Red</div>

<!-- Typography -->
<h1 class="text-headline-xl">Large Heading</h1>
<p class="text-body-md">Body Text</p>
<label class="text-label-md">Form Label</label>

<!-- Spacing -->
<div class="p-md">16px padding</div>
<div class="m-lg">24px margin</div>

<!-- Components -->
<button class="bg-primary text-white px-4 py-2 rounded-lg">
  Button
</button>
```

---

## 📁 Project Structure

```
food-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Protected dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   ├── common/            # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/            # Layout components
│   │   ├── dashboard/         # Dashboard-specific
│   │   └── auth/              # Auth components
│   │
│   ├── design-system/         # Design tokens from Stitch
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── theme.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # React Context
│   ├── services/              # API services
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Helper functions
│   └── lib/                   # Third-party setup
│
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## 🛠️ Common Tasks

### Add a New Page
1. Create file in `src/app/yourpage/page.tsx`
2. Use existing components from `src/components/common/`
3. Apply design tokens (colors, spacing)

### Create a New Component
1. Create file in `src/components/your-section/YourComponent.tsx`
2. Use the `cn()` utility for className merging
3. Apply Tailwind classes directly

### Update Design Tokens
- Colors: `src/design-system/colors.ts`
- Typography: `src/design-system/typography.ts`
- Spacing: `src/design-system/spacing.ts`
- Then update `tailwind.config.ts`

### Add API Integration
1. Create service in `src/services/your-service.ts`
2. Use in components via `useState` + `useEffect`
3. Add types in `src/types/`

---

## 🎯 Next Steps

### Phase 2: Complete Dashboard Pages (~20 min)
- [ ] Add content to `/dashboard/restaurants`
- [ ] Add content to `/dashboard/suppliers`
- [ ] Add content to `/dashboard/live-orders`
- [ ] Add content to `/dashboard/inventory`
- [ ] Add content to `/dashboard/settings`
- [ ] Add content to `/dashboard/profile`

### Phase 3: State Management (~10 min)
- [ ] Set up Zustand stores
- [ ] Create API service layer
- [ ] Connect form submissions
- [ ] Add loading states

### Phase 4: Backend Integration
- [ ] Connect to your API
- [ ] Add authentication
- [ ] Real-time updates (WebSocket)
- [ ] Error handling

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Restart the dev server
npm run dev
```

### Tailwind classes not working
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✨ You're all set!

Your app is ready to build. Start by:

1. Running `npm run dev`
2. Opening http://localhost:3000
3. Exploring the landing page and dashboard
4. Adding real data and API integration

Good luck building! 🌿

