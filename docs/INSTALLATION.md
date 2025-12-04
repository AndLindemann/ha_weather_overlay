# Weather Overlay Installation Guide for Home Assistant

This guide will help you install the weather overlay animations in your Home Assistant.

## What You'll Get

Fullscreen weather animations that automatically change based on your weather entity:
- 🌧️ Rain
- ⛈️ Heavy Rain (Pouring)
- ☁️ Cloudy (drifting clouds)
- ⛅ Partly Cloudy (light clouds)
- 🌫️ Fog (dense mist)
- ⚡ Lightning (ambient flashes)
- ⛈️ Lightning + Rain (combined)
- ❄️ Snow (falling snowflakes)
- 🌨️ Snowy-Rainy (mixed precipitation)
- 🌙 Clear Night (twinkling stars)
- ☀️ Sunny (warm golden glow)
- ✨ Clear (no animation)

## Prerequisites

- Home Assistant with a working weather integration (e.g., weather.pirateweather)
- Access to your Home Assistant configuration files
- HACS installed (recommended but not required)

## Installation Steps

### Step 1: Enable Packages (if not already enabled)

First, make sure packages are enabled in your Home Assistant:

1. Open `/config/configuration.yaml`
2. Add this section if it doesn't exist:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

3. Create the packages folder if it doesn't exist:
   - Create folder: `/config/packages/`

### Step 2: Install the Helper Package

1. Download the `weather_overlay_package.yaml` file
2. Upload it to `/config/packages/weather_overlay_package.yaml`
3. Restart Home Assistant or reload YAML configuration:
   - Go to **Developer Tools** → **YAML** → **Reload All YAML Configuration**

This creates the `input_boolean.weather_overlay` toggle and `input_select.weather_overlay_test` selector automatically!

### Step 3: Add the Dashboard Card

1. Go to your dashboard
2. Click **Edit Dashboard** (pencil icon)
3. Click **Add Card**
4. Scroll down and select **Manual** (or click "Show Code Editor")
5. Download and open `dashboard_card.yaml`
6. Copy the entire contents and paste it
7. Click **Save**

You now have a nice control card with:
- Toggle switch for the overlay
- **Test selector dropdown** to try different weather effects
- Your weather forecast
- Status information

### Step 4: Upload the JavaScript File

1. Download the `weather-overlay.js` file
2. Connect to your Home Assistant (via Samba, SSH, or File Editor add-on)
3. Navigate to `/config/www/` folder
   - If the `www` folder doesn't exist, create it
4. Upload `weather-overlay.js` to `/config/www/`

Your file should be at: `/config/www/weather-overlay.js`

### Step 5: Update Configuration.yaml

Add the JavaScript file to your Home Assistant configuration:

1. Open `/config/configuration.yaml`
2. Find the `frontend:` section (or add it if it doesn't exist)
3. Add the module URL:

```yaml
frontend:
  extra_module_url:
    - /local/weather-overlay.js
```

**If you already have `frontend:` or `extra_module_url:`**, just add the new line:

```yaml
frontend:
  themes: !include_dir_merge_named themes  # Your existing config
  extra_module_url:
    - /local/card-mod.js  # Your existing modules
    - /local/weather-overlay.js  # Add this line
```

### Step 3: Update Configuration.yaml

Add the JavaScript file to your Home Assistant configuration:

1. Open `/config/configuration.yaml`
2. Find the `frontend:` section (or add it if it doesn't exist)
3. Add the module URL:

```yaml
frontend:
  extra_module_url:
    - /local/weather-overlay.js
```

**If you already have `frontend:` or `extra_module_url:`**, just add the new line:

```yaml
frontend:
  themes: !include_dir_merge_named themes  # Your existing config
  extra_module_url:
    - /local/card-mod.js  # Your existing modules
    - /local/weather-overlay.js  # Add this line
```

### Step 6: Configure Your Weather Entity

Edit the `weather-overlay.js` file and change the weather entity to match yours:

Find this line (near the top):
```javascript
const WEATHER_ENTITY = 'weather.pirateweather'; // Change this to your weather entity
```

Change `'weather.pirateweather'` to your actual weather entity name.

**To find your weather entity:**
1. Go to Developer Tools → States in Home Assistant
2. Search for "weather"
3. Copy the entity ID (e.g., `weather.home`, `weather.forecast_home`, etc.)

### Step 7: Restart Home Assistant

1. Go to Settings → System → Restart
2. Click "Restart Home Assistant"
3. Wait for it to restart

### Step 8: Verify It's Working

1. Make sure your **Weather Overlay toggle is ON** (check the card you added)
2. Open Home Assistant in your browser
3. Press **F12** to open Developer Tools
4. Go to the **Console** tab
5. Look for messages like:
   ```
   [Weather Overlay] Module loaded
   [Weather Overlay] Home Assistant ready, initializing...
   [Weather Overlay] Canvas initialized
   [Weather Overlay] Started with weather: rainy
   ```

6. You should see weather animations based on your current weather!
7. **Toggle it off/on** using the switch to verify it works

### Step 9: Test Different Weather States

**Easy Way - Use the built-in test selector:**

1. On your dashboard card, find the **"Test Weather Effect"** dropdown
2. Select any weather state (snowy, rainy, lightning, etc.)
3. Watch the animation change instantly!
4. Set it back to **"Use Real Weather"** when done testing

**Advanced Way - Create your own test helper:**

**Option 1: Wait for weather to change naturally**

**Option 2: Create a test helper (temporary entity):**
1. Go to Settings → Devices & Services → Helpers
2. Click "Create Helper" → "Dropdown"
3. Name it "Test Weather"
4. Add options: `rainy`, `snowy`, `lightning`, `fog`, `clear`
5. Save it
6. Edit `weather-overlay.js` and change:
   ```javascript
   const WEATHER_ENTITY = 'input_select.test_weather';
   ```
7. Restart Home Assistant
8. Now you can change the dropdown to test different effects!

## Troubleshooting

### No Animation Appears

1. **Check the toggle is ON** - Make sure `input_boolean.weather_overlay` is enabled
2. **Check browser console** (F12 → Console) for errors
3. **Verify the file path:**
   - Make sure `/config/www/weather-overlay.js` exists
   - Try accessing: `http://YOUR_HA_IP:8123/local/weather-overlay.js` in browser
4. **Check your weather entity name** is correct in the JS file
5. **Clear browser cache:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### "Entity not found" Error

- Double-check your weather entity name
- Go to Developer Tools → States and verify the entity exists
- Make sure it's spelled exactly right (case-sensitive)

### Canvas Appears but No Animations

- Check if your weather state is supported (see list above)
- Look in browser console for messages about weather state
- The animation only runs for specific weather states (not sunny/clear)

### Performance Issues

If animations are slow or laggy:

1. **Reduce particle count** - Edit `weather-overlay.js`:
   ```javascript
   'rainy': {
     maxParticles: 75,  // Was 150, reduce to 75
     // ...
   }
   ```

2. **Disable on mobile devices** - Add this at the top of the JS file:
   ```javascript
   // Disable on mobile
   if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
     console.log('[Weather Overlay] Disabled on mobile');
     return;
   }
   ```

## Customization

### Change Animation Intensity

Edit the `weatherConfigs` object in `weather-overlay.js`:

```javascript
'rainy': {
  maxParticles: 150,     // More = heavier rain
  speedMin: 15,          // Slower = 10, Faster = 25
  speedMax: 25,
  sizeMin: 1,           // Larger drops = 2-3
  sizeMax: 2,
  // ...
}
```

### Change Lightning Frequency

Find this line:
```javascript
let lightningInterval = 1500 + Math.random() * 2500;
```

- **More frequent:** Change to `1000 + Math.random() * 1500` (1-2.5 sec)
- **Less frequent:** Change to `3000 + Math.random() * 5000` (3-8 sec)

### Add Your Own Weather States

Add a new configuration in `weatherConfigs`:

```javascript
'hail': {
  maxParticles: 200,
  color: 'rgba(220, 220, 255, 0.9)',
  speedMin: 25,
  speedMax: 35,
  sizeMin: 3,
  sizeMax: 6,
  swayAmount: 2,
  type: 'snow'  // Uses snow rendering (circles)
}
```

## Uninstalling

1. Remove the line from `configuration.yaml`:
   ```yaml
   - /local/weather-overlay.js
   ```
2. Restart Home Assistant
3. (Optional) Delete `/config/www/weather-overlay.js`

## Support

If you have issues:
1. Check the browser console (F12) for error messages
2. Verify all file paths are correct
3. Make sure your weather entity is working properly
4. Try a hard refresh of your browser (Ctrl+Shift+R)

## Credits

Weather overlay inspired by Home Assistant's Winter Mode feature.
Canvas animations adapted from various open-source weather effect libraries.
