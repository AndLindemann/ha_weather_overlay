# 🚀 QUICK START - Publishing to GitHub & HACS

## ✅ What You Have
Complete HACS-ready package in the `hacs-package` folder with:
- ✅ Proper directory structure
- ✅ All required metadata files
- ✅ Documentation
- ✅ Examples
- ✅ GitHub workflows
- ✅ License

## 📤 Upload to GitHub (15 minutes)

### 1. Create Repository
- Go to https://github.com/new
- Name: `weather-overlay`
- Description: "Fullscreen weather animations for Home Assistant"
- Public ✅
- Add README ✅
- License: MIT ✅
- Create!

### 2. Upload Files
Drag these from `hacs-package/` folder to GitHub:
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
```

### 3. Find & Replace
Replace `mzuniga51` with your GitHub username in:
- README.md (multiple places)
- info.md

### 4. Create Release
- Click "Releases"
- "Create new release"
- Tag: `v1.0.0`
- Title: `v1.0.0 - Initial Release`
- Description: Copy from RELEASE_NOTES.md
- Publish!

## 🧪 Test Installation (10 minutes)

In Home Assistant:
1. HACS → Frontend → ⋮ → Custom repositories
2. Add: `https://github.com/mzuniga51/weather-overlay`
3. Category: Lovelace
4. Download and test!

## 📮 Submit to HACS (5 minutes)

1. Go to https://github.com/hacs/default
2. Fork repository
3. Edit file `plugin`
4. Add your repo URL (alphabetically):
   ```
   mzuniga51/weather-overlay
   ```
5. Create Pull Request
6. Wait 3-7 days for approval

## 🎉 Done!

After approval, users can install via:
**HACS → Frontend → Search "Weather Overlay" → Install**

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `hacs.json` | HACS metadata |
| `info.md` | HACS UI description |
| `README.md` | Main documentation |
| `LICENSE` | MIT license |
| `dist/weather-overlay.js` | Main code |
| `packages/weather_overlay.yaml` | Helper entities |
| `examples/*` | Demo & examples |
| `docs/*` | Installation & troubleshooting |
| `.github/workflows/validate.yaml` | Auto-validation |
| `PUBLISH_GUIDE.md` | Detailed publishing steps |
| `RELEASE_NOTES.md` | Template for releases |

## 🔗 Important Links

- **HACS Docs**: https://hacs.xyz/docs/publish/plugin
- **HACS Default**: https://github.com/hacs/default
- **HACS Discord**: https://discord.gg/apgchf8
- **Your Repo**: `https://github.com/mzuniga51/weather-overlay`

## ⚠️ Don't Forget

- [ ] Replace mzuniga51 everywhere
- [x] Name updated to Manuel Zuniga in LICENSE
- [ ] Test installation before submitting
- [ ] Add screenshots to README (optional but recommended)
- [ ] Create v1.0.0 release tag

---

**Full detailed guide**: See [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md)

**Need help?** Ask in HACS Discord or HA Community Forum

Good luck! 🌦️✨
