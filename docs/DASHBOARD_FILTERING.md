# Dashboard Filtering Guide

## Overview
By default, the weather overlay appears on **all dashboards** in Home Assistant. You can configure it to only show on specific dashboards if you prefer.

## Configuration

Edit the `ENABLED_DASHBOARDS` array at the top of `weather-overlay.js` (around line 18):

### Show on ALL Dashboards (Default)
```javascript
const ENABLED_DASHBOARDS = []; // Empty array = show everywhere
```

### Show on Specific Dashboards Only

#### Example 1: Only Default Dashboard
```javascript
const ENABLED_DASHBOARDS = ['lovelace'];
```

#### Example 2: Multiple Dashboards
```javascript
const ENABLED_DASHBOARDS = ['lovelace', 'mobile', 'weather'];
```

#### Example 3: Custom Dashboard Names
```javascript
const ENABLED_DASHBOARDS = ['home', 'living-room'];
```

## Finding Your Dashboard Names

Dashboard names come from your URL:

| URL | Dashboard Name |
|-----|----------------|
| `http://homeassistant.local:8123/lovelace` | `lovelace` |
| `http://homeassistant.local:8123/lovelace/mobile` | `mobile` |
| `http://homeassistant.local:8123/lovelace/weather` | `weather` |
| `http://homeassistant.local:8123/lovelace/living-room` | `living-room` |

**The dashboard name is everything after `/lovelace/`**

If the URL is just `/lovelace` with nothing after, the dashboard name is `lovelace` (the default dashboard).

## Complete Example

Let's say you have three dashboards:
1. Default dashboard (`/lovelace`)
2. Mobile dashboard (`/lovelace/mobile`)
3. Weather dashboard (`/lovelace/weather`)

And you only want the overlay on the default and weather dashboards:

```javascript
const ENABLED_DASHBOARDS = ['lovelace', 'weather'];
```

Now the overlay will:
- ✅ Show on `/lovelace` (default)
- ❌ Hide on `/lovelace/mobile`
- ✅ Show on `/lovelace/weather`

## How It Works

When you navigate between dashboards:
1. The script checks the current URL
2. Extracts the dashboard name
3. Compares it to your `ENABLED_DASHBOARDS` list
4. Shows or hides the overlay accordingly

You'll see console messages like:
```
[Weather Overlay] Dashboard: mobile, Enabled: false
[Weather Overlay] Dashboard: lovelace, Enabled: true
```

## Use Cases

### Use Case 1: Mobile-Only
Show the overlay only on your mobile dashboard:
```javascript
const ENABLED_DASHBOARDS = ['mobile'];
```

### Use Case 2: Hide on TV Dashboards
Show everywhere except your TV dashboard:
```javascript
// Note: This requires listing all dashboards EXCEPT the one you want to hide
const ENABLED_DASHBOARDS = ['lovelace', 'mobile', 'tablet'];
// Now 'tv' dashboard won't have the overlay
```

### Use Case 3: Weather Dashboard Only
Only show on a dedicated weather dashboard:
```javascript
const ENABLED_DASHBOARDS = ['weather'];
```

## Testing

1. Edit `ENABLED_DASHBOARDS` in the JS file
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Navigate to different dashboards
4. Check the browser console (F12) to see which dashboard is detected
5. Verify the overlay appears/disappears as expected

## Troubleshooting

**Overlay not appearing on any dashboard?**
- Check console for: `[Weather Overlay] Dashboard: xxx, Enabled: false`
- Make sure the dashboard name matches exactly (case-sensitive)
- Verify the URL format is `/lovelace/dashboard-name`

**Overlay still appearing everywhere?**
- Make sure `ENABLED_DASHBOARDS` is not empty `[]`
- Clear browser cache completely
- Check for JavaScript errors in console

**Dashboard name not detected?**
- Open browser console (F12)
- Navigate to the dashboard
- Look for: `[Weather Overlay] Dashboard: xxx`
- Use that exact name in your configuration

## Notes

- Dashboard names are **case-sensitive**: `Mobile` ≠ `mobile`
- The toggle (`input_boolean.weather_overlay`) still works - it can disable the overlay globally
- Changes require a browser cache clear to take effect
- Navigation between dashboards is detected automatically (checks every 500ms)

## Reverting to Default

To show the overlay on all dashboards again:
```javascript
const ENABLED_DASHBOARDS = []; // Back to default
```

---

**Need help?** Check the browser console for debug messages!
