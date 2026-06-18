# 🎮 Stream Break Screen Overlay

A **free, no-install browser overlay** for Twitch streamers — drop it straight into Streamlabs Desktop or OBS Studio as a Browser Source. No server, no account, no framework. Just open `index.html`.

> **Like this? [Buy me a Ko-fi ☕](https://ko-fi.com/folkfirebrand)** — it helps me keep building free tools for the community!

---

## ✨ Features

- 🪃 **Bouncing logo** — your image bounces around the screen with physics, 3D rotation, and collision ripples
- ⏱️ **Countdown timer** — an animated ring countdown (set any duration)
- 📣 **Social media carousel** — cycles through your platforms automatically
- 🎨 **5 built-in themes** — Cream & Gold, Neon Cyber, Dark Nebula, Emerald Glow, Solar Ember
- ✨ **Ambient particle effects** — glowing embers/dust and a digital grid backdrop
- ⚙️ **Live settings panel** — tweak everything without touching a file (press `C` or click the gear ⚙️)
- 💾 **Persistent settings** — your changes are saved in the browser and reload automatically
- 🖥️ **OBS/Streamlabs compatible** — fully tested in Streamlabs Desktop's Chromium Embedded Framework

---

## 🚀 Quick Start

### 1. Download

Click **Code → Download ZIP** on GitHub, then unzip the folder anywhere on your PC.

### 2. Customize `config.js`

Open `config.js` in any text editor (Notepad is fine) and fill in your details:

```js
// Your social handles — leave "" to hide a platform
socials: {
    twitch:    "YourChannel",
    instagram: "@yourhandle",
    youtube:   "@yourchannel",
    kofi:      "yourpage",
    // ...
},

// How long your break is (in seconds)
timerDuration: 300,   // 300 = 5 minutes

// Your break screen message
statusText:    "BE RIGHT BACK",
statusSubtext: "Taking a quick break! Grab a drink and settle in.",

// Theme: "cream-gold" | "neon-cyber" | "dark-nebula" | "emerald-glow" | "fire-glow"
themePreset: "cream-gold",
```

### 3. Add your logo *(optional)*

Replace `FFNEW.png` with your own image (JPG, PNG, GIF, WebP). Update `config.js`:

```js
defaultImage: "your-logo.png",
```

Or upload it live using the Settings panel's **Upload JPG/PNG** button.

### 4. Add to Streamlabs / OBS

| Setting | Value |
|---|---|
| **Source type** | Browser Source |
| **URL / Local file** | Browse to `index.html` |
| **Width** | `1920` |
| **Height** | `1080` |
| **Custom CSS** | *(leave empty)* |
| **Refresh on scene activate** | ✅ Recommended |

---

## ⚙️ Settings Panel

While the overlay is open, press **`C`** or click the **⚙️** gear icon (top-right corner) to open the live settings panel. From here you can:

- Upload a custom bouncer image
- Adjust physics (speed, size, rotation axes)
- Set the countdown timer and control Start / Pause / Reset
- Edit status text and all social handles
- Reposition widgets and change their scale
- Switch themes and toggle visual effects

Click **Apply & Save Settings** to persist your changes across sessions.

---

## 🎨 Themes

| Name | Palette |
|---|---|
| `cream-gold` | Warm cream background, gold/amber accents — great for cozy streams |
| `neon-cyber` | Dark background, purple / pink / cyan neon |
| `dark-nebula` | Deep blue / indigo cosmic feel |
| `emerald-glow` | Dark teal / green — great for nature or chill content |
| `fire-glow` | Dark grey with orange / red ember tones |

---

## 📂 File Structure

```
twitch-break-screen/
├── index.html      ← The overlay (open this in Streamlabs/OBS)
├── app.js          ← All logic: physics, timer, carousel, settings
├── style.css       ← All styles and theme definitions
├── config.js       ← ⭐ Your personal settings (edit this!)
├── FFNEW.png       ← Default bouncing logo (replace with your own)
└── LICENSE         ← MIT — free to use and modify
```

---

## 🛠️ Tips & Troubleshooting

**Settings panel dropdowns don't open in Streamlabs "Interact" window?**
This is a known Chromium Embedded Framework (CEF) limitation. Use the overlay's **custom dropdown** UI — it works around this automatically.

**The timer resets when I switch scenes?**
Enable **"Refresh browser when scene becomes active"** in Streamlabs/OBS, or use the **Start** button inside the settings panel to begin the countdown manually after switching to the scene.

**My image looks blurry?**
Use a PNG with a transparent background for the cleanest result. A square image around 600×600px or larger works best.

**How do I reset all my saved settings?**
In the browser's developer console (F12), run: `localStorage.removeItem('twitch_break_screen_settings')` then refresh.

---

## 📄 License

[GNU General Public License v3.0](LICENSE) — free to use, modify, and redistribute. If you distribute a modified version, you must also share the source code under the same license.

---

*Made with ❤️ by [FolkFirebrand](https://www.twitch.tv/FolkFirebrand) — [Support on Ko-fi ☕](https://ko-fi.com/folkfirebrand)*
