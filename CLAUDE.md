# Claude Development Guidelines

## Project Overview
This is a modern portfolio and blog application built with Next.js 14, TypeScript, Supabase, and Tailwind CSS. The project follows strict coding standards and GitHub workflow practices.

## Coding Standards

### TypeScript & JavaScript
- **Always use TypeScript** - No plain JavaScript files except config files
- **Strict type checking** - Enable all strict TypeScript compiler options
- **Interface over type** - Prefer interfaces for object shapes, types for unions/primitives
- **Explicit return types** - Always define return types for functions
- **No `any` type** - Use proper typing or `unknown` if necessary
- **Consistent naming** - Use camelCase for variables/functions, PascalCase for components/interfaces

### React & Next.js
- **Functional components only** - No class components
- **Custom hooks** - Extract reusable logic into custom hooks
- **Server Components by default** - Use 'use client' only when necessary
- **Proper error boundaries** - Implement error handling at component level
- **Accessibility first** - Always include proper ARIA labels and semantic HTML
- **Performance optimization** - Use React.memo, useMemo, useCallback when appropriate

### Database & API
- **Type-safe queries** - Use generated types from Supabase
- **Error handling** - Always handle database errors gracefully
- **Row Level Security** - Implement proper RLS policies
- **Optimistic updates** - Use optimistic UI updates where appropriate
- **Data validation** - Validate all inputs on both client and server
- **API rate limiting** - Implement proper rate limiting for public endpoints

### Styling & UI
- **Tailwind CSS only** - No custom CSS files except for special cases
- **Design system** - Use shadcn/ui components as base
- **Responsive design** - Mobile-first approach for all components
- **Dark mode support** - All components must support light/dark themes
- **Consistent spacing** - Use Tailwind spacing scale consistently
- **Animation guidelines** - Use Framer Motion for complex animations

### File Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth route groups
│   ├── admin/             # Admin protected routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                  # Utility functions
│   ├── supabase/         # Database client & types
│   ├── utils.ts          # General utilities
│   └── hooks/            # Custom React hooks
├── types/                # TypeScript type definitions
└── middleware.ts         # Next.js middleware
```

### Component Guidelines
- **Single responsibility** - One component, one purpose
- **Props interface** - Always define props interface
- **Default props** - Use default parameters instead of defaultProps
- **Ref forwarding** - Use forwardRef for reusable components
- **Compound components** - Use compound pattern for complex UI

### Testing Standards
- **Unit tests** - Jest + React Testing Library
- **Integration tests** - Test user workflows
- **E2E tests** - Playwright for critical paths
- **Coverage threshold** - Minimum 80% test coverage
- **Test file naming** - `component.test.tsx` format

## Git Workflow & GitHub Rules

### Branch Strategy
- **Main branch** - Production-ready code only
- **Feature branches** - `feat/feature-name` format
- **Bug fixes** - `fix/bug-description` format
- **Hot fixes** - `hotfix/critical-issue` format
- **Experimental** - `experiment/feature-name` format

### Commit Messages
Follow conventional commits format:
```
type(scope): description

[optional body]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Guidelines
- **Descriptive titles** - Clear, concise PR titles
- **Template usage** - Always use PR template
- **Linked issues** - Reference related issues
- **Reviewers** - Assign appropriate reviewers
- **Labels** - Use proper labels (feature, bug, documentation, etc.)
- **Squash merge** - Use squash and merge for clean history

### Code Review Standards
- **Two approvals minimum** - For production changes
- **Security review** - For auth/payment related changes
- **Performance check** - Monitor bundle size and performance
- **Accessibility audit** - Check WCAG compliance
- **Mobile testing** - Test on mobile devices

### GitHub Actions & CI/CD
- **Automated testing** - Run tests on every PR
- **Build verification** - Ensure builds pass
- **Type checking** - TypeScript compilation check
- **Linting** - ESLint and Prettier checks
- **Security scanning** - Dependency vulnerability checks
- **Preview deployments** - Vercel preview for every PR

### Issue Management
- **Bug reports** - Use bug report template
- **Feature requests** - Use feature request template
- **Priority labels** - high, medium, low priority
- **Status tracking** - todo, in-progress, review, done
- **Sprint planning** - Use GitHub Projects for sprint management

## Development Workflow

### Local Development
1. **Environment setup** - Copy `.env.example` to `.env.local`
2. **Dependencies** - Run `npm install`
3. **Database setup** - Apply migrations and seed data
4. **Development server** - `npm run dev`
5. **Type checking** - `npm run type-check`
6. **Linting** - `npm run lint`
7. **Testing** - `npm run test`

### Pre-commit Checklist
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Accessibility tested
- [ ] Mobile responsive
- [ ] Dark mode compatible

### Deployment Process
1. **Feature complete** - All requirements met
2. **Code review** - Approved by team
3. **QA testing** - Tested on staging
4. **Performance check** - Lighthouse score > 90
5. **Security audit** - No vulnerabilities
6. **Production deploy** - Merge to main

## Performance Guidelines
- **Core Web Vitals** - Maintain good scores
- **Bundle size** - Monitor and optimize
- **Image optimization** - Use Next.js Image component
- **Database queries** - Optimize and cache appropriately
- **Loading states** - Implement proper loading UX

## Security Guidelines
- **Authentication** - Use Supabase Auth
- **Authorization** - Implement proper role-based access
- **Data validation** - Validate all inputs
- **SQL injection** - Use parameterized queries
- **XSS protection** - Sanitize user inputs
- **HTTPS only** - All communications encrypted

## Accessibility Requirements
- **WCAG 2.1 AA** - Minimum compliance level
- **Keyboard navigation** - All interactive elements accessible
- **Screen readers** - Proper ARIA labels
- **Color contrast** - Minimum 4.5:1 ratio
- **Focus indicators** - Visible focus states

## Documentation Standards
- **README** - Keep updated with setup instructions
- **API documentation** - Document all endpoints
- **Component documentation** - Storybook for UI components
- **Code comments** - JSDoc for complex functions
- **Architecture decisions** - Document major decisions

Remember: Code quality and user experience are paramount. Always prioritize maintainability, performance, and accessibility in every contribution.