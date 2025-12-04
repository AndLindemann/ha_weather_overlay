# How to Publish to GitHub & HACS

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `weather-overlay` (or `ha-weather-overlay`)
3. Description: "Fullscreen weather animations for Home Assistant"
4. Make it **Public**
5. ✅ Add a README file (we'll replace it)
6. ✅ Choose a license: MIT
7. Click **Create repository**

## Step 2: Upload Files

### Option A: Via GitHub Web Interface (Easiest)

1. In your new repository, click **Add file** → **Upload files**
2. Drag all files from the `hacs-package` folder:
   ```
   dist/weather-overlay.js
   packages/weather_overlay.yaml
   examples/dashboard_card.yaml
   examples/weather-canvas-demo.html
   docs/INSTALLATION.md
   docs/TROUBLESHOOTING.md
   .github/workflows/validate.yaml
   README.md
   info.md
   hacs.json
   LICENSE
   RELEASE_NOTES.md
   ```
3. Commit message: "Initial commit"
4. Click **Commit changes**

### Option B: Via Git Command Line

```bash
# Navigate to the hacs-package folder
cd /path/to/hacs-package

# Initialize git
git init

# Add GitHub remote (replace mzuniga51 and REPO-NAME)
git remote add origin https://github.com/mzuniga51/weather-overlay.git

# Add all files
git add .

# Commit
git commit -m "Initial commit - Weather Overlay v1.0.0"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Update README with Your Username

Before or after uploading, replace all instances of `mzuniga51` with your actual GitHub username:

In `README.md`:
- Line 3: `[![GitHub release](https://img.shields.io/github/release/mzuniga51/weather-overlay.svg)]`
- Line 8: `> **Note**: Replace mzuniga51...`
- Many other badge URLs

You can do this:
1. Directly in GitHub web interface (click file → Edit)
2. Or before uploading, do find-replace in the files

## Step 4: Create First Release

1. In your repository, click **Releases** (right sidebar)
2. Click **Create a new release**
3. Click **Choose a tag** → Type `v1.0.0` → Click **Create new tag**
4. Release title: `v1.0.0 - Initial Release`
5. Description: Copy from `RELEASE_NOTES.md`
6. **Optional**: Attach `weather-overlay.js` as a binary
7. Click **Publish release**

## Step 5: Test HACS Installation (Manual)

Before submitting to HACS default, test it works:

1. In Home Assistant, go to **HACS** → **Frontend**
2. Click the **⋮** menu (top right) → **Custom repositories**
3. Repository: `https://github.com/mzuniga51/weather-overlay`
4. Category: **Lovelace**
5. Click **Add**
6. Find "Weather Overlay" in the list
7. Click **Download**
8. Follow installation steps
9. Test all features!

## Step 6: Submit to HACS Default Repository

Once tested and working:

### Method 1: Via GitHub PR (Recommended)

1. Go to https://github.com/hacs/default
2. Click **Fork** (top right)
3. In your fork, find the file `plugin`
4. Click **Edit** (pencil icon)
5. Add your repository URL alphabetically:
   ```
   mzuniga51/weather-overlay
   ```
6. Scroll down, commit message: "Add weather-overlay plugin"
7. Click **Propose changes**
8. Click **Create pull request**
9. Title: "Add weather-overlay plugin"
10. Description:
    ```
    Fullscreen weather animations for Home Assistant
    
    - 11 weather effects (rain, snow, clouds, lightning, stars, etc.)
    - Automatic mode based on weather entity
    - Test mode to preview effects
    - Compatible with all weather integrations
    
    Repository: https://github.com/mzuniga51/weather-overlay
    ```
11. Click **Create pull request**

### Method 2: Via HACS Discord

1. Join HACS Discord: https://discord.gg/apgchf8
2. Go to `#hacs-submissions` channel
3. Post:
   ```
   New plugin submission: Weather Overlay
   Repository: https://github.com/mzuniga51/weather-overlay
   
   Fullscreen weather animations for Home Assistant with 11 different effects.
   Works with any weather integration. Includes toggle control and test mode.
   ```

## Step 7: Wait for Approval

- **Timeline**: Usually 3-7 days
- **What happens**: HACS maintainers will review your submission
- **They check**:
  - Code quality and security
  - HACS metadata (hacs.json, info.md)
  - README completeness
  - License
  - Repository structure
  
- **If issues**: They'll comment on your PR with requested changes
- **When approved**: Your plugin appears in HACS default list!

## Step 8: After Approval

Users can now:
1. Open HACS → Frontend
2. Search "Weather Overlay"
3. Click Install
4. Follow your installation guide

## Ongoing Maintenance

### Releasing Updates

1. Make changes to code
2. Commit and push to GitHub
3. Create new release (e.g., `v1.1.0`)
4. HACS auto-detects and notifies users!

### Handling Issues

- Users will report bugs via GitHub Issues
- Answer questions
- Fix bugs in new releases
- Add requested features

### Promotion

- Post on Home Assistant Community Forum
- Share on Reddit r/homeassistant
- Tweet about it
- Add screenshots/GIFs to README

## Checklist Before Submitting

- [ ] Repository is public
- [ ] README.md is complete and clear
- [ ] All mzuniga51 placeholders replaced
- [ ] hacs.json and info.md present
- [ ] At least one release tag (v1.0.0)
- [ ] LICENSE file included
- [ ] Tested manual HACS installation works
- [ ] All features working correctly
- [ ] No console errors
- [ ] Screenshots/demo available

## Common Issues & Solutions

### "HACS validation failed"
- Check hacs.json syntax
- Ensure filename matches in hacs.json
- Make sure dist/weather-overlay.js exists

### "Repository not found"
- Make sure repository is public
- Check URL is correct
- Wait a few minutes after creating

### "Installation fails"
- Check file structure matches HACS requirements
- Ensure JS file is in dist/ folder
- Verify hacs.json is in root

## Need Help?

- **HACS Docs**: https://hacs.xyz/docs/publish/plugin
- **HACS Discord**: https://discord.gg/apgchf8
- **HA Community**: https://community.home-assistant.io/

## Quick Reference

**Your Repository URL**: `https://github.com/mzuniga51/weather-overlay`

**After approval, users install via**:
- HACS → Frontend → Search "Weather Overlay" → Install

**Update procedure**:
1. Push changes to GitHub
2. Create new release tag
3. Users get update notification in HACS

---

Good luck! 🚀 Your weather overlay will make many Home Assistant users happy! 🌦️
