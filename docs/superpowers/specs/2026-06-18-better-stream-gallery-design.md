# Better Stream Gallery — Design Spec

**Date:** 2026-06-18  
**Author:** Brainstorming session (TheLightTester)  
**Status:** Approved for implementation

---

## Overview

A new stream utility overlay widget (`better-stream-gallery/`) for OBS/Streamlabs browser sources. It displays a rotating gallery of user-provided images with cinematic Ken Burns motion, multiple display modes, randomized transitions, and a glassmorphic control panel — following the same architecture and conventions as the existing `stream-break-screen` project.

The gallery can operate in two modes: **transparent overlay** (layered on top of other stream content) or **solid background** (full-canvas image replacement, e.g. for an intermission scene). Settings are persisted to `localStorage`.

---

## Constraints & Conventions

These are inherited from the `stream-break-screen` project and must be respected:

- **No build tools, no framework, no bundler.** Pure HTML + CSS + JS.
- **No native `<select>` elements** in the settings panel. The OBS/Streamlabs CEF interact window does not open native dropdowns. Use the custom `.custom-select` DOM system (same `initCustomSelects()` / `updateCustomSelects()` pattern).
- **No automated browser testing.** Verified manually by opening `index.html` in Chrome/Edge or inside Streamlabs Desktop.
- **Target resolution: 1920×1080 (16:9)** browser source.
- **Settings persisted to `localStorage`** under key `gallery_settings`.
- **Theme system via CSS custom properties** on `:root` — never hardcode colors.

---

## File Architecture

| File | Purpose |
|---|---|
| `index.html` | Full structural markup — overlay canvas, display mode containers, settings panel |
| `style.css` | All visual styling, CSS variables for themes, transition keyframes, display mode layouts |
| `app.js` | All runtime logic — image loading, slideshow engine, Ken Burns, transitions, settings I/O, custom selects |
| `config.js` | User-facing default configuration object (`GALLERY_CONFIG`) — loaded before `app.js` |

The folder `better-stream-gallery/` lives adjacent to `stream-break-screen/` inside the Coding projects workspace.

---

## Image Loading

### Primary: File System Access API
- A button labeled **"Open Folder"** triggers `window.showDirectoryPicker()`.
- The app reads all files with extensions `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` from the selected directory (non-recursive, top level only).
- Images are converted to Object URLs and held in memory as an array (`imageList`).
- A thumbnail strip in the settings panel shows loaded images with a count badge (e.g. "24 images loaded").
- **Permission note:** FSA permissions are session-scoped. If the page is reloaded, the user must re-open the folder. A notice is shown in the panel when no images are loaded.

### Fallback: Multi-file Upload
- A secondary button labeled **"Upload Images"** opens `<input type="file" multiple accept="image/*">`.
- Selected files are converted to Object URLs and treated identically to FSA-loaded images.
- This path is always visible (not hidden behind a feature check), so Firefox users and older OBS builds are covered.

### Image List Operations
- **Clear** button disposes all Object URLs and resets the gallery to an empty state.
- Order of `imageList` is established at load time. Shuffle/Sequential mode determines playback order at runtime without mutating `imageList`.

---

## Display Modes

One mode is active at a time, selected via a dropdown in the settings panel.

### Fullscreen
- A single image fills the entire 1920×1080 canvas using CSS `object-fit: cover`.
- Ken Burns effect is applied to the image via a CSS animation on a wrapper div.
- On transition, the outgoing image exits and the incoming image enters using the selected transition effect.

### Mosaic Grid
- 4 images (2×2) or 9 images (3×3) are displayed simultaneously, selected by a sub-option (2×2 / 3×3).
- Each cell updates independently on its own timer (staggered by cell index × 500ms offset).
- Ken Burns runs independently per cell.
- Transitions apply per cell.

### Floating Cards
- 5 image "cards" are rendered as absolutely-positioned divs with a 3D CSS `perspective` and subtle `rotateY` / `rotateX` tilt.
- Cards drift slowly across the canvas using a randomized sinusoidal path (no physics, pure CSS animation with randomized `animation-duration` and `animation-delay`).
- Each card cycles its image independently using the same transition system.
- Cards are `pointer-events: none` so they do not interfere with the settings toggle button.
- Ken Burns runs per card.

### Filmstrip
- One large **hero image** occupies the center-top region (~80% of canvas height).
- A horizontal **thumbnail strip** runs along the bottom (~18% of canvas height), showing the previous 2 and next 2 images (5 thumbnails total, centered on the current image).
- The strip scrolls with a smooth slide animation as images advance.
- Transitions apply to the hero image only. Thumbnails swap instantly.
- Ken Burns runs on the hero image only.

---

## Ken Burns Effect

Applied to all images in all display modes (can be toggled off in the panel).

- Each image gets a CSS animation on its wrapper that combines a slow `scale()` and `translate()`.
- Direction is randomized per image from a set of 8 presets:
  - Zoom in: center, top-left origin, top-right origin, bottom-left origin
  - Zoom out: center, top-left origin, top-right origin, bottom-right origin
- Duration matches the slide duration (so the motion fills the entire display time).
- **Intensity slider** (Subtle / Medium / Dramatic) controls the scale range:
  - Subtle: 1.0 → 1.08
  - Medium: 1.0 → 1.15
  - Dramatic: 1.0 → 1.25

---

## Transitions

Seven transition types. Each is implemented as a pair of CSS keyframe animations: one for the **outgoing** image (exits) and one for the **incoming** image (enters).

| ID | Name | Description |
|---|---|---|
| `fade` | Fade Dissolve | Outgoing fades out, incoming fades in simultaneously |
| `zoom` | Zoom Burst | Incoming scales from 1.3→1.0 while fading in; outgoing fades out |
| `slide` | Slide | Outgoing slides off in a random cardinal direction; incoming slides in from opposite |
| `flip` | Flip | 3D horizontal card flip using `rotateY`, mid-flip image swap |
| `glitch` | Glitch | Rapid clip-rect / translate jitter on outgoing before incoming snaps in |
| `shatter` | Shatter | Outgoing splits into rectangular shards (clip-path grid) that scatter outward |
| `vignette` | Vignette Wipe | Radial clip-path expands from center to reveal incoming image |

### Transition Selection
- Each transition has a **checkbox** in the settings panel (all checked by default).
- At each image advance, a transition is picked **randomly from the checked set**.
- At least one transition must remain checked (disabling the last one is prevented with a UI warning).
- **Transition speed slider**: 0.5s – 3.0s controls animation duration.

---

## Shuffle vs. Sequential

A toggle in the settings panel (two radio buttons: **Shuffle** / **Sequential**).

### Sequential
- Images advance in the order they were loaded (index 0, 1, 2 … N, then loops back to 0).

### Shuffle
- A shuffled play queue is generated using a Fisher-Yates shuffle of `imageList` indices.
- Images play through the shuffled queue; when exhausted, a new shuffle is generated (ensuring no immediate repeat of the last image across shuffles).
- The current play queue is shown as a small progress indicator: "Photo 7 of 24".

---

## Timing

Two sliders in the settings panel:

| Control | Range | Default | Description |
|---|---|---|---|
| Slide Duration | 5s – 60s | 12s | How long each image is displayed (from transition end to next transition start) |
| Transition Speed | 0.5s – 3.0s | 1.2s | Duration of the transition animation itself |

---

## Overlay Mode

A toggle in the settings panel with two states:

### Transparent Overlay
- `body` background is `transparent`.
- No background color or pattern is drawn behind the images.
- Intended use: OBS browser source layered on top of gameplay/content.
- Images display with their natural transparency edges (if any).

### Solid Background
- `body` background uses the active **theme** (same 5 themes as break screen: `cream-gold`, `neon-cyber`, `dark-nebula`, `emerald-glow`, `fire-glow`).
- Ambient particle canvas is rendered (same system as break screen, optional via toggle).
- Intended use: Full intermission/break scene replacement.
- Theme dropdown and particle controls appear in the panel when this mode is active.

---

## Control Panel

Follows the exact same UX pattern as `stream-break-screen`:

- **Gear icon button** (top-right corner of the overlay) toggles the panel open/closed.
- **Keyboard shortcut `C`** toggles the panel (blocked when focus is inside an `INPUT`, `TEXTAREA`, or `SELECT`).
- Panel is a **glassmorphic sidebar** sliding in from the right.
- Panel sections:

| # | Section | Controls |
|---|---|---|
| 1 | Image Source | Open Folder button, Upload Images button, thumbnail strip, image count, Clear button |
| 2 | Display Mode | Custom select dropdown (Fullscreen / Mosaic / Floating Cards / Filmstrip), Mosaic sub-option (2×2 / 3×3) shown conditionally |
| 3 | Playback | Shuffle / Sequential radio, slide duration slider, transition speed slider |
| 4 | Transitions | 7 checkboxes (one per transition type), "at least one required" guard |
| 5 | Ken Burns | Enable toggle, Intensity select (Subtle / Medium / Dramatic) |
| 6 | Overlay Mode | Toggle (Transparent / Solid Background), theme dropdown + particle density slider (shown only in Solid mode) |
| 7 | Playback Controls | Play / Pause button, Previous / Next buttons |

- **Apply & Save Settings** button at the footer persists all settings to `localStorage`.
- Custom select system (`initCustomSelects` / `updateCustomSelects`) used for all dropdowns.

---

## Settings System

Mirrors `stream-break-screen` three-layer priority:

1. `localStorage` (`gallery_settings`) — saved by "Apply & Save Settings"
2. `GALLERY_CONFIG` in `config.js` — user file-level defaults
3. `DEFAULT_SETTINGS` in `app.js` — code-level fallback

Image file handles/URLs are **not** persisted (FSA handles cannot be serialized to localStorage). On reload, the user must re-open the folder or re-upload. A "No images loaded" placeholder is shown in the overlay until images are provided.

---

## App.js Section Map (planned)

| Section | Content |
|---|---|
| 1 | `DEFAULT_SETTINGS` object |
| 2 | Settings management (`loadSettings`, `saveSettings`, `applySettingsToUI`) |
| 3 | Image loading — FSA path (`openFolder`) and fallback upload path |
| 4 | Image queue — shuffle/sequential logic, play queue management |
| 5 | Ken Burns engine — preset table, per-image animation assignment |
| 6 | Transition engine — 7 transition implementations, random selection |
| 7 | Display mode renderers — Fullscreen, Mosaic, Floating Cards, Filmstrip |
| 8 | Slideshow loop — `advanceImage()`, timing, pause/play state |
| 9 | Ambient particles canvas (reused from break screen, only in Solid mode) |
| 10 | Controls & keyboard handlers |
| 11 | Custom dropdown select system (`initCustomSelects`, `updateCustomSelects`) |
| — | `init()` and `window.onload = init` |

---

## Out of Scope (Parking Lot)

The following were discussed and intentionally deferred to a later version:

- Tilt-shift blur effect
- Color grade / LUT overlay
- Caption ticker
- Reaction particles on transition
- BPM-synced transitions
- Vignette frame (photo album border)
- Image counter overlay on screen (panel progress indicator is in scope)
- Pause on hover

---

## Verification Plan

- Open `index.html` directly in Chrome/Edge and verify all display modes render correctly.
- Test File System Access API with a folder of 10+ mixed-format images.
- Test fallback upload with multi-select file input.
- Verify all 7 transitions animate cleanly and respect the transition speed slider.
- Verify Ken Burns direction randomizes across multiple images.
- Verify shuffle produces no immediate repeats across queue boundaries.
- Verify sequential loops correctly.
- Toggle overlay/background modes and confirm transparency vs. theme rendering.
- Open in Streamlabs Desktop browser source interact window and confirm:
  - Custom dropdowns open and select correctly (CEF compatibility)
  - Settings persist across page reloads via localStorage
  - Keyboard shortcut `C` toggles panel
