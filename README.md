# Antigravity Ultimate Personalization Mod — Liquid Glass & Custom Wallpapers

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Antigravity](https://img.shields.io/badge/Antigravity-2.28%20--%202.31%2B-purple.svg)](https://antigravity.google)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-success.svg)](https://github.com/ashenmp4/Antigravity-Wallpapers)
[![Download ZIP](https://img.shields.io/badge/Download-Release%20ZIP%20(9.9MB)-brightgreen.svg?style=flat-square&logo=archive)](https://github.com/ashenmp4/Antigravity-Wallpapers/raw/main/antigravity-liquid-glass-customizer.zip)

A powerful, high-performance customization suite for the [Antigravity](https://antigravity.google) desktop application. Transform your coding and AI experience with **custom static images, animated GIFs, looping videos, 50 procedural ASCII scenes**, a dynamic **multi-layered Liquid Glass & Glassmorphism engine**, custom typography fonts, and an all-in-one **Appearance Studio** (`Ctrl+Alt+G`).

---

## 🌟 Original Creator Attribution

This project is an extended edition based on the foundational work by the original creator:

- **Original Creator**: **[erlttt0](https://github.com/erlttt0)** ([Mix4o445](https://mix4o445.github.io/antigravity-ascii-wallpapers/))
  - Created the original [antigravity-ascii-wallpapers](https://github.com/erlttt0/antigravity-ascii-wallpapers) project.
  - Authored the **50 procedural ASCII scene renderers** (Aurora, Catnap, Koi Pond, Digital Rain, etc.), the quick theme switcher, and the real-time model quota monitor chip.
  - Designed the robust, fuse-safe `app.asar` patching and integrity verification architecture.

> **Disclaimer**: This is an independent, unofficial community mod. It is not affiliated with, sponsored, or endorsed by Google. All modifications are made locally to your installed app with automated checksum backups.

---

## ✨ Features Overview

### 1. 🖼️ Complete Custom Wallpaper Engine
- **Static Wallpapers**: Upload your own **PNG**, **JPG**, **JPEG**, or **WEBP** wallpapers.
- **Animated & Video Wallpapers**: Full support for **looping MP4**, **WEBM**, **GIF**, and **animated WEBP** backgrounds. Includes playback speed, volume controls, mute/unmute, and canvas frame-freeze.
- **50 Procedural ASCII Wallpapers**: 28 dark and 22 light algorithmic art themes that dynamically react when agents are thinking or finish tasks.
- **Display Modes & Real-Time Adjustments**: Cover, Contain, Stretch, Center, or Tile. Adjust brightness, contrast, saturation, blur, opacity, dimming, and custom gradient overlays on the fly.
- **Persistent Wallpaper Library**: All uploaded media is safely stored in `%APPDATA%\Antigravity\liquid-glass-customizer\wallpapers\`. Reinstalling or updating the mod never deletes your images.

### 2. 🧊 Liquid Glass & Glassmorphism
- **5 Handcrafted Glass Presets**: **Liquid Glass**, **Frosted Glass**, **Dark Glass**, **Clear Glass**, and **Acrylic Glass**.
- **Component-Level Control**: Fine-tune transparency (`0–100%`) and blur (`0–50px`) independently for:
  - Sidebar & Project Navigation
  - Main Conversation Area & Chat Bubbles
  - Prompt Composer & Input Bar
  - Title Bar & Navigation Header
  - Markdown Tables (Frosted glass styling without opaque black blocks)
  - Secondary Panels (PDF viewer, Artifacts viewer, Inspector)
  - Floating Toolbars & Dropdown Menus
  - Settings & System Dialogs
- **Specular Highlights & Edge Shimmer**: Adjustable light-refraction gradients and subtle dynamic shimmer.

### 3. 🎛️ Integrated Appearance Studio (`Ctrl + Alt + G`)
- Manage everything in real-time from an intuitive in-app dashboard.
- **10 Dedicated Studio Tabs**:
  1. **Overview**: Live status and quick toggles.
  2. **Wallpaper Manager**: Drag-and-drop file uploader and live tuning sliders.
  3. **Glass Effects**: Sliders for blur, opacity, reflections, and corner radius.
  4. **Font Manager**: Drag-and-drop `.ttf`, `.otf`, `.woff`, `.woff2` font uploader.
  5. **Colors & Themes**: Accent colors, text color balance, and dark/light modes.
  6. **Animation Settings**: Reactive agent effects, typing shimmers, and FPS limits.
  7. **Wallpaper Library**: Full-screen preview, favorites, and default selectors.
  8. **Theme Profiles**: Save custom setups and choose a **Default Startup Profile** that launches automatically every time you open Antigravity.
  9. **Performance**: GPU hardware acceleration settings, power-saver mode, and auto-pause when unfocused.
  10. **Restore Defaults**: One-click reset to clean mod settings.

---

## 📦 Downloadable Releases (ZIP)

You can download the ready-to-run ZIP package directly:

- **Direct Download**: **[Click here to download antigravity-liquid-glass-customizer.zip](https://github.com/ashenmp4/Antigravity-Wallpapers/raw/main/antigravity-liquid-glass-customizer.zip)** (9.9 MB — includes all mod scripts, launchers, and assets).
- **GitHub ZIP**: Click the green **Code** button at the top of the repository and select **Download ZIP**, or grab the latest build from the [Releases](https://github.com/ashenmp4/Antigravity-Wallpapers/releases) tab.
- **Portable & Zero Dependencies on Windows**: The installer automatically uses Antigravity's built-in Node engine (`Antigravity.exe`) if you don't have Node.js installed on your computer. Simply extract and double-click `install.bat`!

---

## 🚀 Step-by-Step Setup Tutorial

### Method 1: One-Click Quick Install (Windows — Recommended)

1. **Download and Extract**:
   - Download the repository ZIP file and extract it to a folder (e.g., `Downloads` or `C:\Users\<You>\Desktop`).
2. **Close Antigravity**:
   - Ensure the Antigravity application is completely closed (check your system tray to make sure it's not running in the background).
3. **Run `install.bat`**:
   - Double-click `install.bat` inside the extracted folder.
   - *(If your program files require administrator permissions, right-click `install.bat` and select **Run as administrator**).*
4. **Open Antigravity**:
   - Launch Antigravity. You will see the **[☆ Studio]** and **Themes** buttons in the top bar!

---

### Method 2: Command Line Install (Windows, macOS, Linux)

If you prefer using your terminal or PowerShell:

#### Windows (PowerShell or Command Prompt):
```powershell
# 1. Navigate to the mod folder
cd path\to\antigravity-ascii-wallpapers

# 2. Make sure Antigravity is closed, then run:
.\manage-wallpapers.cmd install
```

#### macOS:
```bash
# 1. Open Terminal and navigate to the mod folder
cd path/to/antigravity-ascii-wallpapers

# 2. Make sure Antigravity is closed, then run:
node manage-wallpapers.cjs install
# (If your /Applications folder is protected, use: sudo node manage-wallpapers.cjs install)
```

#### Linux:
```bash
# 1. Open Terminal and navigate to the mod folder
cd path/to/antigravity-ascii-wallpapers

# 2. Make sure Antigravity is closed, then run:
node manage-wallpapers.cjs install
# (If installed in /opt or system paths, use: sudo node manage-wallpapers.cjs install)
```

---

## 🎨 How to Use Appearance Studio

Once installed, there are **4 ways** to open the customizer inside Antigravity:

| Action | Shortcut / Trigger |
|---|---|
| **Keyboard Shortcut** | Press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>G</kbd> *(or <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>G</kbd> on macOS)* |
| **Top Titlebar** | Click the **[☆ Studio]** button in the top-right titlebar |
| **Themes Panel** | Click **Themes** in the top bar, then click the **Studio** button |
| **Composer Command** | Type `/studio` or `/appearance` into the chat input and hit Enter |

### Adding Your Own Wallpaper in 30 Seconds:
1. Open Appearance Studio (<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>G</kbd>).
2. Go to the **Wallpaper Manager** tab.
3. Drag and drop any **JPG**, **PNG**, **GIF**, or **MP4** into the drop zone.
4. Select your fit mode (**Cover**, **Contain**, or **Center**) and adjust the blur or brightness sliders.
5. Click **Apply Wallpaper Now**. It updates instantly in real time!

### Setting a Default Startup Theme (Automatic on Launch):
1. Configure your wallpaper and glass preferences to your liking.
2. Go to the **Theme Profiles** tab in Studio.
3. Click **Save Current Profile** (e.g. name it `My Theme`).
4. Click **Set as Default Startup Profile**.
5. Every time you open Antigravity, your theme and wallpaper will load immediately on launch!

---

## 🔄 After an Antigravity Update

When Google releases an update to Antigravity, the updater replaces the internal `app.asar` file, which temporarily removes the mod.

**Re-applying takes 5 seconds:**
1. Close Antigravity.
2. Double-click `install.bat` (or run `.\manage-wallpapers.cmd install`).
3. Reopen Antigravity!

> **Your media is safe**: All uploaded wallpapers, custom fonts, and saved profiles are stored separately in `%APPDATA%\Antigravity\liquid-glass-customizer\`, so updating or re-installing will **never** lose your pictures or settings.

---

## 🗑️ How to Uninstall / Clean Restore

To revert Antigravity back to its 100% factory clean state:

1. Close Antigravity.
2. Double-click `uninstall.bat` (or run `.\manage-wallpapers.cmd restore`).
3. The original factory archive is verified and restored from the automatic backup (`app.asar.ascii-wallpapers.backup`).

---

## 🛡️ Safety & Architecture

- **Automatic Checksum Backups**: An untampered copy of your original `app.asar` is preserved prior to patching.
- **Embedded Asar Fuse Verification**: Respects Electron runtime fuses and integrity checks before making changes.
- **100% Local & Private**: No analytics, telemetry, or external network requests.
- **Performance Optimized**: Looping videos and animated renderers automatically pause when Antigravity is minimized or behind other windows to preserve battery and CPU/GPU resources.

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

Original ASCII renderers & themes Copyright (c) 2026 **erlttt0** (Mix4o445).  
Liquid Glass Customizer & Appearance Studio enhancements Copyright (c) 2026 ashenmp4.
