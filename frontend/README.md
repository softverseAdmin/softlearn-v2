# Frontend - SoftLearn

React + TypeScript + Vite frontend for the SoftLearn platform.

## Performance Optimization Features

### Service Worker & Offline Support
- Automatic service worker registration for offline support
- Network-first strategy for API calls
- Cache-first strategy for static assets
- Periodic update checks every 60 seconds

### Code Splitting & Bundle Optimization
- Automatic code splitting for `recharts` and `react-router-dom`
- Tree-shaking enabled for unused code removal
- Minification with Terser (console/debugger code removed)
- Optimized build targeting ES2020 browsers
- CSS code splitting for independent stylesheet optimization

### Performance Monitoring
- Web Vitals monitoring (FCP, LCP, CLS, FID, TTFB)
- Automatic performance metrics reporting to backend
- Page visibility monitoring
- Network status detection (online/offline)

### Image Optimization
- Lazy loading with Intersection Observer API
- Responsive images with srcSet support
- Automatic placeholder images while loading
- Smooth fade-in transitions

### UI/UX Enhancements
- Loading skeleton screens for better perceived performance
- Support for multiple skeleton variants (card, table, avatar)
- Smooth transitions between loading and loaded states

### Browser Optimizations
- DNS prefetching for external domains
- HTTP/2 preconnect for critical resources
- Resource preloading for critical assets
- Responsive image sizing

### Accessibility + Performance
- WCAG AA compliance with focus indicators
- Screen reader announcements for dynamic updates
- Keyboard navigation for all interactive elements
- Proper semantic HTML for better SEO

## Performance Targets

- Lighthouse Performance: 90+
- Lighthouse Accessibility: 90+
- Lighthouse Best Practices: 90+
- Lighthouse SEO: 90+
- First Contentful Paint: < 2 seconds
- Largest Contentful Paint: < 2.5 seconds
- Cumulative Layout Shift: < 0.1

## Build & Development

```bash
# Install dependencies
npm install

# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Directory Structure

```
frontend/
├── src/
│   ├── app/           # Application shell
│   ├── auth/          # Authentication context
│   ├── components/    # Reusable components
│   ├── features/      # Feature-specific pages
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries
│   ├── pages/         # Page components
│   ├── router/        # Routing configuration
│   └── index.css      # Global styles with accessibility utilities
├── public/
│   └── sw.js          # Service Worker
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
