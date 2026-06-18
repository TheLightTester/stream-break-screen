// ==========================================================================
// Twitch Break Screen — Configuration File
// ==========================================================================
// Customize your overlay here. Changes made in this file will load
// automatically when you open index.html in Chrome or add it as a
// Browser Source in Streamlabs Desktop / OBS Studio.
//
// QUICK START:
//   1. Fill in your social media handles below
//   2. Set your preferred timer duration
//   3. Change the theme if you like
//   4. Open index.html in your browser to preview
//   5. Add index.html as a 1920x1080 Browser Source in Streamlabs/OBS
//
// TIP: You can also tweak everything live using the ⚙️ Settings panel
// inside the overlay (press C or click the gear icon, top-right).
// Saved settings in-overlay override these file defaults.
// ==========================================================================

const OVERLAY_CONFIG = {

    // -----------------------------------------------------------------------
    // Bouncer Image
    // -----------------------------------------------------------------------
    // File name of your bouncing logo image.
    // Place the image in the same folder as index.html.
    // Supports JPG, PNG, GIF, WebP.
    defaultImage: "default-logo.png",

    // -----------------------------------------------------------------------
    // Bouncer Physics & Rotation
    // -----------------------------------------------------------------------
    speed: 4,                  // Bouncing speed factor (1–15)
    size: 300,                 // Size of the bouncing logo in pixels (50–600)
    rotationSpeed: 1,          // 3D rotation speed (0–10)
    axes: {
        x: false,              // Spin on X-axis (Pitch)
        y: false,              // Spin on Y-axis (Yaw)
        z: true                // Spin on Z-axis (Roll)
    },

    // -----------------------------------------------------------------------
    // Countdown Timer
    // -----------------------------------------------------------------------
    timerDuration: 300,        // Duration in seconds (e.g. 300 = 5 minutes)

    // -----------------------------------------------------------------------
    // Overlay Branding Text
    // -----------------------------------------------------------------------
    statusText: "BE RIGHT BACK",
    statusSubtext: "Taking a quick break! Grab a drink and settle in.",

    // -----------------------------------------------------------------------
    // Social Media Handles
    // -----------------------------------------------------------------------
    // Leave a handle as "" to hide that platform.
    socials: {
        twitch:    "",         // e.g. "YourChannel"
        twitter:   "",         // e.g. "YourHandle"
        instagram: "",         // e.g. "@yourhandle"
        youtube:   "",         // e.g. "@yourchannel"
        discord:   "",         // e.g. "discord.gg/yourserver"
        kofi:      "",         // e.g. "yourpage"
        patreon:   "",         // e.g. "yourpage"
        tiktok:    ""          // e.g. "@yourhandle"
    },

    // Toggle each platform on (true) or off (false) in the carousel
    showSocials: {
        twitch:    true,
        twitter:   false,
        instagram: false,
        youtube:   false,
        discord:   false,
        kofi:      false,
        patreon:   false,
        tiktok:    false
    },

    // -----------------------------------------------------------------------
    // Background Theme
    // -----------------------------------------------------------------------
    // Options: "cream-gold" | "neon-cyber" | "dark-nebula" | "emerald-glow" | "fire-glow"
    themePreset: "cream-gold",

    // -----------------------------------------------------------------------
    // Ambient Visual Effects
    // -----------------------------------------------------------------------
    toggleParticles: true,     // Background glowing embers/dust
    toggleGrid:      true,     // Ambient digital grid lines
    toggleShocks:    true,     // Visual ripple on boundary wall hits
    particleDensity: 60,       // Number of background particles (0–150)

    // -----------------------------------------------------------------------
    // Layout & Positioning
    // -----------------------------------------------------------------------
    // Options: "center" | "top-center" | "bottom-center" |
    //          "top-left" | "top-right" | "bottom-left" | "bottom-right"
    breakPosition: "center",
    timerPosition: "bottom-right",
    widgetScale:   1.5         // Message & socials size scale factor (0.5–2.0)
};
