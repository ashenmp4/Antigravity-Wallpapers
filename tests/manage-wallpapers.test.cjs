// tests/manage-wallpapers.test.cjs
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

console.log('Running installer unit tests...');

const rootDir = path.resolve(__dirname, '..');

const runEnv = { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
const nodeCmd = `"${process.execPath}"`;

// Test 1: Verify uninstall alias exists in help / error handling
try {
  execSync(`${nodeCmd} manage-wallpapers.cjs invalid-action`, { cwd: rootDir, stdio: 'pipe', env: runEnv });
  assert.fail('Should have failed for invalid action');
} catch (e) {
  const err = (e.stderr || e.stdout || '').toString();
  assert(err.includes('uninstall'), 'Error message must list uninstall as valid action');
  assert(err.includes('Use install, verify, status, restore, or uninstall'), 'Error message must list all valid actions');
}

// Test 2: Verify uninstall CLI action is normalized to restore (does not throw invalid action error)
try {
  execSync(`${nodeCmd} manage-wallpapers.cjs uninstall /nonexistent/path/app.asar`, {
    cwd: rootDir,
    stdio: 'pipe',
    env: runEnv
  });
  assert.fail('Should fail on nonexistent archive');
} catch (e) {
  const err = (e.stderr || e.stdout || '').toString();
  assert(!err.includes('Use install, verify, status'), 'uninstall action must be recognized as valid');
  assert(err.includes('Antigravity was not found at') || err.includes('No wallpaper backup found'), 'uninstall must proceed to action handling');
}

// Test 3: Linux candidate path resolution
const installer = require('../manage-wallpapers.cjs');
assert(typeof installer.resolveArchive === 'function', 'resolveArchive must be exported');

const originalPlatform = process.platform;
const originalArgv = [...process.argv];
const originalEnvAsar = process.env.ANTIGRAVITY_ASAR;
const originalEnvAppPath = process.env.ANTIGRAVITY_APP_PATH;
const originalExists = fs.existsSync;

try {
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  delete process.env.ANTIGRAVITY_ASAR;
  delete process.env.ANTIGRAVITY_APP_PATH;
  process.argv = ['node', 'manage-wallpapers.cjs', 'status'];

  const expectedLinuxPaths = [
    '/opt/Antigravity/resources/app.asar',
    '/opt/antigravity/resources/app.asar',
    '/usr/lib/antigravity/resources/app.asar',
    '/usr/lib/Antigravity/resources/app.asar',
    path.join(os.homedir(), '.local', 'share', 'antigravity', 'resources', 'app.asar'),
    path.join(os.homedir(), '.local', 'share', 'Antigravity', 'resources', 'app.asar')
  ];

  for (const expected of expectedLinuxPaths) {
    fs.existsSync = (p) => p === expected;
    const resolved = installer.resolveArchive();
    assert.strictEqual(resolved, expected, 'resolveArchive should discover Linux path: ' + expected);
  }

  // When none exist, should fall back to first Linux candidate
  fs.existsSync = () => false;
  assert.strictEqual(installer.resolveArchive(), '/opt/Antigravity/resources/app.asar', 'Default candidate on Linux should be /opt/Antigravity/resources/app.asar');
} finally {
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  process.argv = originalArgv;
  if (originalEnvAsar !== undefined) process.env.ANTIGRAVITY_ASAR = originalEnvAsar;
  if (originalEnvAppPath !== undefined) process.env.ANTIGRAVITY_APP_PATH = originalEnvAppPath;
  fs.existsSync = originalExists;
}

// Test 4: Check replace() permission error formatting logic
assert(typeof installer.replace === 'function', 'replace must be exported');

const originalWrite = fs.writeFileSync;
const originalUnlink = fs.unlinkSync;

try {
  // Test win32 EACCES / EPERM -> PowerShell as Administrator
  Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  fs.writeFileSync = () => { const err = new Error('access denied'); err.code = 'EACCES'; throw err; };
  fs.unlinkSync = () => {};
  assert.throws(() => installer.replace(Buffer.from('')), /Run PowerShell as Administrator/);

  fs.writeFileSync = () => { const err = new Error('operation not permitted'); err.code = 'EPERM'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /Run PowerShell as Administrator/);

  // Test linux EACCES / EPERM -> sudo node manage-wallpapers.cjs
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  process.argv[2] = 'install';
  fs.writeFileSync = () => { const err = new Error('access denied'); err.code = 'EACCES'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /Run with: sudo node manage-wallpapers\.cjs install/);

  fs.writeFileSync = () => { const err = new Error('operation not permitted'); err.code = 'EPERM'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /Run with: sudo node manage-wallpapers\.cjs install/);

  // Test EBUSY across platforms -> in use message
  fs.writeFileSync = () => { const err = new Error('resource busy'); err.code = 'EBUSY'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /The app archive is in use\. Close Antigravity completely/);

  // Test backup and old backup permission error formatting
  assert(typeof installer.permissionError === 'function', 'permissionError must be exported');
  const backupPath = '/opt/Antigravity/resources/app.asar.ascii-wallpapers.backup';
  const oldBackupPath = '/opt/Antigravity/resources/app.asar.ascii-wallpapers.backup.previous-12345';

  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  process.argv[2] = 'install';
  const linuxBackupErr = installer.permissionError(backupPath);
  assert.strictEqual(
    linuxBackupErr.message,
    'Permission denied writing to ' + backupPath + '. Run with: sudo node manage-wallpapers.cjs install'
  );
  const linuxOldErr = installer.permissionError(oldBackupPath);
  assert.strictEqual(
    linuxOldErr.message,
    'Permission denied writing to ' + oldBackupPath + '. Run with: sudo node manage-wallpapers.cjs install'
  );

  Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  const winBackupErr = installer.permissionError(backupPath);
  assert.strictEqual(
    winBackupErr.message,
    'Permission denied writing to ' + backupPath + '. Run PowerShell as Administrator and try again.'
  );
} finally {
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  process.argv = originalArgv;
  fs.writeFileSync = originalWrite;
  fs.unlinkSync = originalUnlink;
}

// Test 5: Linux ELF integrity fuse inspection and inspect() reporting
assert(typeof installer.asarIntegrityFuse === 'function', 'asarIntegrityFuse must be exported');
assert(typeof installer.inspect === 'function', 'inspect must be exported');

function makeFuseBuffer(wireString) {
  const sentinel = Buffer.from('dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX');
  const version = Buffer.from([1]);
  const wire = Buffer.from(wireString, 'latin1');
  const len = Buffer.from([wire.length]);
  return Buffer.concat([Buffer.from('ELF_HEADER_DUMMY_DATA'), sentinel, version, len, wire]);
}

function makeMinimalAsar() {
  const json = Buffer.from(JSON.stringify({ files: {} }));
  const padded = Math.ceil((4 + json.length) / 4) * 4;
  const head = Buffer.alloc(8 + padded);
  head.writeUInt32LE(4 + padded, 0);
  head.writeUInt32LE(json.length, 4);
  json.copy(head, 8);
  const size = Buffer.alloc(8);
  size.writeUInt32LE(4, 0);
  size.writeUInt32LE(head.length, 4);
  return Buffer.concat([size, head]);
}

const originalReadFileSync = fs.readFileSync;

try {
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });

  // 1. Binary lookup precedence: checks 'antigravity' first, then 'Antigravity'
  let checkedPaths = [];
  let readPath = null;
  fs.existsSync = (p) => {
    checkedPaths.push(p);
    return path.basename(p) === 'antigravity';
  };
  fs.readFileSync = (p) => {
    readPath = p;
    return makeFuseBuffer('00001');
  };

  let status = installer.asarIntegrityFuse();
  assert.strictEqual(status, 'on', 'Should return "on" when fuse 4 is "1"');
  assert.strictEqual(path.basename(readPath), 'antigravity', 'Should prefer lowercase antigravity binary');

  // If lowercase does not exist, checks Antigravity (capitalized)
  checkedPaths = [];
  readPath = null;
  fs.existsSync = (p) => {
    checkedPaths.push(p);
    return path.basename(p) === 'Antigravity';
  };
  fs.readFileSync = (p) => {
    readPath = p;
    return makeFuseBuffer('00000');
  };

  status = installer.asarIntegrityFuse();
  assert.strictEqual(status, 'off', 'Should return "off" when fuse 4 is "0"');
  assert.strictEqual(path.basename(readPath), 'Antigravity', 'Should fallback to uppercase Antigravity binary');

  // If neither exists, returns 'unknown'
  fs.existsSync = () => false;
  status = installer.asarIntegrityFuse();
  assert.strictEqual(status, 'unknown', 'Should return "unknown" when binary does not exist');

  // 2. Wire parsing edge cases
  fs.existsSync = () => true;

  // Wire too short
  fs.readFileSync = () => makeFuseBuffer('000');
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when fuse wire is too short');

  // Sentinel missing
  fs.readFileSync = () => Buffer.from('binary data without sentinel');
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when sentinel is missing');

  // Unreadable binary (EACCES / EPERM / EIO)
  fs.readFileSync = () => { const err = new Error('permission denied'); err.code = 'EACCES'; throw err; };
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when binary read throws EACCES');

  fs.readFileSync = () => { const err = new Error('operation not permitted'); err.code = 'EPERM'; throw err; };
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when binary read throws EPERM');

  fs.readFileSync = () => { const err = new Error('i/o error'); err.code = 'EIO'; throw err; };
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when binary read throws EIO');

  // 3. inspect() behavior on Linux
  const dummyArchive = makeMinimalAsar();

  // Fuse 'on' -> error
  fs.readFileSync = () => makeFuseBuffer('00001');
  let report = installer.inspect(dummyArchive, '', '');
  assert(
    report.errors.includes('Electron ASAR integrity validation is enabled for this build'),
    'inspect() should push error when Linux fuse is "on"'
  );

  // Fuse 'unknown' on Linux -> warning mentioning 'antigravity binary'
  fs.existsSync = () => false;
  report = installer.inspect(dummyArchive, '', '');
  assert(
    report.warnings.includes('could not read Electron fuses from antigravity binary'),
    'inspect() should push warning mentioning antigravity binary on Linux when fuse is unknown'
  );
  assert(
    !report.warnings.some((w) => w.includes('Antigravity.exe')),
    'inspect() should not mention Antigravity.exe on Linux'
  );

  // Fuse 'unknown' on Windows -> warning mentioning 'Antigravity.exe'
  Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  fs.existsSync = () => false;
  report = installer.inspect(dummyArchive, '', '');
  assert(
    report.warnings.includes('could not read Electron fuses from Antigravity.exe'),
    'inspect() should push warning mentioning Antigravity.exe on Windows when fuse is unknown'
  );
} finally {
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  fs.existsSync = originalExists;
  fs.readFileSync = originalReadFileSync;
}

// Test 6: Document viewer CSS resets for PDF and text previewers
const asciiSource = fs.readFileSync(path.resolve(__dirname, '../ascii-wallpapers.js'), 'utf8');

const requiredSelectors = [
  'iframe',
  'embed',
  'object',
  '.pdfViewer',
  '.textLayer',
  '[class*="pdf" i]',
  '.monaco-editor'
];

for (const selector of requiredSelectors) {
  assert(
    asciiSource.includes(selector),
    `ascii-wallpapers.js must declare viewer reset selector: ${selector}`
  );
}

assert(
  asciiSource.includes('text-shadow: none !important') || asciiSource.includes('text-shadow:none!important'),
  'ascii-wallpapers.js must reset text-shadow on viewers'
);

assert(
  asciiSource.includes('isolation: isolate') || asciiSource.includes('isolation:isolate'),
  'ascii-wallpapers.js must isolate viewer stacking context'
);

assert(
  asciiSource.includes('color: initial') || asciiSource.includes('color:initial'),
  'ascii-wallpapers.js must reset color on document viewers'
);

// Assert viewer reset is present in both stylesheet branches of appearance()
const appearanceMatch = asciiSource.match(/function appearance\([^)]*\)\s*\{([\s\S]*?)\n\s*function apply/);
assert(appearanceMatch, 'appearance() function must exist in ascii-wallpapers.js');
const appearanceBody = appearanceMatch[1];
const resetMatches = appearanceBody.match(/\$\{viewerReset\}/g) || [];
assert(
  appearanceBody.includes('viewerReset') && resetMatches.length >= 2,
  'viewerReset must be included in both the wallpaper-only and full recolor stylesheet branches'
);

// Test 7: Verify Antigravity 2.30.0+ inset container transparency rules in ascii-wallpapers.js
const insetSelector = '.agy-sheet[data-sheet-inset] [data-main-content-body]';
const insetMatches = appearanceBody.match(/\.agy-sheet\[data-sheet-inset\]\s*\[data-main-content-body\]/g) || [];
assert(
  insetMatches.length >= 2,
  'inset container transparency rule must be included in both the wallpaper-only and full recolor stylesheet branches'
);
assert(
  appearanceBody.includes('.agy-inset-shell [data-side-panel-body]'),
  'appearance() must include transparency rules for .agy-inset-shell [data-side-panel-body]'
);

// Test 8: Verify frosted glass surface refinements in ascii-wallpapers.js
assert(
  appearanceBody.includes('.border-menu-border') && appearanceBody.includes('[role="menu"]'),
  'appearance() must include frosted menu dropdown styling'
);
assert(
  appearanceBody.includes('.agy-sidebar-row.bg-sidebar-secondary'),
  'appearance() must include frosted active sidebar item styling'
);
assert(
  appearanceBody.includes('.agy-row-actions::before'),
  'appearance() must neutralize the opaque .agy-row-actions::before pseudo-element'
);

// Test 9: Verify dynamic text truncation on hover/active
assert(
  appearanceBody.includes('.agy-sidebar-row:hover > div:nth-child(2)'),
  'appearance() must include dynamic text truncation on .agy-sidebar-row hover'
);
assert(
  appearanceBody.includes('padding-right:76px') || appearanceBody.includes('padding-right: 76px'),
  'appearance() must allocate padding-right for floating actions to prevent text collision'
);

// Test 10: Verify sidebar and header share the same glass recipe (30% tint, 10px blur) so they match
const glass = 'background-color:color-mix(in srgb,${t.chrome} 30%,transparent)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;';
assert(
  appearanceBody.includes('nav.bg-sidebar{' + glass + 'border-right') &&
  appearanceBody.includes('.agy-shell > .shrink-0{position:relative!important;z-index:30!important;' + glass + 'border-bottom:0!important}'),
  'appearance() must give the sidebar and .agy-shell > .shrink-0 header the identical glass recipe'
);

// Test 11: Verify the header has no bottom border, so header and sidebar read as one block
assert(
  !appearanceBody.includes('border-bottom:1px solid color-mix(in srgb,${t.border} 30%,rgba(255,255,255,0.08))'),
  'appearance() must not draw a bottom border on .agy-shell > .shrink-0'
);

// Test 12: Verify calm titlebar zone prevents bright character bleeding into header
const scenesSource = fs.readFileSync(path.join(__dirname, '..', 'wallpaper-scenes.js'), 'utf8');
assert(
  scenesSource.includes('topH') && scenesSource.includes('ey <= 0'),
  'wallpaper-scenes.js must define topH titlebar calm boundary and suppress glyph rendering when ey <= 0'
);
assert(
  asciiSource.includes('topHeight') && asciiSource.includes('.agy-shell > .shrink-0'),
  'ascii-wallpapers.js must calculate topHeight from .agy-shell > .shrink-0 and pass it into calmBox'
);

// Test 13: Verify transparent window controls overlay color to prevent opaque cutout
assert(
  asciiSource.includes("color:'#00000000'") || asciiSource.includes('color: "#00000000"') || asciiSource.includes("color: '#00000000'"),
  'ascii-wallpapers.js must set transparent titleBarOverlay color (#00000000) to blend with glass topbar'
);

// Test 9: quotaGroups merges Low/Medium/High variants, keeps the lowest fraction, and treats a missing fraction as 0
const quotaMatch = asciiSource.match(/const hasQuota[\s\S]*?function quotaGroups\([\s\S]*?\r?\n  \}\r?\n/);
assert(quotaMatch, 'quotaSummary() and quotaGroups() must exist in ascii-wallpapers.js');
const { quotaSummary, quotaGroups } = new Function(quotaMatch[0] + 'return {quotaSummary,quotaGroups};')();

// Test 10: quotaSummary keeps server group order, labels windows, and takes the tighter limit per group
const summary = quotaSummary([
  { displayName: 'Gemini Models', description: 'Flash, Pro', buckets: [
    { window: 'weekly', remainingFraction: 0.97, resetTime: '2026-11-14T13:43:15Z' },
    { window: '5h', resetTime: '2026-11-11T00:34:52Z' }
  ] },
  { displayName: 'Claude and GPT models', buckets: [{ window: 'weekly', remainingFraction: 1, resetTime: '2026-11-17T19:34:52Z' }] },
  { displayName: 'Empty', buckets: [{}] }
]);
assert.deepStrictEqual(summary.map(g => [g.name, g.left]), [['Gemini Models', 0], ['Claude and GPT models', 1]]);
assert.deepStrictEqual(summary[0].buckets.map(b => [b.label, b.left]), [['Weekly', 0.97], ['5-hour', 0]]);
assert.strictEqual(summary[0].info, 'Flash, Pro');
assert.deepStrictEqual(quotaSummary(undefined), []);
const groups = quotaGroups([
  { label: 'Claude Opus 5.5 (Low)', quotaInfo: { remainingFraction: 0.8, resetTime: '2026-11-11T00:00:00Z' } },
  { label: 'Claude Opus 5.5 (High)', quotaInfo: { remainingFraction: 0.4, resetTime: '2026-11-11T00:00:00Z' } },
  { label: 'Gemini Flash', quotaInfo: { resetTime: '2026-11-12T00:00:00Z' } },
  { label: 'Unlimited', quotaInfo: {} },
  { label: 'No info' }
]);
assert.deepStrictEqual(groups.map(g => [g.name, g.left]), [['Gemini Flash', 0], ['Claude Opus 5.5', 0.4]]);
assert.strictEqual(groups[1].buckets[0].reset, Date.parse('2026-11-11T00:00:00Z'));
assert.deepStrictEqual(quotaGroups(undefined), []);

console.log('Tests passed.');

// ============================================================================
// Test 14: Main-process wallpapers-main.js IPC, Wallpaper & Font Asset Storage
// ============================================================================
console.log('Running main-process asset & storage tests...');
{
  const vm = require('vm');
  const tmpUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-lg-main-test-'));
  const ipcHandlers = new Map();
  const mockElectron = {
    app: { getPath: (k) => (k === 'userData' ? tmpUserData : tmpUserData) },
    ipcMain: {
      handle: (channel, fn) => ipcHandlers.set(channel, fn)
    }
  };
  const mainSource = fs.readFileSync(path.join(rootDir, 'wallpapers-main.js'), 'utf8');
  const customRequire = (mod) => (mod === 'electron' ? mockElectron : require(mod));
  vm.runInNewContext(mainSource, { require: customRequire, Buffer, process, console });

  const trustedEvent = { senderFrame: { url: 'https://127.0.0.1:41234/' } };
  const untrustedEvent = { senderFrame: { url: 'https://evil.example.com/' } };

  // 14a: Rejects untrusted origin
  assert.throws(
    () => ipcHandlers.get('agy-customizer:get-state')(untrustedEvent),
    /Unsupported wallpaper origin/,
    'Main IPC must reject untrusted origins'
  );

  // 14b: Upload static JPG, PNG, WEBP wallpapers
  for (const [ext, mime] of [['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.png', 'image/png'], ['.webp', 'image/webp']]) {
    const res = ipcHandlers.get('agy-customizer:upload-asset')(trustedEvent, {
      category: 'wallpaper',
      name: 'sample' + ext,
      mime,
      bytes: Buffer.from('FAKE_STATIC_IMAGE_BYTES_' + ext)
    });
    assert.strictEqual(res.item.kind, 'static', `Upload ${ext} should be categorized as static`);
    const readBack = ipcHandlers.get('agy-customizer:read-asset')(trustedEvent, { category: 'wallpaper', id: res.item.id });
    assert.strictEqual(readBack.mime, mime);
    assert(readBack.bytes.byteLength > 0);
  }

  // 14c: Upload animated GIF & auto-detect Animated WEBP (RIFF....WEBPVP8X with bit 0x02 at offset 20)
  const gifRes = ipcHandlers.get('agy-customizer:upload-asset')(trustedEvent, {
    category: 'wallpaper',
    name: 'matrix-loop.gif',
    mime: 'image/gif',
    bytes: Buffer.from('GIF89a_FAKE_ANIMATED_GIF')
  });
  assert.strictEqual(gifRes.item.kind, 'gif', 'GIF upload must be categorized as gif');

  const animWebpHeader = Buffer.alloc(32);
  animWebpHeader.write('RIFF', 0, 'ascii');
  animWebpHeader.write('WEBP', 8, 'ascii');
  animWebpHeader.write('VP8X', 12, 'ascii');
  animWebpHeader[20] = 0x02; // animation flag
  const webpRes = ipcHandlers.get('agy-customizer:upload-asset')(trustedEvent, {
    category: 'wallpaper',
    name: 'aurora-loop.webp',
    mime: 'image/webp',
    bytes: animWebpHeader
  });
  assert.strictEqual(webpRes.item.kind, 'webp', 'Animated WEBP with RIFF VP8X animation flag must be categorized as webp');

  // 14d: Upload MP4 and WEBM video wallpapers
  for (const [ext, mime] of [['.mp4', 'video/mp4'], ['.webm', 'video/webm']]) {
    const vRes = ipcHandlers.get('agy-customizer:upload-asset')(trustedEvent, {
      category: 'wallpaper',
      name: 'cyber-city' + ext,
      mime,
      bytes: Buffer.from('FAKE_VIDEO_STREAM_' + ext)
    });
    assert.strictEqual(vRes.item.kind, 'video', `${ext} must be categorized as video`);
  }

  // 14e: Favorite, Rename, Set Default, and Delete Wallpaper
  const targetId = gifRes.item.id;
  const updated = ipcHandlers.get('agy-customizer:update-asset')(trustedEvent, {
    category: 'wallpaper',
    id: targetId,
    name: 'Renamed Matrix GIF',
    favorite: true,
    setDefault: true
  });
  assert.strictEqual(updated.item.name, 'Renamed Matrix GIF');
  assert.strictEqual(updated.item.favorite, true);
  assert.strictEqual(updated.library.defaultWallpaperId, targetId);

  const afterDel = ipcHandlers.get('agy-customizer:delete-asset')(trustedEvent, {
    category: 'wallpaper',
    id: targetId
  });
  assert(!afterDel.library.wallpapers.some(x => x.id === targetId), 'Deleted wallpaper must be removed from library');
  assert.strictEqual(afterDel.library.defaultWallpaperId, null, 'Deleting default wallpaper must clear defaultWallpaperId');

  // 14f: Upload TTF, OTF, WOFF, WOFF2 fonts
  for (const ext of ['.ttf', '.otf', '.woff', '.woff2']) {
    const fRes = ipcHandlers.get('agy-customizer:upload-asset')(trustedEvent, {
      category: 'font',
      name: 'CustomFont' + ext,
      bytes: Buffer.from('FAKE_FONT_BINARY_' + ext)
    });
    assert(fRes.item.cssFamily.startsWith('AGYCustom_'), `Font ${ext} must receive an isolated cssFamily`);
    const readFont = ipcHandlers.get('agy-customizer:read-asset')(trustedEvent, { category: 'font', id: fRes.item.id });
    assert(readFont.bytes.byteLength > 0, `Uploaded font ${ext} must be readable from persistent storage`);
  }

  // 14g: Save & reload customizer state + legacy preference coexistence
  ipcHandlers.get('ascii-wallpapers:save')(trustedEvent, {
    'asciiWallpaperPreferences.v1': JSON.stringify({ theme: 'aurora', intensity: 85, paused: false, reactive: true, recolor: true, glyphs: 'braille', scale: 'fine', quota: true })
  });
  ipcHandlers.get('agy-customizer:save-state')(trustedEvent, { version: 2, activeProfileId: 'cyberpunk' });
  const loadedState = ipcHandlers.get('agy-customizer:get-state')(trustedEvent);
  assert.strictEqual(loadedState.state.activeProfileId, 'cyberpunk');
  assert(loadedState.legacy['asciiWallpaperPreferences.v1'].includes('aurora'));

  fs.rmSync(tmpUserData, { recursive: true, force: true });
}

// ============================================================================
// Test 15: End-to-End Isolated ASAR Install, Verify, Duplicate Check & Restore
// ============================================================================
console.log('Running isolated ASAR install/verify/restore tests...');
{
  const tmpAsarDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-asar-test-'));
  const resourcesDir = path.join(tmpAsarDir, 'resources');
  fs.mkdirSync(resourcesDir, { recursive: true });
  // Create a mock Antigravity binary with fuse 4 off ('00000')
  const exeName = process.platform === 'win32' ? 'Antigravity.exe' : 'antigravity';
  fs.writeFileSync(path.join(tmpAsarDir, exeName), makeFuseBuffer('00000'));

  function buildMockAsar(filesObj) {
    const header = { files: {} };
    const chunks = [];
    let offset = 0;
    function addTree(src, dst) {
      for (const [k, v] of Object.entries(src)) {
        if (typeof v === 'string' || Buffer.isBuffer(v)) {
          const buf = Buffer.isBuffer(v) ? v : Buffer.from(v, 'utf8');
          const hash = require('crypto').createHash('sha256').update(buf).digest('hex');
          dst[k] = { size: buf.length, offset: String(offset), integrity: { algorithm: 'SHA256', hash, blockSize: 4194304, blocks: [hash] } };
          offset += buf.length;
          chunks.push(buf);
        } else {
          dst[k] = { files: {} };
          addTree(v, dst[k].files);
        }
      }
    }
    addTree(filesObj, header.files);
    const json = Buffer.from(JSON.stringify(header));
    const padded = Math.ceil((4 + json.length) / 4) * 4;
    const head = Buffer.alloc(8 + padded);
    head.writeUInt32LE(4 + padded, 0);
    head.writeUInt32LE(json.length, 4);
    json.copy(head, 8);
    const size = Buffer.alloc(8);
    size.writeUInt32LE(4, 0);
    size.writeUInt32LE(head.length, 4);
    return Buffer.concat([size, head, ...chunks]);
  }

  const cleanAsarBytes = buildMockAsar({
    'package.json': JSON.stringify({ name: 'antigravity', productName: 'Antigravity', version: '2.31.2', main: 'dist/main.js' }),
    dist: {
      'preload.js': '"use strict";\nconst electron_1 = require("electron");\nconst electronNativeAPI = {};\nconst x = \'agent:update-active-count\';\n',
      'main.js': '"use strict";\nconst electron_1 = require("electron");\n'
    }
  });
  const mockAsarPath = path.join(resourcesDir, 'app.asar');
  fs.writeFileSync(mockAsarPath, cleanAsarBytes);

  const statusBefore = execSync(`${nodeCmd} manage-wallpapers.cjs status "${mockAsarPath}"`, { cwd: rootDir, env: runEnv }).toString();
  assert(statusBefore.includes('wallpapers not installed') && statusBefore.includes('Ready to patch.'));

  const verifyOut = execSync(`${nodeCmd} manage-wallpapers.cjs verify "${mockAsarPath}"`, { cwd: rootDir, env: runEnv }).toString();
  assert(verifyOut.includes('archive rebuild verified, with all packed file integrity hashes intact. No files changed.'));

  const installOut = execSync(`${nodeCmd} manage-wallpapers.cjs install "${mockAsarPath}"`, { cwd: rootDir, env: runEnv }).toString();
  assert(installOut.includes('Installed ASCII wallpapers'));
  assert(fs.existsSync(mockAsarPath + '.ascii-wallpapers.backup'), 'Backup file must be created');
  assert(fs.existsSync(mockAsarPath + '.ascii-wallpapers.json'), 'Receipt file must be created');

  // Duplicate install check
  const dupOut = execSync(`${nodeCmd} manage-wallpapers.cjs install "${mockAsarPath}"`, { cwd: rootDir, env: runEnv }).toString();
  assert(dupOut.includes('Latest ASCII wallpapers are installed'), 'Duplicate install must be idempotent');

  // Restore via uninstall alias
  const restoreOut = execSync(`${nodeCmd} manage-wallpapers.cjs uninstall "${mockAsarPath}"`, { cwd: rootDir, env: runEnv }).toString();
  assert(restoreOut.includes('Original Antigravity 2.31.2 restored'));
  assert.strictEqual(
    Buffer.compare(fs.readFileSync(mockAsarPath), cleanAsarBytes),
    0,
    'Restored app.asar must match original byte-for-byte'
  );

  fs.rmSync(tmpAsarDir, { recursive: true, force: true });
}

// ============================================================================
// Test 16: Liquid Glass Engine, Presets, Fonts & Appearance Studio Verification
// ============================================================================
console.log('Running Liquid Glass & Appearance Studio verification tests...');
{
  const customizerSource = fs.readFileSync(path.join(rootDir, 'liquid-glass-customizer.js'), 'utf8');
  for (const preset of ['liquid', 'frosted', 'dark', 'clear', 'acrylic']) {
    assert(customizerSource.includes(`id: '${preset}'`), `Glass preset "${preset}" must be defined`);
  }
  for (const comp of ['background', 'sidebar', 'conversation', 'header', 'composer', 'menus', 'toolbars', 'dialogs', 'secondary']) {
    assert(customizerSource.includes(`id: '${comp}'`), `Glass component "${comp}" must be independently customizable`);
  }
  for (const font of ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'JetBrains Mono', 'Fira Code']) {
    assert(customizerSource.includes(`id: '${font}'`), `Built-in font "${font}" must be included`);
  }
  for (const profile of ['dark-liquid-glass', 'frosted-glass', 'cyberpunk', 'anime', 'minimalist', 'amoled-dark', 'neon', 'nature', 'acrylic', 'custom']) {
    assert(customizerSource.includes(`id: '${profile}'`), `Predefined profile "${profile}" must be included`);
  }
  for (const category of ['Overview', 'Wallpaper Manager', 'Glass Effects', 'Font Manager', 'Colors & Themes', 'Animation Settings', 'Wallpaper Library', 'Theme Profiles', 'Performance', 'Restore Defaults']) {
    assert(customizerSource.includes(`name: '${category}'`), `Appearance Studio category "${category}" must exist`);
  }
  assert(customizerSource.includes('Antigravity Appearance Studio'), 'Interface must be named Antigravity Appearance Studio');
}

console.log('All installer, asset storage, Liquid Glass, font, profile, and studio tests passed!');

// ============================================================================
// Test 17: Live DOM Execution of Liquid Glass Customizer & Appearance Studio
// ============================================================================
console.log('Running live DOM execution tests for Appearance Studio & engines...');
(async () => {
  const vm = require('vm');

  class MockElement {
    constructor(tag) {
      this.tagName = String(tag || 'div').toUpperCase();
      this.id = '';
      this.className = '';
      this.style = { setProperty: (k, v) => { this.style[k] = v; } };
      this.dataset = {};
      this.attributes = new Map();
      this.children = [];
      this.parentElement = null;
      this.textContent = '';
      this.innerHTML = '';
      this.hidden = false;
      this.value = '';
      this.checked = false;
      this.muted = true;
      this.paused = true;
      this.loop = false;
      this.complete = true;
      this.naturalWidth = 1920;
      this.naturalHeight = 1080;
      this.listeners = new Map();
      this.classList = {
        _set: new Set(),
        add: (...c) => c.forEach(x => this.classList._set.add(x)),
        remove: (...c) => c.forEach(x => this.classList._set.delete(x)),
        contains: (c) => this.classList._set.has(c)
      };
    }
    get isConnected() { return true; }
    setAttribute(k, v) {
      this.attributes.set(k, String(v));
      if (k === 'id') this.id = String(v);
      if (k === 'class') this.className = String(v);
      if (k === 'hidden') this.hidden = true;
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        this.dataset[camel] = String(v);
      }
    }
    getAttribute(k) { return this.attributes.get(k) ?? null; }
    append(...nodes) {
      for (const n of nodes) {
        if (n && typeof n === 'object') {
          n.parentElement = this;
          this.children.push(n);
        }
      }
    }
    prepend(...nodes) {
      for (const n of nodes.reverse()) {
        if (n && typeof n === 'object') {
          n.parentElement = this;
          this.children.unshift(n);
        }
      }
    }
    replaceChildren(...nodes) {
      this.children = [];
      this.append(...nodes);
    }
    remove() {
      if (this.parentElement) {
        this.parentElement.children = this.parentElement.children.filter(c => c !== this);
        this.parentElement = null;
      }
    }
    attachShadow() {
      this.shadowRoot = new MockElement('shadow-root');
      return this.shadowRoot;
    }
    addEventListener(ev, fn) {
      if (!this.listeners.has(ev)) this.listeners.set(ev, []);
      this.listeners.get(ev).push(fn);
    }
    removeEventListener() {}
    dispatchEvent(ev) {
      for (const fn of this.listeners.get(ev.type) || []) fn(ev);
    }
    click() {
      this.dispatchEvent({ type: 'click', target: this, preventDefault() {}, stopPropagation() {} });
    }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    getBoundingClientRect() { return { top: 6, left: 900, right: 960, bottom: 31, width: 60, height: 25 }; }
    getContext() {
      return { clearRect() {}, drawImage() {}, fillRect() {}, createLinearGradient: () => ({ addColorStop() {} }), save() {}, restore() {}, setTransform() {} };
    }
    matches(sel) {
      if (sel.startsWith('.')) return (this.className || '').split(/\s+/).includes(sel.slice(1));
      if (sel.startsWith('#')) return this.id === sel.slice(1);
      return this.tagName.toLowerCase() === sel.toLowerCase();
    }
    querySelectorAll(sel) {
      const results = [];
      const visit = (node) => {
        for (const child of node.children || []) {
          if (
            (sel.startsWith('.') && (child.className || '').split(/\s+/).includes(sel.slice(1))) ||
            (sel.startsWith('#') && child.id === sel.slice(1)) ||
            (sel === '[data-tab]' && child.dataset?.tab) ||
            (sel === 'button' && child.tagName === 'BUTTON')
          ) {
            results.push(child);
          }
          visit(child);
        }
      };
      visit(this);
      return results;
    }
    querySelector(sel) {
      return this.querySelectorAll(sel)[0] || null;
    }
  }

  const docHead = new MockElement('head');
  const docBody = new MockElement('body');
  const agyShell = new MockElement('div');
  agyShell.className = 'agy-shell';
  const asciiCanvas = new MockElement('canvas');
  asciiCanvas.id = 'agy-ascii-scene';
  agyShell.append(asciiCanvas);
  docBody.append(agyShell);

  const storageMap = new Map();
  const winObj = {
    innerWidth: 1440,
    innerHeight: 900,
    document: {
      readyState: 'complete',
      hidden: false,
      head: docHead,
      body: docBody,
      fonts: { add() {} },
      createElement: (tag) => new MockElement(tag),
      getElementById: (id) => docBody.querySelector('#' + id) || docHead.querySelector('#' + id),
      querySelector: (sel) => (sel === '.agy-shell' ? agyShell : docBody.querySelector(sel) || docHead.querySelector(sel)),
      addEventListener() {},
      removeEventListener() {}
    },
    localStorage: {
      getItem: (k) => storageMap.get(k) ?? null,
      setItem: (k, v) => storageMap.set(k, String(v)),
      removeItem: (k) => storageMap.delete(k)
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    URL: {
      createObjectURL: () => 'blob:https://127.0.0.1:40000/mock-object-url',
      revokeObjectURL: () => {}
    },
    Blob: class { constructor(parts, opts) { this.parts = parts; this.type = opts?.type; } },
    FontFace: class { constructor(family, src) { this.family = family; this.src = src; } load() { return Promise.resolve(this); } },
    MutationObserver: class { observe() {} disconnect() {} },
    CustomEvent: class { constructor(type) { this.type = type; } },
    Event: class { constructor(type) { this.type = type; } },
    navigator: { clipboard: { writeText() {} } },
    addEventListener() {},
    dispatchEvent() {},
    setTimeout,
    clearTimeout,
    __agyAsciiBridge: {
      themes: [{ id: 'aurora', name: 'Aurora', light: false, sky: '#061220', floor: '#0d2233', chrome: '#0a1724', panel: '#0b1826', card: '#16283a', fg: '#e9f4f2', muted: '#a9c4c4', border: '#35506a', accent: '#7cf2b4' }],
      getPrefs: () => ({ theme: 'aurora', intensity: 100, paused: false, reactive: true, recolor: true, glyphs: 'ascii', scale: 'normal', quota: true }),
      setPrefs() {},
      select() {},
      toggle() {},
      getElements: () => ({ canvas: asciiCanvas, shell: agyShell }),
      windowAPI: { setTitleBarOverlay: () => Promise.resolve() }
    }
  };
  winObj.window = winObj;

  const customizerCode = fs.readFileSync(path.join(rootDir, 'liquid-glass-customizer.js'), 'utf8');
  vm.runInNewContext(customizerCode, winObj);
  await new Promise(r => setTimeout(r, 30));

  const api = winObj.__agyLiquidGlass;
  assert(api, 'window.__agyLiquidGlass must be initialized');

  // 17a: Test all 5 glass presets & CSS generation
  const glassStyle = docHead.querySelector('#agy-liquid-glass-style');
  assert(glassStyle, '#agy-liquid-glass-style must be mounted in document.head');

  for (const presetId of ['liquid', 'frosted', 'dark', 'clear', 'acrylic']) {
    await api.applyGlassPreset(presetId);
    assert.strictEqual(api.getState().glass.preset, presetId);
    assert(glassStyle.textContent.includes('backdrop-filter: blur('), `Preset ${presetId} must generate backdrop-filter CSS`);
  }

  // 17b: Test independent component customization (Sidebar 65%/20px, Conversation 45%/15px, Composer 35%/25px)
  const st = api.getState();
  st.glass.components.sidebar = { enabled: true, transparency: 65, blur: 20 };
  st.glass.components.conversation = { enabled: true, transparency: 45, blur: 15 };
  st.glass.components.composer = { enabled: true, transparency: 35, blur: 25 };
  await api.setState(st);
  assert(glassStyle.textContent.includes('35%, transparent) !important; backdrop-filter: blur(20px)'), 'Sidebar 65% transparency (35% mix) and 20px blur must be rendered');
  assert(glassStyle.textContent.includes('55%, transparent) !important; backdrop-filter: blur(15px)'), 'Conversation 45% transparency (55% mix) and 15px blur must be rendered');
  assert(glassStyle.textContent.includes('65%, transparent) !important; backdrop-filter: blur(25px)'), 'Composer 35% transparency (65% mix) and 25px blur must be rendered');

  // 17c: Test custom wallpaper upload, switching (Static, GIF, WEBP, Video), positioning & effects
  const wpItem = await api.uploadAsset({
    category: 'wallpaper',
    name: 'nebula.png',
    mime: 'image/png',
    bytes: new Uint8Array([137, 80, 78, 71])
  });
  assert.strictEqual(wpItem.kind, 'static');

  const stWp = api.getState();
  stWp.wallpaper.source = 'static';
  stWp.wallpaper.assetId = wpItem.id;
  stWp.wallpaper.fit = 'contain';
  stWp.wallpaper.brightness = 120;
  stWp.wallpaper.blur = 8;
  stWp.wallpaper.overlayType = 'gradient';
  await api.setState(stWp);

  const stage = agyShell.querySelector('#agy-custom-wallpaper-stage');
  assert(stage, '#agy-custom-wallpaper-stage must be mounted inside .agy-shell');
  assert.strictEqual(asciiCanvas.style.display, 'none', 'ASCII canvas must hide when custom static wallpaper is active');

  // 17d: Test custom font upload & typography rules
  const fontItem = await api.uploadAsset({
    category: 'font',
    name: 'Orbitron.woff2',
    mime: 'font/woff2',
    bytes: new Uint8Array([119, 79, 70, 50])
  });
  const stFont = api.getState();
  stFont.fonts.enabled = true;
  stFont.fonts.main = fontItem.id;
  stFont.fonts.sidebar = 'Poppins';
  stFont.fonts.code = 'Fira Code';
  stFont.fonts.sizePx = 16;
  await api.setState(stFont);
  const fontStyle = docHead.querySelector('#agy-custom-fonts-style');
  assert(fontStyle.textContent.includes(fontItem.cssFamily), 'Uploaded font family must be applied to #agy-custom-fonts-style');
  assert(fontStyle.textContent.includes('Poppins'), 'Independent sidebar font must be applied');
  assert(fontStyle.textContent.includes('Fira Code'), 'Independent code font must be applied');

  // 17e: Test Theme Profiles (Built-in switch, Create, Rename, Duplicate, Export, Import, Delete)
  assert(api.applyProfileById('cyberpunk'), 'Built-in Cyberpunk profile must activate');
  assert.strictEqual(api.getState().activeProfileId, 'cyberpunk');
  const createdProf = api.createUserProfile('My Custom Glass');
  assert.strictEqual(createdProf.name, 'My Custom Glass');
  assert(api.renameUserProfile(createdProf.id, 'Renamed Glass'));
  const exportedJson = api.exportProfileJson(createdProf.id);
  assert(exportedJson.includes('Renamed Glass'));
  const importedProf = api.importProfileJson(exportedJson);
  assert.strictEqual(importedProf.name, 'Renamed Glass');
  assert(api.deleteUserProfile(createdProf.id));

  // 17f: Open Appearance Studio and switch across all 10 tabs
  api.toggleStudio(true);
  const studioHostEl = docBody.querySelector('#agy-appearance-studio-host');
  const navBtns = studioHostEl.shadowRoot.querySelectorAll('.nav-btn');
  assert.strictEqual(navBtns.length, 10, 'Appearance Studio must render all 10 category navigation buttons');
  for (const btn of navBtns) {
    btn.click();
  }

  // 17g: Verify default on startup & borderless active row styling
  assert.strictEqual(docBody.dataset.agyCustomizer, 'true', 'body.dataset.agyCustomizer must be true');
  assert(docBody.dataset.awTheme, 'body.dataset.awTheme must be defined');
  const glassCss = glassStyle.textContent;
  assert(glassCss.includes('[data-active="true"]'), 'Active conversation item must be styled');
  assert(glassCss.includes('border: none !important'), 'Active row must be borderless');
  assert(glassCss.includes(':is(body[data-aw-theme], body[data-agy-customizer])'), 'Rules must match both aw-theme and agy-customizer');

  console.log('Live DOM execution tests passed!');
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
