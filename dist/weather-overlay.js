class WeatherOverlayCard extends HTMLElement {
  static get defaultConfig() {
    return {
      weather_entity: 'weather.home',
      sun_entity: 'sun.sun',
      toggle_entity: 'input_boolean.weather_overlay',
      test_entity: 'input_select.weather_overlay_test',
      rain_sensor_entity: 'sensor.rain_rate',
      test_rain_rate_mmh: 6,
      rain_rate_max_mmh: 20,
      rain_rate_min_active_fraction: 0.12,
      rain_rate_response_curve: 1.35,
      rain_rate_light_mmh: 2,
      rain_rate_normal_mmh: 5,
      rain_only_when_rate_positive: true,
      rain_rate_start_threshold_mmh: 0.05,
      rain_rate_stop_threshold_mmh: 0.01,
      rain_no_rain_weather: 'cloudy',
      stars_vertical_limit: 0.15,
      clouds_vertical_limit: 0.15,
      moon_x: 0.35,
      moon_y: 0.10,
      show_moon: true,
      debug_mode: false,
      clouds_left_fade_px: 500,
      clouds_left_fade_min_opacity: 0.05,
      rain_cloud_ceiling_enabled: true,
      rain_cloud_ceiling_count: 60,
      rain_cloud_ceiling_y: 0.05,
      rain_cloud_ceiling_height: 0.12,
      rain_cloud_ceiling_size_min: 220,
      rain_cloud_ceiling_size_max: 420,
      rain_cloud_ceiling_opacity: 1,
      weather_configs: {
        'rainy': { maxParticles: 60, color: 'rgba(213, 226, 245, 0.6)', speedMin: 15, speedMax: 25, sizeMin: 3, sizeMax: 4, swayAmount: 0.5, type: 'rain', cloud_ceiling: true, cloud_color: 'rgba(180, 180, 180, 0.55)' },
        'pouring': { maxParticles: 100, color: 'rgba(213, 226, 245, 0.35)', speedMin: 10.5, speedMax: 17.5, sizeMin: 3, sizeMax: 4, swayAmount: 0.5, type: 'rain', lengthMultiplier: 4, cloud_ceiling: true, cloud_color: 'rgba(160, 160, 160, 1)' },
        'cloudy': { maxParticles: 60, color: 'rgba(180, 180, 180, 0.55)', speedMin: 0.22, speedMax: 0.65, sizeMin: 180, sizeMax: 320, swayAmount: 0.5, type: 'clouds', puffCountMin: 7, puffCountMax: 10, puffSizeMin: 0.45, puffSizeMax: 0.85 },
        'partlycloudy': { maxParticles: 28, color: 'rgba(200, 200, 200, 0.30)', speedMin: 0.30, speedMax: 0.90, sizeMin: 120, sizeMax: 200, swayAmount: 0.6, type: 'clouds', puffCountMin: 6, puffCountMax: 8, puffSizeMin: 0.42, puffSizeMax: 0.75 },
        'snowy': { maxParticles: 120, color: 'rgba(255, 255, 255, 0.85)', speedMin: 0.8, speedMax: 2.5, sizeMin: 2, sizeMax: 6, swayAmount: 2, type: 'snow', cloud_ceiling: true, cloud_color: 'rgba(230, 230, 245, 0.9)' },
        'snowy-rainy': { maxParticles: 100, color: 'rgba(215, 225, 245, 0.7)', speedMin: 9, speedMax: 16, sizeMin: 3, sizeMax: 5, swayAmount: 1.0, type: 'mixed', cloud_ceiling: true, cloud_color: 'rgba(200, 210, 230, 0.85)' },
        'hail': { maxParticles: 80, color: 'rgba(220, 230, 240, 0.85)', speedMin: 15, speedMax: 25, sizeMin: 3, sizeMax: 5, swayAmount: 0.5, type: 'hail', cloud_ceiling: true, cloud_color: 'rgba(120, 130, 140, 0.7)' },
        'clear-night': { maxParticles: 56, type: 'stars' },
        'sunny': { maxParticles: 45, color: 'rgba(255, 220, 140, 0.9)', speedMin: 0.2, speedMax: 0.5, sizeMin: 2, sizeMax: 4, swayAmount: 0.5, type: 'sunny' },
        'fog': { maxParticles: 14, color: 'rgba(220, 220, 220, 0.75)', density: 3, speedMin: 0.12, speedMax: 0.28, sizeMin: 160, sizeMax: 320, swayAmount: 0, type: 'fog' },
        'exceptional': { maxParticles: 45, color: 'rgba(255, 250, 220, 0.9)', speedMin: 0.2, speedMax: 0.5, sizeMin: 2, sizeMax: 4, swayAmount: 0.5, type: 'sunny' },
        'windy': { maxParticles: 6, color: 'rgba(200, 200, 200, 0.06)', speedMin: 2, speedMax: 4, sizeMin: 70, sizeMax: 130, swayAmount: 0.6, type: 'clouds' },
        'lightning': { maxParticles: 0, type: 'lightning' },
        'lightning-rainy': { maxParticles: 50, color: 'rgba(213, 226, 245, 0.6)', speedMin: 15, speedMax: 25, sizeMin: 3, sizeMax: 4, swayAmount: 0.5, type: 'rain', hasLightning: true, cloud_ceiling: true, cloud_color: 'rgba(160, 160, 160, 0.55)' }
      }
    };
  };

  constructor() {
    super();
    this._initializationComplete = false;

    this._overlayActive = false;

    this._rainCloudCeiling = [];
    this._rainParticleLimit = null;
    this._rainRateMmH = null;
    this._isRaining = false;
    this._actualWeather = null;
    this._viewEl = null;
    this._viewObserver = null;
    this._boundSyncActive = () => this._syncActiveState();

    this.attachShadow({ mode: 'open' });
    this._container = document.createElement('div');
    this._container.style.overflow = "hidden";
    this._container.style.minHeight = "1px";
    this.shadowRoot.appendChild(this._container);
    this._canvas = null;
    this._ctx = null;
    this._particles = [];
    this._animationId = null;
    this._currentWeather = null;
    this._sunRotation = 0;
    this._lightning = { timer: 0, interval: 1500 + Math.random() * 2500, show: false, duration: 0, brightness: 0, fade: 0 };
    this._defaultConfig = WeatherOverlayCard.defaultConfig;
    this._config = { ...this._defaultConfig };
    this._boundResize = () => this.handleResize();
  }

  _isInEditor() {
    return Boolean(
      this.closest("hui-card-preview") ||
        this.closest("hui-card-editor") ||
        this.closest("hui-dialog-edit-card") ||
        window.location.search.includes("edit=1")
    );
  }

  _getClosestView() {
    return this.closest("hui-view") || null;
  }

  _isViewVisible(view) {
    if (!view) return true;

    if (view.hidden) return false;
    if (view.hasAttribute("hidden")) return false;
    if (view.getAttribute("aria-hidden") === "true") return false;

    const style = getComputedStyle(view);
    if (style.display === "none") return false;
    if (style.visibility === "hidden") return false;

    return true;
  }

  _syncActiveState() {
    if (this._isInEditor()) {
      this._deactivateOverlay();
      return;
    }

    this._ensureViewObserver();

    const viewVisible = this._isViewVisible(this._viewEl);
    const shouldRun = Boolean(this._hass && this._config && viewVisible);

    if (shouldRun) this._activateOverlay();
    else this._deactivateOverlay();
  }

  _activateOverlay() {
    if (this._overlayActive) return;
    this._overlayActive = true;

    window.__weatherOverlayRefCount = (window.__weatherOverlayRefCount || 0) + 1;

    this._ensureOverlayStarted();
  }

  _deactivateOverlay() {
    if (!this._overlayActive) return;
    this._overlayActive = false;

    this._stopAnimation();

    window.removeEventListener("resize", this._boundResize);

    window.__weatherOverlayRefCount = Math.max(0, (window.__weatherOverlayRefCount || 1) - 1);

    if ((window.__weatherOverlayRefCount || 0) === 0) {
      const existing = document.getElementById("weather-overlay-canvas");
      if (existing) existing.remove();
      window.__weatherOverlayCanvas = undefined;
      window.__weatherOverlayCtx = undefined;
    } else {
      const canvas = document.getElementById("weather-overlay-canvas");
      if (canvas) canvas.style.display = "none";
    }

    this._initializationComplete = false;
    this._canvas = null;
    this._ctx = null;
  }

  _ensureViewObserver() {
    const nextView = this._getClosestView();
    if (this._viewEl === nextView && this._viewObserver) return;

    if (this._viewObserver) {
      this._viewObserver.disconnect();
      this._viewObserver = null;
    }

    this._viewEl = nextView;
    if (!this._viewEl) return;

    this._viewObserver = new MutationObserver(() => this._syncActiveState());
    this._viewObserver.observe(this._viewEl, {
      attributes: true,
      attributeFilter: ["hidden", "style", "class", "aria-hidden"],
    });
  }

  connectedCallback() {
    this._updatePlaceholderVisibility();

    if (this._isInEditor()) return;

    window.addEventListener("location-changed", this._boundSyncActive);
    window.addEventListener("popstate", this._boundSyncActive);

    this._syncActiveState();
  }

  disconnectedCallback() {
    if (this._viewObserver) {
      this._viewObserver.disconnect();
      this._viewObserver = null;
    }
    window.removeEventListener("location-changed", this._boundSyncActive);
    window.removeEventListener("popstate", this._boundSyncActive);

    this._deactivateOverlay();
  }

  _updatePlaceholderVisibility() {
    if (this._isInEditor()) {
      this._container.style.display = "block";
      this._container.style.visibility = "visible";
      this._container.style.height = "auto";
      this._container.style.margin = "";
      this._container.style.overflow = "hidden";
      this._container.style.pointerEvents = "auto";
      this._renderPlaceholder();
      this._queueLlResize();
    } else {
      this._container.innerHTML = "";
      this._container.style.display = "block";
      this._container.style.visibility = "hidden";
      this._container.style.height = "0px";
      this._container.style.margin = "0px";
      this._container.style.overflow = "hidden";
      this._container.style.pointerEvents = "none";
    }
  }

  _renderPlaceholder() {
    const entity = this._config?.weather_entity || "(not configured)";

    this._container.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          min-height: 64px;
        }
        .content {
          padding: 12px 16px;
        }
        .title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .secondary {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.4;
        }
        code {
          font-family: var(--code-font-family, monospace);
        }
      </style>

      <ha-card>
        <div class="content">
          <div class="secondary">
            Weather Overlay<br>
            This card renders a dashboard-wide background overlay.
          </div>
          <div class="secondary" style="margin-top:8px;">
            Entity: <code>${entity}</code>
          </div>
        </div>
      </ha-card>
    `;
  }

  _queueLlResize() {
    if (this.__llResizeQueued) return;
    this.__llResizeQueued = true;

    requestAnimationFrame(() => {
      this.__llResizeQueued = false;
      this.dispatchEvent(new CustomEvent("ll-resize", { bubbles: true, composed: true }));
    });
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: this._isInEditor() ? 2 : 1,
    };
  }

  getCardSize() {
    return this._isInEditor() ? 2 : 1;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");

    const merged = JSON.parse(JSON.stringify(this._defaultConfig));
    const yamlWeatherConfigs = config.weather_configs || {};

    Object.keys(config).forEach((key) => {
      if (key !== "weather_configs") merged[key] = config[key];
    });

    Object.keys(yamlWeatherConfigs).forEach((key) => {
      merged.weather_configs[key] = {
        ...(merged.weather_configs[key] || {}),
        ...yamlWeatherConfigs[key],
      };
    });

    this._config = merged;

    this._updatePlaceholderVisibility();

    if (this._hass && !this._isInEditor()) {
      this._ensureOverlayStarted();
    }
  }

  set hass(hass) {
    this._hass = hass;

    if (this._isInEditor()) {
      this._updatePlaceholderVisibility();
      return;
    }
    if (!this._config) return;

    this._syncActiveState();
    if (!this._overlayActive) return;

    const weather = hass.states[this._config.weather_entity]?.state;
    const test = this._config.test_entity ? hass.states[this._config.test_entity]?.state : undefined;
    const toggle = this._config.toggle_entity ? hass.states[this._config.toggle_entity]?.state : undefined;
    const rainRate = this._config.rain_sensor_entity ? hass.states[this._config.rain_sensor_entity]?.state : undefined;
    const sun = this._config.sun_entity ? hass.states[this._config.sun_entity]?.state : undefined;

    const snapshot = `${weather}|${test}|${toggle}|${rainRate}|${sun}`;
    if (snapshot === this._lastEntitySnapshot) return;

    this._lastEntitySnapshot = snapshot;
    this.updateWeather();
  }

  _startAnimation() {
    if (this._animationId) return;
    const loop = () => {
      this._animationId = requestAnimationFrame(loop);
      this.animateFrame();
    };
    this._animationId = requestAnimationFrame(loop);
  }

  _stopAnimation() {
    if (!this._animationId) return;
    cancelAnimationFrame(this._animationId);
    this._animationId = null;
  }

  _ensureOverlayStarted() {
    if (this._initializationComplete) return;
    if (this._isInEditor()) return;

    window.__weatherOverlayRefCount = (window.__weatherOverlayRefCount || 0) + 1;

    let canvas = document.getElementById("weather-overlay-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "weather-overlay-canvas";
      canvas.style.cssText =
        "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:-1;";
      document.body.appendChild(canvas);
    }

    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");

    this.handleResize();
    window.addEventListener("resize", this._boundResize);

    this._initializationComplete = true;
    this.updateWeather();
  }

  handleResize() {
    if (!this._canvas || !this._ctx) return;

    const dpr = window.devicePixelRatio || 1;

    this._canvas.width = Math.floor(window.innerWidth * dpr);
    this._canvas.height = Math.floor(window.innerHeight * dpr);

    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.scale(dpr, dpr);

    if (this._currentWeather) this._initRainCloudCeiling(this._currentWeather);
  }

  updateWeather() {
    if (!this._hass || !this._config) return;
    if (!this._canvas) return;

    const state = this._hass.states[this._config.weather_entity];

    const testState = this._config.test_entity
      ? this._hass.states[this._config.test_entity]
      : undefined;

    if (!state && !testState?.state) return;

    let weather = state?.state;

    if (testState?.state && testState.state !== "Use Real Weather") {
      weather = testState.state;
    }
    if (!weather) return;

    const actualWeather = weather;
    const renderWeather = this._resolveRenderWeather(actualWeather);
    this._actualWeather = actualWeather;
    weather = renderWeather;

    if (
      this._config.toggle_entity &&
      this._hass.states[this._config.toggle_entity]?.state !== "on"
    ) {
      this._canvas.style.display = "none";
      this._stopAnimation();
      return;
    }
    this._canvas.style.display = "block";
    this._startAnimation();

    this._updateRainRuntime(weather);

    if (weather !== this._currentWeather) {
      console.info(`[WEATHER-OVERLAY-CARD] New weather: ${weather}`);
      this._currentWeather = weather;
      // Calculate moon phase only when relevant and showing moon
      const newConfig = this._config.weather_configs[weather];
      const isMoonWeather = newConfig?.type === 'stars' || weather === 'partlycloudy';
      if (isMoonWeather && this._config.show_moon !== false) {
        this._moonPhase = this._getMoonPhase();
      }
      this.initParticles(weather);
    }
  }

  _shouldShowRainCloudCeiling(weather) {
    const cfg = this._config?.weather_configs?.[weather];
    if (!cfg) return false;
    if (!this._config?.rain_cloud_ceiling_enabled) return false;

    return (cfg.type === "rain" || cfg.type === "snow" || cfg.type === "mixed" || cfg.type === "hail") && cfg.cloud_ceiling === true;
  }

  _initRainCloudCeiling(weather) {
    if (!this._shouldShowRainCloudCeiling(weather)) {
      this._rainCloudCeiling = [];
      return;
    }

    const count = Math.max(1, Number(this._config.rain_cloud_ceiling_count ?? 8));
    const yBase = Number(this._config.rain_cloud_ceiling_y ?? 0.12);
    const yHeight = Number(this._config.rain_cloud_ceiling_height ?? 0.12);
    const sizeMin = Number(this._config.rain_cloud_ceiling_size_min ?? 220);
    const sizeMax = Number(this._config.rain_cloud_ceiling_size_max ?? 420);
    const opacity = Number(this._config.rain_cloud_ceiling_opacity ?? 0.55);

    const ceilingCloudConfig = {
      type: "clouds",
      speedMin: 0,
      speedMax: 0,
      sizeMin,
      sizeMax,
      swayAmount: 0,
      verticalLimit: yBase + yHeight,
      puffCountMin: 7,
      puffCountMax: 10,
      puffSizeMin: 0.45,
      puffSizeMax: 0.85,
    };

    const clouds = [];

    const width = window.innerWidth;
    for (let i = 0; i < count; i++) {
      const p = new WeatherParticle(ceilingCloudConfig, this._config);

      const t = count === 1 ? 0.5 : i / (count - 1);
      const jitter = (Math.random() - 0.5) * (width / count) * 0.55;

      const edgePad = p.size * 1.4;
      const x = t * (width + edgePad * 2) - edgePad + jitter;

      p.x = x;
      p.y = (yBase + Math.random() * yHeight) * window.innerHeight;

      p.opacity = opacity;

      p.speed = 0;

      clouds.push(p);
    }

    this._rainCloudCeiling = clouds;
  }

  _parseNumber(value) {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }

  _isTestMode() {
    const ent = this._config?.test_entity;
    if (!ent || !this._hass) return false;
    const st = this._hass.states[ent]?.state;
    return Boolean(st && st !== "Use Real Weather");
  }

  _getRainRateMmH() {
    if (this._isTestMode()) {
      const testRate = this._parseNumber(this._config?.test_rain_rate_mmh);
      if (testRate != null) return testRate;
    }

    const ent = this._config?.rain_sensor_entity;
    if (!ent || !this._hass) return null;
    const st = this._hass.states[ent]?.state;
    if (st == null || st === "unknown" || st === "unavailable") return null;
    return this._parseNumber(st);
  }


  _updateIsRainingFromSensor() {
    if (!this._config?.rain_only_when_rate_positive) return this._isRaining;

    const rate = this._getRainRateMmH();
    const startTh = Number(this._config.rain_rate_start_threshold_mmh ?? 0.05);
    const stopTh = Number(this._config.rain_rate_stop_threshold_mmh ?? 0.01);

    if (rate == null) {
      this._isRaining = !this._config?.rain_only_when_rate_positive ? true : false;
      return this._isRaining;
    }

    if (!this._isRaining && rate > startTh) this._isRaining = true;
    else if (this._isRaining && rate < stopTh) this._isRaining = false;

    return this._isRaining;
  }

  _resolveRenderWeather(actualWeather) {
    const cfg = this._config?.weather_configs?.[actualWeather];
    if (!cfg) return actualWeather;

    if (cfg.type === "rain" && this._config?.rain_only_when_rate_positive) {
      const raining = this._updateIsRainingFromSensor();
      if (!raining) {
        const fallback = this._config?.rain_no_rain_weather ?? "cloudy";
        return this._config?.weather_configs?.[fallback] ? fallback : actualWeather;
      }
    }

    return actualWeather;
  }


  _updateRainRuntime(weather) {
    const cfg = this._config?.weather_configs?.[weather];
    if (!cfg || cfg.type !== "rain") {
      this._config.__rainActiveCount = undefined;
      this._config.__rainIntensity = 0;
      this._config.__rainSpeedScale = 1;
      this._config.__rainLengthScale = 1;
      this._rainParticleLimit = null;
      return;
    }

    const rate = this._getRainRateMmH();
    this._rainRateMmH = rate;

    
    const max = Number(this._config.rain_rate_max_mmh ?? 20);
    const light = Number(this._config.rain_rate_light_mmh ?? 2);
    const normal = Number(this._config.rain_rate_normal_mmh ?? 5);
    const minFrac = Number(this._config.rain_rate_min_active_fraction ?? 0.12);

    let intensity = 1;
    if (rate == null) {
      intensity = 1;
    } else if (rate <= 0) {
      intensity = 0;
    } else if (rate < light) {
      intensity = (rate / Math.max(0.01, light)) * 0.35;
    } else if (rate < normal) {
      intensity = 0.35 + ((rate - light) / Math.max(0.01, (normal - light))) * 0.35;
    } else {
      const r = Math.min(rate, max);
      intensity = 0.70 + ((r - normal) / Math.max(0.01, (max - normal))) * 0.30;
    }
    intensity = Math.max(0, Math.min(1, intensity));

    const smooth = intensity * intensity * (3 - 2 * intensity);

    const density = minFrac + (1 - minFrac) * smooth;
    const maxParticles = Math.max(0, Number(cfg.maxParticles ?? 0));
    const targetCount = Math.max(0, Math.min(maxParticles, Math.round(maxParticles * density)));

    this._config.__rainIntensity = intensity;
    this._config.__rainActiveCount = targetCount;

    this._config.__rainSpeedScale = 0.85 + 0.65 * smooth;
    this._config.__rainLengthScale = 0.75 + 1.05 * smooth;

    if (Array.isArray(this._particles)) {
      const prev = this._rainParticleLimit == null ? 0 : this._rainParticleLimit;
      if (targetCount > prev) {
        for (let i = prev; i < targetCount; i++) {
          const p = this._particles[i];
          if (p) p.reset(cfg, this._config, true);
        }
      }
    }
    this._rainParticleLimit = targetCount;
  }

  initParticles(weather) {
    this._particles = [];
    const config = this._config.weather_configs[weather];
    if (config && config.maxParticles > 0) {
      for (let i = 0; i < config.maxParticles; i++) {
        this._particles.push(new WeatherParticle(config, this._config));
      }
    }
    this._initRainCloudCeiling(weather);
  
    this._rainParticleLimit = this._particles.length;
    this._updateRainRuntime(weather);
  }

  animateFrame() {
    if (!this._ctx) return;
    if (this._canvas?.style.display === "none") return;

    this._ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const config = this._config.weather_configs[this._currentWeather];

    if (config) {
      // Determine if moon should be drawn
      const isPartlyCloudy = this._currentWeather === 'partlycloudy';
      const isMoonWeather = config.type === 'stars' || isPartlyCloudy;
      
      // Check if it's night time for partlycloudy using sun entity if available, otherwise heuristic
      let isNight = false;
      let sunStateStr = 'undefined';
      if (this._config.sun_entity && this._hass?.states[this._config.sun_entity]) {
        sunStateStr = this._hass.states[this._config.sun_entity].state;
        isNight = sunStateStr === 'above_horizon';
      } else {
        const hour = new Date().getHours();
        isNight = hour < 6 || hour >= 18;
      }
      const shouldDrawMoon = isMoonWeather && this._config.show_moon !== false && (!isPartlyCloudy || isNight);

      // Draw background elements (Moon behind clouds)
      if (config.type === 'sunny') this.drawSunnyGlow();

      const drawMoon = () => {
        if (shouldDrawMoon) this.drawMoon();
      };

      const drawParticles = () => {
        if (this._shouldShowRainCloudCeiling(this._currentWeather) && this._rainCloudCeiling?.length) {
          for (const c of this._rainCloudCeiling) {
            c.draw(this._ctx, this._config, this._currentWeather);
          }
        }
        const limit = (config.type === "rain" && Number.isFinite(this._config.__rainActiveCount))
          ? Math.min(this._particles.length, this._config.__rainActiveCount)
          : this._particles.length;

        for (let i = 0; i < limit; i++) {
          const p = this._particles[i];
          p.update(config, this._config);
          p.draw(this._ctx, this._config, this._currentWeather);
        }
      };

      // For stars, we want the moon in front (stars are background)
      // For clouds (partlycloudy), we want clouds in front of the moon
      if (config.type === 'stars') {
        drawParticles();
        drawMoon();
      } else {
        drawMoon();
        drawParticles();
      }

      if (config.type === 'lightning' || config.hasLightning) this.handleLightning();
    }
  }

  _getMoonPhase() {
    const c = 29.53058867;
    const d1 = new Date();
    const d2 = new Date(2000, 0, 6, 18, 14, 0); 
    const days = (d1 - d2) / 86400000;
    const phase = ((days % c) + c) % c; 
    return phase / c; 
  }

  drawMoon() {
    const ctx = this._ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const phase = this._moonPhase ?? this._getMoonPhase();
    
    const mx = w * (this._config.moon_x ?? 0.15);
    const my = h * (this._config.moon_y ?? 0.15);
    const r = 45; 

    // Glow
    const glow = ctx.createRadialGradient(mx, my, r * 0.9, mx, my, r * 3.5);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(mx, my, r * 3.5, 0, Math.PI*2); ctx.fill();

    // Dark Side (Earthshine background) - Full Circle
    ctx.fillStyle = 'rgba(30, 35, 45, 0.85)'; 
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.translate(mx, my);
    
    const mp = phase;
    const isWaxing = mp < 0.5;
    
    // Lit Color
    ctx.fillStyle = 'rgba(235, 235, 225, 0.9)'; 
    ctx.beginPath();

    let termX = 0;
    
    if (isWaxing) {
       // Outer Arc: Right Semicircle
       ctx.arc(0, 0, r, -Math.PI/2, Math.PI/2, false); 
       
       termX = r * Math.cos(mp * 2 * Math.PI);
       
       if (termX > 0) {
          // Crescent: Cut scoop on right (CCW)
          ctx.ellipse(0, 0, Math.abs(termX), r, 0, Math.PI/2, -Math.PI/2, true);
       } else {
          // Gibbous: Add bulge on left (CW)
          ctx.ellipse(0, 0, Math.abs(termX), r, 0, Math.PI/2, 3*Math.PI/2, false);
       }
    } else {
       // Outer Arc: Left Semicircle
       ctx.arc(0, 0, r, -Math.PI/2, Math.PI/2, true); 
       
       termX = -r * Math.cos(mp * 2 * Math.PI);
       
       if (termX > 0) {
          // Gibbous: Add bulge on right (CCW)
          ctx.ellipse(0, 0, Math.abs(termX), r, 0, Math.PI/2, -Math.PI/2, true);
       } else {
          // Crescent: Cut scoop on left (CW)
          ctx.ellipse(0, 0, Math.abs(termX), r, 0, Math.PI/2, 3*Math.PI/2, false); 
       }
    }
    
    ctx.fill();
    ctx.restore();
  }

  drawSunnyGlow() {
    const ctx = this._ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const time = Date.now() * 0.001;

    // Sun Position (Top Right)
    const sunX = w * 0.9;
    const sunY = h * 0.1;
    
    // 1. Large Atmospheric Bloom (Soft warm wash)
    // Covers a large portion of the screen to simulate bright day
    const bloomRadius = Math.max(w, h) * 0.75;
    const bloom = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, bloomRadius);
    bloom.addColorStop(0, 'rgba(255, 210, 100, 0.28)');
    bloom.addColorStop(0.3, 'rgba(255, 170, 60, 0.12)');
    bloom.addColorStop(0.7, 'rgba(255, 120, 30, 0.04)');
    bloom.addColorStop(1, 'rgba(255, 80, 0, 0)');

    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.fill();

    // 2. Sun Core (The light source)
    const sunRadius = 65 + Math.sin(time * 0.5) * 5;
    const sunCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 1.5);
    sunCore.addColorStop(0, 'rgba(255, 255, 245, 0.95)');
    sunCore.addColorStop(0.4, 'rgba(255, 230, 160, 0.7)');
    sunCore.addColorStop(0.8, 'rgba(255, 190, 100, 0.25)');
    sunCore.addColorStop(1, 'rgba(255, 140, 50, 0)');

    ctx.fillStyle = sunCore;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Subtle Lens Flares
    // Drifting slightly towards screen center
    const cx = w * 0.5;
    const cy = h * 0.5;
    const dx = cx - sunX;
    const dy = cy - sunY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const flares = [
        { t: 0.3, s: 60, c: 'rgba(255, 255, 200, 0.04)' },
        { t: 0.6, s: 30, c: 'rgba(200, 255, 200, 0.03)' },
        { t: 1.2, s: 120, c: 'rgba(200, 200, 255, 0.025)' }
    ];

    for (const f of flares) {
        const fx = sunX + dx * f.t;
        const fy = sunY + dy * f.t;
        const fs = f.s + Math.sin(time + f.t * 10) * 5;
        
        const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fs);
        grad.addColorStop(0, f.c);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fx, fy, fs, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  handleLightning() {
    const l = this._lightning;
    l.timer += 16;
    if (l.show) {
      l.duration -= 16;
      if (l.duration <= 0) {
        l.show = false;
        l.timer = 0;
      } else {
        l.brightness = Math.max(0, l.brightness - l.fade);
        this.drawLightning(l);
      }
    } else if (l.timer >= l.interval) {
      l.show = true;
      l.duration = 200 + Math.random() * 300;
      l.brightness = 0.5 + Math.random() * 0.5;
      l.fade = l.brightness / (l.duration / 16);
      l.interval = 3000 + Math.random() * 5000;
    }
  }

  drawLightning(l) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const lightX = Math.random() * w;
    const lightY = Math.random() * (h * 0.3);
    
    const gradient = this._ctx.createRadialGradient(
      lightX, lightY, 0,
      lightX, lightY, w * 0.8
    );
    
    const colorVariation = Math.random() * 30;
    const blue = 220 + colorVariation;
    const green = 230 + colorVariation;
    
    gradient.addColorStop(0, `rgba(255, ${green}, ${blue}, ${l.brightness * 0.4})`);
    gradient.addColorStop(0.3, `rgba(240, ${green - 20}, ${blue - 20}, ${l.brightness * 0.25})`);
    gradient.addColorStop(0.7, `rgba(200, ${green - 40}, ${blue - 40}, ${l.brightness * 0.1})`);
    gradient.addColorStop(1, 'rgba(180, 190, 210, 0)');
    
    this._ctx.fillStyle = gradient;
    this._ctx.fillRect(0, 0, w, h);
    
    this._ctx.fillStyle = `rgba(255, 255, 255, ${l.brightness * 0.15})`;
    this._ctx.fillRect(0, 0, w, h);
  }

  static getConfigElement() {
    return document.createElement("weather-overlay-card-editor");
  }

  static getStubConfig() {
    return WeatherOverlayCard.defaultConfig;
  }
}

class WeatherParticle {
  constructor(config, globalConfig) {
    this.reset(config, globalConfig, true);
  }

  reset(config, globalConfig, isFirstInit = false) {
    const cloudsVerticalLimit = globalConfig.clouds_vertical_limit;
    const starsVerticalLimit = globalConfig.stars_vertical_limit;
    this.type = config.type;
    this.x = Math.random() * window.innerWidth;
    this.opacity = 0.4 + Math.random() * 0.5;

    if (this.type === 'stars') {
      this.y = Math.random() * (window.innerHeight * starsVerticalLimit);
      this.size = 1 + Math.random() * 1.5;
      this.twinkleSpeed = 0.005 + Math.random() * 0.01;
      this.phase = Math.random() * 10;
      this.cycleLength = 12;
      this.opacity = 0;
    } else if (this.type === 'clouds') {
      const vLimit = config.verticalLimit ?? cloudsVerticalLimit;
      this.y = Math.random() * (window.innerHeight * vLimit);

      this.speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
      this.size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

      const puffMin = config.puffCountMin ?? 5;
      const puffMax = config.puffCountMax ?? 7;
      this.puffCount = puffMin + Math.floor(Math.random() * (puffMax - puffMin + 1));

      const puffSizeMin = config.puffSizeMin ?? 0.4;
      const puffSizeMax = config.puffSizeMax ?? 0.7;
      this.puffSizes = Array.from({ length: this.puffCount }, () =>
        puffSizeMin + Math.random() * (puffSizeMax - puffSizeMin)
      );

      this._cloudSprite = null;
      this._cloudSpriteKey = null;
    } else if (this.type === 'fog') {
      this.speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);

      this.size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
      this.fogW = this.size * (4.5 + Math.random() * 4.5);   // wide, but not infinite
      this.fogH = this.size * (0.9 + Math.random() * 1.2);

      this.x = Math.random() * (window.innerWidth + this.fogW) - this.fogW;

      const r = Math.pow(Math.random(), 0.65);
      this.baseY = (0.15 + r * 0.75) * window.innerHeight;
      this.y = this.baseY;

      this.seed = Math.random() * 10000;

      this.opacity = 0.12 + Math.random() * 0.22;

      this._fogTexture = null;
      this._fogTextureKey = null;
    } else {
      this.y = isFirstInit ? Math.random() * window.innerHeight : -20;
      this.speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
      this.size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
      this.seed = Math.random() * 1000;
      this.angle = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.06;
    }

    this.sway = (Math.random() - 0.5) * (config.swayAmount || 0);
    if (this.type === 'mixed') {
      this.isRain = Math.random() > 0.6; // Slightly more rain than snow? Or equal? Let's keep it mostly rain.
      if (!this.isRain) {
        // Snow physics override for mixed mode
        this.speed *= 0.12; 
        this.size = Math.max(2.5, this.size * 1.3);
        this.sway *= 2.5; 
      }
    }
  }

  update(config, globalConfig) {
    const cloudsVerticalLimit = globalConfig.clouds_vertical_limit;
    const starsVerticalLimit = globalConfig.stars_vertical_limit;

    if (this.type === 'stars') {
      this.phase += this.twinkleSpeed;
      if (this.phase >= this.cycleLength) {
        this.phase = 0;
        if (Math.random() > 0.7) {
          this.x = Math.random() * window.innerWidth;
          this.y = Math.random() * (window.innerHeight * starsVerticalLimit);
        }
      }
      if (this.phase < 2) this.opacity = this.phase / 2;
      else if (this.phase < 10) this.opacity = 0.7 + Math.sin((this.phase - 2) * 0.5 * Math.PI) * 0.3;
      else this.opacity = Math.max(0, 1 - (this.phase - 10) / 2);
    } else if (this.type === 'clouds') {
      this.x += this.speed;

      const vLimit = config.verticalLimit ?? cloudsVerticalLimit;

      this.y += Math.sin(this.x * 0.01) * 0.2;
      const maxY = window.innerHeight * vLimit;
      if (this.y < 0) this.y = 0;
      if (this.y > maxY) this.y = maxY;

      const halfW = this.size * 1.35;
      if (this.x > window.innerWidth + halfW) {
        this.x = -halfW;
        this.y = Math.random() * (window.innerHeight * vLimit);
        this._cloudSprite = null;
        this._cloudSpriteKey = null;
      }
      } else if (this.type === 'rain' || (this.type === 'mixed' && this.isRain)) {
      const spScale = globalConfig.__rainSpeedScale ?? 1;
      this.y += this.speed * spScale;
      this.x += this.sway;
      if (this.y > window.innerHeight) this.reset(config, globalConfig);
    } else if (this.type === 'sunny') {
      this.y += this.speed;
      // Gentle floating sway
      this.x += Math.sin(this.y * 0.02 + (this.seed || 0)) * 0.3;
      // Subtle twinkling/opacity shift
      const time = Date.now() * 0.001;
      this.opacity = 0.4 + Math.sin(time + (this.seed || 0)) * 0.3;
      
      if (this.y > window.innerHeight) this.reset(config, globalConfig);
    } else if (this.type === 'hail') {
      this.y += this.speed;
      this.x += (Math.random() - 0.5) * 0.5;
      if (this.y > window.innerHeight) this.reset(config, globalConfig);
    } else if (this.type === 'fog') {
      this.x += this.speed;

      const amp = 10 + (this.fogH || this.size) * 0.03;
      this.y = (this.baseY || this.y) + Math.sin((this.x + (this.seed || 0)) * 0.003) * amp;

      const w = this.fogW || this.size;
      if (this.x > window.innerWidth + w) {
        this.x = -w;

        const r = Math.pow(Math.random(), 0.65);
        this.baseY = (0.15 + r * 0.75) * window.innerHeight;
        this.seed = Math.random() * 10000;
      }
    } else {
      this.y += this.speed;
      this.x += this.sway;
      if (this.type === 'snow' || (this.type === 'mixed' && !this.isRain)) {
        this.angle = (this.angle || 0) + (this.rotationSpeed || 0);
      }
      if (this.y > window.innerHeight) this.reset(config, globalConfig);
    }
  }


  _parseRGBA(color) {
    const m = String(color).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (!m) return { r: 180, g: 180, b: 180, a: 1 };
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] == null ? 1 : Number(m[4]) };
  }

  _ensureCloudSprite(baseColor) {
    const key = `${baseColor}|${this.size}|${this.puffCount}|${this.puffSizes?.join(",")}`;
    if (this._cloudSprite && this._cloudSpriteKey === key) return;

    this._cloudSpriteKey = key;

    const { r, g, b } = this._parseRGBA(baseColor);
    const midColor = `rgba(${r}, ${g}, ${b}, 0.02)`;
    const edgeColor = `rgba(${r}, ${g}, ${b}, 0)`;

    const halfW = this.size * 1.35;
    const halfH = this.size * 1.20;
    const logicalW = halfW * 2;
    const logicalH = halfH * 2;
    const scale = 0.65;

    this._cloudHalfW = halfW;
    this._cloudHalfH = halfH;
    this._cloudLogicalW = logicalW;
    this._cloudLogicalH = logicalH;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(logicalW * scale));
    canvas.height = Math.max(1, Math.ceil(logicalH * scale));

    const cctx = canvas.getContext("2d", { alpha: true });
    if (!cctx) return;

    cctx.setTransform(scale, 0, 0, scale, 0, 0);
    cctx.clearRect(0, 0, logicalW, logicalH);

    const cx = halfW;
    const cy = halfH;

    for (let i = 0; i < this.puffCount; i++) {
      const angle = (i / this.puffCount) * Math.PI * 2;
      const puffSize = this.size * this.puffSizes[i];
      const offsetX = Math.cos(angle) * this.size * 0.4;
      const offsetY = Math.sin(angle) * this.size * 0.25;

      const gx = cx + offsetX;
      const gy = cy + offsetY;

      const gradient = cctx.createRadialGradient(gx, gy, 0, gx, gy, puffSize);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.6, midColor);
      gradient.addColorStop(1, edgeColor);

      cctx.fillStyle = gradient;
      cctx.beginPath();
      cctx.arc(gx, gy, puffSize, 0, Math.PI * 2);
      cctx.fill();
    }

    this._cloudSprite = canvas;
  }

  _ensureFogTexture(baseColor, density = 1) {
    window.__weatherOverlayFogTextureCache = window.__weatherOverlayFogTextureCache || new Map();

    const key = `${String(baseColor)}|d=${density}`;
    const cached = window.__weatherOverlayFogTextureCache.get(key);
    if (cached) {
      this._fogTexture = cached;
      this._fogTextureKey = key;
      return;
    }

    const texW = 320;
    const texH = 160;

    const canvas = document.createElement("canvas");
    canvas.width = texW;
    canvas.height = texH;

    const cctx = canvas.getContext("2d", { alpha: true });
    if (!cctx) return;

    const { r, g, b, a } = this._parseRGBA(baseColor);

    const intensity = Math.max(0, Math.min(1, a ?? 1)) * (density ?? 1);

    const core = `rgba(${r}, ${g}, ${b}, ${0.22 * intensity})`;
    const mid  = `rgba(${r}, ${g}, ${b}, ${0.10 * intensity})`;
    const edge = `rgba(${r}, ${g}, ${b}, 0)`;

    cctx.clearRect(0, 0, texW, texH);

    for (let i = 0; i < 18; i++) {
      const x = Math.random() * texW;
      const y = (0.2 + Math.random() * 0.6) * texH;

      const rx = 40 + Math.random() * 90;
      const ry = 18 + Math.random() * 45;

      cctx.save();
      cctx.translate(x, y);
      cctx.scale(rx / ry, 1);
      const gradient = cctx.createRadialGradient(0, 0, 0, 0, 0, ry);
      gradient.addColorStop(0, core);
      gradient.addColorStop(0.55, mid);
      gradient.addColorStop(1, edge);
      cctx.fillStyle = gradient;
      cctx.beginPath();
      cctx.arc(0, 0, ry, 0, Math.PI * 2);
      cctx.fill();
      cctx.restore();
    }

    cctx.globalAlpha = 0.10 * intensity;
    cctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    for (let i = 0; i < 140; i++) {
      const x = Math.random() * texW;
      const y = Math.random() * texH;
      const s = 1 + Math.random() * 2;
      cctx.fillRect(x, y, s, s);
    }
    cctx.globalAlpha = 1;

    cctx.globalCompositeOperation = "destination-in";

    let mask = cctx.createLinearGradient(0, 0, texW, 0);
    mask.addColorStop(0.00, "rgba(0,0,0,0)");
    mask.addColorStop(0.18, "rgba(0,0,0,1)");
    mask.addColorStop(0.82, "rgba(0,0,0,1)");
    mask.addColorStop(1.00, "rgba(0,0,0,0)");
    cctx.fillStyle = mask;
    cctx.fillRect(0, 0, texW, texH);

    mask = cctx.createLinearGradient(0, 0, 0, texH);
    mask.addColorStop(0.00, "rgba(0,0,0,0)");
    mask.addColorStop(0.25, "rgba(0,0,0,1)");
    mask.addColorStop(0.85, "rgba(0,0,0,1)");
    mask.addColorStop(1.00, "rgba(0,0,0,0)");
    cctx.fillStyle = mask;
    cctx.fillRect(0, 0, texW, texH);

    cctx.globalCompositeOperation = "source-over";

    window.__weatherOverlayFogTextureCache.set(key, canvas);
    this._fogTexture = canvas;
    this._fogTextureKey = key;
  }

  draw(ctx, globalConfig, weather) {
    const color = globalConfig.weather_configs[weather]?.color || 'white';
    ctx.globalAlpha = this.opacity;

    if (this.type === 'snow' || (this.type === 'mixed' && !this.isRain)) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle || 0);

      ctx.strokeStyle = color; 
      ctx.fillStyle = color;
      ctx.lineWidth = 1.3; 
      ctx.lineCap = 'round';
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
      
      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Detail for larger flakes
      if (this.size > 4.5) {
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(this.size * 0.5, -this.size * 0.3);
          ctx.lineTo(this.size * 0.5, this.size * 0.3);
          ctx.stroke();
          ctx.rotate(Math.PI / 3);
        }
      }

      ctx.restore();
    } else if (this.type === 'hail') {
      // Hard icy core
      const grad = ctx.createRadialGradient(this.x - this.size*0.3, this.y - this.size*0.3, 0, this.x, this.y, this.size);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.4, 'rgba(240, 245, 255, 0.8)');
      grad.addColorStop(1, color);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Motion streak (fading tail)
      const tailLen = this.size * 5;
      const tailGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y - tailLen);
      tailGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      tailGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.8, this.y);
      ctx.lineTo(this.x + this.size * 0.8, this.y);
      ctx.lineTo(this.x, this.y - tailLen);
      ctx.fill();
    
    } else if (this.type === 'rain' || (this.type === 'mixed' && this.isRain)) {
      const cfg = globalConfig.weather_configs[weather] || {};
      const mult = cfg.lengthMultiplier || 1;

      const lenScale = globalConfig.__rainLengthScale ?? 1;
      const intensity = globalConfig.__rainIntensity ?? 0;

      const alphaScale = 0.70 + 0.55 * intensity;

      const baseLen = (this.size * (3.5 + this.speed * 0.22)) * mult * lenScale;
      const dx = this.sway * 1.15;

      ctx.lineCap = 'round';
      ctx.strokeStyle = color;

      ctx.globalAlpha = this.opacity * 0.28 * alphaScale;
      ctx.lineWidth = this.size * 1.6;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + dx * 1.25, this.y + baseLen * 1.15);
      ctx.stroke();

      ctx.globalAlpha = this.opacity * 0.65 * alphaScale;
      ctx.lineWidth = this.size;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + dx, this.y + baseLen);
      ctx.stroke();
    } else if (this.type === 'stars') {
      if (this.opacity > 0) {
        ctx.globalAlpha = this.opacity * 0.7;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(200, 220, 255, 0.6)';
        ctx.shadowBlur = 4 + this.opacity * 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    
    } else if (this.type === 'clouds') {
      const baseOpacity = this.opacity * 0.6;
      const weatherCfg = globalConfig.weather_configs[weather] || {};
      const baseColor = weatherCfg.cloud_color || weatherCfg.color || 'rgba(180, 180, 180, 0.10)';

      this._ensureCloudSprite(baseColor);

      if (this._cloudSprite) {
        const fadePx = globalConfig.clouds_left_fade_px ?? 260;
        const minFactor = globalConfig.clouds_left_fade_min_opacity ?? 0.05;

        const halfW = this._cloudHalfW ?? this.size * 1.35;
        const leftEdge = this.x - halfW;
        let factor = 1;

        if (fadePx > 0) {
          const t = Math.max(0, Math.min(1, leftEdge / fadePx));
          const smooth = t * t * (3 - 2 * t);
          factor = minFactor + (1 - minFactor) * smooth;
        }

        ctx.globalAlpha = baseOpacity * factor;
        ctx.drawImage(
          this._cloudSprite,
          this.x - this._cloudHalfW,
          this.y - this._cloudHalfH,
          this._cloudLogicalW,
          this._cloudLogicalH
        );
      }
    } else if (this.type === 'fog') {
      const fogCfg = globalConfig.weather_configs[weather] || {};
      const baseColor = fogCfg.color || 'rgba(220, 220, 220, 0.18)';
      const density = fogCfg.density ?? 1;

      const { a } = this._parseRGBA(baseColor);
      const intensity = Math.max(0, Math.min(1, a ?? 1)) * density;

      this._ensureFogTexture(baseColor, density);
      if (!this._fogTexture) return;

      if (this._fogTexture) {
        const w = this.fogW || this.size * 6;
        const h = this.fogH || this.size * 1.4;

        const fogTop = window.innerHeight / 3;

        const x = this.x - w * 0.5;
        const y = Math.min(
          window.innerHeight - h * 0.5,
          Math.max(fogTop + h * 0.5, this.y)
        );

        ctx.globalAlpha = Math.min(1, this.opacity * 0.55 * intensity);

        ctx.drawImage(this._fogTexture, x, y - h * 0.5, w, h);

        ctx.globalAlpha *= 0.55;
        ctx.drawImage(this._fogTexture, x + w * 0.03, y - h * 0.52, w, h);
      }
    } else if (this.type === 'sunny') {
      // Draw dust motes / pollen as soft glowing dots
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      grad.addColorStop(0, globalConfig.weather_configs[weather]?.color || 'white');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}

class WeatherOverlayCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this._config) return;

    this.shadowRoot.innerHTML = `
      <style>
        .card-config { padding: 16px; }
        .option { padding: 12px 0; border-bottom: 1px solid var(--divider-color); }
        label { display: block; font-weight: bold; margin-bottom: 4px; font-size: 0.9em; }
        input { 
          width: 100%; 
          padding: 10px; 
          box-sizing: border-box; 
          border-radius: 4px; 
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
        .help { font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px; }
      </style>
      <div class="card-config">
        <div class="option">
          <label>Weather Entity</label>
          <input type="text" data-config="weather_entity" value="${this._config.weather_entity || ''}" placeholder="weather.home">
        </div>
        <div class="option">
          <label>Sun Entity (Optional)</label>
          <input type="text" data-config="sun_entity" value="${this._config.sun_entity || ''}" placeholder="sun.sun">
        </div>
        <div class="option">
          <label>Toggle Entity (Optional)</label>
          <input type="text" data-config="toggle_entity" value="${this._config.toggle_entity || ''}" placeholder="input_boolean.weather_overlay">
        </div>
        <div class="option">
          <label>Test Entity (Optional)</label>
          <input type="text" data-config="test_entity" value="${this._config.test_entity || ''}" placeholder="input_select.weather_overlay_test">
        </div>
        <div class="option">
          <label>Clouds Vertical Limit (0.0 - 1.0)</label>
          <input type="number" step="0.05" data-config="clouds_vertical_limit" value="${this._config.clouds_vertical_limit !== undefined ? this._config.clouds_vertical_limit : 0.2}">
        </div>
        <div class="option">
          <label>Stars Vertical Limit (0.0 - 1.0)</label>
          <input type="number" step="0.05" data-config="stars_vertical_limit" value="${this._config.stars_vertical_limit !== undefined ? this._config.stars_vertical_limit : 0.15}">
        </div>
        <div class="option">
          <label>Moon Position X (0.0 - 1.0)</label>
          <input type="number" step="0.05" data-config="moon_x" value="${this._config.moon_x !== undefined ? this._config.moon_x : 0.15}">
        </div>
        <div class="option">
          <label>Moon Position Y (0.0 - 1.0)</label>
          <input type="number" step="0.05" data-config="moon_y" value="${this._config.moon_y !== undefined ? this._config.moon_y : 0.15}">
        </div>
        <div class="option">
          <label>Show Moon</label>
          <input type="checkbox" data-config="show_moon" ${this._config.show_moon !== false ? 'checked' : ''}>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (ev) => this._valueChanged(ev));
    });
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const configKey = ev.target.dataset.config;
    let value = ev.target.value;
    
    if (ev.target.type === 'number') value = parseFloat(value);
    if (ev.target.type === 'checkbox') value = ev.target.checked;
    
    const newConfig = { ...this._config };
    if (value === '' && configKey !== 'weather_entity' && configKey !== 'sun_entity') {
      delete newConfig[configKey];
    } else {
      newConfig[configKey] = value;
    }
    
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('weather-overlay-card-editor', WeatherOverlayCardEditor);
customElements.define('weather-overlay-card', WeatherOverlayCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "weather-overlay-card",
  name: "Weather Overlay Card",
  description: "An animated weather overlay for the whole dashboard",
  preview: true,
  documentationURL: "https://github.com/AndLindemann/ha_weather_overlay"
});
