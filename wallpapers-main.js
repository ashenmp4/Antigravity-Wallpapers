/* Isolated wallpaper & Liquid Glass customizer storage; never writes Antigravity's own settings file. */
(() => {
  'use strict';
  const { app, ipcMain } = require('electron');
  const fs = require('fs'), path = require('path'), crypto = require('crypto');

  const legacyFile = () => path.join(app.getPath('userData'), 'ascii-wallpapers-preferences.json');
  const customizerRoot = () => path.join(app.getPath('userData'), 'liquid-glass-customizer');
  const stateFile = () => path.join(customizerRoot(), 'customizer-state.json');
  const libraryFile = () => path.join(customizerRoot(), 'library-index.json');
  const wallpapersDir = () => path.join(customizerRoot(), 'wallpapers');
  const fontsDir = () => path.join(customizerRoot(), 'fonts');

  const WALLPAPER_EXTS = {
    '.jpg': { mime: 'image/jpeg', kind: 'static' },
    '.jpeg': { mime: 'image/jpeg', kind: 'static' },
    '.png': { mime: 'image/png', kind: 'static' },
    '.webp': { mime: 'image/webp', kind: 'static' },
    '.gif': { mime: 'image/gif', kind: 'gif' },
    '.mp4': { mime: 'video/mp4', kind: 'video' },
    '.webm': { mime: 'video/webm', kind: 'video' }
  };

  const FONT_EXTS = {
    '.ttf': { mime: 'font/ttf', format: 'truetype' },
    '.otf': { mime: 'font/otf', format: 'opentype' },
    '.woff': { mime: 'font/woff', format: 'woff' },
    '.woff2': { mime: 'font/woff2', format: 'woff2' }
  };

  function ensureDirs() {
    for (const d of [customizerRoot(), wallpapersDir(), fontsDir()]) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    }
  }

  function atomicWriteJson(targetPath, dataObj) {
    ensureDirs();
    const tmp = targetPath + '.' + process.pid + '-' + Date.now() + '.tmp';
    const raw = typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj, null, 2);
    fs.writeFileSync(tmp, raw, 'utf8');
    fs.renameSync(tmp, targetPath);
  }

  function assertTrustedSender(event) {
    if (!event) return;
    const url = event?.senderFrame?.url || event?.sender?.getURL?.() || '';
    if (!url || url === 'about:blank' || /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url) || url.startsWith('file:') || url.startsWith('vscode-file:')) {
      return;
    }
    throw Error('Unsupported wallpaper origin');
  }

  function detectAnimatedWebp(buf) {
    if (!Buffer.isBuffer(buf) || buf.length < 30) return false;
    if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return false;
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X' && (buf[20] & 0x02) !== 0) return true;
    return buf.indexOf(Buffer.from('ANIM')) >= 12;
  }

  function readLibrary() {
    try {
      const parsed = JSON.parse(fs.readFileSync(libraryFile(), 'utf8'));
      return {
        wallpapers: Array.isArray(parsed?.wallpapers) ? parsed.wallpapers : [],
        fonts: Array.isArray(parsed?.fonts) ? parsed.fonts : [],
        defaultWallpaperId: typeof parsed?.defaultWallpaperId === 'string' ? parsed.defaultWallpaperId : null
      };
    } catch {
      return { wallpapers: [], fonts: [], defaultWallpaperId: null };
    }
  }

  function saveLibrary(lib) {
    atomicWriteJson(libraryFile(), {
      wallpapers: Array.isArray(lib.wallpapers) ? lib.wallpapers : [],
      fonts: Array.isArray(lib.fonts) ? lib.fonts : [],
      defaultWallpaperId: typeof lib.defaultWallpaperId === 'string' ? lib.defaultWallpaperId : null
    });
  }

  function safeId(id) {
    return typeof id === 'string' && /^[a-zA-Z0-9_-]{4,64}$/.test(id);
  }

  // Original v1 IPC handlers (100% preserved)
  ipcMain.handle('ascii-wallpapers:get', () => {
    try { return JSON.parse(fs.readFileSync(legacyFile(), 'utf8')); } catch { return {}; }
  });

  ipcMain.handle('ascii-wallpapers:save', (event, changes) => {
    const url = event.senderFrame?.url || '';
    if (!/^https:\/\/127\.0\.0\.1:\d+\//.test(url)) throw Error('Unsupported wallpaper origin');
    const key = 'asciiWallpaperPreferences.v1', raw = changes?.[key];
    if (typeof raw !== 'string' || raw.length > 1024) throw Error('Invalid wallpaper preferences');
    const p = JSON.parse(raw);
    if (typeof p.theme !== 'string' || !/^[a-z]{2,16}$/.test(p.theme) || !Number.isFinite(p.intensity) || p.intensity < 15 || p.intensity > 100 || typeof p.paused !== 'boolean' || (p.reactive !== undefined && typeof p.reactive !== 'boolean') || (p.recolor !== undefined && typeof p.recolor !== 'boolean') || (p.glyphs !== undefined && !['ascii', 'braille', 'blocks', 'katakana'].includes(p.glyphs)) || (p.scale !== undefined && !['fine', 'normal', 'chunky'].includes(p.scale)) || (p.quota !== undefined && typeof p.quota !== 'boolean')) throw Error('Invalid wallpaper preferences');
    const data = JSON.stringify({ [key]: JSON.stringify({ theme: p.theme, intensity: p.intensity, paused: p.paused, reactive: p.reactive !== false, recolor: p.recolor !== false, glyphs: p.glyphs || 'ascii', scale: p.scale || 'normal', quota: p.quota !== false }) });
    fs.writeFileSync(legacyFile() + '.tmp', data, 'utf8');
    fs.renameSync(legacyFile() + '.tmp', legacyFile());
  });

  // Extended v2 Liquid Glass Customizer IPC handlers
  ipcMain.handle('agy-customizer:get-state', (event) => {
    assertTrustedSender(event);
    ensureDirs();
    let state = null;
    try {
      state = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
    } catch {}
    let legacy = {};
    try {
      legacy = JSON.parse(fs.readFileSync(legacyFile(), 'utf8'));
    } catch {}
    return {
      state,
      legacy,
      library: readLibrary(),
      storageDir: customizerRoot()
    };
  });

  ipcMain.handle('agy-customizer:save-state', (event, payload) => {
    assertTrustedSender(event);
    if (!payload || typeof payload !== 'object') throw Error('Invalid customizer state payload');
    const raw = JSON.stringify(payload);
    if (raw.length > 512 * 1024) throw Error('Customizer state exceeds maximum allowed size');
    atomicWriteJson(stateFile(), payload);
    if (payload.wallpaper && typeof payload.wallpaper.source === 'string') {
      try {
        const key = 'asciiWallpaperPreferences.v1';
        let legacy = {};
        try { legacy = JSON.parse(fs.readFileSync(legacyFile(), 'utf8')); } catch {}
        let p = {};
        try { p = JSON.parse(legacy[key] || '{}'); } catch {}
        if (payload.wallpaper.source !== 'ascii') {
          p.theme = 'off';
          p.paused = true;
        } else if (payload.wallpaper.asciiTheme) {
          p.theme = payload.wallpaper.asciiTheme;
          p.paused = Boolean(payload.wallpaper.paused);
        }
        legacy[key] = JSON.stringify(p);
        atomicWriteJson(legacyFile(), legacy);
      } catch {}
    }
    return { ok: true };
  });

  ipcMain.handle('agy-customizer:upload-asset', (event, payload) => {
    assertTrustedSender(event);
    if (!payload || typeof payload !== 'object') throw Error('Invalid upload payload');
    const category = payload.category === 'font' ? 'font' : 'wallpaper';
    const rawName = String(payload.name || 'asset').trim();
    const ext = path.extname(rawName).toLowerCase();
    const cleanTitle = path.basename(rawName, ext).replace(/[^\w\s().-]/g, '').trim().slice(0, 64) || (category === 'font' ? 'Custom Font' : 'Custom Wallpaper');

    let buffer;
    if (payload.sourcePath && typeof payload.sourcePath === 'string') {
      const resolvedSource = path.resolve(payload.sourcePath);
      if (!fs.existsSync(resolvedSource) || !fs.statSync(resolvedSource).isFile()) {
        throw Error('Source file does not exist');
      }
      buffer = fs.readFileSync(resolvedSource);
    } else if (payload.bytes) {
      buffer = Buffer.from(payload.bytes);
    } else {
      throw Error('No file data provided');
    }

    const maxBytes = category === 'font' ? 35 * 1024 * 1024 : 250 * 1024 * 1024;
    if (!buffer.length || buffer.length > maxBytes) {
      throw Error('File size is invalid or exceeds limit');
    }

    ensureDirs();
    const id = (category === 'font' ? 'fnt_' : 'wp_') + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex');
    const fileName = id + ext;
    const lib = readLibrary();

    if (category === 'wallpaper') {
      const spec = WALLPAPER_EXTS[ext];
      if (!spec) throw Error('Unsupported wallpaper format: ' + ext + '. Use JPG, JPEG, PNG, WEBP, GIF, MP4, or WEBM.');
      let kind = spec.kind;
      if (ext === '.webp' && detectAnimatedWebp(buffer)) {
        kind = 'webp';
      } else if (payload.forceKind && ['static', 'gif', 'webp', 'video'].includes(payload.forceKind)) {
        kind = payload.forceKind;
      }
      const target = path.join(wallpapersDir(), fileName);
      fs.writeFileSync(target, buffer);
      const item = {
        id,
        name: cleanTitle,
        kind,
        ext,
        mime: spec.mime,
        fileName,
        size: buffer.length,
        favorite: false,
        createdAt: new Date().toISOString()
      };
      lib.wallpapers.unshift(item);
      saveLibrary(lib);
      return { item, library: lib };
    } else {
      const spec = FONT_EXTS[ext];
      if (!spec) throw Error('Unsupported font format: ' + ext + '. Use TTF, OTF, WOFF, or WOFF2.');
      const target = path.join(fontsDir(), fileName);
      fs.writeFileSync(target, buffer);
      const family = 'AGYCustom_' + id.replace(/[^a-zA-Z0-9]/g, '');
      const item = {
        id,
        name: cleanTitle,
        family: payload.family ? String(payload.family).replace(/[^\w\s-]/g, '').slice(0, 48) || family : cleanTitle,
        cssFamily: family,
        ext,
        mime: spec.mime,
        format: spec.format,
        fileName,
        size: buffer.length,
        createdAt: new Date().toISOString()
      };
      lib.fonts.unshift(item);
      saveLibrary(lib);
      return { item, library: lib };
    }
  });

  ipcMain.handle('agy-customizer:read-asset', (event, payload) => {
    assertTrustedSender(event);
    const category = payload?.category === 'font' ? 'font' : 'wallpaper';
    const id = payload?.id;
    if (!safeId(id)) throw Error('Invalid asset ID');
    const lib = readLibrary();
    const list = category === 'font' ? lib.fonts : lib.wallpapers;
    const item = list.find(x => x.id === id);
    if (!item || !item.fileName || path.basename(item.fileName) !== item.fileName) {
      throw Error('Asset not found');
    }
    const fullPath = path.join(category === 'font' ? fontsDir() : wallpapersDir(), item.fileName);
    if (!fs.existsSync(fullPath)) throw Error('Asset file missing on disk');
    const bytes = fs.readFileSync(fullPath);
    return {
      id: item.id,
      name: item.name,
      mime: item.mime,
      kind: item.kind,
      format: item.format,
      cssFamily: item.cssFamily,
      bytes: new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    };
  });

  ipcMain.handle('agy-customizer:update-asset', (event, payload) => {
    assertTrustedSender(event);
    const category = payload?.category === 'font' ? 'font' : 'wallpaper';
    const id = payload?.id;
    if (!safeId(id)) throw Error('Invalid asset ID');
    const lib = readLibrary();
    const list = category === 'font' ? lib.fonts : lib.wallpapers;
    const item = list.find(x => x.id === id);
    if (!item) throw Error('Asset not found');
    if (typeof payload.name === 'string' && payload.name.trim()) {
      item.name = payload.name.trim().slice(0, 64);
    }
    if (typeof payload.favorite === 'boolean') {
      item.favorite = payload.favorite;
    }
    if (payload.setDefault === true && category === 'wallpaper') {
      lib.defaultWallpaperId = item.id;
    } else if (payload.setDefault === false && lib.defaultWallpaperId === item.id) {
      lib.defaultWallpaperId = null;
    }
    saveLibrary(lib);
    return { item, library: lib };
  });

  ipcMain.handle('agy-customizer:delete-asset', (event, payload) => {
    assertTrustedSender(event);
    const category = payload?.category === 'font' ? 'font' : 'wallpaper';
    const id = payload?.id;
    if (!safeId(id)) throw Error('Invalid asset ID');
    const lib = readLibrary();
    const key = category === 'font' ? 'fonts' : 'wallpapers';
    const idx = lib[key].findIndex(x => x.id === id);
    if (idx < 0) return { library: lib };
    const [removed] = lib[key].splice(idx, 1);
    if (removed?.fileName && path.basename(removed.fileName) === removed.fileName) {
      const fullPath = path.join(category === 'font' ? fontsDir() : wallpapersDir(), removed.fileName);
      try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch {}
    }
    if (category === 'wallpaper' && lib.defaultWallpaperId === id) {
      lib.defaultWallpaperId = null;
    }
    saveLibrary(lib);
    return { library: lib };
  });
})();
