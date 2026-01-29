# Testing Patterns

**Analysis Date:** 2026-01-28

## Test Framework

**Runner:**
- Not detected in current setup
- Recommended: Vitest or Jest for Next.js projects
- No test dependencies configured in `package.json`

**Assertion Library:**
- Not configured

**Run Commands:**
- No test commands found in `package.json`
- To add testing: `npm install --save-dev vitest @vitest/ui` or `npm install --save-dev jest @testing-library/react`

## Test File Organization

**Location:**
- No test files detected in codebase
- Recommended pattern: Co-locate tests with source files
- Pattern: `component.tsx` + `component.test.tsx` or `component.spec.tsx`

**Naming:**
- Not established (no tests present)
- Recommended: `[component-name].test.tsx` for unit tests

**Structure:**
```
app/
├── page.tsx
├── page.test.tsx          # Recommended location
├── layout.tsx
└── layout.test.tsx        # Recommended location
```

## Test Structure

**Suite Organization:**
- Not yet implemented
- Recommended pattern for Next.js:

```typescript
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page', () => {
  it('should render the main heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('should render deploy button', () => {
    render(<Home />);
    expect(screen.getByText('Deploy Now')).toBeInTheDocument();
  });
});
```

**Patterns:**
- Setup: No setup files currently needed
- Teardown: Automatic through testing library cleanup
- Assertion: Use testing library queries for accessible selectors

## Mocking

**Framework:**
- Not configured
- Recommended: Vitest for native mock support or Jest with manual mocks

**Patterns:**
- Not established
- Recommended for Next.js Image component:

```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />
}));
```

**What to Mock:**
- Next.js built-in components: `Image`, `Link` (when testing logic, not presentation)
- External API calls (not applicable yet)
- Next.js font loading: `next/font/google`

**What NOT to Mock:**
- React components (test actual rendering)
- CSS classes (test styling integration)
- DOM elements

## Fixtures and Factories

**Test Data:**
- Not yet established
- Recommended location: `__fixtures__` or `test/fixtures/`

Example fixture directory structure:
```
test/
├── fixtures/
│   └── metadata.ts       # Mock Metadata objects
├── helpers/
│   └── render.ts         # Custom render with providers
└── setup.ts              # Test environment setup
```

**Location:**
- Would live in `test/` directory at project root
- Or `app/__tests__/` for co-located tests

## Coverage

**Requirements:**
- Not enforced
- Recommended baseline: 80% for critical paths

**View Coverage:**
```bash
# If Vitest configured:
npm run test -- --coverage

# If Jest configured:
npm test -- --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual components and utilities
- Approach: Test component rendering with various props
- Focus areas: `app/page.tsx` (main page component), `app/layout.tsx` (root layout)

Example unit test:
```typescript
// app/page.test.tsx
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Component', () => {
  it('renders Next.js logo', () => {
    render(<Home />);
    const image = screen.getByAltText('Next.js logo');
    expect(image).toBeInTheDocument();
  });
});
```

**Integration Tests:**
- Scope: Page rendering with layout
- Approach: Test `RootLayout` wrapping child pages
- Would verify metadata application and font injection

**E2E Tests:**
- Framework: Not configured; Playwright or Cypress recommended
- Scope: User workflows (navigation, form submission)
- Not yet implemented

## Common Patterns

**Async Testing:**
- Next.js components are Server Components by default (async)
- Testing pattern for async components:

```typescript
import { render } from '@testing-library/react';

// For server components, test data fetching separately:
async function getComponentData() {
  // Simulate server-side data fetch
  return { /* data */ };
}

it('renders with async data', async () => {
  const data = await getComponentData();
  expect(data).toBeDefined();
});
```

**Error Testing:**
- No error boundary currently implemented
- When added, test with:

```typescript
it('catches and displays errors', () => {
  const BadComponent = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <BadComponent />
    </ErrorBoundary>
  );

  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Setup Recommendations

**To enable testing immediately:**

1. Install dependencies:
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

2. Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
});
```

3. Add scripts to `package.json`:
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

---

*Testing analysis: 2026-01-28*
