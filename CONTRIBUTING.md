# Contributing to Ipsumify

Thank you for your interest in contributing to Ipsumify! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ipsumify-next-2026.git
   cd ipsumify-next-2026
   ```
3. **Install dependencies**:
   ```bash
   yarn install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
yarn dev
```

The app will be available at `http://localhost:3000`.

### Before Committing

Always run these commands before committing:

```bash
# Lint your code
yarn lint

# Fix auto-fixable lint issues
yarn lint:fix

# Run type checking
yarn typecheck

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Changes to build process or auxiliary tools

**Examples:**
```
feat: add dark mode toggle
fix: resolve hydration mismatch in theme selector
docs: update README with new features
test: add unit tests for seededRandom function
```

## Pull Request Process

1. **Update documentation** if needed (README.md, JSDoc comments, etc.)
2. **Add or update tests** for your changes
3. **Ensure all checks pass**:
   - Linting
   - Type checking
   - Tests
   - Build succeeds
4. **Update CHANGELOG.md** with your changes under the "Unreleased" section
5. **Create a pull request** with a clear title and description
6. **Link any related issues** in the PR description
7. **Wait for review** - maintainers will review your PR and may request changes

### Pull Request Title Format

Use the same format as commit messages:

```
feat: add new barbecue theme
fix: correct keyboard shortcut on Windows
```

## Adding New Themes

To add a new theme:

1. Edit `data/themes.ts`
2. Add a new theme object with:
   - `id`: Unique identifier (lowercase, no spaces)
   - `label`: Display name
   - `icon`: Iconify icon class (browse at [icones.js.org](https://icones.js.org/))
   - `paragraphs`: Array of 10+ paragraph sentences
   - `headings`: Array of 15+ heading strings
   - `listItems`: Array of 3+ list items
3. Optionally update `defaultThemeId` in `ipsumify.config.ts`
4. Test the theme in the app
5. Add screenshots to your PR if it's a visual change

## Code Style

- We use **ESLint** for JavaScript/TypeScript linting
- We use **Prettier** (via ESLint) for code formatting
- Follow existing code conventions in the project
- Add JSDoc comments for functions and complex logic
- Keep functions small and focused (single responsibility)

## Testing

- Write tests for new features and bug fixes
- Place unit tests in `tests/unit/`
- Test file naming: `*.test.ts`
- Run tests with `yarn test`
- Aim for high test coverage on critical logic

## Project Structure

```
ipsumify/
├── app/                    # Nuxt 4 app directory
│   ├── app.vue             # Root component
│   ├── assets/css/         # Global styles
│   └── pages/              # Page components
├── composables/            # Vue composables (auto-imported)
├── data/                   # Static data (themes)
├── tests/                  # Test files
├── utils/                  # Utility functions
├── ipsumify.config.ts      # App configuration
└── nuxt.config.ts          # Nuxt configuration
```

## Need Help?

- Open an issue for questions or discussions
- Tag maintainers for urgent matters
- Check existing issues and PRs before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
