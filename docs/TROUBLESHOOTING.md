# Troubleshooting: Effects Not Showing

If some effects work (like fog, rain, lightning) but others don't (like cloudy, partly cloudy, clear-night, sunny), follow these steps:

## Step 1: Check Browser Console

1. Open Home Assistant
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Select an effect from the test dropdown (e.g., "sunny")
5. Look for these messages:

**Good signs:**
```
[Weather Overlay] Weather changed: rainy -> sunny
[Weather Overlay] Initializing particles for sunny, config: {maxParticles: 0, type: 'sunny'}
[Weather Overlay] Created 0 particles
```

**Bad signs:**
```
[Weather Overlay] Entity weather.pirateweather not found
[Weather Overlay] No config for weather: sunny
```

## Step 2: Verify Canvas Element

In the console, type:
```javascript
document.getElementById('weather-overlay-canvas')
```

You should see: `<canvas id="weather-overlay-canvas" ...></canvas>`

If you see `null`, the canvas isn't being created.

## Step 3: Check Animation Loop

In the console, type:
```javascript
// Get the canvas
const canvas = document.getElementById('weather-overlay-canvas');
const ctx = canvas.getContext('2d');

// Manually draw something
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
ctx.fillRect(0, 0, 200, 200);
```

You should see a red square in the top-left. If you do, the canvas is working.

## Step 4: Force an Effect

Try this in console to force sunny effect:
```javascript
const canvas = document.getElementById('weather-overlay-canvas');
const ctx = canvas.getContext('2d');

function testSunny() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
  gradient.addColorStop(0, 'rgba(255, 160, 40, 0.35)');
  gradient.addColorStop(0.3, 'rgba(255, 180, 60, 0.22)');
  gradient.addColorStop(0.6, 'rgba(255, 200, 100, 0.12)');
  gradient.addColorStop(1, 'rgba(255, 220, 150, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
  
  const sunGradient = ctx.createRadialGradient(
    canvas.width * 0.85, canvas.height * 0.15, 0,
    canvas.width * 0.85, canvas.height * 0.15, 180
  );
  sunGradient.addColorStop(0, 'rgba(255, 200, 80, 0.30)');
  sunGradient.addColorStop(0.4, 'rgba(255, 180, 60, 0.18)');
  sunGradient.addColorStop(0.7, 'rgba(255, 160, 40, 0.08)');
  sunGradient.addColorStop(1, 'rgba(255, 140, 20, 0)');
  
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.85, canvas.height * 0.15, 180, 0, Math.PI * 2);
  ctx.fill();
}

testSunny();
```

If you see the sunny effect, then the canvas works but the animation loop isn't running.

## Step 5: Check if Animation Loop is Running

In console:
```javascript
// Check if animation is active
window.weatherOverlayDebug = true;
```

Then in weather-overlay.js, you'd need to add at the start of animate():
```javascript
if (window.weatherOverlayDebug) {
  console.log('Animate called, weather:', currentWeather, 'particles:', particles.length);
}
```

## Common Issues & Solutions

### Issue: "Entity not found"
**Solution**: Edit weather-overlay.js line 7 and change to your actual weather entity name.

### Issue: Effects work in demo but not in HA
**Possible causes:**
1. Canvas z-index issue - something covering it
2. Canvas not attached to DOM properly
3. Animation loop stopping
4. Home Assistant loading JS before DOM ready

**Try:**
```javascript
// Check canvas z-index
const canvas = document.getElementById('weather-overlay-canvas');
console.log(canvas.style.zIndex); // Should be '9999'
```

### Issue: Some effects work, others don't
**Most likely:** The animation loop is stopping when there are 0 particles.

**Check:** Does it work for effects with particles (rain, fog) but not without (sunny)?

**Solution:** Make sure animate() is always calling requestAnimationFrame at the end, regardless of particle count.

## Getting More Help

1. Share console output
2. Try the manual canvas test above
3. Check if canvas element exists
4. Verify toggle is ON
5. Try disabling, clearing cache (Ctrl+Shift+R), then re-enabling

## Quick Fix to Try

If cloudy/sunny/clear-night don't work, try clearing your browser cache:
1. Press **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac)
2. Or go to browser settings and clear cache for your HA URL
3. Reload the page

The old cached version of weather-overlay.js might have a bug.
