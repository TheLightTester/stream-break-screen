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
- 🖱️ **Interact-friendly** — control the overlay live from inside OBS or Streamlabs using the built-in Interact window
- 💾 **Persistent settings** — your changes are saved in the browser and reload automatically
- 🖥️ **OBS/Streamlabs compatible** — fully tested in Streamlabs Desktop's Chromium Embedded Framework

---

## 🚀 Quick Start

### Step 1 — Download & Extract

Click **Code → Download ZIP** on GitHub, then unzip the folder anywhere on your PC.

---

### Step 2 — Open in Browser to Configure

Double-click `index.html` to open it in Chrome or Edge. This lets you:

- Press **`C`** or click the **⚙️** gear icon to open the Settings panel
- Set your break message, timer duration, social handles, theme, and logo
- Click **Apply & Save Settings** — your choices are saved and will persist automatically

> You only need the browser open for this setup step. Once your settings are saved, you're done here.

---

### Step 3 — Add as a Browser Source

In **Streamlabs Desktop** or **OBS Studio**, add a new Browser Source with these settings:

| Setting | Value |
|---|---|
| **Source type** | Browser Source |
| **URL / Local file** | Browse to `index.html` |
| **Width** | `1920` |
| **Height** | `1080` |
| **Custom CSS** | *(leave empty)* |
| **Refresh on scene activate** | ✅ Recommended |

Your browser does **not** need to be open while streaming — the stream software runs the overlay itself.

---

### Step 4 — Control It Live with Interact

Need to start the timer, change settings, or update text mid-stream? Use the **Interact** feature built into OBS and Streamlabs — no alt-tabbing required:

1. Right-click the Browser Source in your source list
2. Select **Interact**
3. Press **`C`** or click the ⚙️ gear icon to open Settings
4. Make your changes and hit **Apply & Save Settings**

---

### 🛠️ Advanced: Edit `config.js` Directly

Prefer to configure everything upfront in a text file? Open `config.js` in any editor (Notepad works) and set your defaults before adding the source:

```js
// Your social handles — leave "" to hide a platform
socials: {
    twitch:    "YourChannel",
    instagram: "@yourhandle",
    youtube:   "@yourchannel",
    kofi:      "yourpage",
},

// Break duration in seconds (300 = 5 minutes)
timerDuration: 300,

// Break message
statusText:    "BE RIGHT BACK",
statusSubtext: "Taking a quick break! Grab a drink and settle in.",

// Theme: "cream-gold" | "neon-cyber" | "dark-nebula" | "emerald-glow" | "fire-glow"
themePreset: "cream-gold",

// Your logo image (place file in the same folder as index.html)
defaultImage: "your-logo.png",
```

Settings saved via the in-overlay panel always take priority over `config.js`.

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

## 🖱️ Using Interact (Live Control from OBS / Streamlabs)

You don't need to alt-tab out of your stream to change settings. Both OBS Studio and Streamlabs Desktop have a built-in **Interact** feature that lets you click inside the browser source in real time.

**In Streamlabs Desktop:**
1. Right-click the Browser Source in your source list
2. Select **Interact**
3. The overlay opens in an interactive window — press **`C`** or click the **⚙️** gear icon to open the settings panel

**In OBS Studio:**
1. Right-click the Browser Source in your source list
2. Select **Interact**
3. Same as above — press **`C`** or click the gear to open settings

> **Note:** Native `<select>` dropdowns won't open in the Interact window due to a CEF limitation. This overlay uses custom-built dropdowns that work around this automatically — all controls function as expected.

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
stream-break-screen/
├── index.html      ← The overlay (open this in Streamlabs/OBS)
├── app.js          ← All logic: physics, timer, carousel, settings
├── style.css       ← All styles and theme definitions
├── config.js       ← ⭐ Your personal settings (edit this!)
├── default-logo.png ← Default bouncing logo (replace with your own)
└── LICENSE         ← GNU GPL v3 — free to use and modify
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
