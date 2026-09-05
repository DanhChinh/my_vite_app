# Contributing Guide

Thank you for contributing to TechStore Pro.

## Project standards

- keep changes focused and easy to review
- follow the existing folder structure and naming conventions
- prefer readable, maintainable code over clever abstractions
- document business logic in comments when necessary
- never commit secrets or local environment files

## Branch workflow

Use a simple feature-based workflow:

```bash
git checkout -b feature/your-change
```

When ready, open a pull request with a clear summary and validation notes.

## Pull request expectations

A good PR should include:

- a short summary of the change
- the reason for the change
- any affected route or UI flow
- validation steps or test notes

## Local validation

Before submitting a patch:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run build
```

## Coding conventions

- use meaningful variable and function names
- keep route logic thin and controller logic focused
- use consistent response shapes for API endpoints
- prefer environment variables over hardcoded values
- validate inputs before database operations

## Security expectations

- do not expose secret values in code or Git history
- sanitize user-supplied data before writing it to the database
- protect admin-only routes with role checks
- verify JWT handling before merging authentication-related changes

## Documentation updates

Any feature that changes behavior should also update the relevant documentation in `docs/` and the root `README.md`.
