# Contributing

Thank you for your interest in contributing to our project! Whether it's a bug report, new feature, correction, or additional documentation, we greatly value feedback and contributions from our community.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. **Check if the issue has already been reported** - Search through the [GitHub Issues](https://github.com/yourusername/shop/issues) to see if the issue has already been reported.

2. **Create a new issue** - If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/yourusername/shop/issues/new). Be sure to include:
   - A clear and descriptive title
   - A description of the issue
   - Steps to reproduce the issue
   - Expected vs. actual behavior
   - Screenshots if applicable
   - Your environment (OS, browser, Node.js version, etc.)

### Suggesting Enhancements

1. **Check if the enhancement has already been suggested** - Search through the [GitHub Issues](https://github.com/yourusername/shop/issues?q=is%3Aissue+label%3Aenhancement) to see if the enhancement has already been suggested.

2. **Create a new issue** - If the enhancement hasn't been suggested, [open a new issue](https://github.com/yourusername/shop/issues/new) with the following:
   - A clear and descriptive title
   - A detailed description of the enhancement
   - Why this enhancement would be useful
   - Any alternatives or workarounds you've considered

### Making Code Changes

1. **Fork the repository** - Click the "Fork" button on the top right of the repository page.

2. **Clone your fork** - `git clone https://github.com/yourusername/shop.git`

3. **Create a new branch** - `git checkout -b feature/your-feature-name` or `fix/your-bug-fix`

4. **Install dependencies** - `npm install`

5. **Make your changes** - Follow the coding standards and guidelines below.

6. **Run tests** - `npm test`

7. **Commit your changes** - Use a descriptive commit message that follows our [commit message conventions](#commit-message-format).

8. **Push to your fork** - `git push origin your-branch-name`

9. **Create a Pull Request** - Go to the [Pull Requests](https://github.com/yourusername/shop/pulls) page and click "New Pull Request".

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Variables

Copy the `.env.example` file to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

### Database Setup

1. Start the PostgreSQL database:

```bash
docker-compose up -d db
```

2. Run migrations:

```bash
npm run db:migrate
```

3. Seed the database (optional):

```bash
npm run db:seed
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Coding Standards

- Follow the [JavaScript Standard Style](https://standardjs.com/)
- Use ES6+ features
- Write meaningful commit messages
- Keep functions small and focused
- Add comments where necessary
- Write tests for new features

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for our commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat(auth): add login with Google

- Add Google OAuth2 authentication
- Update user model with OAuth fields

Closes #123
```

```
fix(api): handle null values in product response

- Add null checks for product properties
- Return default values for missing fields

Fixes #456
```

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
