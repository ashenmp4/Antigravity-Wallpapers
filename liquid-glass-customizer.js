/* Antigravity Ultimate Personalization Mod — Liquid Glass & Appearance Studio
 * Extends Antigravity ASCII Wallpapers while preserving all 50 original ASCII scenes,
 * shortcuts, slash commands, and safety checks.
 */
(() => {
  'use strict';
  if (window.__agyLiquidGlassInstalled) return;
  window.__agyLiquidGlassInstalled = true;
  window.__agyLiquidGlassActive = true;
  window.__agyCustomizerActive = true;
  if (typeof document !== 'undefined' && document.body) {
    document.body.dataset.agyCustomizer = 'true';
    if (!document.body.dataset.awTheme) {
      document.body.dataset.awTheme = 'aurora';
    }
  }

  const STATE_KEY = 'agyLiquidGlassState.v2';
  const LIB_KEY = 'agyLiquidGlassLibrary.v2';
  const ipc = typeof electron_1 !== 'undefined' && electron_1?.ipcRenderer ? electron_1.ipcRenderer : null;
  const webUtils = typeof electron_1 !== 'undefined' && electron_1?.webUtils ? electron_1.webUtils : null;
  const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');

  // Built-in font options (Section 5)
  const BUILTIN_FONTS = [
    { id: 'system', name: 'System Default', css: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', mono: false },
    { id: 'Inter', name: 'Inter', css: '"Inter", "Inter Tight", "Segoe UI", system-ui, sans-serif', mono: false },
    { id: 'Roboto', name: 'Roboto', css: '"Roboto", "Segoe UI", system-ui, sans-serif', mono: false },
    { id: 'Poppins', name: 'Poppins', css: '"Poppins", "Segoe UI", system-ui, sans-serif', mono: false },
    { id: 'Montserrat', name: 'Montserrat', css: '"Montserrat", "Segoe UI", system-ui, sans-serif', mono: false },
    { id: 'JetBrains Mono', name: 'JetBrains Mono', css: '"JetBrains Mono", "Cascadia Code", Consolas, monospace', mono: true },
    { id: 'Fira Code', name: 'Fira Code', css: '"Fira Code", "JetBrains Mono", Consolas, monospace', mono: true }
  ];

  // Nine independently customizable interface components (Section 4A & 4C)
  const GLASS_COMPONENTS = [
    { id: 'background', name: 'Main App Background', desc: 'Root shell and workspace backdrop' },
    { id: 'sidebar', name: 'Sidebar', desc: 'Left navigation & conversation history list' },
    { id: 'conversation', name: 'Conversation Area', desc: 'Main AI chat sheet & message cards' },
    { id: 'header', name: 'Navigation & Header', desc: 'Top titlebar and navigation strip' },
    { id: 'composer', name: 'Composer / Input Area', desc: 'Prompt box and attachment bar' },
    { id: 'menus', name: 'Menus & Dropdowns', desc: 'Context menus, popovers, and dropdown lists' },
    { id: 'toolbars', name: 'Floating Toolbars', desc: 'Row actions, code block headers, and pills' },
    { id: 'dialogs', name: 'Settings & Dialogs', desc: 'Modals, alert dialogs, and overlays' },
    { id: 'secondary', name: 'Secondary Panels', desc: 'Side panels, artifacts, and inspectors' }
  ];

  // Five selectable glass presets (Section 4B)
  const GLASS_PRESETS = {
    liquid: {
      id: 'liquid',
      name: 'Liquid Glass',
      tagline: 'High transparency, specular reflections & layered depth',
      transparency: 65,
      blur: 20,
      brightness: 108,
      saturation: 145,
      borderOpacity: 38,
      shadowIntensity: 55,
      reflectionIntensity: 68,
      highlightIntensity: 62,
      cornerRadius: 14,
      components: {
        background: { enabled: true, transparency: 92, blur: 0 },
        sidebar: { enabled: true, transparency: 65, blur: 20 },
        conversation: { enabled: true, transparency: 78, blur: 15 },
        header: { enabled: true, transparency: 65, blur: 20 },
        composer: { enabled: true, transparency: 38, blur: 25 },
        menus: { enabled: true, transparency: 25, blur: 28 },
        toolbars: { enabled: true, transparency: 48, blur: 18 },
        dialogs: { enabled: true, transparency: 24, blur: 32 },
        secondary: { enabled: true, transparency: 62, blur: 18 }
      }
    },
    frosted: {
      id: 'frosted',
      name: 'Frosted Glass',
      tagline: 'Strong background blur, soft translucent panels & frost borders',
      transparency: 52,
      blur: 32,
      brightness: 104,
      saturation: 125,
      borderOpacity: 48,
      shadowIntensity: 45,
      reflectionIntensity: 35,
      highlightIntensity: 48,
      cornerRadius: 12,
      components: {
        background: { enabled: true, transparency: 88, blur: 4 },
        sidebar: { enabled: true, transparency: 54, blur: 30 },
        conversation: { enabled: true, transparency: 68, blur: 24 },
        header: { enabled: true, transparency: 54, blur: 30 },
        composer: { enabled: true, transparency: 32, blur: 34 },
        menus: { enabled: true, transparency: 18, blur: 36 },
        toolbars: { enabled: true, transparency: 40, blur: 26 },
        dialogs: { enabled: true, transparency: 18, blur: 38 },
        secondary: { enabled: true, transparency: 52, blur: 28 }
      }
    },
    dark: {
      id: 'dark',
      name: 'Dark Glass',
      tagline: 'Smoked obsidian surfaces, subtle highlights & deep shadows',
      transparency: 42,
      blur: 22,
      brightness: 88,
      saturation: 120,
      borderOpacity: 32,
      shadowIntensity: 80,
      reflectionIntensity: 40,
      highlightIntensity: 42,
      cornerRadius: 12,
      components: {
        background: { enabled: true, transparency: 82, blur: 2 },
        sidebar: { enabled: true, transparency: 42, blur: 22 },
        conversation: { enabled: true, transparency: 58, blur: 16 },
        header: { enabled: true, transparency: 42, blur: 22 },
        composer: { enabled: true, transparency: 25, blur: 26 },
        menus: { enabled: true, transparency: 14, blur: 30 },
        toolbars: { enabled: true, transparency: 32, blur: 20 },
        dialogs: { enabled: true, transparency: 14, blur: 34 },
        secondary: { enabled: true, transparency: 40, blur: 22 }
      }
    },
    clear: {
      id: 'clear',
      name: 'Clear Glass',
      tagline: 'Ultra-high transparency, minimal blur & crisp subtle borders',
      transparency: 82,
      blur: 6,
      brightness: 102,
      saturation: 110,
      borderOpacity: 24,
      shadowIntensity: 28,
      reflectionIntensity: 30,
      highlightIntensity: 35,
      cornerRadius: 10,
      components: {
        background: { enabled: true, transparency: 96, blur: 0 },
        sidebar: { enabled: true, transparency: 80, blur: 6 },
        conversation: { enabled: true, transparency: 88, blur: 4 },
        header: { enabled: true, transparency: 80, blur: 6 },
        composer: { enabled: true, transparency: 55, blur: 10 },
        menus: { enabled: true, transparency: 32, blur: 14 },
        toolbars: { enabled: true, transparency: 65, blur: 8 },
        dialogs: { enabled: true, transparency: 30, blur: 16 },
        secondary: { enabled: true, transparency: 78, blur: 6 }
      }
    },
    acrylic: {
      id: 'acrylic',
      name: 'Acrylic Glass',
      tagline: 'Windows 11-inspired acrylic blend with balanced saturation & blur',
      transparency: 58,
      blur: 26,
      brightness: 100,
      saturation: 165,
      borderOpacity: 34,
      shadowIntensity: 52,
      reflectionIntensity: 46,
      highlightIntensity: 44,
      cornerRadius: 8,
      components: {
        background: { enabled: true, transparency: 88, blur: 2 },
        sidebar: { enabled: true, transparency: 58, blur: 26 },
        conversation: { enabled: true, transparency: 72, blur: 18 },
        header: { enabled: true, transparency: 58, blur: 26 },
        composer: { enabled: true, transparency: 36, blur: 28 },
        menus: { enabled: true, transparency: 20, blur: 32 },
        toolbars: { enabled: true, transparency: 45, blur: 22 },
        dialogs: { enabled: true, transparency: 20, blur: 32 },
        secondary: { enabled: true, transparency: 56, blur: 24 }
      }
    }
  };

  // Predefined Theme Presets / Profiles (Section 9)
  const BUILTIN_PROFILES = [
    {
      id: 'dark-liquid-glass',
      name: 'Dark Liquid Glass',
      builtin: true,
      desc: 'Luminous abyssal sapphire with high-clarity Liquid Glass reflections',
      asciiTheme: 'aurora',
      glassPreset: 'liquid',
      colors: { enabled: true, mode: 'dark', background: '#061220', sidebar: '#0a1726', panel: '#0d1e30', composer: '#132a42', text: '#eef7ff', accent: '#6ee7ff', border: '#35587a', menu: '#0c1b2c' }
    },
    {
      id: 'frosted-glass',
      name: 'Frosted Glass',
      builtin: true,
      desc: 'Glacial daylight frost with soft translucent white surfaces',
      asciiTheme: 'snow',
      glassPreset: 'frosted',
      colors: { enabled: true, mode: 'light', background: '#dce9f5', sidebar: '#e8f1fa', panel: '#f4f9fd', composer: '#ffffff', text: '#182b3c', accent: '#2b72a8', border: '#9eb8ce', menu: '#f2f7fc' }
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      builtin: true,
      desc: 'Night City neon magenta and cyber cyan over smoked violet glass',
      asciiTheme: 'glitch',
      glassPreset: 'liquid',
      colors: { enabled: true, mode: 'dark', background: '#070412', sidebar: '#0e0720', panel: '#140b2e', composer: '#1d1040', text: '#f7ecff', accent: '#ff2a85', border: '#00f0ff', menu: '#110926' }
    },
    {
      id: 'anime',
      name: 'Anime',
      builtin: true,
      desc: 'Sakura twilight and sky lanterns with dreamy pastel glass',
      asciiTheme: 'lanterns',
      glassPreset: 'liquid',
      colors: { enabled: true, mode: 'dark', background: '#0e102e', sidebar: '#15173d', panel: '#1d2052', composer: '#262966', text: '#fff2f7', accent: '#ff85b3', border: '#6c68b8', menu: '#181a44' }
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      builtin: true,
      desc: 'Architectural monochrome slate with crisp Clear Glass geometry',
      asciiTheme: 'inkwash',
      glassPreset: 'clear',
      colors: { enabled: true, mode: 'light', background: '#f2f1ed', sidebar: '#eae8e2', panel: '#faf9f6', composer: '#ffffff', text: '#181818', accent: '#2f2f2f', border: '#c9c6be', menu: '#f7f6f2' }
    },
    {
      id: 'amoled-dark',
      name: 'AMOLED Dark',
      builtin: true,
      desc: 'True #000000 pitch black with obsidian Dark Glass and emerald accents',
      asciiTheme: 'code',
      glassPreset: 'dark',
      colors: { enabled: true, mode: 'dark', background: '#000000', sidebar: '#030504', panel: '#070c09', composer: '#0b140f', text: '#e6fff0', accent: '#38f88f', border: '#183826', menu: '#060a08' }
    },
    {
      id: 'neon',
      name: 'Neon',
      builtin: true,
      desc: 'Synthwave laser violet and electric cyan glow',
      asciiTheme: 'neon',
      glassPreset: 'liquid',
      colors: { enabled: true, mode: 'dark', background: '#060310', sidebar: '#0c061d', panel: '#130a2c', composer: '#1c103e', text: '#f6eeff', accent: '#3ff0ff', border: '#b83fff', menu: '#100824' }
    },
    {
      id: 'nature',
      name: 'Nature',
      builtin: true,
      desc: 'Tranquil emerald lagoon & forest canopy with organic glass',
      asciiTheme: 'koi',
      glassPreset: 'frosted',
      colors: { enabled: true, mode: 'dark', background: '#0d221c', sidebar: '#132e26', panel: '#1a3c32', composer: '#224c40', text: '#eff9f2', accent: '#8ce2bd', border: '#467865', menu: '#15332a' }
    },
    {
      id: 'acrylic',
      name: 'Acrylic',
      builtin: true,
      desc: 'Windows 11 Fluent Acrylic dark mica blend',
      asciiTheme: 'moon',
      glassPreset: 'acrylic',
      colors: { enabled: true, mode: 'dark', background: '#0c101d', sidebar: '#12182b', panel: '#171f36', composer: '#1e2846', text: '#edf2fc', accent: '#7aa2f7', border: '#3b4970', menu: '#141b30' }
    },
    {
      id: 'custom',
      name: 'Custom',
      builtin: true,
      desc: 'Your personalized wallpaper, glass, font, and color configuration',
      asciiTheme: 'clouds',
      glassPreset: 'liquid',
      colors: { enabled: false, mode: 'dark', background: '#0b1220', sidebar: '#0f182a', panel: '#142038', composer: '#1b2b4a', text: '#edf4ff', accent: '#6ee7ff', border: '#385078', menu: '#111b30' }
    }
  ];

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function clamp(num, min, max, fallback) {
    const n = Number(num);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function validHex(c, fallback) {
    if (typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.trim())) return c.trim().toLowerCase();
    return fallback;
  }

  function createDefaultState(legacyPrefs) {
    const basePreset = clone(GLASS_PRESETS.liquid);
    return {
      version: 2,
      enabled: true,
      autoSave: true,
      activeProfileId: 'prof_mwdinmpu_76t3',
      defaultProfileId: 'prof_mwdinmpu_76t3',
      performanceProfile: 'high', // 'high' | 'balanced' | 'performance'
      wallpaper: {
        source: legacyPrefs?.theme === 'off' ? 'off' : 'ascii', // 'ascii' | 'static' | 'gif' | 'webp' | 'video' | 'off'
        asciiTheme: legacyPrefs?.theme && legacyPrefs.theme !== 'off' ? legacyPrefs.theme : 'aurora',
        assetId: null,
        fit: 'cover', // 'cover' | 'contain' | 'stretch' | 'center' | 'tile'
        enableAnimated: !reducedMotionQuery.matches,
        paused: Boolean(legacyPrefs?.paused),
        pauseWhenUnfocused: true,
        muted: true,
        volume: 50,
        playbackRate: 1,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        opacity: 100,
        dimming: 10,
        scale: 100,
        posX: 50,
        posY: 50,
        overlayType: 'none', // 'none' | 'dark' | 'light' | 'solid' | 'gradient'
        overlayColor1: '#06101e',
        overlayColor2: '#1f3b64',
        overlayAngle: 135,
        overlayOpacity: 35
      },
      glass: {
        enabled: true,
        preset: 'liquid', // 'liquid' | 'frosted' | 'dark' | 'clear' | 'acrylic'
        transparency: basePreset.transparency,
        blur: basePreset.blur,
        brightness: basePreset.brightness,
        saturation: basePreset.saturation,
        borderOpacity: basePreset.borderOpacity,
        shadowIntensity: basePreset.shadowIntensity,
        reflectionIntensity: basePreset.reflectionIntensity,
        highlightIntensity: basePreset.highlightIntensity,
        cornerRadius: basePreset.cornerRadius,
        components: clone(basePreset.components)
      },
      fonts: {
        enabled: false,
        main: 'system',
        sidebar: 'system',
        heading: 'system',
        conversation: 'system',
        code: 'JetBrains Mono',
        sizePx: 14,
        weight: '400',
        letterSpacingEm: 0,
        lineHeight: 1.55
      },
      colors: {
        enabled: false,
        mode: 'dark', // 'dark' | 'light'
        background: '#061220',
        sidebar: '#0a1726',
        panel: '#0d1e30',
        composer: '#132a42',
        text: '#eef7ff',
        accent: '#6ee7ff',
        border: '#35587a',
        menu: '#0c1b2c'
      },
      animations: {
        smoothWallpaperTransitions: true,
        fadeInEffects: true,
        hoverAnimations: true,
        glassHighlightTransitions: true,
        animatedReflections: false,
        smoothSettingsTransitions: true,
        agentReactive: legacyPrefs?.reactive !== false
      },
      userProfiles: []
    };
  }

  function validateState(raw, legacyPrefs) {
    const def = createDefaultState(legacyPrefs);
    if (!raw || typeof raw !== 'object') return def;

    const w = raw.wallpaper || {};
    const g = raw.glass || {};
    const f = raw.fonts || {};
    const c = raw.colors || {};
    const a = raw.animations || {};
    const presetKey = GLASS_PRESETS[g.preset] ? g.preset : 'liquid';
    const presetDef = GLASS_PRESETS[presetKey];

    const components = {};
    for (const comp of GLASS_COMPONENTS) {
      const src = g.components?.[comp.id] || presetDef.components[comp.id];
      components[comp.id] = {
        enabled: src?.enabled !== false,
        transparency: clamp(src?.transparency, 0, 100, presetDef.components[comp.id].transparency),
        blur: clamp(src?.blur, 0, 50, presetDef.components[comp.id].blur)
      };
    }

    return {
      version: 2,
      enabled: raw.enabled !== false,
      autoSave: raw.autoSave !== false,
      activeProfileId: typeof raw.activeProfileId === 'string' ? raw.activeProfileId : def.activeProfileId,
      defaultProfileId: typeof raw.defaultProfileId === 'string' ? raw.defaultProfileId : (typeof raw.activeProfileId === 'string' ? raw.activeProfileId : def.defaultProfileId),
      performanceProfile: ['high', 'balanced', 'performance'].includes(raw.performanceProfile) ? raw.performanceProfile : 'high',
      wallpaper: {
        source: ['ascii', 'static', 'gif', 'webp', 'video', 'off'].includes(w.source) ? w.source : def.wallpaper.source,
        asciiTheme: typeof w.asciiTheme === 'string' && w.asciiTheme ? w.asciiTheme : def.wallpaper.asciiTheme,
        assetId: typeof w.assetId === 'string' ? w.assetId : null,
        fit: ['cover', 'contain', 'stretch', 'center', 'tile'].includes(w.fit) ? w.fit : 'cover',
        enableAnimated: typeof w.enableAnimated === 'boolean' ? w.enableAnimated : def.wallpaper.enableAnimated,
        paused: typeof w.paused === 'boolean' ? w.paused : def.wallpaper.paused,
        pauseWhenUnfocused: w.pauseWhenUnfocused !== false,
        muted: w.muted !== false,
        volume: clamp(w.volume, 0, 100, 50),
        playbackRate: clamp(w.playbackRate, 0.25, 2, 1),
        brightness: clamp(w.brightness, 20, 200, 100),
        contrast: clamp(w.contrast, 20, 200, 100),
        saturation: clamp(w.saturation, 0, 250, 100),
        blur: clamp(w.blur, 0, 50, 0),
        opacity: clamp(w.opacity, 5, 100, 100),
        dimming: clamp(w.dimming, 0, 90, 10),
        scale: clamp(w.scale, 50, 200, 100),
        posX: clamp(w.posX, 0, 100, 50),
        posY: clamp(w.posY, 0, 100, 50),
        overlayType: ['none', 'dark', 'light', 'solid', 'gradient'].includes(w.overlayType) ? w.overlayType : 'none',
        overlayColor1: validHex(w.overlayColor1, '#06101e'),
        overlayColor2: validHex(w.overlayColor2, '#1f3b64'),
        overlayAngle: clamp(w.overlayAngle, 0, 360, 135),
        overlayOpacity: clamp(w.overlayOpacity, 0, 95, 35)
      },
      glass: {
        enabled: g.enabled !== false,
        preset: presetKey,
        transparency: clamp(g.transparency, 0, 100, presetDef.transparency),
        blur: clamp(g.blur, 0, 50, presetDef.blur),
        brightness: clamp(g.brightness, 50, 150, presetDef.brightness),
        saturation: clamp(g.saturation, 50, 250, presetDef.saturation),
        borderOpacity: clamp(g.borderOpacity, 0, 100, presetDef.borderOpacity),
        shadowIntensity: clamp(g.shadowIntensity, 0, 100, presetDef.shadowIntensity),
        reflectionIntensity: clamp(g.reflectionIntensity, 0, 100, presetDef.reflectionIntensity),
        highlightIntensity: clamp(g.highlightIntensity, 0, 100, presetDef.highlightIntensity),
        cornerRadius: clamp(g.cornerRadius, 0, 28, presetDef.cornerRadius),
        components
      },
      fonts: {
        enabled: Boolean(f.enabled),
        main: typeof f.main === 'string' ? f.main : 'system',
        sidebar: typeof f.sidebar === 'string' ? f.sidebar : 'system',
        heading: typeof f.heading === 'string' ? f.heading : 'system',
        conversation: typeof f.conversation === 'string' ? f.conversation : 'system',
        code: typeof f.code === 'string' ? f.code : 'JetBrains Mono',
        sizePx: clamp(f.sizePx, 11, 22, 14),
        weight: ['300', '400', '500', '600', '700'].includes(String(f.weight)) ? String(f.weight) : '400',
        letterSpacingEm: clamp(f.letterSpacingEm, -0.05, 0.12, 0),
        lineHeight: clamp(f.lineHeight, 1.1, 2.0, 1.55)
      },
      colors: {
        enabled: Boolean(c.enabled),
        mode: c.mode === 'light' ? 'light' : 'dark',
        background: validHex(c.background, '#061220'),
        sidebar: validHex(c.sidebar, '#0a1726'),
        panel: validHex(c.panel, '#0d1e30'),
        composer: validHex(c.composer, '#132a42'),
        text: validHex(c.text, '#eef7ff'),
        accent: validHex(c.accent, '#6ee7ff'),
        border: validHex(c.border, '#35587a'),
        menu: validHex(c.menu, '#0c1b2c')
      },
      animations: {
        smoothWallpaperTransitions: a.smoothWallpaperTransitions !== false,
        fadeInEffects: a.fadeInEffects !== false,
        hoverAnimations: a.hoverAnimations !== false,
        glassHighlightTransitions: a.glassHighlightTransitions !== false,
        animatedReflections: Boolean(a.animatedReflections),
        smoothSettingsTransitions: a.smoothSettingsTransitions !== false,
        agentReactive: a.agentReactive !== false
      },
      userProfiles: Array.isArray(raw.userProfiles) ? raw.userProfiles.slice(0, 50) : []
    };
  }

  // Runtime state & asset caches
  let state = createDefaultState(null);
  let sessionSnapshot = null;
  let library = { wallpapers: [], fonts: [], defaultWallpaperId: null };
  let storageDir = '%APPDATA%\\Antigravity\\liquid-glass-customizer';
  const objectUrlCache = new Map(); // assetId -> { url, mime, kind }
  const memoryAssetBytes = new Map(); // fallback for non-IPC browser preview/test environments
  const loadedFontFamilies = new Set();

  let wpStage = null, wpMediaWrap = null, wpImg = null, wpTileDiv = null, wpFreezeCanvas = null, wpVideo = null, wpOverlay = null;
  let glassStyleEl = null, fontStyleEl = null;
  let studioHost = null, studioShadow = null, studioOpen = false, activeTab = 'overview';
  let stagedUpload = null; // { file, name, kind, mime, previewUrl, bytes, sourcePath }
  let activeWallpaperAssetId = null;
  let windowFocused = true;

  function revokeAssetUrl(id) {
    const cached = objectUrlCache.get(id);
    if (cached?.url && cached.url.startsWith('blob:')) {
      try { URL.revokeObjectURL(cached.url); } catch {}
    }
    objectUrlCache.delete(id);
  }

  function revokeAllAssetUrls() {
    for (const id of [...objectUrlCache.keys()]) revokeAssetUrl(id);
  }

  function detectAnimatedWebpClient(uint8) {
    if (!uint8 || uint8.length < 30) return false;
    const str = (s, e) => String.fromCharCode(...uint8.subarray(s, e));
    if (str(0, 4) !== 'RIFF' || str(8, 12) !== 'WEBP') return false;
    if (str(12, 16) === 'VP8X' && (uint8[20] & 0x02) !== 0) return true;
    for (let i = 12; i < Math.min(uint8.length - 4, 256); i++) {
      if (uint8[i] === 65 && uint8[i + 1] === 78 && uint8[i + 2] === 73 && uint8[i + 3] === 77) return true;
    }
    return false;
  }

  const storageBackend = {
    async load() {
      const bridge = window.__agyAsciiBridge;
      const legacyPrefs = bridge?.getPrefs?.() || null;
      if (ipc) {
        try {
          const res = await ipc.invoke('agy-customizer:get-state');
          if (res?.library) library = res.library;
          if (res?.storageDir) storageDir = res.storageDir;
          state = validateState(res?.state, legacyPrefs);
          return;
        } catch {}
      }
      try {
        const rawLib = localStorage.getItem(LIB_KEY);
        if (rawLib) library = JSON.parse(rawLib);
      } catch {}
      try {
        const rawState = localStorage.getItem(STATE_KEY);
        state = validateState(rawState ? JSON.parse(rawState) : null, legacyPrefs);
      } catch {
        state = createDefaultState(legacyPrefs);
      }
    },

    async save() {
      if (ipc) {
        try {
          await ipc.invoke('agy-customizer:save-state', state);
        } catch {}
      }
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
        localStorage.setItem(LIB_KEY, JSON.stringify(library));
      } catch {}
    },

    async uploadAsset({ category, name, mime, bytes, sourcePath, forceKind }) {
      if (ipc) {
        const res = await ipc.invoke('agy-customizer:upload-asset', {
          category,
          name,
          mime,
          bytes,
          sourcePath,
          forceKind
        });
        if (res?.library) library = res.library;
        if (res?.item && bytes) {
          const blob = new Blob([bytes], { type: res.item.mime || mime });
          objectUrlCache.set(res.item.id, { url: URL.createObjectURL(blob), mime: res.item.mime, kind: res.item.kind });
        }
        return res.item;
      }
      // Browser / test environment fallback
      const extMatch = String(name || '').toLowerCase().match(/\.[a-z0-9]+$/);
      const ext = extMatch ? extMatch[0] : '';
      const id = (category === 'font' ? 'fnt_' : 'wp_') + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
      const cleanTitle = String(name || 'Asset').replace(/\.[a-z0-9]+$/i, '').trim() || 'Custom Asset';
      if (category === 'font') {
        const validExts = ['.ttf', '.otf', '.woff', '.woff2'];
        if (!validExts.includes(ext)) throw Error('Unsupported font format: ' + ext);
        const cssFamily = 'AGYCustom_' + id.replace(/[^a-zA-Z0-9]/g, '');
        const item = { id, name: cleanTitle, family: cleanTitle, cssFamily, ext, mime: mime || 'font/ttf', size: bytes?.byteLength || 0, createdAt: new Date().toISOString() };
        if (bytes) memoryAssetBytes.set(id, new Uint8Array(bytes));
        library.fonts.unshift(item);
        localStorage.setItem(LIB_KEY, JSON.stringify(library));
        return item;
      } else {
        const map = { '.jpg': 'static', '.jpeg': 'static', '.png': 'static', '.webp': 'static', '.gif': 'gif', '.mp4': 'video', '.webm': 'video' };
        if (!map[ext]) throw Error('Unsupported wallpaper format: ' + ext);
        let kind = forceKind || map[ext];
        if (ext === '.webp' && bytes && detectAnimatedWebpClient(new Uint8Array(bytes))) kind = 'webp';
        const resolvedMime = mime || (kind === 'video' ? 'video/' + ext.slice(1) : 'image/' + (ext === '.jpg' ? 'jpeg' : ext.slice(1)));
        const item = { id, name: cleanTitle, kind, ext, mime: resolvedMime, size: bytes?.byteLength || 0, favorite: false, createdAt: new Date().toISOString() };
        if (bytes) {
          const u8 = new Uint8Array(bytes);
          memoryAssetBytes.set(id, u8);
          objectUrlCache.set(id, { url: URL.createObjectURL(new Blob([u8], { type: resolvedMime })), mime: resolvedMime, kind });
        }
        library.wallpapers.unshift(item);
        localStorage.setItem(LIB_KEY, JSON.stringify(library));
        return item;
      }
    },

    async getAssetUrl(category, id) {
      if (!id) return null;
      if (objectUrlCache.has(id)) return objectUrlCache.get(id);
      if (ipc) {
        try {
          const res = await ipc.invoke('agy-customizer:read-asset', { category, id });
          if (res?.bytes) {
            const u8 = res.bytes instanceof Uint8Array ? res.bytes : new Uint8Array(res.bytes);
            const blob = new Blob([u8], { type: res.mime || 'application/octet-stream' });
            const entry = { url: URL.createObjectURL(blob), mime: res.mime, kind: res.kind, bytes: category === 'font' ? u8 : undefined, cssFamily: res.cssFamily };
            objectUrlCache.set(id, entry);
            return entry;
          }
        } catch {}
      }
      if (memoryAssetBytes.has(id)) {
        const u8 = memoryAssetBytes.get(id);
        const list = category === 'font' ? library.fonts : library.wallpapers;
        const item = list.find(x => x.id === id);
        const blob = new Blob([u8], { type: item?.mime || 'application/octet-stream' });
        const entry = { url: URL.createObjectURL(blob), mime: item?.mime, kind: item?.kind, bytes: category === 'font' ? u8 : undefined, cssFamily: item?.cssFamily };
        objectUrlCache.set(id, entry);
        return entry;
      }
      return null;
    },

    async updateAsset(category, payload) {
      if (ipc) {
        const res = await ipc.invoke('agy-customizer:update-asset', { category, ...payload });
        if (res?.library) library = res.library;
        return res?.item;
      }
      const list = category === 'font' ? library.fonts : library.wallpapers;
      const item = list.find(x => x.id === payload.id);
      if (item) {
        if (typeof payload.name === 'string' && payload.name.trim()) item.name = payload.name.trim();
        if (typeof payload.favorite === 'boolean') item.favorite = payload.favorite;
        if (payload.setDefault === true && category === 'wallpaper') library.defaultWallpaperId = item.id;
        else if (payload.setDefault === false && library.defaultWallpaperId === item.id) library.defaultWallpaperId = null;
        localStorage.setItem(LIB_KEY, JSON.stringify(library));
      }
      return item;
    },

    async deleteAsset(category, id) {
      revokeAssetUrl(id);
      memoryAssetBytes.delete(id);
      if (ipc) {
        const res = await ipc.invoke('agy-customizer:delete-asset', { category, id });
        if (res?.library) library = res.library;
        return;
      }
      const key = category === 'font' ? 'fonts' : 'wallpapers';
      library[key] = library[key].filter(x => x.id !== id);
      if (category === 'wallpaper' && library.defaultWallpaperId === id) library.defaultWallpaperId = null;
      localStorage.setItem(LIB_KEY, JSON.stringify(library));
    }
  };

  // Custom Font Registration Engine (Section 5)
  async function ensureUploadedFontsLoaded() {
    for (const f of library.fonts) {
      if (!f?.id || loadedFontFamilies.has(f.cssFamily)) continue;
      const asset = await storageBackend.getAssetUrl('font', f.id);
      if (!asset) continue;
      try {
        if (typeof FontFace === 'function' && asset.bytes) {
          const face = new FontFace(f.cssFamily, asset.bytes);
          await face.load();
          document.fonts?.add?.(face);
          loadedFontFamilies.add(f.cssFamily);
        } else if (asset.url) {
          loadedFontFamilies.add(f.cssFamily);
        }
      } catch {}
    }
  }

  function resolveFontStack(fontSelection, fallbackMono = false) {
    if (!fontSelection || fontSelection === 'system') {
      return fallbackMono ? BUILTIN_FONTS.find(x => x.id === 'JetBrains Mono').css : BUILTIN_FONTS[0].css;
    }
    const builtin = BUILTIN_FONTS.find(x => x.id === fontSelection);
    if (builtin) return builtin.css;
    const uploaded = library.fonts.find(x => x.id === fontSelection || x.cssFamily === fontSelection || x.name === fontSelection);
    if (uploaded) {
      return `"${uploaded.cssFamily}", "${uploaded.name}", ${fallbackMono ? 'monospace' : 'system-ui, sans-serif'}`;
    }
    return `"${fontSelection}", ${fallbackMono ? 'monospace' : 'system-ui, sans-serif'}`;
  }

  function applyFontStyles() {
    if (!fontStyleEl) {
      fontStyleEl = document.createElement('style');
      fontStyleEl.id = 'agy-custom-fonts-style';
      document.head.append(fontStyleEl);
    }
    if (!state.enabled || !state.fonts.enabled) {
      fontStyleEl.textContent = '';
      return;
    }
    const f = state.fonts;
    const mainStack = resolveFontStack(f.main, false);
    const sidebarStack = resolveFontStack(f.sidebar === 'system' ? f.main : f.sidebar, false);
    const headingStack = resolveFontStack(f.heading === 'system' ? f.main : f.heading, false);
    const convStack = resolveFontStack(f.conversation === 'system' ? f.main : f.conversation, false);
    const codeStack = resolveFontStack(f.code, true);

    const fontFaceRules = library.fonts.map(item => {
      const cached = objectUrlCache.get(item.id);
      if (!cached?.url) return '';
      return `@font-face { font-family: "${item.cssFamily}"; src: url("${cached.url}"); font-display: swap; }`;
    }).filter(Boolean).join('\n');

    fontStyleEl.textContent = `
      ${fontFaceRules}
      :is(body[data-aw-theme], body[data-agy-customizer]), :is(body[data-aw-theme], body[data-agy-customizer]) .agy-shell {
        --agy-font-main: ${mainStack};
        --agy-font-sidebar: ${sidebarStack};
        --agy-font-heading: ${headingStack};
        --agy-font-conversation: ${convStack};
        --agy-font-code: ${codeStack};
        font-family: var(--agy-font-main) !important;
        font-weight: ${f.weight};
        letter-spacing: ${f.letterSpacingEm}em;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) nav.bg-sidebar,
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"],
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sidebar-row {
        font-family: var(--agy-font-sidebar) !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) h1,
      :is(body[data-aw-theme], body[data-agy-customizer]) h2,
      :is(body[data-aw-theme], body[data-agy-customizer]) h3,
      :is(body[data-aw-theme], body[data-agy-customizer]) h4,
      :is(body[data-aw-theme], body[data-agy-customizer]) h5,
      :is(body[data-aw-theme], body[data-agy-customizer]) h6 {
        font-family: var(--agy-font-heading) !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sheet,
      :is(body[data-aw-theme], body[data-agy-customizer]) .markdown-body,
      :is(body[data-aw-theme], body[data-agy-customizer]) .prose,
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-user-bubble,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer textarea,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [contenteditable="true"] {
        font-family: var(--agy-font-conversation) !important;
        font-size: ${f.sizePx}px;
        line-height: ${f.lineHeight};
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) pre,
      :is(body[data-aw-theme], body[data-agy-customizer]) code,
      :is(body[data-aw-theme], body[data-agy-customizer]) .monaco-editor,
      :is(body[data-aw-theme], body[data-agy-customizer]) .monaco-editor .view-lines {
        font-family: var(--agy-font-code) !important;
      }
    `;
  }

  // Custom Wallpaper Stage & Media Renderer (Section 3)
  function ensureWallpaperStage() {
    const shell = document.querySelector('.agy-shell') || document.querySelector('.agy-sheet') || document.body;
    if (!shell) return null;
    if (wpStage && wpStage.isConnected) {
      if (wpStage.parentElement !== shell) {
        shell.prepend(wpStage);
      }
      return wpStage;
    }
    wpStage?.remove();
    wpStage = document.createElement('div');
      wpStage.id = 'agy-custom-wallpaper-stage';
      wpStage.setAttribute('aria-hidden', 'true');
      Object.assign(wpStage.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        zIndex: '-1',
        pointerEvents: 'none',
        overflow: 'hidden',
        userSelect: 'none'
      });

      wpMediaWrap = document.createElement('div');
      wpMediaWrap.className = 'agy-wp-media-wrap';
      Object.assign(wpMediaWrap.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        transformOrigin: 'center center',
        imageRendering: 'high-quality',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      });

      wpImg = document.createElement('img');
      wpImg.className = 'agy-wp-img';
      wpImg.alt = '';
      wpImg.decoding = 'async';
      Object.assign(wpImg.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'none',
        imageRendering: 'high-quality',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      });

      wpTileDiv = document.createElement('div');
      wpTileDiv.className = 'agy-wp-tile';
      Object.assign(wpTileDiv.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        backgroundRepeat: 'repeat',
        display: 'none'
      });

      wpFreezeCanvas = document.createElement('canvas');
      wpFreezeCanvas.className = 'agy-wp-freeze';
      Object.assign(wpFreezeCanvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'none'
      });

      wpVideo = document.createElement('video');
      wpVideo.className = 'agy-wp-video';
      wpVideo.playsInline = true;
      wpVideo.loop = true;
      wpVideo.muted = true;
      Object.assign(wpVideo.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'none'
      });

      wpOverlay = document.createElement('div');
      wpOverlay.className = 'agy-wp-overlay';
      Object.assign(wpOverlay.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      });

      wpMediaWrap.append(wpImg, wpTileDiv, wpFreezeCanvas, wpVideo);
      wpStage.append(wpMediaWrap, wpOverlay);
      shell.prepend(wpStage);
    return wpStage;
  }

  function computeOverlayBackground(w) {
    const layers = [];
    if (w.dimming > 0) {
      layers.push(`linear-gradient(0deg, rgba(0,0,0,${(w.dimming / 100).toFixed(3)}), rgba(0,0,0,${(w.dimming / 100).toFixed(3)}))`);
    }
    const alpha = (w.overlayOpacity / 100).toFixed(3);
    if (w.overlayType === 'dark') {
      layers.push(`linear-gradient(180deg, rgba(4,8,16,${alpha}), rgba(2,4,10,${Math.min(0.95, w.overlayOpacity / 100 + 0.15).toFixed(3)}))`);
    } else if (w.overlayType === 'light') {
      layers.push(`linear-gradient(180deg, rgba(255,255,255,${alpha}), rgba(235,244,255,${alpha}))`);
    } else if (w.overlayType === 'solid') {
      layers.push(`color-mix(in srgb, ${w.overlayColor1} ${w.overlayOpacity}%, transparent)`);
    } else if (w.overlayType === 'gradient') {
      layers.push(`linear-gradient(${w.overlayAngle}deg, color-mix(in srgb, ${w.overlayColor1} ${w.overlayOpacity}%, transparent), color-mix(in srgb, ${w.overlayColor2} ${w.overlayOpacity}%, transparent))`);
    }
    return layers.length ? layers.join(', ') : 'transparent';
  }

  function applyPositioningStyles(el, w) {
    const pos = `${w.posX}% ${w.posY}%`;
    if (w.fit === 'cover') {
      el.style.objectFit = 'cover';
      el.style.objectPosition = pos;
    } else if (w.fit === 'contain') {
      el.style.objectFit = 'contain';
      el.style.objectPosition = pos;
    } else if (w.fit === 'stretch') {
      el.style.objectFit = 'fill';
      el.style.objectPosition = pos;
    } else if (w.fit === 'center') {
      el.style.objectFit = 'none';
      el.style.objectPosition = pos;
    } else {
      el.style.objectFit = 'cover';
      el.style.objectPosition = pos;
    }
  }

  function freezeImageToCanvas(imgEl, w) {
    if (!wpFreezeCanvas || !imgEl || !imgEl.naturalWidth) return false;
    const rect = wpStage?.getBoundingClientRect() || { width: 1280, height: 720 };
    const cw = Math.max(1, Math.round(rect.width));
    const ch = Math.max(1, Math.round(rect.height));
    wpFreezeCanvas.width = cw;
    wpFreezeCanvas.height = ch;
    const ctx2d = wpFreezeCanvas.getContext('2d');
    if (!ctx2d) return false;
    ctx2d.clearRect(0, 0, cw, ch);
    const iw = imgEl.naturalWidth, ih = imgEl.naturalHeight;
    if (w.fit === 'stretch') {
      ctx2d.drawImage(imgEl, 0, 0, cw, ch);
    } else if (w.fit === 'center') {
      const dx = (cw - iw) * (w.posX / 100);
      const dy = (ch - ih) * (w.posY / 100);
      ctx2d.drawImage(imgEl, dx, dy);
    } else {
      const scale = w.fit === 'contain' ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);
      const dw = iw * scale, dh = ih * scale;
      const dx = (cw - dw) * (w.posX / 100);
      const dy = (ch - dh) * (w.posY / 100);
      ctx2d.drawImage(imgEl, dx, dy, dw, dh);
    }
    return true;
  }

  function shouldPauseAnimations() {
    const w = state.wallpaper;
    if (!w.enableAnimated || w.paused) return true;
    if (document.hidden) return true;
    if (w.pauseWhenUnfocused && !windowFocused) return true;
    return false;
  }

  async function syncWallpaperStage() {
    ensureWallpaperStage();
    const bridge = window.__agyAsciiBridge;
    const asciiCanvas = bridge?.getElements?.()?.canvas || document.getElementById('agy-ascii-scene');
    const w = state.wallpaper;

    if (!state.enabled || w.source === 'off') {
      if (wpStage) wpStage.style.display = 'none';
      if (wpVideo && !wpVideo.paused) wpVideo.pause();
      if (asciiCanvas) asciiCanvas.style.display = 'none';
      return;
    }

    if (wpStage) {
      wpStage.style.display = 'block';
      wpStage.style.transition = state.animations.smoothWallpaperTransitions && !reducedMotionQuery.matches ? 'opacity 0.28s ease' : 'none';
    }

    const perfBlurCap = state.performanceProfile === 'performance' ? 8 : state.performanceProfile === 'balanced' ? 24 : 50;
    const effBlur = Math.min(w.blur, perfBlurCap);
    const filterCss = `brightness(${w.brightness}%) contrast(${w.contrast}%) saturate(${w.saturation}%) blur(${effBlur}px) opacity(${w.opacity}%)`;
    const scaleCss = w.scale !== 100 ? `scale(${(w.scale / 100).toFixed(3)})` : 'none';

    if (wpOverlay) {
      wpOverlay.style.background = computeOverlayBackground(w);
    }

    if (w.source === 'ascii') {
      if (wpMediaWrap) wpMediaWrap.style.display = 'none';
      if (wpVideo && !wpVideo.paused) wpVideo.pause();
      if (asciiCanvas) {
        asciiCanvas.style.display = '';
        asciiCanvas.style.filter = filterCss;
        asciiCanvas.style.transform = scaleCss;
      }
      const targetPaused = shouldPauseAnimations();
      const curPrefs = bridge?.getPrefs?.();
      if (curPrefs && (curPrefs.theme !== w.asciiTheme || curPrefs.paused !== targetPaused)) {
        bridge.setPrefs({ theme: w.asciiTheme, paused: targetPaused }, true);
      }
      return;
    }

    // Custom image / GIF / Animated WEBP / Video mode
    if (asciiCanvas) {
      asciiCanvas.style.display = 'none';
    }
    const curPrefs = bridge?.getPrefs?.();
    if (curPrefs && (curPrefs.theme !== 'off' || !curPrefs.paused)) {
      bridge.setPrefs({ theme: 'off', paused: true }, true);
    }
    if (wpMediaWrap) {
      wpMediaWrap.style.display = 'block';
      wpMediaWrap.style.filter = filterCss;
      wpMediaWrap.style.transform = scaleCss;
    }

    const assetId = w.assetId || library.defaultWallpaperId || library.wallpapers[0]?.id || null;
    const assetEntry = assetId ? await storageBackend.getAssetUrl('wallpaper', assetId) : null;

    if (!assetEntry?.url) {
      wpImg.style.display = 'none';
      wpTileDiv.style.display = 'none';
      wpFreezeCanvas.style.display = 'none';
      wpVideo.style.display = 'none';
      return;
    }

    const isVideo = w.source === 'video' || assetEntry.kind === 'video' || /^video\//i.test(assetEntry.mime || '');
    const isAnimatedImage = w.source === 'gif' || w.source === 'webp' || assetEntry.kind === 'gif' || assetEntry.kind === 'webp';
    const pausedNow = shouldPauseAnimations();

    if (isVideo) {
      wpImg.style.display = 'none';
      wpTileDiv.style.display = 'none';
      wpFreezeCanvas.style.display = 'none';
      wpVideo.style.display = 'block';
      applyPositioningStyles(wpVideo, w);
      if (wpVideo.dataset.assetId !== assetId || wpVideo.src !== assetEntry.url) {
        wpVideo.dataset.assetId = assetId;
        wpVideo.src = assetEntry.url;
      }
      wpVideo.muted = Boolean(w.muted);
      wpVideo.volume = clamp(w.volume / 100, 0, 1, 0.5);
      wpVideo.playbackRate = clamp(w.playbackRate, 0.25, 2, 1);
      if (pausedNow) {
        if (!wpVideo.paused) wpVideo.pause();
      } else {
        wpVideo.play?.()?.catch?.(() => {});
      }
    } else {
      if (!wpVideo.paused) wpVideo.pause();
      wpVideo.style.display = 'none';

      if (w.fit === 'tile') {
        wpImg.style.display = 'none';
        wpFreezeCanvas.style.display = 'none';
        wpTileDiv.style.display = 'block';
        wpTileDiv.style.backgroundImage = `url("${assetEntry.url}")`;
        wpTileDiv.style.backgroundPosition = `${w.posX}% ${w.posY}%`;
        wpTileDiv.style.backgroundSize = `${w.scale}%`;
      } else {
        wpTileDiv.style.display = 'none';
        applyPositioningStyles(wpImg, w);
        if (wpImg.dataset.assetId !== assetId || wpImg.src !== assetEntry.url) {
          wpImg.dataset.assetId = assetId;
          wpImg.src = assetEntry.url;
        }
        if (isAnimatedImage && pausedNow && wpImg.complete && wpImg.naturalWidth > 0) {
          if (freezeImageToCanvas(wpImg, w)) {
            wpFreezeCanvas.style.display = 'block';
            wpImg.style.display = 'none';
          } else {
            wpFreezeCanvas.style.display = 'none';
            wpImg.style.display = 'block';
          }
        } else {
          wpFreezeCanvas.style.display = 'none';
          wpImg.style.display = 'block';
        }
      }
    }
    activeWallpaperAssetId = assetId;
  }

  // Liquid Glass & Custom Color Stylesheet Engine (Section 4 & Section 7)
  function resolvePalette() {
    const bridge = window.__agyAsciiBridge;
    const asciiThemes = bridge?.themes || [];
    const activeAscii = asciiThemes.find(t => t.id === state.wallpaper.asciiTheme) || asciiThemes[0] || {
      light: false, sky: '#061220', floor: '#0d2233', chrome: '#0a1724', panel: '#0b1826', card: '#16283a', fg: '#e9f4f2', muted: '#a9c4c4', border: '#35506a', accent: '#7cf2b4'
    };

    if (state.colors.enabled) {
      const c = state.colors;
      const isLight = c.mode === 'light';
      return {
        light: isLight,
        sky: c.background,
        floor: c.panel,
        chrome: c.sidebar,
        panel: c.panel,
        card: c.composer,
        menu: c.menu,
        fg: c.text,
        muted: `color-mix(in srgb, ${c.text} 68%, ${c.panel})`,
        border: c.border,
        accent: c.accent
      };
    }
    return {
      light: Boolean(activeAscii.light),
      sky: activeAscii.sky,
      floor: activeAscii.floor,
      chrome: activeAscii.chrome,
      panel: activeAscii.panel,
      card: activeAscii.card,
      menu: activeAscii.panel,
      fg: activeAscii.fg,
      muted: activeAscii.muted,
      border: activeAscii.border,
      accent: activeAscii.accent
    };
  }

  function syncDocumentMode(isLight) {
    const modeClass = isLight ? 'light' : 'dark';
    const oldClass = isLight ? 'dark' : 'light';
    const themeClass = isLight ? 'light-theme' : 'dark-theme';
    const oldThemeClass = isLight ? 'dark-theme' : 'light-theme';

    if (document.documentElement?.classList) {
      document.documentElement.classList.remove(oldClass, oldThemeClass);
      document.documentElement.classList.add(modeClass, themeClass);
      if (document.documentElement.style) document.documentElement.style.colorScheme = modeClass;
    }
    if (document.body?.classList) {
      document.body.classList.remove(oldClass, oldThemeClass, isLight ? 'theme-dark' : 'theme-light');
      document.body.classList.add(modeClass, themeClass, isLight ? 'theme-light' : 'theme-dark');
      if (document.body.dataset) document.body.dataset.awMode = modeClass;
    }
    if (typeof document.querySelectorAll === 'function') {
      try {
        const els = document.querySelectorAll('#root, #root .dark, #root .light, [class*="theme-"]');
        els?.forEach?.(el => {
          el.classList?.remove?.(oldClass, oldThemeClass, isLight ? 'theme-dark' : 'theme-light');
          el.classList?.add?.(modeClass);
        });
      } catch (_) {}
    }
  }

  function applyLiquidGlassStyles() {
    window.__agyLiquidGlassActive = true;
    window.__agyCustomizerActive = true;
    window.__agyCustomizerState = state;

    if (!glassStyleEl) {
      glassStyleEl = document.createElement('style');
      glassStyleEl.id = 'agy-liquid-glass-style';
      document.head.append(glassStyleEl);
    }

    const bridge = window.__agyAsciiBridge;
    if (!state.enabled || state.wallpaper.source === 'off') {
      glassStyleEl.textContent = '';
      return;
    }

    // Ensure :is(body[data-aw-theme], body[data-agy-customizer]) and body[data-agy-customizer] are active
    document.body.dataset.agyCustomizer = 'true';
    if (!document.body.dataset.awTheme) {
      document.body.dataset.awTheme = (state.wallpaper.source === 'ascii' && state.wallpaper.asciiTheme) ? state.wallpaper.asciiTheme : 'aurora';
    }

    const pal = resolvePalette();
    syncDocumentMode(pal.light);
    document.body.dataset.agyGlassPreset = state.glass.preset;

    const g = state.glass;
    const perf = state.performanceProfile;
    const maxBlur = perf === 'performance' ? 6 : perf === 'balanced' ? 22 : 50;
    const allowReflections = perf !== 'performance' && g.reflectionIntensity > 0;
    const allowAnimatedShimmer = perf === 'high' && state.animations.animatedReflections && !reducedMotionQuery.matches;

    const compStyle = (compId, baseColor) => {
      const c = g.components[compId] || { enabled: true, transparency: g.transparency, blur: g.blur };
      if (!g.enabled || !c.enabled) {
        if (compId === 'background' || compId === 'conversation') {
          return `background: transparent !important; background-color: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important;`;
        }
        if (compId === 'sidebar') {
          return `background-color: color-mix(in srgb, ${baseColor} 30%, transparent) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important;`;
        }
        if (compId === 'composer') {
          return `background-color: color-mix(in srgb, ${baseColor} 75%, transparent) !important; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important;`;
        }
        return `background-color: color-mix(in srgb, ${baseColor} 88%, transparent) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important;`;
      }
      if (compId === 'background') {
        return `background: transparent !important; background-color: transparent !important;`;
      }
      const opacityPct = Math.max(0, Math.min(100, 100 - c.transparency));
      const blurPx = Math.min(maxBlur, Math.round(c.blur));
      const satPct = perf === 'performance' ? 100 : g.saturation;
      const briPct = perf === 'performance' ? 100 : g.brightness;
      const filterExtras = (satPct !== 100 || briPct !== 100) ? ` saturate(${satPct}%) brightness(${briPct}%)` : '';
      const backdrop = blurPx > 0
        ? `backdrop-filter: blur(${blurPx}px)${filterExtras} !important; -webkit-backdrop-filter: blur(${blurPx}px)${filterExtras} !important;`
        : `backdrop-filter: none !important; -webkit-backdrop-filter: none !important;`;
      return `background-color: color-mix(in srgb, ${baseColor} ${opacityPct}%, transparent) !important; ${backdrop}`;
    };

    const borderAlpha = Math.round(g.borderOpacity);
    const hiAlpha = (g.highlightIntensity / 100 * (pal.light ? 0.65 : 0.28)).toFixed(3);
    const refAlpha = allowReflections ? (g.reflectionIntensity / 100 * (pal.light ? 0.55 : 0.22)).toFixed(3) : '0';
    const shAlpha = (g.shadowIntensity / 100 * (pal.light ? 0.22 : 0.55)).toFixed(3);
    const radius = g.cornerRadius;

    const specularGradient = allowReflections
      ? `linear-gradient(135deg, rgba(255,255,255,${refAlpha}) 0%, rgba(255,255,255,0) 42%, rgba(255,255,255,${(Number(refAlpha) * 0.35).toFixed(3)}) 100%)`
      : 'none';

    const transitionRule = state.animations.glassHighlightTransitions && !reducedMotionQuery.matches
      ? 'transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;'
      : '';

    const colorTokens = `
      :root, body, #root, :is(body[data-aw-theme], body[data-agy-customizer]), :is(body[data-aw-theme], body[data-agy-customizer]) #root .dark, :is(body[data-aw-theme], body[data-agy-customizer]) #root .light, :is(body[data-aw-theme], body[data-agy-customizer]) .agy-shell, .agy-inset-shell, [aria-label="Sidebar"], nav, aside {
        --background: ${pal.chrome} !important;
        --color-background: ${pal.chrome} !important;
        --foreground: ${pal.fg} !important;
        --color-foreground: ${pal.fg} !important;
        --sidebar: ${pal.chrome} !important;
        --color-sidebar: ${pal.chrome} !important;
        --sidebar-background: ${pal.chrome} !important;
        --sidebar-foreground: ${pal.fg} !important;
        --sidebar-secondary: ${pal.panel} !important;
        --sidebar-primary: color-mix(in srgb, ${pal.accent} 28%, rgba(12, 22, 38, 0.92)) !important;
        --sidebar-primary-foreground: #ffffff !important;
        --color-sidebar-primary: color-mix(in srgb, ${pal.accent} 28%, rgba(12, 22, 38, 0.92)) !important;
        --color-sidebar-primary-foreground: #ffffff !important;
        --card: ${pal.panel} !important;
        --color-card: ${pal.panel} !important;
        --card-foreground: ${pal.fg} !important;
        --muted: ${pal.panel} !important;
        --color-muted: ${pal.panel} !important;
        --muted-foreground: ${pal.muted} !important;
        --secondary: ${pal.panel} !important;
        --secondary-foreground: ${pal.fg} !important;
        --popover: ${pal.menu} !important;
        --color-popover: ${pal.menu} !important;
        --popover-foreground: ${pal.fg} !important;
        --border: ${pal.light ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)'} !important;
        --color-border: ${pal.light ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)'} !important;
        --sidebar-border: transparent !important;
        --card-border: ${pal.light ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'} !important;
        --primary: color-mix(in srgb, ${pal.accent} 28%, rgba(12, 22, 38, 0.92)) !important;
        --color-primary: color-mix(in srgb, ${pal.accent} 28%, rgba(12, 22, 38, 0.92)) !important;
        --primary-foreground: #ffffff !important;
        --color-primary-foreground: #ffffff !important;
        --ring: transparent !important;
        color: ${pal.fg} !important;
      }
    `;

    glassStyleEl.textContent = `
      ${colorTokens}

      /* 0. UNIVERSAL TEXT-SHADOW KILL: Eliminate all blurry neon glow halos across UI */
      :is(body[data-aw-theme], body[data-agy-customizer]) *:not([class*="glow-text"]):not(.agy-ascii-glow) {
        text-shadow: none !important;
      }

      /* 1. Main Application Background (Transparent so Wallpaper at z-index -1 is completely visible) */
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-shell {
        position: relative !important;
        isolation: isolate !important;
        background: transparent !important;
        background-color: transparent !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell {
        background: transparent !important;
        background-color: transparent !important;
      }

      /* 2. Sidebar */
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell > div:first-child > div:first-child,
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"],
      :is(body[data-aw-theme], body[data-agy-customizer]) nav.bg-sidebar {
        ${compStyle('sidebar', pal.chrome)}
        border-right: 1px solid color-mix(in srgb, ${pal.border} ${borderAlpha}%, rgba(255,255,255,${hiAlpha})) !important;
        box-shadow: inset 0 1px 0 0 rgba(255,255,255,${hiAlpha}), 4px 0 24px rgba(0,0,0,${(Number(shAlpha) * 0.5).toFixed(3)}) !important;
        background-image: ${specularGradient} !important;
        ${transitionRule}
      }

      /* Sidebar: "+ New Conversation" Button (Clean, borderless modern glass pill) */
      [data-agy-new-conv="true"],
      button[data-agy-new-conv="true"],
      a[data-agy-new-conv="true"],
      button[aria-label*="New Conversation" i],
      a[href*="/c/new"] {
        background: color-mix(in srgb, ${pal.accent} 22%, rgba(16, 26, 42, 0.88)) !important;
        background-color: color-mix(in srgb, ${pal.accent} 22%, rgba(16, 26, 42, 0.88)) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 9999px !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35) !important;
        text-shadow: none !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
      }

      [data-agy-new-conv="true"]:hover,
      button[data-agy-new-conv="true"]:hover,
      button[aria-label*="New Conversation" i]:hover,
      a[href*="/c/new"]:hover {
        background: color-mix(in srgb, ${pal.accent} 36%, rgba(20, 32, 54, 0.95)) !important;
        background-color: color-mix(in srgb, ${pal.accent} 36%, rgba(20, 32, 54, 0.95)) !important;
        color: #ffffff !important;
        border: none !important;
      }

      [data-agy-new-conv="true"] *,
      button[data-agy-new-conv="true"] *,
      button[aria-label*="New Conversation" i] *,
      a[href*="/c/new"] * {
        color: #ffffff !important;
        stroke: #ffffff !important;
        fill: currentColor !important;
        text-shadow: none !important;
      }

      /* Clean, sleek sidebar rows, headings, pills - strictly borderless (no ugly cyan ovals) */
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sidebar-row,
      :is(body[data-aw-theme], body[data-agy-customizer]) nav [role="button"],
      :is(body[data-aw-theme], body[data-agy-customizer]) aside [role="button"],
      :is(body[data-aw-theme], body[data-agy-customizer]) nav button:not([data-agy-new-conv="true"]),
      :is(body[data-aw-theme], body[data-agy-customizer]) aside button:not([data-agy-new-conv="true"]),
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] [role="button"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] button:not([data-agy-new-conv="true"]),
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] a,
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] [class*="header" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] [class*="section" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] [class*="title" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] div[class*="rounded" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] span[class*="rounded" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-testid="conversation-row-history"],
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell button:not([data-agy-new-conv="true"]),
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell [role="button"]:not([data-agy-new-conv="true"]),
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="overview" i] button,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="overview" i] [role="button"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="overview" i] div[class*="rounded" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="menuitem"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-collection-item],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="menu-item" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-active="true"],
      :is(body[data-aw-theme], body[data-agy-customizer]) .bg-sidebar-secondary,
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-current="page"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-state="active"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-selected="true"] {
        border: none !important;
        border-width: 0 !important;
        border-color: transparent !important;
        border-style: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-box-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] *::before,
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] *::after,
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-active="true"]::before,
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-active="true"]::after,
      :is(body[data-aw-theme], body[data-agy-customizer]) .bg-sidebar-secondary::before,
      :is(body[data-aw-theme], body[data-agy-customizer]) .bg-sidebar-secondary::after {
        border: none !important;
        border-width: 0 !important;
        border-color: transparent !important;
        box-shadow: none !important;
        outline: none !important;
      }
      .agy-sidebar-row:not([data-active="true"]):not(:hover) {
        background: transparent !important;
        background-color: transparent !important;
      }
      .agy-sidebar-row:hover:not(.bg-sidebar-secondary) {
        background-color: rgba(255, 255, 255, 0.08) !important;
        border: none !important;
      }

      /* 3. Conversation Area */
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sheet,
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sheet[data-sheet-inset] [data-main-content-body],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-main-content-body] {
        ${(g.enabled && g.components.conversation?.enabled) ? compStyle('conversation', pal.panel) : 'background: transparent !important; background-color: transparent !important;'}
        color: ${pal.fg} !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-user-bubble {
        ${compStyle('conversation', pal.card)}
        border: 1px solid color-mix(in srgb, ${pal.border} ${borderAlpha}%, rgba(255,255,255,${hiAlpha})) !important;
        border-radius: ${radius}px !important;
        box-shadow: 0 6px 20px rgba(0,0,0,${(Number(shAlpha) * 0.45).toFixed(3)}), inset 0 1px 0 rgba(255,255,255,${hiAlpha}) !important;
      }

      /* 4. Navigation & Header */
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-shell > .shrink-0 {
        position: relative !important;
        z-index: 30 !important;
        ${compStyle('header', pal.chrome)}
        border-bottom: 0 !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,${hiAlpha}) !important;
      }

      /* Breadcrumbs & Navigation Titles (Fixes neon halos) */
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="breadcrumb" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="project-name" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) header a,
      :is(body[data-aw-theme], body[data-agy-customizer]) header span {
        text-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="breadcrumb" i] span,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="breadcrumb" i] a {
        color: ${pal.light ? '#334155' : '#cbd5e1'} !important;
        font-weight: 500 !important;
      }

      /* 5. Composer / Input Area */
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer-card {
        background: ${pal.light ? 'rgba(245, 249, 255, 0.88)' : 'rgba(14, 22, 36, 0.88)'} !important;
        background-color: ${pal.light ? 'rgba(245, 249, 255, 0.88)' : 'rgba(14, 22, 36, 0.88)'} !important;
        color: ${pal.fg} !important;
        border: 1px solid ${pal.light ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.1)'} !important;
        border-radius: 8px !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer-card:has(.surface-composer) {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer {
        ${compStyle('composer', pal.card)}
        border: 1px solid color-mix(in srgb, ${pal.border} ${Math.min(100, borderAlpha + 12)}%, rgba(255,255,255,${hiAlpha})) !important;
        border-radius: ${radius}px !important;
        box-shadow: 0 12px 36px rgba(0,0,0,${shAlpha}), inset 0 1px 0 0 rgba(255,255,255,${hiAlpha}), 0 0 0 1px color-mix(in srgb, ${pal.accent} 18%, transparent) !important;
        background-image: ${specularGradient} !important;
        color: ${pal.fg} !important;
        ${transitionRule}
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer textarea,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [contenteditable="true"],
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer input,
      :is(body[data-aw-theme], body[data-agy-customizer]) textarea,
      :is(body[data-aw-theme], body[data-agy-customizer]) input,
      :is(body[data-aw-theme], body[data-agy-customizer]) [contenteditable="true"] {
        color: #ffffff !important;
        caret-color: #00f0ff !important;
        font-weight: 450 !important;
        text-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer button,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [role="button"],
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer span,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer p {
        color: ${pal.fg} !important;
        text-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer svg {
        color: ${pal.fg} !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer textarea::placeholder,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [data-placeholder]::before,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [class*="placeholder"] {
        color: ${pal.light ? 'rgba(51, 65, 85, 0.72)' : 'rgba(203, 213, 225, 0.72)'} !important;
        text-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer:focus-within {
        border-color: #00f0ff !important;
        box-shadow: 0 14px 40px rgba(0,0,0,${shAlpha}), 0 0 20px rgba(0, 240, 255, 0.45), inset 0 1px 0 rgba(255,255,255,${hiAlpha}) !important;
      }

      /* Composer Submit / Sparkle Circle Button (High Contrast Accent) */
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer button.rounded-full,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [role="button"].rounded-full,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer button:has(svg):last-of-type,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [aria-label*="Submit" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [aria-label*="Send" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [class*="submit" i] {
        background: ${pal.accent} !important;
        background-color: ${pal.accent} !important;
        color: #061220 !important;
        border: none !important;
        border-radius: 9999px !important;
        box-shadow: 0 2px 12px color-mix(in srgb, ${pal.accent} 50%, transparent) !important;
        text-shadow: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer button.rounded-full svg,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [role="button"].rounded-full svg,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer button:has(svg):last-of-type svg,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [aria-label*="Submit" i] svg,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [aria-label*="Send" i] svg,
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer [class*="submit" i] svg {
        color: #061220 !important;
        stroke: #061220 !important;
        fill: #061220 !important;
      }

      /* 6. Menus & Dropdowns (SOLID / OPAQUE to prevent text collision) */
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-opaque,
      :is(body[data-aw-theme], body[data-agy-customizer]) .border-menu-border,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="menu"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-menu-content],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-popper-content-wrapper] > *,
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-dropdown-menu-content],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-select-content],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="menu-content" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="dropdown-content" i] {
        background-color: ${pal.light ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 16, 28, 0.97)'} !important;
        backdrop-filter: blur(28px) !important;
        -webkit-backdrop-filter: blur(28px) !important;
        border: 1px solid ${pal.light ? 'rgba(0,0,0,0.15)' : 'rgba(110, 231, 255, 0.32)'} !important;
        border-radius: ${Math.max(6, radius - 2)}px !important;
        box-shadow: 0 20px 54px rgba(0,0,0,${Math.min(0.9, Number(shAlpha) + 0.3).toFixed(3)}), inset 0 1px 0 rgba(255,255,255,${hiAlpha}) !important;
        background-image: ${specularGradient} !important;
        color: ${pal.light ? '#0f172a' : '#f1f5f9'} !important;
        text-shadow: none !important;
        z-index: 999999 !important;
        opacity: 1 !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="menu"] *,
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-menu-content] *,
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-popper-content-wrapper] * {
        text-shadow: none !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="menuitem"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-collection-item],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="menu-item" i] {
        color: ${pal.light ? '#1e293b' : '#e2e8f0'} !important;
        border: none !important;
        border-color: transparent !important;
        box-shadow: none !important;
        border-radius: 6px !important;
        transition: background 0.12s ease !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="menuitem"]:hover,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="menuitem"][data-highlighted],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-collection-item]:hover,
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-collection-item][data-highlighted] {
        background-color: ${pal.light ? 'rgba(0,0,0,0.06)' : 'rgba(110, 231, 255, 0.16)'} !important;
        color: ${pal.light ? '#0284c7' : '#ffffff'} !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="menu"] [class*="badge" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-menu-content] [class*="badge" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-popper-content-wrapper] [class*="badge" i] {
        background-color: ${pal.light ? 'rgba(0,0,0,0.08)' : 'rgba(110, 231, 255, 0.18)'} !important;
        color: ${pal.light ? '#0369a1' : '#6ee7ff'} !important;
        border: 1px solid ${pal.light ? 'rgba(0,0,0,0.1)' : 'rgba(110, 231, 255, 0.3)'} !important;
        border-radius: 9999px !important;
        text-shadow: none !important;
      }

      /* 7. Floating Toolbars & Active Sidebar Rows - clean & borderless */
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] [data-active="true"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] .bg-sidebar-secondary,
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] [aria-current="page"],
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sidebar-row.bg-sidebar-secondary,
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sidebar-row[data-active="true"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-active="true"],
      :is(body[data-aw-theme], body[data-agy-customizer]) .bg-sidebar-secondary {
        background-color: rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        border: none !important;
        border-color: transparent !important;
        border-radius: 8px !important;
        box-shadow: none !important;
        outline: none !important;
        color: #ffffff !important;
      }
      ${state.animations.hoverAnimations ? `
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] [role="button"]:hover:not([data-active="true"]):not(.bg-sidebar-secondary),
      :is(body[data-aw-theme], body[data-agy-customizer]) [aria-label="Sidebar"] a:hover:not([data-active="true"]):not(.bg-sidebar-secondary),
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-sidebar-row:hover:not(.bg-sidebar-secondary):not([data-active="true"]) {
        background-color: rgba(255, 255, 255, 0.12) !important;
        border: none !important;
        border-color: transparent !important;
        border-radius: 8px !important;
        box-shadow: none !important;
        outline: none !important;
      }` : ''}

      /* 8. Settings, Dialogs & Permission Prompts ("Allow read access to this path?") */
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="alertdialog"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-dialog-content],
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-radix-alert-dialog-content],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="dialog-content" i] {
        background-color: ${pal.light ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 16, 28, 0.97)'} !important;
        color: ${pal.light ? '#0f172a' : '#f8fafc'} !important;
        border: 1px solid ${pal.light ? 'rgba(0,0,0,0.15)' : 'rgba(110, 231, 255, 0.35)'} !important;
        border-radius: 14px !important;
        box-shadow: 0 24px 72px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(28px) !important;
        -webkit-backdrop-filter: blur(28px) !important;
        text-shadow: none !important;
        z-index: 99999 !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] *,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="alertdialog"] * {
        text-shadow: none !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] h2,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] h3,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [class*="title" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="alertdialog"] [class*="title" i] {
        color: ${pal.light ? '#0f172a' : '#ffffff'} !important;
        font-weight: 600 !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] input,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] code,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [class*="input" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [class*="path" i] {
        background-color: ${pal.light ? 'rgba(0,0,0,0.05)' : 'rgba(6, 11, 20, 0.9)'} !important;
        color: ${pal.light ? '#0284c7' : '#6ee7ff'} !important;
        border: 1px solid ${pal.light ? 'rgba(0,0,0,0.12)' : 'rgba(255, 255, 255, 0.15)'} !important;
        border-radius: 8px !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] button,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [role="button"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [class*="option" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="alertdialog"] button {
        background-color: ${pal.light ? 'rgba(0,0,0,0.04)' : 'rgba(18, 28, 48, 0.75)'} !important;
        color: ${pal.light ? '#1e293b' : '#e2e8f0'} !important;
        border: 1px solid ${pal.light ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.15)'} !important;
        border-radius: 8px !important;
        transition: all 0.15s ease !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] button:hover,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [role="button"]:hover,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [class*="option" i]:hover,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="alertdialog"] button:hover {
        background-color: ${pal.light ? 'rgba(0,0,0,0.08)' : 'rgba(28, 44, 76, 0.95)'} !important;
        border-color: ${pal.accent} !important;
        color: ${pal.light ? '#0f172a' : '#ffffff'} !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] button[type="submit"],
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="dialog"] [class*="submit" i] {
        background-color: ${pal.accent} !important;
        color: #061220 !important;
        font-weight: 600 !important;
        border-color: ${pal.accent} !important;
      }

      /* 9. Code Blocks & Terminal Output (Deep dark readable glass, single clean outer border) */
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> pre),
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> * > pre),
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="code-block" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="codeBlock" i],
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="terminal" i] {
        background-color: ${pal.light ? 'rgba(240, 246, 252, 0.96)' : 'rgba(8, 14, 26, 0.95)'} !important;
        background: ${pal.light ? 'rgba(240, 246, 252, 0.96)' : 'rgba(8, 14, 26, 0.95)'} !important;
        color: ${pal.light ? '#0f172a' : '#e6edf3'} !important;
        border: 1px solid ${pal.light ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.12)'} !important;
        border-radius: 8px !important;
        text-shadow: none !important;
        overflow: hidden !important;
      }

      /* Inner pre inside container must NEVER have its own border or background */
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> pre) pre,
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> * > pre) pre,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="code-block" i] pre,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="codeBlock" i] pre,
      :is(body[data-aw-theme], body[data-agy-customizer]) pre:has(code),
      :is(body[data-aw-theme], body[data-agy-customizer]) pre {
        border: none !important;
        border-color: transparent !important;
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none !important;
        margin: 0 !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> pre) > div:first-child,
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> * > pre) > div:first-child,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="code-block" i] > div:first-child,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="codeBlock" i] > div:first-child,
      :is(body[data-aw-theme], body[data-agy-customizer]) pre > div:first-child {
        background-color: ${pal.light ? 'rgba(226, 232, 240, 0.98)' : 'rgba(14, 22, 38, 0.98)'} !important;
        background: ${pal.light ? 'rgba(226, 232, 240, 0.98)' : 'rgba(14, 22, 38, 0.98)'} !important;
        border-bottom: 1px solid ${pal.light ? 'rgba(0,0,0,0.08)' : 'rgba(255, 255, 255, 0.1)'} !important;
        color: ${pal.light ? '#475569' : '#94a3b8'} !important;
        text-shadow: none !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> pre) > div:first-child *,
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> * > pre) > div:first-child *,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="code-block" i] > div:first-child *,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="codeBlock" i] > div:first-child * {
        color: ${pal.light ? '#334155' : '#cbd5e1'} !important;
        text-shadow: none !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) pre code,
      :is(body[data-aw-theme], body[data-agy-customizer]) .markdown-body pre code,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="code-block" i] code,
      :is(body[data-aw-theme], body[data-agy-customizer]) [class*="codeBlock" i] span,
      :is(body[data-aw-theme], body[data-agy-customizer]) pre span,
      :is(body[data-aw-theme], body[data-agy-customizer]) pre code * {
        background-color: transparent !important;
        color: ${pal.light ? '#1f2937' : '#e6edf3'} !important;
        text-shadow: none !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) p code,
      :is(body[data-aw-theme], body[data-agy-customizer]) li code,
      :is(body[data-aw-theme], body[data-agy-customizer]) kbd {
        background-color: ${pal.light ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, 0.1)'} !important;
        color: ${pal.light ? '#0f172a' : '#6ee7ff'} !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 2px 6px !important;
        text-shadow: none !important;
      }

      :is(body[data-aw-theme], body[data-agy-customizer]) hr,
      :is(body[data-aw-theme], body[data-agy-customizer]) [role="separator"] {
        border: none !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        margin: 16px 0 !important;
      }

      /* 9. Markdown Tables - Aesthetic Liquid Glass Styling */
      :is(body[data-aw-theme], body[data-agy-customizer]) table {
        width: 100% !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        background: color-mix(in srgb, ${pal.panel} 35%, rgba(10, 18, 32, 0.45)) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 10px !important;
        overflow: hidden !important;
        margin: 14px 0 !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) thead,
      :is(body[data-aw-theme], body[data-agy-customizer]) thead tr {
        background: color-mix(in srgb, ${pal.accent} 12%, rgba(255, 255, 255, 0.06)) !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) th {
        color: #ffffff !important;
        font-weight: 600 !important;
        padding: 9px 14px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        text-align: left !important;
        background: transparent !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) th:last-child {
        border-right: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) td {
        padding: 8px 14px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.04) !important;
        color: ${pal.fg} !important;
        background: transparent !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) td:last-child {
        border-right: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) tbody tr:last-child td {
        border-bottom: none !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) tbody tr:hover td {
        background-color: rgba(255, 255, 255, 0.05) !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .markdown-body table,
      :is(body[data-aw-theme], body[data-agy-customizer]) .prose table {
        background: color-mix(in srgb, ${pal.panel} 35%, rgba(10, 18, 32, 0.45)) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 10px !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> table),
      :is(body[data-aw-theme], body[data-agy-customizer]) div:has(> * > table) {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }

      /* 10. Secondary Panels & Side Panels (Artifacts, PDF viewer, Inspector) */
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell [data-side-panel-body],
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell > div:last-child,
      :is(body[data-aw-theme], body[data-agy-customizer]) [data-side-panel] {
        background-color: color-mix(in srgb, ${pal.panel} 30%, transparent) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell [data-side-panel-body] header,
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell > div:last-child > header,
      :is(body[data-aw-theme], body[data-agy-customizer]) .agy-inset-shell > div:last-child > div:first-child {
        background-color: color-mix(in srgb, ${pal.chrome} 35%, transparent) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
      }

      ${allowAnimatedShimmer ? `
      @keyframes agy-liquid-shimmer {
        0% { background-position: 0% 0%; }
        50% { background-position: 100% 100%; }
        100% { background-position: 0% 0%; }
      }
      :is(body[data-aw-theme], body[data-agy-customizer]) .surface-composer,
      :is(body[data-aw-theme], body[data-agy-customizer]) nav.bg-sidebar {
        background-size: 200% 200% !important;
        animation: agy-liquid-shimmer 14s ease-in-out infinite;
      }` : ''}
    `;

    const winAPI = bridge?.windowAPI || window.electronNative;
    if (winAPI?.setTitleBarOverlay) {
      winAPI.setTitleBarOverlay({ color: '#00000000', symbolColor: pal.fg }).catch?.(() => {});
    }
  }

  function fixNewConversationButton() {
    if (state.wallpaper?.source === 'off' && !state.colors?.enabled && !state.glass?.enabled) return;
    const pal = resolvePalette();
    const bgStyle = `color-mix(in srgb, ${pal.accent} 22%, rgba(16, 26, 42, 0.88))`;

    if (typeof document.querySelectorAll !== 'function') return;
    try {
      const candidates = document.querySelectorAll('button, a, [role="button"]');
      for (const el of candidates) {
        const text = (el.textContent || '').trim().toLowerCase();
        if (text === 'new conversation' || text === '+ new conversation' || text === 'new chat' || text === '+ new chat') {
          el.setAttribute('data-agy-new-conv', 'true');
          el.style.setProperty('background', bgStyle, 'important');
          el.style.setProperty('background-color', bgStyle, 'important');
          el.style.setProperty('color', '#ffffff', 'important');
          el.style.setProperty('border', 'none', 'important');
          el.style.setProperty('border-radius', '9999px', 'important');
          el.style.setProperty('box-shadow', '0 2px 10px rgba(0, 0, 0, 0.35)', 'important');
          el.style.setProperty('text-shadow', 'none', 'important');

          el.querySelectorAll('*').forEach(child => {
            child.style.setProperty('color', '#ffffff', 'important');
            child.style.setProperty('stroke', '#ffffff', 'important');
            child.style.setProperty('fill', 'currentColor', 'important');
            child.style.setProperty('text-shadow', 'none', 'important');
          });
        }
      }
    } catch (_) {}
  }

  async function applyAllCustomizations(persist = false) {
    await ensureUploadedFontsLoaded();
    await syncWallpaperStage();
    applyLiquidGlassStyles();
    applyFontStyles();
    updateStudioStatusUI();
    fixNewConversationButton();
    if (persist && state.autoSave) {
      await storageBackend.save();
    }
  }

  // Glass Presets & Theme Profile Management (Section 4B, Section 8, Section 9)
  function applyGlassPreset(presetId) {
    const preset = GLASS_PRESETS[presetId];
    if (!preset) return;
    state.glass.preset = preset.id;
    state.glass.transparency = preset.transparency;
    state.glass.blur = preset.blur;
    state.glass.brightness = preset.brightness;
    state.glass.saturation = preset.saturation;
    state.glass.borderOpacity = preset.borderOpacity;
    state.glass.shadowIntensity = preset.shadowIntensity;
    state.glass.reflectionIntensity = preset.reflectionIntensity;
    state.glass.highlightIntensity = preset.highlightIntensity;
    state.glass.cornerRadius = preset.cornerRadius;
    state.glass.components = clone(preset.components);
  }

  function getAllProfiles() {
    return [...BUILTIN_PROFILES, ...state.userProfiles];
  }

  function applyProfileById(profileId) {
    const all = getAllProfiles();
    const prof = all.find(p => p.id === profileId || p.name.toLowerCase() === String(profileId).toLowerCase());
    if (!prof) return false;
    state.activeProfileId = prof.id;
    state.enabled = true;

    if (prof.snapshot) {
      // Full user profile snapshot
      const snap = prof.snapshot;
      if (snap.wallpaper) state.wallpaper = validateState({ wallpaper: snap.wallpaper }).wallpaper;
      if (snap.glass) state.glass = validateState({ glass: snap.glass }).glass;
      if (snap.fonts) state.fonts = validateState({ fonts: snap.fonts }).fonts;
      if (snap.colors) state.colors = validateState({ colors: snap.colors }).colors;
      if (snap.animations) state.animations = validateState({ animations: snap.animations }).animations;
      if (snap.performanceProfile) state.performanceProfile = snap.performanceProfile;
    } else {
      // Built-in preset profile
      if (prof.asciiTheme && state.wallpaper.source === 'ascii') {
        state.wallpaper.asciiTheme = prof.asciiTheme;
        window.__agyAsciiBridge?.select?.(prof.asciiTheme);
      } else if (prof.asciiTheme && state.wallpaper.source === 'off') {
        state.wallpaper.source = 'ascii';
        state.wallpaper.asciiTheme = prof.asciiTheme;
        window.__agyAsciiBridge?.select?.(prof.asciiTheme);
      }
      if (prof.glassPreset) {
        applyGlassPreset(prof.glassPreset);
      }
      if (prof.colors) {
        state.colors = { ...state.colors, ...clone(prof.colors) };
      }
    }
    void applyAllCustomizations(true);
    renderStudioTab();
    return true;
  }

  function captureCurrentSnapshot() {
    return {
      wallpaper: clone(state.wallpaper),
      glass: clone(state.glass),
      fonts: clone(state.fonts),
      colors: clone(state.colors),
      animations: clone(state.animations),
      performanceProfile: state.performanceProfile
    };
  }

  function createUserProfile(name) {
    const clean = String(name || '').trim().slice(0, 48) || ('Custom Profile ' + (state.userProfiles.length + 1));
    const id = 'prof_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    const prof = {
      id,
      name: clean,
      builtin: false,
      desc: `${ GLASS_PRESETS[state.glass.preset]?.name || 'Custom' } · ${ state.wallpaper.source.toUpperCase() }`,
      createdAt: new Date().toISOString(),
      snapshot: captureCurrentSnapshot()
    };
    state.userProfiles.unshift(prof);
    state.activeProfileId = id;
    void storageBackend.save();
    return prof;
  }

  function duplicateProfile(profileId) {
    const src = getAllProfiles().find(p => p.id === profileId);
    if (!src) return null;
    const prevId = state.activeProfileId;
    applyProfileById(src.id);
    const copy = createUserProfile(src.name + ' (Copy)');
    if (!copy) state.activeProfileId = prevId;
    return copy;
  }

  function renameUserProfile(profileId, newName) {
    const p = state.userProfiles.find(x => x.id === profileId);
    if (!p || !newName || !newName.trim()) return false;
    p.name = newName.trim().slice(0, 48);
    void storageBackend.save();
    return true;
  }

  function deleteUserProfile(profileId) {
    const idx = state.userProfiles.findIndex(x => x.id === profileId);
    if (idx < 0) return false;
    state.userProfiles.splice(idx, 1);
    if (state.activeProfileId === profileId) state.activeProfileId = 'dark-liquid-glass';
    void storageBackend.save();
    return true;
  }

  function exportProfileJson(profileId) {
    const p = getAllProfiles().find(x => x.id === (profileId || state.activeProfileId));
    const payload = {
      format: 'antigravity-liquid-glass-profile.v2',
      exportedAt: new Date().toISOString(),
      profile: p && !p.builtin ? p : {
        id: 'exported_' + Date.now().toString(36),
        name: (p?.name || 'Custom Liquid Glass'),
        builtin: false,
        desc: p?.desc || 'Exported Antigravity Appearance Studio profile',
        snapshot: captureCurrentSnapshot()
      }
    };
    return JSON.stringify(payload, null, 2);
  }

  function importProfileJson(rawText) {
    const parsed = JSON.parse(rawText);
    const profData = parsed?.profile || parsed;
    if (!profData || typeof profData !== 'object') throw Error('Invalid profile JSON');
    const snap = profData.snapshot || profData;
    const validated = validateState(snap);
    const id = 'prof_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    const item = {
      id,
      name: String(profData.name || 'Imported Profile').trim().slice(0, 48),
      builtin: false,
      desc: String(profData.desc || 'Imported appearance profile').slice(0, 96),
      createdAt: new Date().toISOString(),
      snapshot: {
        wallpaper: validated.wallpaper,
        glass: validated.glass,
        fonts: validated.fonts,
        colors: validated.colors,
        animations: validated.animations,
        performanceProfile: validated.performanceProfile
      }
    };
    state.userProfiles.unshift(item);
    applyProfileById(item.id);
    return item;
  }

  // Antigravity Appearance Studio UI Construction (Section 6)
  const STUDIO_CATEGORIES = [
    { id: 'overview', num: '01', name: 'Overview' },
    { id: 'wallpapers', num: '02', name: 'Wallpaper Manager' },
    { id: 'glass', num: '03', name: 'Glass Effects' },
    { id: 'fonts', num: '04', name: 'Font Manager' },
    { id: 'colors', num: '05', name: 'Colors & Themes' },
    { id: 'animations', num: '06', name: 'Animation Settings' },
    { id: 'library', num: '07', name: 'Wallpaper Library' },
    { id: 'profiles', num: '08', name: 'Theme Profiles' },
    { id: 'performance', num: '09', name: 'Performance' },
    { id: 'restore', num: '10', name: 'Restore Defaults' }
  ];

  const studioIconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 2.5 14.4 8l5.6.8-4 4 .9 5.7-4.9-2.6L7.1 18.5 8 12.8 4 8.8 9.6 8 12 2.5Z"/></svg>';

  function el(tag, attrs = {}, text = '') {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null) continue;
      node.setAttribute(k, String(v));
    }
    if (text) node.textContent = text;
    return node;
  }

  function showToast(msg) {
    if (!studioShadow) return;
    const toast = studioShadow.querySelector('.studio-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function currentSummaryText() {
    if (!state.enabled || state.wallpaper.source === 'off') return 'Stock Antigravity (Off)';
    const presetName = GLASS_PRESETS[state.glass.preset]?.name || 'Liquid Glass';
    let wpName = 'ASCII: ' + state.wallpaper.asciiTheme;
    if (state.wallpaper.source !== 'ascii') {
      const item = library.wallpapers.find(x => x.id === state.wallpaper.assetId);
      wpName = `${state.wallpaper.source.toUpperCase()}: ${item ? item.name : 'Custom'}`;
    }
    return `${presetName} · ${wpName}`;
  }

  function updateStudioStatusUI() {
    if (!studioShadow) return;
    const badge = studioShadow.querySelector('.current-indicator');
    if (badge) badge.textContent = currentSummaryText();
    const autoBox = studioShadow.querySelector('.autosave-check');
    if (autoBox) autoBox.checked = Boolean(state.autoSave);
  }

  function positionStudioTrigger() {
    if (!studioShadow) return;
    const btn = studioShadow.querySelector('.studio-trigger');
    if (!btn) return;
    const bridge = window.__agyAsciiBridge;
    const asciiShadow = bridge?.getElements?.()?.shadow;
    const themesBtn = asciiShadow?.querySelector?.('.trigger');
    const quotaChip = asciiShadow?.querySelector?.('.quota');
    if (quotaChip && !quotaChip.hidden) {
      const r = quotaChip.getBoundingClientRect();
      if (r.width > 0 && r.left >= (window.innerWidth - 420)) {
        btn.style.top = Math.round(r.top) + 'px';
        btn.style.right = Math.max(220, Math.min(380, Math.round(window.innerWidth - r.left + 6))) + 'px';
        return;
      }
    }
    if (themesBtn) {
      const r = themesBtn.getBoundingClientRect();
      if (r.width > 0 && r.left >= (window.innerWidth - 350)) {
        btn.style.top = Math.round(r.top) + 'px';
        btn.style.right = Math.max(200, Math.min(350, Math.round(window.innerWidth - r.left + 6))) + 'px';
        return;
      }
    }
    btn.style.top = '5px';
    btn.style.right = '275px';
  }

  function toggleStudio(openState) {
    studioOpen = typeof openState === 'boolean' ? openState : !studioOpen;
    if (!studioShadow) return;
    const modal = studioShadow.querySelector('.studio-backdrop');
    const trigger = studioShadow.querySelector('.studio-trigger');
    if (!modal) return;
    if (studioOpen) {
      sessionSnapshot = clone(state);
      window.__agyAsciiBridge?.toggle?.(false, false);
      modal.hidden = false;
      trigger?.setAttribute('aria-expanded', 'true');
      renderStudioTab();
      updateStudioStatusUI();
    } else {
      modal.hidden = true;
      trigger?.setAttribute('aria-expanded', 'false');
    }
  }

  async function readFileAsStaged(file, category) {
    if (!file) return null;
    let sourcePath = null;
    try {
      if (webUtils?.getPathForFile) {
        sourcePath = webUtils.getPathForFile(file) || null;
      }
    } catch {}
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const name = file.name || (category === 'font' ? 'font.ttf' : 'wallpaper.png');
    const ext = (name.toLowerCase().match(/\.[a-z0-9]+$/) || [''])[0];
    let kind = 'static';
    if (ext === '.gif') kind = 'gif';
    else if (ext === '.mp4' || ext === '.webm') kind = 'video';
    else if (ext === '.webp' && detectAnimatedWebpClient(bytes)) kind = 'webp';
    const mime = file.type || (kind === 'video' ? 'video/' + ext.slice(1) : 'image/' + (ext === '.jpg' ? 'jpeg' : ext.slice(1)));
    const previewUrl = category === 'wallpaper' ? URL.createObjectURL(new Blob([bytes], { type: mime })) : null;
    let width = 0, height = 0;
    if (category === 'wallpaper' && previewUrl && kind !== 'video' && typeof Image !== 'undefined') {
      try {
        const probe = new Image();
        probe.src = previewUrl;
        await probe.decode?.().catch?.(() => {});
        width = probe.naturalWidth || 0;
        height = probe.naturalHeight || 0;
      } catch {}
    }
    return { file, name, ext, kind, mime, bytes, sourcePath, previewUrl, category, width, height };
  }

  async function commitStagedWallpaper(applyNow = true) {
    if (!stagedUpload) return null;
    try {
      const item = await storageBackend.uploadAsset({
        category: 'wallpaper',
        name: stagedUpload.name,
        mime: stagedUpload.mime,
        bytes: stagedUpload.bytes,
        sourcePath: stagedUpload.sourcePath,
        forceKind: stagedUpload.kind
      });
      if (stagedUpload.previewUrl) {
        try { URL.revokeObjectURL(stagedUpload.previewUrl); } catch {}
      }
      stagedUpload = null;
      if (applyNow && item) {
        state.enabled = true;
        state.wallpaper.source = item.kind;
        state.wallpaper.assetId = item.id;
        await applyAllCustomizations(true);
        showToast(`Applied ${item.kind.toUpperCase()} wallpaper: ${item.name}`);
      } else if (item) {
        showToast(`Saved "${item.name}" to Wallpaper Library`);
      }
      renderStudioTab();
      return item;
    } catch (err) {
      showToast('Upload error: ' + (err?.message || String(err)));
      return null;
    }
  }

  async function handleDirectFontUpload(file) {
    try {
      const staged = await readFileAsStaged(file, 'font');
      if (!staged) return null;
      const item = await storageBackend.uploadAsset({
        category: 'font',
        name: staged.name,
        mime: staged.mime,
        bytes: staged.bytes,
        sourcePath: staged.sourcePath
      });
      if (item) {
        state.fonts.enabled = true;
        state.fonts.main = item.id;
        state.fonts.conversation = item.id;
        await applyAllCustomizations(true);
        showToast(`Installed & applied font: ${item.name}`);
        renderStudioTab();
      }
      return item;
    } catch (err) {
      showToast('Font upload failed: ' + (err?.message || String(err)));
      return null;
    }
  }

  function makeSliderRow(label, value, min, max, step, unit, onChange) {
    const row = el('div', { class: 'ctrl-row' });
    const lbl = el('span', { class: 'ctrl-label' }, label);
    const valSpan = el('span', { class: 'ctrl-val' }, `${value}${unit}`);
    const input = el('input', { type: 'range', class: 'ctrl-slider', min, max, step, value });
    input.addEventListener('input', () => {
      const num = step < 1 ? Number(parseFloat(input.value).toFixed(2)) : Number(input.value);
      valSpan.textContent = `${num}${unit}`;
      onChange(num);
    });
    row.append(lbl, input, valSpan);
    return row;
  }

  function makeToggleRow(label, desc, checked, onChange) {
    const row = el('label', { class: 'toggle-row' });
    const textWrap = el('div', { class: 'toggle-text' });
    textWrap.append(el('strong', {}, label));
    if (desc) textWrap.append(el('span', { class: 'muted' }, desc));
    const box = el('input', { type: 'checkbox' });
    box.checked = Boolean(checked);
    box.addEventListener('change', () => onChange(box.checked));
    row.append(textWrap, box);
    return row;
  }

  function renderStudioTab() {
    if (!studioShadow) return;
    const body = studioShadow.querySelector('.studio-content');
    if (!body) return;
    body.replaceChildren();

    studioShadow.querySelectorAll('.nav-btn').forEach(btn => {
      btn.setAttribute('aria-selected', String(btn.dataset.tab === activeTab));
    });

    const w = state.wallpaper;
    const g = state.glass;
    const f = state.fonts;
    const c = state.colors;
    const a = state.animations;
    const bridge = window.__agyAsciiBridge;
    const asciiThemes = bridge?.themes || [];

    // 1. OVERVIEW
    if (activeTab === 'overview') {
      const hero = el('div', { class: 'card hero-card' });
      hero.append(
        el('div', { class: 'card-kicker' }, 'ANTIGRAVITY ULTIMATE PERSONALIZATION MOD'),
        el('h3', {}, 'Liquid Glass & Custom Wallpaper Engine'),
        el('p', { class: 'muted' }, 'Customize your live Antigravity desktop environment with custom static/GIF/WEBP/MP4/WEBM wallpapers, 50 procedural ASCII scenes, 5 multi-layered Liquid Glass presets, per-component blur & transparency, custom uploaded fonts, and theme profiles.')
      );

      const stats = el('div', { class: 'grid-3' });
      const mkStat = (title, val, sub, targetTab) => {
        const box = el('button', { type: 'button', class: 'stat-card' });
        box.append(el('span', { class: 'muted' }, title), el('strong', {}, val), el('span', { class: 'stat-sub' }, sub));
        box.addEventListener('click', () => { activeTab = targetTab; renderStudioTab(); });
        return box;
      };
      stats.append(
        mkStat('Active Wallpaper', w.source.toUpperCase(), w.source === 'ascii' ? `Scene: ${w.asciiTheme}` : (library.wallpapers.find(x => x.id === w.assetId)?.name || 'Custom Media'), 'wallpapers'),
        mkStat('Glass Engine', GLASS_PRESETS[g.preset]?.name || 'Liquid Glass', `Blur ${g.blur}px · Transp ${g.transparency}%`, 'glass'),
        mkStat('Typography & Colors', f.enabled ? f.main : 'System Default', c.enabled ? `Custom (${c.mode.toUpperCase()})` : 'Scene Synced', 'fonts')
      );

      const quickPresets = el('div', { class: 'card' });
      quickPresets.append(el('h4', {}, 'Quick Glass Preset Switcher'));
      const presetRow = el('div', { class: 'pill-grid' });
      for (const p of Object.values(GLASS_PRESETS)) {
        const b = el('button', { type: 'button', class: 'preset-pill', 'aria-pressed': String(g.preset === p.id) });
        b.append(el('strong', {}, p.name), el('span', { class: 'muted' }, `${p.transparency}% transp · ${p.blur}px blur`));
        b.addEventListener('click', () => {
          applyGlassPreset(p.id);
          void applyAllCustomizations(true);
          renderStudioTab();
        });
        presetRow.append(b);
      }
      quickPresets.append(presetRow);

      const quickProfiles = el('div', { class: 'card' });
      quickProfiles.append(el('h4', {}, 'Instant Theme Profiles'));
      const profGrid = el('div', { class: 'pill-grid' });
      for (const prof of getAllProfiles().slice(0, 6)) {
        const b = el('button', { type: 'button', class: 'preset-pill', 'aria-pressed': String(state.activeProfileId === prof.id) });
        b.append(el('strong', {}, prof.name), el('span', { class: 'muted' }, prof.desc));
        b.addEventListener('click', () => applyProfileById(prof.id));
        profGrid.append(b);
      }
      quickProfiles.append(profGrid);

      body.append(hero, stats, quickPresets, quickProfiles);
      return;
    }

    // 2. WALLPAPER MANAGER
    if (activeTab === 'wallpapers') {
      const srcCard = el('div', { class: 'card' });
      srcCard.append(el('h4', {}, 'Wallpaper Mode & Source'));
      const modeRow = el('div', { class: 'seg-row' });
      const modes = [
        ['ascii', '1. ASCII Animated'],
        ['static', '2. Static Image'],
        ['gif', '3. Animated GIF'],
        ['webp', '4. Animated WEBP'],
        ['video', '5. Video (MP4/WEBM)'],
        ['off', 'Off (Stock)']
      ];
      for (const [mId, mName] of modes) {
        const btn = el('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(w.source === mId) }, mName);
        btn.addEventListener('click', () => {
          state.enabled = mId !== 'off';
          w.source = mId;
          if (mId !== 'ascii' && mId !== 'off' && !w.assetId) {
            const match = library.wallpapers.find(x => x.kind === mId) || library.wallpapers[0];
            if (match) w.assetId = match.id;
          }
          void applyAllCustomizations(true);
          renderStudioTab();
        });
        modeRow.append(btn);
      }
      srcCard.append(modeRow);

      // Upload & Drag-and-Drop Card with Preview-Before-Applying
      const upCard = el('div', { class: 'card' });
      upCard.append(el('h4', {}, 'Upload Custom Wallpaper (JPG, JPEG, PNG, WEBP, GIF, MP4, WEBM)'));
      const dropzone = el('div', { class: 'dropzone' });
      const fileInput = el('input', { type: 'file', accept: '.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,image/*,video/mp4,video/webm', hidden: '' });
      dropzone.append(
        el('strong', {}, 'Drag & Drop Wallpaper File Here'),
        el('span', { class: 'muted' }, 'Supports Static (JPG, JPEG, PNG, WEBP), Animated GIF, Animated WEBP, and Video (MP4, WEBM)'),
        el('button', { type: 'button', class: 'btn-secondary' }, 'Browse Local Files')
      );
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', async e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer?.files?.[0];
        if (file) {
          stagedUpload = await readFileAsStaged(file, 'wallpaper');
          renderStudioTab();
        }
      });
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (file) {
          stagedUpload = await readFileAsStaged(file, 'wallpaper');
          renderStudioTab();
        }
      });
      upCard.append(dropzone, fileInput);

      if (stagedUpload) {
        const stageBox = el('div', { class: 'staged-preview' });
        const dimNotice = stagedUpload.width && stagedUpload.height
          ? ` · ${stagedUpload.width}×${stagedUpload.height} px ${stagedUpload.width < 1920 ? '(Low-Res preview: may look pixelated when stretched to full screen)' : '(Full HD / High-Res ✓)'}`
          : '';
        stageBox.append(el('strong', {}, `Preview Before Applying: ${stagedUpload.name} (${stagedUpload.kind.toUpperCase()})${dimNotice}`));
        if (stagedUpload.kind === 'video') {
          const v = el('video', { src: stagedUpload.previewUrl, autoplay: '', loop: '', muted: '', playsinline: '', class: 'staged-media' });
          v.muted = true;
          stageBox.append(v);
        } else {
          stageBox.append(el('img', { src: stagedUpload.previewUrl, class: 'staged-media', alt: stagedUpload.name }));
        }
        const kindSelRow = el('div', { class: 'inline-actions' });
        for (const k of ['static', 'gif', 'webp', 'video']) {
          const kb = el('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(stagedUpload.kind === k) }, `Type: ${k.toUpperCase()}`);
          kb.addEventListener('click', () => { stagedUpload.kind = k; renderStudioTab(); });
          kindSelRow.append(kb);
        }
        const actRow = el('div', { class: 'inline-actions' });
        const applyBtn = el('button', { type: 'button', class: 'btn-primary' }, 'Apply Wallpaper Now');
        applyBtn.addEventListener('click', () => commitStagedWallpaper(true));
        const saveLibBtn = el('button', { type: 'button', class: 'btn-secondary' }, 'Save to Library Only');
        saveLibBtn.addEventListener('click', () => commitStagedWallpaper(false));
        const discardBtn = el('button', { type: 'button', class: 'btn-ghost' }, 'Discard Preview');
        discardBtn.addEventListener('click', () => {
          if (stagedUpload?.previewUrl) try { URL.revokeObjectURL(stagedUpload.previewUrl); } catch {}
          stagedUpload = null;
          renderStudioTab();
        });
        actRow.append(applyBtn, saveLibBtn, discardBtn);
        stageBox.append(kindSelRow, actRow);
        upCard.append(stageBox);
      }

      // Positioning & Playback Card
      const posCard = el('div', { class: 'card' });
      posCard.append(el('h4', {}, 'Positioning & Playback Controls'));
      const fitRow = el('div', { class: 'seg-row' });
      for (const fit of ['cover', 'contain', 'stretch', 'center', 'tile']) {
        const fb = el('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(w.fit === fit) }, fit.toUpperCase());
        fb.addEventListener('click', () => { w.fit = fit; void applyAllCustomizations(true); renderStudioTab(); });
        fitRow.append(fb);
      }
      posCard.append(fitRow);
      posCard.append(
        makeToggleRow('Enable Animated Wallpapers', 'Master switch for ASCII, GIF, Animated WEBP, and Video playback', w.enableAnimated, val => {
          w.enableAnimated = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Pause Wallpaper Playback', 'Freeze current animation or video frame immediately', w.paused, val => {
          w.paused = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Pause When Window Minimized or Inactive', 'Saves CPU/GPU when Antigravity is in the background', w.pauseWhenUnfocused, val => {
          w.pauseWhenUnfocused = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Mute Video Audio', 'Keep MP4/WEBM video wallpapers silent', w.muted, val => {
          w.muted = val; void applyAllCustomizations(true); renderStudioTab();
        }),
        makeSliderRow('Video Volume', w.volume, 0, 100, 1, '%', val => { w.volume = val; void applyAllCustomizations(true); }),
        makeSliderRow('Playback Speed', w.playbackRate, 0.25, 2.0, 0.05, 'x', val => { w.playbackRate = val; void applyAllCustomizations(true); })
      );

      // Wallpaper Effects & Overlays Card
      const fxCard = el('div', { class: 'card' });
      fxCard.append(
        el('h4', {}, 'Wallpaper Effects & Overlays (Live Preview)'),
        makeSliderRow('Brightness', w.brightness, 20, 200, 1, '%', val => { w.brightness = val; void applyAllCustomizations(true); }),
        makeSliderRow('Contrast', w.contrast, 20, 200, 1, '%', val => { w.contrast = val; void applyAllCustomizations(true); }),
        makeSliderRow('Saturation', w.saturation, 0, 250, 1, '%', val => { w.saturation = val; void applyAllCustomizations(true); }),
        makeSliderRow('Background Blur', w.blur, 0, 50, 1, 'px', val => { w.blur = val; void applyAllCustomizations(true); }),
        makeSliderRow('Wallpaper Opacity', w.opacity, 5, 100, 1, '%', val => { w.opacity = val; void applyAllCustomizations(true); }),
        makeSliderRow('Background Dimming', w.dimming, 0, 90, 1, '%', val => { w.dimming = val; void applyAllCustomizations(true); }),
        makeSliderRow('Background Scale', w.scale, 50, 200, 1, '%', val => { w.scale = val; void applyAllCustomizations(true); }),
        makeSliderRow('Horizontal Position (X)', w.posX, 0, 100, 1, '%', val => { w.posX = val; void applyAllCustomizations(true); }),
        makeSliderRow('Vertical Position (Y)', w.posY, 0, 100, 1, '%', val => { w.posY = val; void applyAllCustomizations(true); })
      );

      const ovRow = el('div', { class: 'seg-row' });
      for (const [oId, oLabel] of [['none', 'No Overlay'], ['dark', 'Dark Overlay'], ['light', 'Light Overlay'], ['solid', 'Solid Color'], ['gradient', 'Custom Gradient']]) {
        const ob = el('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(w.overlayType === oId) }, oLabel);
        ob.addEventListener('click', () => { w.overlayType = oId; void applyAllCustomizations(true); renderStudioTab(); });
        ovRow.append(ob);
      }
      fxCard.append(ovRow);
      if (w.overlayType !== 'none') {
        fxCard.append(
          makeSliderRow('Overlay Intensity', w.overlayOpacity, 0, 95, 1, '%', val => { w.overlayOpacity = val; void applyAllCustomizations(true); }),
          makeSliderRow('Gradient Angle', w.overlayAngle, 0, 360, 5, '°', val => { w.overlayAngle = val; void applyAllCustomizations(true); })
        );
        const colRow = el('div', { class: 'inline-actions' });
        const c1 = el('input', { type: 'color', value: w.overlayColor1 });
        c1.addEventListener('input', () => { w.overlayColor1 = c1.value; void applyAllCustomizations(true); });
        const c2 = el('input', { type: 'color', value: w.overlayColor2 });
        c2.addEventListener('input', () => { w.overlayColor2 = c2.value; void applyAllCustomizations(true); });
        colRow.append(el('span', { class: 'muted' }, 'Overlay Color 1:'), c1, el('span', { class: 'muted' }, 'Overlay Color 2:'), c2);
        fxCard.append(colRow);
      }

      body.append(srcCard, upCard, posCard, fxCard);
      return;
    }

    // 3. GLASS EFFECTS
    if (activeTab === 'glass') {
      const presetCard = el('div', { class: 'card' });
      presetCard.append(el('h4', {}, 'Five Selectable Liquid Glass Presets'));
      const pGrid = el('div', { class: 'pill-grid' });
      for (const p of Object.values(GLASS_PRESETS)) {
        const b = el('button', { type: 'button', class: 'preset-pill', 'aria-pressed': String(g.preset === p.id) });
        b.append(el('strong', {}, p.name), el('span', { class: 'muted' }, p.tagline));
        b.addEventListener('click', () => {
          applyGlassPreset(p.id);
          void applyAllCustomizations(true);
          renderStudioTab();
        });
        pGrid.append(b);
      }
      presetCard.append(pGrid);

      const globalCard = el('div', { class: 'card' });
      globalCard.append(
        el('h4', {}, 'Global Glass Rendering Controls'),
        makeToggleRow('Enable Liquid Glass Engine', 'Apply multi-layered backdrop blur, specular edges & glass surfaces', g.enabled, val => {
          g.enabled = val; void applyAllCustomizations(true);
        }),
        makeSliderRow('Master Transparency', g.transparency, 0, 100, 1, '%', val => {
          g.transparency = val;
          for (const k of Object.keys(g.components)) g.components[k].transparency = val;
          void applyAllCustomizations(true);
          renderStudioTab();
        }),
        makeSliderRow('Master Background Blur', g.blur, 0, 50, 1, 'px', val => {
          g.blur = val;
          for (const k of Object.keys(g.components)) g.components[k].blur = val;
          void applyAllCustomizations(true);
          renderStudioTab();
        }),
        makeSliderRow('Glass Brightness', g.brightness, 50, 150, 1, '%', val => { g.brightness = val; void applyAllCustomizations(true); }),
        makeSliderRow('Glass Saturation', g.saturation, 50, 250, 1, '%', val => { g.saturation = val; void applyAllCustomizations(true); }),
        makeSliderRow('Border Opacity', g.borderOpacity, 0, 100, 1, '%', val => { g.borderOpacity = val; void applyAllCustomizations(true); }),
        makeSliderRow('Shadow Intensity', g.shadowIntensity, 0, 100, 1, '%', val => { g.shadowIntensity = val; void applyAllCustomizations(true); }),
        makeSliderRow('Reflection Intensity', g.reflectionIntensity, 0, 100, 1, '%', val => { g.reflectionIntensity = val; void applyAllCustomizations(true); }),
        makeSliderRow('Highlight Intensity', g.highlightIntensity, 0, 100, 1, '%', val => { g.highlightIntensity = val; void applyAllCustomizations(true); }),
        makeSliderRow('Corner Radius', g.cornerRadius, 0, 28, 1, 'px', val => { g.cornerRadius = val; void applyAllCustomizations(true); })
      );

      const compCard = el('div', { class: 'card' });
      compCard.append(el('h4', {}, 'Independent Component Glass Controls (9 Surface Layers)'));
      for (const comp of GLASS_COMPONENTS) {
        const cState = g.components[comp.id];
        const block = el('div', { class: 'comp-glass-block' });
        const head = el('div', { class: 'comp-glass-head' });
        head.append(el('strong', {}, comp.name), el('span', { class: 'muted' }, comp.desc));
        const enBox = el('input', { type: 'checkbox' });
        enBox.checked = cState.enabled !== false;
        enBox.addEventListener('change', () => { cState.enabled = enBox.checked; void applyAllCustomizations(true); });
        head.append(enBox);
        block.append(
          head,
          makeSliderRow(`${comp.name} Transparency`, cState.transparency, 0, 100, 1, '%', val => { cState.transparency = val; void applyAllCustomizations(true); }),
          makeSliderRow(`${comp.name} Blur`, cState.blur, 0, 50, 1, 'px', val => { cState.blur = val; void applyAllCustomizations(true); })
        );
        compCard.append(block);
      }

      body.append(presetCard, globalCard, compCard);
      return;
    }

    // 4. FONT MANAGER
    if (activeTab === 'fonts') {
      const upCard = el('div', { class: 'card' });
      upCard.append(el('h4', {}, 'Upload Custom Fonts (TTF, OTF, WOFF, WOFF2)'));
      const dropzone = el('div', { class: 'dropzone' });
      const fontInput = el('input', { type: 'file', accept: '.ttf,.otf,.woff,.woff2', hidden: '' });
      dropzone.append(
        el('strong', {}, 'Drag & Drop Font File Here (.ttf, .otf, .woff, .woff2)'),
        el('span', { class: 'muted' }, 'Fonts are stored persistently in %APPDATA%\\Antigravity and loaded via FontFace API'),
        el('button', { type: 'button', class: 'btn-secondary' }, 'Select Font File')
      );
      dropzone.addEventListener('click', () => fontInput.click());
      dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer?.files?.[0]) void handleDirectFontUpload(e.dataTransfer.files[0]);
      });
      fontInput.addEventListener('change', () => {
        if (fontInput.files?.[0]) void handleDirectFontUpload(fontInput.files[0]);
      });
      upCard.append(dropzone, fontInput);

      const allFontOptions = [
        ...BUILTIN_FONTS.map(b => ({ value: b.id, label: `${b.name} (Built-in)` })),
        ...library.fonts.map(u => ({ value: u.id, label: `${u.name} (${u.ext.toUpperCase()})` }))
      ];

      const typoCard = el('div', { class: 'card' });
      typoCard.append(
        el('h4', {}, 'Independent Component Typography & Font Assignment'),
        makeToggleRow('Enable Custom Typography Engine', 'Apply custom font families, sizing, weights & spacing across Antigravity', f.enabled, val => {
          f.enabled = val; void applyAllCustomizations(true); renderStudioTab();
        })
      );

      const targets = [
        ['main', 'Main Application Font'],
        ['sidebar', 'Sidebar Font'],
        ['heading', 'Heading Font'],
        ['conversation', 'Conversation Font'],
        ['code', 'Code Editor Font']
      ];
      for (const [tKey, tLabel] of targets) {
        const row = el('div', { class: 'ctrl-row' });
        row.append(el('span', { class: 'ctrl-label' }, tLabel));
        const sel = el('select', { class: 'ctrl-select' });
        for (const opt of allFontOptions) {
          const o = el('option', { value: opt.value }, opt.label);
          if (f[tKey] === opt.value) o.selected = true;
          sel.append(o);
        }
        sel.addEventListener('change', () => {
          f.enabled = true;
          f[tKey] = sel.value;
          void applyAllCustomizations(true);
          renderStudioTab();
        });
        row.append(sel);
        typoCard.append(row);
      }

      typoCard.append(
        makeSliderRow('Conversation Font Size', f.sizePx, 11, 22, 1, 'px', val => { f.enabled = true; f.sizePx = val; void applyAllCustomizations(true); }),
        makeSliderRow('Font Weight', Number(f.weight), 300, 700, 100, '', val => { f.enabled = true; f.weight = String(val); void applyAllCustomizations(true); }),
        makeSliderRow('Letter Spacing', f.letterSpacingEm, -0.05, 0.12, 0.01, 'em', val => { f.enabled = true; f.letterSpacingEm = val; void applyAllCustomizations(true); }),
        makeSliderRow('Line Height', f.lineHeight, 1.1, 2.0, 0.05, '', val => { f.enabled = true; f.lineHeight = val; void applyAllCustomizations(true); })
      );

      const previewSpecimen = el('div', { class: 'font-specimen', style: `font-family: ${resolveFontStack(f.main)}; font-size: ${f.sizePx}px; font-weight: ${f.weight}; letter-spacing: ${f.letterSpacingEm}em; line-height: ${f.lineHeight};` });
      previewSpecimen.append(
        el('strong', {}, 'Live Typography Specimen — Antigravity Liquid Glass'),
        el('p', {}, 'The quick brown fox jumps over the lazy dog · 0123456789'),
        el('code', { style: `font-family: ${resolveFontStack(f.code, true)}; display:block; margin-top:6px;` }, 'const liquidGlass = new AppearanceStudio({ blur: 20, transparency: 65 });')
      );
      typoCard.append(previewSpecimen);

      if (library.fonts.length > 0) {
        const libCard = el('div', { class: 'card' });
        libCard.append(el('h4', {}, `Uploaded Font Library (${library.fonts.length})`));
        for (const item of library.fonts) {
          const r = el('div', { class: 'lib-list-row' });
          r.append(el('strong', {}, item.name), el('span', { class: 'muted' }, item.ext.toUpperCase()));
          const useBtn = el('button', { type: 'button', class: 'btn-secondary' }, 'Apply to Main');
          useBtn.addEventListener('click', () => { f.enabled = true; f.main = item.id; f.conversation = item.id; void applyAllCustomizations(true); renderStudioTab(); });
          const delBtn = el('button', { type: 'button', class: 'btn-ghost' }, 'Remove');
          delBtn.addEventListener('click', async () => {
            await storageBackend.deleteAsset('font', item.id);
            await applyAllCustomizations(true);
            renderStudioTab();
          });
          r.append(useBtn, delBtn);
          libCard.append(r);
        }
        body.append(upCard, typoCard, libCard);
      } else {
        body.append(upCard, typoCard);
      }
      return;
    }

    // 5. COLORS & THEMES
    if (activeTab === 'colors') {
      const colCard = el('div', { class: 'card' });
      colCard.append(
        el('h4', {}, 'Custom Color & Theme Engine'),
        makeToggleRow('Enable Custom Color Override', 'Override scene colors with your own custom HEX palette', c.enabled, val => {
          c.enabled = val; void applyAllCustomizations(true); renderStudioTab();
        })
      );
      const modeRow = el('div', { class: 'seg-row' });
      for (const [mId, mName] of [['dark', 'Dark Mode'], ['light', 'Light Mode']]) {
        const mb = el('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(c.mode === mId) }, mName);
        mb.addEventListener('click', () => { c.enabled = true; c.mode = mId; void applyAllCustomizations(true); renderStudioTab(); });
        modeRow.append(mb);
      }
      colCard.append(modeRow);

      const colorRoles = [
        ['background', 'Background Color'],
        ['sidebar', 'Sidebar Color'],
        ['panel', 'Main Panel Color'],
        ['composer', 'Composer Color'],
        ['text', 'Text Color'],
        ['accent', 'Accent Color'],
        ['border', 'Border Color'],
        ['menu', 'Menu & Popover Color']
      ];

      const grid = el('div', { class: 'color-grid' });
      for (const [roleKey, roleLabel] of colorRoles) {
        const item = el('div', { class: 'color-item' });
        item.append(el('span', { class: 'ctrl-label' }, roleLabel));
        const pickerWrap = el('div', { class: 'color-inputs' });
        const colorInput = el('input', { type: 'color', value: c[roleKey] });
        const hexInput = el('input', { type: 'text', class: 'hex-input', value: c[roleKey], maxlength: '7' });
        colorInput.addEventListener('input', () => {
          c.enabled = true;
          c[roleKey] = colorInput.value;
          hexInput.value = colorInput.value;
          void applyAllCustomizations(true);
        });
        hexInput.addEventListener('change', () => {
          const v = validHex(hexInput.value, c[roleKey]);
          c.enabled = true;
          c[roleKey] = v;
          colorInput.value = v;
          hexInput.value = v;
          void applyAllCustomizations(true);
        });
        pickerWrap.append(colorInput, hexInput);
        item.append(pickerWrap);
        grid.append(item);
      }
      colCard.append(grid);
      body.append(colCard);
      return;
    }

    // 6. ANIMATION SETTINGS
    if (activeTab === 'animations') {
      const animCard = el('div', { class: 'card' });
      animCard.append(
        el('h4', {}, 'Animation & Visual Transitions'),
        makeToggleRow('Smooth Wallpaper Cross-Fade Transitions', 'Cross-fade smoothly when switching wallpapers or profiles', a.smoothWallpaperTransitions, val => {
          a.smoothWallpaperTransitions = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Panel Fade-In Effects', 'Smooth entrance animation when opening studio and popovers', a.fadeInEffects, val => {
          a.fadeInEffects = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Subtle Hover Highlights', 'Luminous glass border & surface highlight when hovering sidebar rows and buttons', a.hoverAnimations, val => {
          a.hoverAnimations = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Glass Highlight Transitions', 'Smoothly interpolate blur, border, and specular changes', a.glassHighlightTransitions, val => {
          a.glassHighlightTransitions = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Animated Glass Reflections (Shimmer)', 'Gentle slow-moving diagonal light reflection across glass surfaces (High Quality mode)', a.animatedReflections, val => {
          a.animatedReflections = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('React to Running Agents', 'Accelerate ASCII scenes while agents run and pulse when a task completes', a.agentReactive, val => {
          a.agentReactive = val;
          window.__agyAsciiBridge?.setPrefs?.({ reactive: val }, true);
          void applyAllCustomizations(true);
        })
      );
      const osNote = el('div', { class: 'card' });
      osNote.append(
        el('h4', {}, 'Operating System Reduced-Motion Integration'),
        el('p', { class: 'muted' }, `OS prefers-reduced-motion is currently: ${reducedMotionQuery.matches ? 'ACTIVE (Animations automatically toned down)' : 'INACTIVE (Full animations allowed)'}.`)
      );
      body.append(animCard, osNote);
      return;
    }

    // 7. WALLPAPER LIBRARY
    if (activeTab === 'library') {
      const topCard = el('div', { class: 'card' });
      topCard.append(el('h4', {}, `Integrated Wallpaper Gallery (${library.wallpapers.length} Uploaded + ${asciiThemes.length} ASCII Scenes)`));

      const searchInput = el('input', { type: 'search', class: 'text-input', placeholder: 'Search uploaded wallpapers or 50 ASCII scenes...' });
      const filterRow = el('div', { class: 'seg-row' });
      let currentLibFilter = topCard._filter || 'all';
      const filters = [
        ['all', 'All'],
        ['uploaded', 'Uploaded'],
        ['static', 'Static'],
        ['gif', 'GIF'],
        ['webp', 'Anim WEBP'],
        ['video', 'Video'],
        ['ascii', 'ASCII (50)'],
        ['favorites', '★ Favorites']
      ];
      const gridWrap = el('div', { class: 'lib-gallery-grid' });

      const renderGalleryItems = async () => {
        gridWrap.replaceChildren();
        const q = searchInput.value.trim().toLowerCase();

        // Uploaded wallpapers
        for (const item of library.wallpapers) {
          if (currentLibFilter === 'ascii') continue;
          if (currentLibFilter === 'favorites' && !item.favorite) continue;
          if (['static', 'gif', 'webp', 'video'].includes(currentLibFilter) && item.kind !== currentLibFilter) continue;
          if (q && !item.name.toLowerCase().includes(q) && !item.kind.includes(q)) continue;

          const card = el('div', { class: 'lib-card', 'data-active': String(w.source !== 'ascii' && w.assetId === item.id) });
          const thumbWrap = el('div', { class: 'lib-thumb-wrap' });
          const badge = el('span', { class: 'lib-badge' }, item.kind.toUpperCase());
          const asset = await storageBackend.getAssetUrl('wallpaper', item.id);
          if (asset?.url) {
            if (item.kind === 'video') {
              const vid = el('video', { src: asset.url, muted: '', loop: '', playsinline: '', class: 'lib-thumb' });
              vid.muted = true;
              card.addEventListener('pointerenter', () => vid.play?.()?.catch?.(() => {}));
              card.addEventListener('pointerleave', () => vid.pause?.());
              thumbWrap.append(vid);
            } else {
              thumbWrap.append(el('img', { src: asset.url, alt: item.name, class: 'lib-thumb', loading: 'lazy' }));
            }
          }
          if (library.defaultWallpaperId === item.id) {
            thumbWrap.append(el('span', { class: 'lib-default-tag' }, 'DEFAULT'));
          }
          thumbWrap.append(badge);

          const meta = el('div', { class: 'lib-meta' });
          meta.append(el('strong', { class: 'lib-title', title: item.name }, item.name));

          const actions = el('div', { class: 'lib-actions' });
          const useBtn = el('button', { type: 'button', class: 'btn-primary btn-xs' }, 'Apply');
          useBtn.addEventListener('click', () => {
            state.enabled = true;
            w.source = item.kind;
            w.assetId = item.id;
            void applyAllCustomizations(true);
            renderGalleryItems();
          });

          const prevBtn = el('button', { type: 'button', class: 'btn-secondary btn-xs' }, 'Preview');
          prevBtn.addEventListener('click', () => openFullSizePreviewModal(item, asset?.url));

          const favBtn = el('button', { type: 'button', class: 'btn-ghost btn-xs', title: 'Toggle Favorite' }, item.favorite ? '★' : '☆');
          favBtn.addEventListener('click', async () => {
            await storageBackend.updateAsset('wallpaper', { id: item.id, favorite: !item.favorite });
            renderGalleryItems();
          });

          const defBtn = el('button', { type: 'button', class: 'btn-ghost btn-xs', title: 'Set as Default Wallpaper' }, library.defaultWallpaperId === item.id ? 'Default ✓' : 'Set Default');
          defBtn.addEventListener('click', async () => {
            await storageBackend.updateAsset('wallpaper', { id: item.id, setDefault: library.defaultWallpaperId !== item.id });
            renderGalleryItems();
          });

          const renBtn = el('button', { type: 'button', class: 'btn-ghost btn-xs', title: 'Rename' }, 'Rename');
          renBtn.addEventListener('click', async () => {
            const nextName = meta.querySelector('.rename-inline')?.value || prompt?.('Rename wallpaper:', item.name);
            if (nextName && nextName.trim()) {
              await storageBackend.updateAsset('wallpaper', { id: item.id, name: nextName.trim() });
              renderGalleryItems();
            }
          });

          const delBtn = el('button', { type: 'button', class: 'btn-ghost btn-xs', title: 'Delete' }, 'Delete');
          delBtn.addEventListener('click', async () => {
            await storageBackend.deleteAsset('wallpaper', item.id);
            if (w.assetId === item.id) {
              w.assetId = library.wallpapers[0]?.id || null;
              if (!w.assetId) w.source = 'ascii';
              await applyAllCustomizations(true);
            }
            renderGalleryItems();
          });

          actions.append(useBtn, prevBtn, favBtn, defBtn, renBtn, delBtn);
          card.append(thumbWrap, meta, actions);
          gridWrap.append(card);
        }

        // Built-in 50 ASCII Scenes
        if (['all', 'ascii'].includes(currentLibFilter)) {
          for (const t of asciiThemes) {
            if (q && !t.name.toLowerCase().includes(q) && !t.id.includes(q)) continue;
            const card = el('div', { class: 'lib-card', 'data-active': String(w.source === 'ascii' && w.asciiTheme === t.id) });
            const thumbWrap = el('div', { class: 'lib-thumb-wrap' });
            const cvs = el('canvas', { width: '160', height: '100', class: 'lib-thumb' });
            try { bridge?.drawPreview?.(cvs.getContext('2d'), 160, 100, t); } catch {}
            const badge = el('span', { class: 'lib-badge' }, `ASCII · ${t.light ? 'LIGHT' : 'DARK'}`);
            thumbWrap.append(cvs, badge);
            const meta = el('div', { class: 'lib-meta' });
            meta.append(el('strong', { class: 'lib-title' }, t.name));
            const actions = el('div', { class: 'lib-actions' });
            const useBtn = el('button', { type: 'button', class: 'btn-primary btn-xs' }, 'Apply ASCII Scene');
            useBtn.addEventListener('click', () => {
              state.enabled = true;
              w.source = 'ascii';
              w.asciiTheme = t.id;
              bridge?.select?.(t.id);
              void applyAllCustomizations(true);
              renderGalleryItems();
            });
            actions.append(useBtn);
            card.append(thumbWrap, meta, actions);
            gridWrap.append(card);
          }
        }
      };

      for (const [fId, fName] of filters) {
        const fb = el('button', { type: 'button', class: 'seg-btn', 'aria-pressed': String(currentLibFilter === fId) }, fName);
        fb.addEventListener('click', () => {
          currentLibFilter = fId;
          topCard._filter = fId;
          filterRow.querySelectorAll('.seg-btn').forEach(b => b.setAttribute('aria-pressed', String(b === fb)));
          void renderGalleryItems();
        });
        filterRow.append(fb);
      }
      searchInput.addEventListener('input', () => void renderGalleryItems());

      topCard.append(searchInput, filterRow, gridWrap);
      body.append(topCard);
      void renderGalleryItems();
      return;
    }

    // 8. THEME PROFILES
    if (activeTab === 'profiles') {
      const createCard = el('div', { class: 'card' });
      createCard.append(el('h4', {}, 'Create, Import & Export Theme Profiles'));
      const newRow = el('div', { class: 'inline-actions' });
      const nameInput = el('input', { type: 'text', class: 'text-input', placeholder: 'New profile name (e.g. My Cyberpunk Glass)...' });
      const saveProfBtn = el('button', { type: 'button', class: 'btn-primary' }, 'Save Current as Profile');
      saveProfBtn.addEventListener('click', () => {
        const prof = createUserProfile(nameInput.value);
        nameInput.value = '';
        showToast(`Created profile "${prof.name}"`);
        renderStudioTab();
      });
      const exportBtn = el('button', { type: 'button', class: 'btn-secondary' }, 'Export Active JSON');
      const importBtn = el('button', { type: 'button', class: 'btn-secondary' }, 'Import Profile JSON');
      const importFileInput = el('input', { type: 'file', accept: '.json,application/json', hidden: '' });
      newRow.append(nameInput, saveProfBtn, exportBtn, importBtn, importFileInput);

      const ioArea = el('textarea', { class: 'json-area', rows: '4', placeholder: 'Paste profile JSON here to import, or click "Export Active JSON" to view/copy...' });
      const applyJsonBtn = el('button', { type: 'button', class: 'btn-secondary', style: 'margin-top:6px;' }, 'Import from JSON Textbox');
      exportBtn.addEventListener('click', () => {
        const json = exportProfileJson(state.activeProfileId);
        ioArea.value = json;
        try { navigator.clipboard?.writeText?.(json); } catch {}
        showToast('Exported profile JSON (and copied to clipboard)');
      });
      importBtn.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', async () => {
        const fObj = importFileInput.files?.[0];
        if (!fObj) return;
        try {
          const txt = await fObj.text();
          const imported = importProfileJson(txt);
          showToast(`Imported profile "${imported.name}"`);
          renderStudioTab();
        } catch (err) {
          showToast('Import error: ' + (err?.message || String(err)));
        }
      });
      applyJsonBtn.addEventListener('click', () => {
        try {
          const imported = importProfileJson(ioArea.value);
          showToast(`Imported profile "${imported.name}"`);
          renderStudioTab();
        } catch (err) {
          showToast('Invalid profile JSON: ' + (err?.message || String(err)));
        }
      });
      createCard.append(newRow, ioArea, applyJsonBtn);

      const listCard = el('div', { class: 'card' });
      listCard.append(el('h4', {}, 'Available Theme Presets & User Profiles'));
      const profList = el('div', { class: 'prof-list' });
      for (const p of getAllProfiles()) {
        const isDefault = state.defaultProfileId === p.id;
        const row = el('div', { class: 'prof-row', 'data-active': String(state.activeProfileId === p.id) });
        const info = el('div', { class: 'prof-info' });
        info.append(
          el('strong', {}, p.name + (p.builtin ? ' (Preset)' : ' (Custom)') + (isDefault ? ' ★ [Default on Startup]' : '')),
          el('span', { class: 'muted' }, p.desc || 'Custom user profile')
        );
        const acts = el('div', { class: 'inline-actions' });
        const swBtn = el('button', { type: 'button', class: 'btn-primary btn-xs' }, state.activeProfileId === p.id ? 'Active ✓' : 'Activate');
        swBtn.addEventListener('click', () => applyProfileById(p.id));
        const defBtn = el('button', { type: 'button', class: isDefault ? 'btn-ghost btn-xs' : 'btn-secondary btn-xs' }, isDefault ? 'Default ★' : 'Set as Default');
        defBtn.addEventListener('click', () => {
          state.defaultProfileId = p.id;
          void storageBackend.save();
          showToast(`"${p.name}" set as startup preset!`);
          renderStudioTab();
        });
        const dupBtn = el('button', { type: 'button', class: 'btn-secondary btn-xs' }, 'Duplicate');
        dupBtn.addEventListener('click', () => { duplicateProfile(p.id); renderStudioTab(); });
        acts.append(swBtn, defBtn, dupBtn);
        if (!p.builtin) {
          const renInput = el('input', { type: 'text', class: 'hex-input', value: p.name, style: 'width:110px;' });
          renInput.addEventListener('change', () => { renameUserProfile(p.id, renInput.value); renderStudioTab(); });
          const delBtn = el('button', { type: 'button', class: 'btn-ghost btn-xs' }, 'Delete');
          delBtn.addEventListener('click', () => { deleteUserProfile(p.id); renderStudioTab(); });
          acts.append(renInput, delBtn);
        }
        row.append(info, acts);
        profList.append(row);
      }
      listCard.append(profList);
      body.append(createCard, listCard);
      return;
    }

    // 9. PERFORMANCE
    if (activeTab === 'performance') {
      const perfCard = el('div', { class: 'card' });
      perfCard.append(el('h4', {}, 'Performance & Resource Optimization Profiles'));
      const profiles = [
        ['high', 'HIGH QUALITY', 'Maximum backdrop blur (up to 50px), full specular & animated glass reflections, and full-rate animations.'],
        ['balanced', 'BALANCED', 'Caps backdrop blur at 22px, disables continuous shimmer while keeping hover & glass transitions, pauses background animations when unfocused.'],
        ['performance', 'PERFORMANCE MODE', 'Caps backdrop blur at 6px, disables specular reflections & heavy shadows, minimizes GPU compositing overhead during heavy AI/coding workloads.']
      ];
      const pGrid = el('div', { class: 'pill-grid' });
      for (const [pId, pTitle, pDesc] of profiles) {
        const b = el('button', { type: 'button', class: 'preset-pill', 'aria-pressed': String(state.performanceProfile === pId) });
        b.append(el('strong', {}, pTitle), el('span', { class: 'muted' }, pDesc));
        b.addEventListener('click', () => {
          state.performanceProfile = pId;
          void applyAllCustomizations(true);
          renderStudioTab();
        });
        pGrid.append(b);
      }
      perfCard.append(pGrid);
      perfCard.append(
        makeToggleRow('Enable Animated Wallpapers', 'Turn off to freeze all video, GIF, WEBP, and ASCII animations immediately', w.enableAnimated, val => {
          w.enableAnimated = val; void applyAllCustomizations(true);
        }),
        makeToggleRow('Pause Animations When Window Minimized or Unfocused', 'Zero background GPU consumption when working in another window', w.pauseWhenUnfocused, val => {
          w.pauseWhenUnfocused = val; void applyAllCustomizations(true);
        })
      );

      const diagCard = el('div', { class: 'card' });
      diagCard.append(
        el('h4', {}, 'Resource & Storage Diagnostics'),
        el('p', { class: 'muted' }, `Persistent Storage Directory: ${storageDir}`),
        el('p', { class: 'muted' }, `Active ObjectURLs Cached: ${objectUrlCache.size} · Loaded Custom Fonts: ${loadedFontFamilies.size}`),
        el('button', { type: 'button', class: 'btn-secondary' }, 'Release Unused Media ObjectURLs')
      );
      diagCard.querySelector('button').addEventListener('click', () => {
        for (const id of [...objectUrlCache.keys()]) {
          if (id !== activeWallpaperAssetId) revokeAssetUrl(id);
        }
        showToast('Released unused cached media handles');
        renderStudioTab();
      });

      body.append(perfCard, diagCard);
      return;
    }

    // 10. RESTORE DEFAULTS
    if (activeTab === 'restore') {
      const restCard = el('div', { class: 'card' });
      restCard.append(
        el('h4', {}, 'Granular Reset & Full Stock Restoration'),
        el('p', { class: 'muted' }, 'Reset individual customization engines or restore Antigravity to its untouched stock appearance.')
      );
      const btnStack = el('div', { class: 'pill-grid' });
      const mkReset = (title, sub, fn) => {
        const b = el('button', { type: 'button', class: 'preset-pill' });
        b.append(el('strong', {}, title), el('span', { class: 'muted' }, sub));
        b.addEventListener('click', async () => { await fn(); await applyAllCustomizations(true); renderStudioTab(); });
        return b;
      };
      btnStack.append(
        mkReset('Reset Glass Effects to Liquid Glass', 'Restores default Liquid Glass transparency, blur & component sliders', () => {
          applyGlassPreset('liquid');
          showToast('Reset Glass Effects to Liquid Glass default');
        }),
        mkReset('Reset Wallpaper Effects & Overlays', 'Restores 100% brightness/contrast/saturation, 0px blur, and removes overlays', () => {
          const defW = createDefaultState().wallpaper;
          Object.assign(state.wallpaper, {
            brightness: defW.brightness, contrast: defW.contrast, saturation: defW.saturation,
            blur: defW.blur, opacity: defW.opacity, dimming: defW.dimming, scale: defW.scale,
            posX: 50, posY: 50, overlayType: 'none'
          });
          showToast('Reset wallpaper effects & overlays');
        }),
        mkReset('Reset Typography & Fonts', 'Restores Antigravity stock system and editor fonts', () => {
          state.fonts = createDefaultState().fonts;
          showToast('Restored stock typography');
        }),
        mkReset('Reset Custom Colors', 'Disables custom color overrides and syncs with active scene', () => {
          state.colors.enabled = false;
          showToast('Disabled custom color overrides');
        }),
        mkReset('Restore Original Stock Antigravity Appearance', 'Turns off all wallpapers, glass effects, custom fonts, and colors', () => {
          state.enabled = false;
          state.wallpaper.source = 'off';
          window.__agyAsciiBridge?.select?.('off');
          showToast('Restored original stock Antigravity appearance');
        })
      );
      restCard.append(btnStack);
      body.append(restCard);
    }
  }

  function openFullSizePreviewModal(item, mediaUrl) {
    if (!studioShadow || !mediaUrl) return;
    const viewer = studioShadow.querySelector('.full-preview-modal');
    if (!viewer) return;
    viewer.replaceChildren();
    viewer.hidden = false;
    const card = el('div', { class: 'full-preview-card' });
    const head = el('div', { class: 'comp-glass-head' });
    head.append(el('strong', {}, `${item.name} (${item.kind.toUpperCase()})`));
    const closeBtn = el('button', { type: 'button', class: 'btn-secondary btn-xs' }, 'Close Preview');
    closeBtn.addEventListener('click', () => { viewer.hidden = true; viewer.replaceChildren(); });
    head.append(closeBtn);
    const mediaEl = item.kind === 'video'
      ? el('video', { src: mediaUrl, controls: '', autoplay: '', loop: '', class: 'full-preview-media' })
      : el('img', { src: mediaUrl, alt: item.name, class: 'full-preview-media' });
    card.append(head, mediaEl);
    viewer.append(card);
  }

  function injectButtonIntoThemesPanel() {
    const bridge = window.__agyAsciiBridge;
    const asciiShadow = bridge?.getElements?.()?.shadow;
    if (!asciiShadow) return;
    const tools = asciiShadow.querySelector('.header .tools');
    if (tools && !tools.querySelector('.open-studio-btn')) {
      const btn = el('button', {
        class: 'tool open-studio-btn',
        type: 'button',
        title: 'Open Antigravity Appearance Studio (Ctrl+Alt+G)'
      }, 'Studio');
      btn.style.color = 'var(--aw-accent)';
      btn.style.fontWeight = '600';
      btn.addEventListener('click', () => toggleStudio(true));
      tools.prepend(btn);
    }
  }

  function buildStudioDOM() {
    studioHost = el('div', { id: 'agy-appearance-studio-host' });
    document.body.append(studioHost);
    studioShadow = studioHost.attachShadow({ mode: 'open' });

    const css = el('style');
    css.textContent = `
      :host { all: initial; position: fixed; inset: 0; z-index: 2147483001; pointer-events: none; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #eef5ff; }
      * { box-sizing: border-box; }
      [hidden] { display: none !important; }
      button, input, select, textarea { font: inherit; color: inherit; }
      button { cursor: pointer; }
      .studio-trigger {
        position: fixed; top: 5px; right: 228px; height: 25px; padding: 0 9px;
        display: flex; align-items: center; gap: 5px;
        border: 1px solid rgba(110, 231, 255, 0.28); border-radius: 5px;
        background: rgba(12, 22, 38, 0.45); backdrop-filter: blur(12px);
        color: #eef5ff; font-size: 11px; font-weight: 500;
        pointer-events: auto; -webkit-app-region: no-drag;
        transition: background 0.15s, border-color 0.15s;
      }
      .studio-trigger:hover, .studio-trigger[aria-expanded="true"] {
        background: rgba(110, 231, 255, 0.16); border-color: rgba(110, 231, 255, 0.65);
      }
      .studio-backdrop {
        position: fixed; inset: 0; pointer-events: auto; -webkit-app-region: no-drag;
        background: rgba(3, 7, 15, 0.52); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center; padding: 20px;
      }
      .studio-window {
        width: min(1040px, 96vw); height: min(720px, 90vh);
        display: grid; grid-template-rows: auto 1fr auto;
        border-radius: 16px; overflow: hidden;
        border: 1px solid rgba(145, 205, 255, 0.28);
        background: linear-gradient(145deg, rgba(11, 20, 36, 0.88), rgba(7, 13, 24, 0.92));
        backdrop-filter: blur(28px) saturate(150%);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.22);
      }
      .studio-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 20px; border-bottom: 1px solid rgba(145, 205, 255, 0.16);
        background: rgba(255, 255, 255, 0.03);
      }
      .studio-brand { display: flex; align-items: center; gap: 10px; }
      .studio-brand strong { font-size: 15px; letter-spacing: -0.01em; }
      .studio-sub { font-size: 11px; color: #9ab0ce; padding: 2px 8px; border-radius: 99px; background: rgba(110, 231, 255, 0.12); color: #7ce8ff; }
      .studio-main { display: grid; grid-template-columns: 220px 1fr; min-height: 0; }
      .studio-nav {
        padding: 12px 10px; border-right: 1px solid rgba(145, 205, 255, 0.14);
        overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
        background: rgba(5, 10, 20, 0.35);
      }
      .nav-btn {
        display: flex; align-items: center; gap: 9px; width: 100%;
        padding: 9px 11px; border: 1px solid transparent; border-radius: 9px;
        background: transparent; color: #b5c7e0; font-size: 12px; text-align: left;
      }
      .nav-btn:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
      .nav-btn[aria-selected="true"] {
        background: linear-gradient(135deg, rgba(110, 231, 255, 0.2), rgba(88, 120, 255, 0.18));
        border-color: rgba(110, 231, 255, 0.45); color: #fff; font-weight: 600;
      }
      .nav-num { font-size: 10px; opacity: 0.65; font-variant-numeric: tabular-nums; }
      .studio-content { padding: 18px 22px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
      .card {
        padding: 16px; border-radius: 12px;
        border: 1px solid rgba(145, 205, 255, 0.16);
        background: rgba(16, 28, 48, 0.52);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        display: flex; flex-direction: column; gap: 10px;
      }
      .hero-card { background: linear-gradient(135deg, rgba(22, 46, 78, 0.65), rgba(14, 24, 46, 0.65)); }
      .card-kicker { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #6ee7ff; }
      h3, h4 { margin: 0; font-weight: 600; }
      p { margin: 0; font-size: 12.5px; line-height: 1.5; }
      .muted { color: #9db2ce; font-size: 11.5px; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .stat-card {
        padding: 12px; border-radius: 10px; border: 1px solid rgba(145, 205, 255, 0.18);
        background: rgba(14, 25, 44, 0.6); text-align: left;
        display: flex; flex-direction: column; gap: 4px;
      }
      .stat-card:hover { border-color: #6ee7ff; }
      .stat-sub { font-size: 11px; color: #7ce8ff; }
      .pill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 9px; }
      .preset-pill {
        padding: 11px 13px; border-radius: 10px; border: 1px solid rgba(145, 205, 255, 0.18);
        background: rgba(12, 22, 38, 0.55); text-align: left;
        display: flex; flex-direction: column; gap: 4px;
      }
      .preset-pill[aria-pressed="true"] {
        border-color: #6ee7ff; background: rgba(110, 231, 255, 0.16);
        box-shadow: 0 0 0 1px rgba(110, 231, 255, 0.35);
      }
      .seg-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .seg-btn {
        padding: 6px 11px; border-radius: 7px; border: 1px solid rgba(145, 205, 255, 0.2);
        background: rgba(10, 18, 32, 0.55); font-size: 11.5px; color: #bfd2ec;
      }
      .seg-btn[aria-pressed="true"] { background: #6ee7ff; color: #05101e; border-color: #6ee7ff; font-weight: 600; }
      .dropzone {
        padding: 20px; border-radius: 11px; border: 1.5px dashed rgba(110, 231, 255, 0.4);
        background: rgba(8, 16, 30, 0.45); text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 7px; cursor: pointer;
      }
      .dropzone.dragover, .dropzone:hover { border-color: #6ee7ff; background: rgba(110, 231, 255, 0.09); }
      .staged-preview { padding: 12px; border-radius: 10px; background: rgba(6, 12, 24, 0.7); display: flex; flex-direction: column; gap: 9px; }
      .staged-media { width: 100%; max-height: 190px; object-fit: contain; border-radius: 8px; background: #000; }
      .ctrl-row { display: grid; grid-template-columns: 190px 1fr 62px; align-items: center; gap: 10px; font-size: 12px; }
      .ctrl-slider { width: 100%; accent-color: #6ee7ff; }
      .ctrl-val { text-align: right; font-variant-numeric: tabular-nums; color: #7ce8ff; font-size: 11.5px; }
      .ctrl-select, .text-input, .hex-input, .json-area {
        padding: 6px 10px; border-radius: 7px; border: 1px solid rgba(145, 205, 255, 0.25);
        background: rgba(7, 14, 26, 0.75); color: #eef5ff; font-size: 12px;
      }
      .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 0; cursor: pointer; font-size: 12px; }
      .toggle-text { display: flex; flex-direction: column; gap: 2px; }
      .comp-glass-block { padding: 10px 12px; border-radius: 9px; background: rgba(8, 15, 28, 0.5); border: 1px solid rgba(145, 205, 255, 0.12); display: flex; flex-direction: column; gap: 6px; }
      .comp-glass-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; }
      .color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; }
      .color-item { padding: 9px 11px; border-radius: 8px; background: rgba(8, 15, 28, 0.5); display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
      .color-inputs { display: flex; align-items: center; gap: 8px; }
      .hex-input { width: 90px; font-family: monospace; }
      .font-specimen { padding: 12px; border-radius: 9px; background: rgba(6, 12, 22, 0.65); border: 1px solid rgba(110, 231, 255, 0.2); }
      .lib-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(195px, 1fr)); gap: 11px; margin-top: 6px; }
      .lib-card { border-radius: 10px; overflow: hidden; border: 1px solid rgba(145, 205, 255, 0.18); background: rgba(9, 17, 30, 0.7); display: flex; flex-direction: column; }
      .lib-card[data-active="true"] { border-color: #6ee7ff; box-shadow: 0 0 0 2px rgba(110, 231, 255, 0.35); }
      .lib-thumb-wrap { position: relative; aspect-ratio: 16/10; background: #050a14; overflow: hidden; }
      .lib-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
      .lib-badge { position: absolute; top: 6px; left: 6px; padding: 2px 6px; border-radius: 4px; background: rgba(4, 10, 20, 0.82); font-size: 9.5px; font-weight: 700; color: #7ce8ff; }
      .lib-default-tag { position: absolute; top: 6px; right: 6px; padding: 2px 6px; border-radius: 4px; background: #6ee7ff; color: #04101e; font-size: 9.5px; font-weight: 700; }
      .lib-meta { padding: 7px 9px 4px; font-size: 11.5px; }
      .lib-title { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .lib-actions { padding: 4px 8px 8px; display: flex; flex-wrap: wrap; gap: 4px; }
      .lib-list-row, .prof-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 11px; border-radius: 8px; background: rgba(8, 15, 28, 0.55); border: 1px solid rgba(145, 205, 255, 0.14); }
      .prof-row[data-active="true"] { border-color: #6ee7ff; background: rgba(110, 231, 255, 0.12); }
      .prof-info { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
      .inline-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
      .btn-primary { padding: 7px 13px; border-radius: 7px; border: 0; background: linear-gradient(135deg, #6ee7ff, #5b8cff); color: #04101e; font-weight: 600; font-size: 12px; }
      .btn-secondary { padding: 6px 12px; border-radius: 7px; border: 1px solid rgba(145, 205, 255, 0.3); background: rgba(15, 28, 48, 0.7); color: #eef5ff; font-size: 12px; }
      .btn-ghost { padding: 6px 10px; border-radius: 7px; border: 1px solid transparent; background: transparent; color: #9db2ce; font-size: 11.5px; }
      .btn-ghost:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
      .btn-xs { padding: 4px 7px; font-size: 10.5px; border-radius: 5px; }
      .studio-footer {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 12px 20px; border-top: 1px solid rgba(145, 205, 255, 0.16);
        background: rgba(5, 10, 20, 0.6); font-size: 12px;
      }
      .current-indicator { color: #7ce8ff; font-weight: 600; font-size: 11.5px; }
      .studio-toast {
        position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%);
        padding: 8px 16px; border-radius: 99px; background: rgba(10, 22, 40, 0.95);
        border: 1px solid #6ee7ff; color: #eef5ff; font-size: 12px; pointer-events: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }
      .full-preview-modal {
        position: fixed; inset: 0; background: rgba(2, 6, 14, 0.85); backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center; padding: 28px; z-index: 10;
      }
      .full-preview-card { width: min(860px, 92vw); background: rgba(10, 18, 34, 0.95); border: 1px solid #6ee7ff; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
      .full-preview-media { width: 100%; max-height: 72vh; object-fit: contain; border-radius: 8px; background: #000; }
    `;

    const trigger = el('button', {
      type: 'button',
      class: 'studio-trigger',
      'aria-label': 'Open Antigravity Appearance Studio',
      'aria-expanded': 'false',
      title: 'Antigravity Appearance Studio · Ctrl+Alt+G'
    });
    trigger.innerHTML = studioIconSvg + '<span>Studio</span>';
    trigger.addEventListener('click', () => toggleStudio(!studioOpen));

    const backdrop = el('div', { class: 'studio-backdrop', hidden: '' });
    backdrop.addEventListener('pointerdown', e => {
      if (e.target === backdrop) toggleStudio(false);
    });

    const win = el('section', { class: 'studio-window', role: 'dialog', 'aria-label': 'Antigravity Appearance Studio' });
    const header = el('header', { class: 'studio-header' });
    const brand = el('div', { class: 'studio-brand' });
    brand.innerHTML = studioIconSvg;
    brand.append(
      el('strong', {}, 'Antigravity Appearance Studio'),
      el('span', { class: 'studio-sub' }, 'Liquid Glass Edition')
    );
    const closeTopBtn = el('button', { type: 'button', class: 'btn-ghost', 'aria-label': 'Close Appearance Studio' }, '✕ Close');
    closeTopBtn.addEventListener('click', () => toggleStudio(false));
    header.append(brand, closeTopBtn);

    const main = el('div', { class: 'studio-main' });
    const nav = el('nav', { class: 'studio-nav', 'aria-label': 'Studio Categories' });
    for (const cat of STUDIO_CATEGORIES) {
      const b = el('button', { type: 'button', class: 'nav-btn', 'data-tab': cat.id, 'aria-selected': String(cat.id === activeTab) });
      b.append(el('span', { class: 'nav-num' }, cat.num), el('span', {}, cat.name));
      b.addEventListener('click', () => { activeTab = cat.id; renderStudioTab(); });
      nav.append(b);
    }
    const content = el('div', { class: 'studio-content' });
    main.append(nav, content);

    const footer = el('footer', { class: 'studio-footer' });
    const leftStatus = el('div', { class: 'inline-actions' });
    leftStatus.append(el('span', { class: 'muted' }, 'Active:'), el('span', { class: 'current-indicator' }, currentSummaryText()));

    const rightControls = el('div', { class: 'inline-actions' });
    const autoLabel = el('label', { class: 'inline-actions', style: 'cursor:pointer;' });
    const autoCheck = el('input', { type: 'checkbox', class: 'autosave-check' });
    autoCheck.checked = Boolean(state.autoSave);
    autoCheck.addEventListener('change', () => {
      state.autoSave = autoCheck.checked;
      void storageBackend.save();
    });
    autoLabel.append(autoCheck, el('span', { class: 'muted' }, 'Save Automatically'));

    const resetBtn = el('button', { type: 'button', class: 'btn-ghost' }, 'Reset');
    resetBtn.addEventListener('click', async () => {
      const legacy = window.__agyAsciiBridge?.getPrefs?.();
      state = createDefaultState(legacy);
      await applyAllCustomizations(true);
      await storageBackend.save();
      renderStudioTab();
      showToast('Reset to default Liquid Glass configuration');
    });

    const cancelBtn = el('button', { type: 'button', class: 'btn-secondary' }, 'Cancel');
    cancelBtn.addEventListener('click', async () => {
      if (sessionSnapshot) {
        state = validateState(sessionSnapshot);
        await applyAllCustomizations(true);
        await storageBackend.save();
      }
      toggleStudio(false);
    });

    const applyBtn = el('button', { type: 'button', class: 'btn-primary' }, 'Apply');
    applyBtn.addEventListener('click', async () => {
      sessionSnapshot = clone(state);
      await applyAllCustomizations(false);
      await storageBackend.save();
      showToast('Appearance settings applied & saved');
    });

    rightControls.append(autoLabel, resetBtn, cancelBtn, applyBtn);
    footer.append(leftStatus, rightControls);

    const fullPreviewModal = el('div', { class: 'full-preview-modal', hidden: '' });
    const toast = el('div', { class: 'studio-toast', hidden: '' });

    win.append(header, main, footer, fullPreviewModal, toast);
    backdrop.append(win);
    studioShadow.append(css, trigger, backdrop);
  }

  function setupShortcutsAndCommands() {
    window.addEventListener('focus', () => { windowFocused = true; void syncWallpaperStage(); });
    window.addEventListener('blur', () => { windowFocused = false; void syncWallpaperStage(); });
    document.addEventListener('visibilitychange', () => { void syncWallpaperStage(); });
    window.addEventListener('resize', () => { positionStudioTrigger(); });

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyG') {
        e.preventDefault();
        toggleStudio(!studioOpen);
        return;
      }
      if (e.key === 'Escape' && studioOpen) {
        e.preventDefault();
        e.stopPropagation();
        toggleStudio(false);
        return;
      }
      const editor = e.target?.closest?.('[contenteditable=true],textarea');
      if (e.key === 'Enter' && !e.shiftKey && editor) {
        const text = String(editor.value ?? editor.textContent ?? '').trim();
        const studioCmd = /^\/(?:studio|appearance|customizer)(?:\s+(.+))?$/i.exec(text);
        const glassCmd = /^\/glass(?:\s+(.+))?$/i.exec(text);
        const profileCmd = /^\/profile(?:\s+(.+))?$/i.exec(text);
        const themeStudioCmd = /^\/themes?\s+studio$/i.exec(text);

        if (studioCmd || glassCmd || profileCmd || themeStudioCmd) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (editor.matches('textarea')) {
            const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
            setter?.call(editor, '');
            editor.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            const range = document.createRange();
            range.selectNodeContents(editor);
            const sel = getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
            document.execCommand('delete');
          }

          if (glassCmd) {
            const arg = (glassCmd[1] || '').trim().toLowerCase();
            if (GLASS_PRESETS[arg]) {
              applyGlassPreset(arg);
              void applyAllCustomizations(true);
            } else {
              activeTab = 'glass';
              toggleStudio(true);
            }
          } else if (profileCmd) {
            const arg = (profileCmd[1] || '').trim();
            if (!arg || !applyProfileById(arg)) {
              activeTab = 'profiles';
              toggleStudio(true);
            }
          } else {
            const tabArg = (studioCmd?.[1] || '').trim().toLowerCase();
            const foundTab = STUDIO_CATEGORIES.find(c => c.id === tabArg || c.name.toLowerCase().includes(tabArg));
            if (foundTab) activeTab = foundTab.id;
            toggleStudio(true);
          }
        }
      }
    }, true);
  }

  let customizerInitialized = false;
  async function initCustomizer() {
    if (customizerInitialized) return;
    customizerInitialized = true;
    await storageBackend.load();
    const targetProfileId = state.defaultProfileId || state.activeProfileId || (state.userProfiles[0]?.id) || 'prof_mwdinmpu_76t3';
    applyProfileById(targetProfileId);
    buildStudioDOM();
    setupShortcutsAndCommands();

    const bridge = window.__agyAsciiBridge;
    if (bridge) {
      bridge.onSelect = (themeId) => {
        if (themeId === 'off') {
          state.enabled = false;
          state.wallpaper.source = 'off';
        } else {
          state.enabled = true;
          state.wallpaper.source = 'ascii';
          state.wallpaper.asciiTheme = themeId;
        }
        void applyAllCustomizations(true);
      };
    }

    injectButtonIntoThemesPanel();
    positionStudioTrigger();
    await applyAllCustomizations(true);

    // Keep stage, trigger, and sidebar buttons synced when Antigravity re-renders DOM
    const rootObserver = new MutationObserver(() => {
      ensureWallpaperStage();
      injectButtonIntoThemesPanel();
      positionStudioTrigger();
      fixNewConversationButton();
      if (state.enabled && state.wallpaper.source !== 'off') {
        if (!document.body.dataset.awTheme) {
          document.body.dataset.awTheme = (state.wallpaper.source === 'ascii' && state.wallpaper.asciiTheme) ? state.wallpaper.asciiTheme : 'aurora';
        }
        document.body.dataset.agyCustomizer = 'true';
        if (wpImg && wpImg.style.display !== 'block' && wpVideo && wpVideo.style.display !== 'block') {
          void syncWallpaperStage();
        }
      }
    });
    rootObserver.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
    if (typeof setInterval === 'function') {
      setInterval(fixNewConversationButton, 400);
    } else if (typeof window !== 'undefined' && typeof window.setInterval === 'function') {
      window.setInterval(fixNewConversationButton, 400);
    }

    // Expose API in isolated preload scope for testing & diagnostics
    window.__agyLiquidGlass = {
      GLASS_PRESETS,
      GLASS_COMPONENTS,
      BUILTIN_FONTS,
      BUILTIN_PROFILES,
       STUDIO_CATEGORIES,
      getState: () => clone(state),
      setState: async (next, persist = true) => {
        state = validateState(next);
        await applyAllCustomizations(persist);
      },
      getLibrary: () => clone(library),
      applyGlassPreset: async (id) => { applyGlassPreset(id); await applyAllCustomizations(true); },
      applyProfileById,
      createUserProfile,
      duplicateProfile,
      renameUserProfile,
      deleteUserProfile,
      exportProfileJson,
      importProfileJson,
      uploadAsset: (payload) => storageBackend.uploadAsset(payload),
      deleteAsset: (category, id) => storageBackend.deleteAsset(category, id),
      toggleStudio,
      applyAllCustomizations,
      dispose: () => {
        revokeAllAssetUrls();
        wpStage?.remove();
        glassStyleEl?.remove();
        fontStyleEl?.remove();
        studioHost?.remove();
        window.__agyLiquidGlassInstalled = false;
      }
    };
  }

  function runInit() {
    if (customizerInitialized) return;
    void initCustomizer();
  }

  if (window.__agyAsciiBridge) {
    runInit();
  }
  window.addEventListener('agy-ascii-ready', runInit, { once: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit, { once: true });
  } else {
    runInit();
  }
  setTimeout(runInit, 100);
})();
