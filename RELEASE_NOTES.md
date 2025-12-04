# Release Notes Template

## v1.0.0 - Initial Release

### 🎉 Features

- **11 Weather Animations**
  - Rain (150 particles)
  - Heavy Rain / Pouring (300 particles)
  - Cloudy (25 drifting clouds)
  - Partly Cloudy (15 lighter clouds)
  - Fog (dense mist effect)
  - Lightning (ambient flashes only)
  - Lightning + Rain (combined effect)
  - Snow (100 snowflakes)
  - Snowy-Rainy (mixed precipitation)
  - Clear Night (200 twinkling stars in 4 drifting groups)
  - Sunny (warm golden glow with sun circle)

- **Controls**
  - Toggle on/off switch
  - Test selector dropdown to preview effects
  - Automatic mode follows weather entity
  
- **Technical**
  - Fullscreen canvas overlay (click-through)
  - 60fps smooth animations
  - Works with any weather integration
  - Mobile-friendly
  - Low CPU usage

### 📋 Installation

1. Install via HACS or manually
2. Add to configuration.yaml frontend section
3. Copy package file to /config/packages/
4. Edit weather entity name
5. Restart Home Assistant
6. Add control card to dashboard

Full installation guide: [docs/INSTALLATION.md](docs/INSTALLATION.md)

### 🐛 Known Issues

None at release.

### 🙏 Credits

Inspired by Home Assistant's Winter Mode feature.

---

## Future Release Template

## v1.1.0 - [Feature Name]

### ✨ New Features
- Added X effect
- Added Y customization

### 🐛 Bug Fixes  
- Fixed Z issue
- Improved performance for A

### 📝 Changes
- Updated B behavior
- Deprecated C (will be removed in v2.0.0)

### ⚠️ Breaking Changes
None

### 📦 Installation
Same as v1.0.0 - just update via HACS or replace the JS file.

---

## How to Create a Release on GitHub

1. Go to your repository
2. Click "Releases" on the right sidebar
3. Click "Create a new release"
4. Tag version: `v1.0.0`
5. Release title: `v1.0.0 - Initial Release`
6. Copy the release notes from above
7. Attach the weather-overlay.js file (optional)
8. Click "Publish release"

HACS will automatically detect new releases and notify users of updates!
