# CI/CD Pipeline Testing Guide

This guide explains how to test and validate the GitHub Actions CI/CD pipeline locally and on GitHub.

## Pipeline Overview

The CI/CD pipeline consists of 4 jobs:

1. **backend-test** - Backend linting and unit tests
2. **frontend-test** - Frontend linting, type checking, unit tests, and build
3. **e2e-test** - End-to-end tests using Cypress
4. **docker-build** - Docker image builds (runs only if all tests pass)

## Testing Locally

### 1. Test Backend Job

```bash
cd backend
npm ci
npm run lint
npm test
```

### 2. Test Frontend Job

```bash
cd frontend
npm ci
npm run lint
npm run type-check
npm test
npm run build
```

### 3. Test E2E Tests Locally

Since Cypress has compatibility issues with macOS 26.0.1, you have two options:

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Run Cypress tests (when macOS compatibility is fixed)
cd frontend
npm run cypress:headless
```

#### Option B: Manual Setup

```bash
# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 mongo:7

# Terminal 2: Start Backend
cd backend
npm ci
npm run build
MONGODB_URI=mongodb://localhost:27017/aladia-test \
JWT_SECRET=test-secret \
GATEWAY_PORT=3000 \
AUTH_HOST=localhost \
AUTH_PORT=3002 \
npm run start:prod

# Terminal 3: Start Frontend
cd frontend
npm ci
npm run build
NEXT_PUBLIC_API_URL=http://localhost:3000/api \
PORT=3001 \
npm start

# Terminal 4: Run Cypress (when compatible)
cd frontend
npm run cypress:headless
```

## Testing on GitHub Actions

### Method 1: Push to Main Branch

The CI/CD pipeline automatically runs on every push to the `main` branch.

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Method 2: Create a Pull Request

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub
   - The CI pipeline will run automatically
   - View results in the PR's "Checks" tab

### Method 3: Manual Workflow Trigger (Optional)

If you want to add manual triggering capability, add this to `.github/workflows/ci.yml`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:  # Add this line
```

Then you can manually trigger from GitHub:
1. Go to "Actions" tab
2. Select "CI/CD Pipeline"
3. Click "Run workflow"

## Viewing Test Results on GitHub

### Accessing Workflow Runs

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. Select a workflow run to view details

### Understanding Job Status

- ✅ **Green checkmark** - Job passed
- ❌ **Red X** - Job failed
- 🟡 **Yellow dot** - Job in progress
- ⚪ **Gray circle** - Job skipped or waiting

### Viewing Cypress Test Results

When E2E tests fail or complete:

1. Click on the failed/completed workflow run
2. Click on the "e2e-test" job
3. Expand "Run Cypress E2E tests" to see test output
4. Scroll to the bottom to find artifacts

### Downloading Test Artifacts

Screenshots (on failure) and videos (always) are uploaded as artifacts:

1. Scroll to the bottom of the workflow run page
2. Find "Artifacts" section
3. Download:
   - `cypress-screenshots` - Screenshots of failed tests
   - `cypress-videos` - Videos of all test runs
4. Artifacts are retained for 7 days

## Debugging Failed CI Runs

### Backend Test Failures

```bash
# View backend test job logs on GitHub
# Look for the specific test that failed
# Run locally to debug:
cd backend
npm test -- --verbose
```

### Frontend Test Failures

```bash
# Check which step failed (lint, type-check, test, or build)
# Run the specific command locally:
cd frontend
npm run lint        # If linting failed
npm run type-check  # If type checking failed
npm test           # If unit tests failed
npm run build      # If build failed
```

### E2E Test Failures

1. **Download artifacts** from GitHub Actions
2. **View screenshots** to see where tests failed
3. **Watch videos** to understand the failure context
4. **Check backend logs** in the "Wait for backend to be ready" step
5. **Verify environment variables** are correct

Common E2E issues:
- Backend not starting: Check MongoDB connection
- Timeouts: Increase wait-on-timeout
- Test-specific failures: Run locally with `npm run cypress`

## Environment Variables Required for CI

The E2E job requires these environment variables:

### Backend Environment
```yaml
NODE_ENV: test
MONGODB_URI: mongodb://localhost:27017/aladia-test
JWT_SECRET: test-secret-key-for-ci-testing-only
GATEWAY_PORT: 3000
AUTH_HOST: localhost
AUTH_PORT: 3002
```

### Frontend Environment
```yaml
NEXT_PUBLIC_API_URL: http://localhost:3000/api
PORT: 3001
```

### Cypress Environment
```yaml
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # Automatically provided
```

## Performance Optimization

### Caching

The pipeline uses npm caching for faster builds:
- Backend: Caches `backend/package-lock.json` dependencies
- Frontend: Caches `frontend/package-lock.json` dependencies
- Cypress: Automatically cached by `cypress-io/github-action@v6`

### Parallel Execution

Jobs run in parallel where possible:
- `backend-test` and `frontend-test` run simultaneously
- `e2e-test` runs independently (has its own backend)
- `docker-build` runs only after all tests pass

## CI Pipeline Best Practices

### 1. Keep Tests Fast
- Unit tests should complete in < 2 minutes
- E2E tests should complete in < 5 minutes
- Total pipeline should complete in < 10 minutes

### 2. Fix Failing Tests Immediately
- Don't merge PRs with failing tests
- Investigate and fix test failures promptly
- Add retries for flaky tests if necessary

### 3. Monitor Artifacts
- Review Cypress videos regularly
- Check for patterns in screenshots
- Clean up old artifacts (7-day retention)

### 4. Update Dependencies
```bash
# Keep GitHub Actions up to date
# Check for new versions:
# - actions/checkout
# - actions/setup-node
# - cypress-io/github-action
# - actions/upload-artifact
```

## Troubleshooting Common Issues

### Issue: "npm ci" fails

**Solution**: Delete `package-lock.json` and regenerate:
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: Regenerate package-lock.json"
```

### Issue: Backend won't start in CI

**Solution**: Check the "Wait for backend to be ready" logs:
1. Verify MongoDB is healthy
2. Check backend build completed
3. Verify environment variables
4. Look for port conflicts

### Issue: Cypress tests timeout

**Solution**: Increase timeouts in `.github/workflows/ci.yml`:
```yaml
wait-on-timeout: 180  # Increase from 120 to 180 seconds
```

### Issue: Tests pass locally but fail in CI

**Possible causes**:
1. Different Node.js versions (CI uses 18)
2. Missing environment variables
3. Different package versions (use `npm ci` not `npm install`)
4. Race conditions in tests

## Monitoring CI Health

### Metrics to Track

1. **Success rate**: Percentage of successful CI runs
2. **Execution time**: Total time per job
3. **Flaky tests**: Tests that intermittently fail
4. **Artifact size**: Keep screenshots/videos manageable

### GitHub Actions Usage

Monitor your GitHub Actions usage:
1. Go to Settings > Billing
2. Check Actions usage minutes
3. Optimize if approaching limits

## Next Steps

1. ✅ CI pipeline is configured
2. ✅ Unit tests run automatically
3. ✅ E2E tests configured (will run when Cypress macOS compatibility is fixed)
4. ✅ Artifacts uploaded for debugging
5. 🔄 Monitor first few runs for issues
6. 🔄 Optimize timeouts if needed
7. 🔄 Consider adding test coverage reports

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress CI Documentation](https://docs.cypress.io/guides/continuous-integration/introduction)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Node.js in GitHub Actions](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
