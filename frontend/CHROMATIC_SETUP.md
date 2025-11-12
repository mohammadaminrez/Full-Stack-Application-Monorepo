# Chromatic Visual Regression Testing Setup

Chromatic is configured for automated visual regression testing of Storybook components.

## What is Chromatic?

Chromatic captures screenshots of your Storybook components and detects visual changes:
- ✅ Catches unintended UI changes
- 🔍 Provides visual diffs for review
- 📸 Archives component history
- 🚀 Integrates with CI/CD

## Setup Instructions

### 1. Create a Chromatic Account

1. Go to [chromatic.com](https://www.chromatic.com/)
2. Sign in with your GitHub account
3. Click "Add project"
4. Select your repository: `Full-Stack-Application-Monorepo`

### 2. Get Your Project Token

After creating the project, Chromatic will provide a `CHROMATIC_PROJECT_TOKEN`.

### 3. Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Name: `CHROMATIC_PROJECT_TOKEN`
5. Value: Paste your token from Chromatic
6. Click "Add secret"

### 4. Verify Setup

Push a commit to trigger the CI/CD pipeline. The Chromatic job should now run!

## Local Usage

### Run Chromatic Locally

```bash
cd frontend

# Set your token (one-time setup)
export CHROMATIC_PROJECT_TOKEN=your-token-here

# Run Chromatic
npm run chromatic
```

### View Results

After running, Chromatic will provide a URL to view the build results:
```
View your Storybook at https://your-project-id.chromatic.com/build?appId=...
```

## How It Works

### In CI/CD Pipeline

1. **frontend-test** job completes
2. **chromatic** job starts:
   - Installs dependencies
   - Builds Storybook (`npm run build-storybook`)
   - Uploads to Chromatic for visual comparison
   - Chromatic compares with baseline screenshots

### On Pull Requests

Chromatic will:
- 📸 Capture new screenshots
- 🔄 Compare with baseline from main branch
- 💬 Comment on PR with visual changes detected
- ✅ Require approval if changes detected

### Configuration Options

See [`chromatic.config.json`](./chromatic.config.json) for configuration:

- `exitZeroOnChanges`: Don't fail build on visual changes
- `onlyChanged`: Only test changed stories (faster)
- `autoAcceptChanges`: Auto-approve on main branch (optional)
- `skip`: Skip Chromatic on dependabot PRs

## Workflow

### For New Features

1. Create a branch and add/modify components
2. Update Storybook stories
3. Push changes
4. CI/CD runs Chromatic
5. Review visual changes in Chromatic UI
6. Approve or request changes
7. Merge PR

### For Bug Fixes

If a visual bug is detected:
1. Chromatic shows the diff
2. Fix the component
3. Push changes
4. Verify fix in Chromatic
5. Approve and merge

## Best Practices

### ✅ DO:
- Write Storybook stories for all UI components
- Review all visual changes before merging
- Use descriptive commit messages
- Keep stories up-to-date with component changes

### ❌ DON'T:
- Auto-accept changes without review
- Ignore visual regression failures
- Skip Chromatic on feature branches
- Forget to update stories when changing components

## Storybook Stories

Your components already have stories:
- [Button](./components/ui/Button/Button.stories.tsx)
- [Card](./components/ui/Card/Card.stories.tsx)
- [InputField](./components/ui/InputField/InputField.stories.tsx)
- [Modal](./components/ui/Modal/Modal.stories.tsx)
- [Tabs](./components/ui/Tabs/Tabs.stories.tsx)

## Troubleshooting

### Chromatic job fails with "No project token"

**Solution**: Make sure `CHROMATIC_PROJECT_TOKEN` secret is added to GitHub.

### Build is slow

**Solution**: Enable `onlyChanged: true` in config (already enabled).

### Too many snapshots

**Solution**: Use Chromatic's TurboSnap feature to only test changed components.

### Visual differences in fonts/rendering

**Solution**: This is normal across different browsers. Review and accept if intentional.

## Cost

Chromatic offers:
- **Free tier**: 5,000 snapshots/month
- **Open source**: Unlimited snapshots for public repos

Your project has 5 UI components with multiple variants = ~20-30 snapshots per build.

## Links

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Your Chromatic Project](https://www.chromatic.com/builds?appId=your-app-id)

## Questions?

- Check [Chromatic's Discord](https://discord.gg/chromatic)
- Review [Storybook Discord](https://discord.gg/storybook)
- See [GitHub Issues](../../issues)
