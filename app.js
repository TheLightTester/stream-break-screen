/* ==========================================================================
   Twitch Break Screen & Overlay Control System
   ========================================================================== */

// Default settings values
const DEFAULT_SETTINGS = {
    speed: 4,
    size: 300,
    rotationSpeed: 1,
    axes: {
        x: false,
        y: false,
        z: true
    },
    timerDuration: 300, // 5 minutes in seconds
    statusText: "BE RIGHT BACK",
    statusSubtext: "Taking a quick 5 minute break! Grab a drink and settle in.",
    socials: {
        twitch: "FolkFirebrand",
        twitter: "",
        instagram: "@folkfirebrand",
        youtube: "@folkfirebrand",
        discord: "",
        kofi: "",
        patreon: "",
        tiktok: ""
    },
    showSocials: {
        twitch: true,
        twitter: false,
        instagram: true,
        youtube: true,
        discord: true,
        kofi: false,
        patreon: false,
        tiktok: false
    },
    themePreset: "cream-gold",
    particleDensity: 60,
    toggleParticles: true,
    toggleGrid: true,
    toggleShocks: true,
    defaultImage: "default-logo.png",
    customLogoUrl: "", // Base64 data url
    breakPosition: "center",
    timerPosition: "bottom-right",
    widgetScale: 1.5
};

// State variables
let settings = { ...DEFAULT_SETTINGS };
let particleArray = [];
let animationFrameId = null;
let timerInterval = null;
let timerSecondsRemaining = 300;
let timerTotalSeconds = 300;
let isTimerRunning = false;

// Physics tracking
let bouncerState = {
    x: 100,
    y: 100,
    vx: 3,
    vy: 3.5,
    rotX: 0,
    rotY: 0,
    rotZ: 0
};

// Social carousel tracking
let socialCarouselIndex = 0;
let socialInterval = null;

// Core elements
const stage = document.getElementById('scene-stage');
const bouncer = document.getElementById('bouncer');
const defaultLogo = document.getElementById('default-logo');
const customLogo = document.getElementById('custom-logo');
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
const gridOverlay = document.querySelector('.grid-overlay');
const rippleEffect = document.getElementById('ripple-effect');

// Timer elements
const timerDisplay = document.getElementById('timer-display');
const timerProgress = document.getElementById('timer-progress');
const circumference = 2 * Math.PI * 95; // Radius is 95

// Control Panel elements
const settingsPanel = document.getElementById('settings-panel');
const settingsToggleBtn = document.getElementById('settings-toggle');
const settingsCloseBtn = document.getElementById('settings-close');
const btnSaveSettings = document.getElementById('btn-save-settings');
const logoFileInput = document.getElementById('logo-file');
const btnResetLogo = document.getElementById('btn-reset-logo');
const imageUploadPreview = document.getElementById('image-upload-preview');

// Input fields for settings binding
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const sizeSlider = document.getElementById('size-slider');
const sizeVal = document.getElementById('size-val');
const rotationSpeedSlider = document.getElementById('rotation-speed');
const rotSpeedVal = document.getElementById('rot-speed-val');
const axisXCheckbox = document.getElementById('axis-x');
const axisYCheckbox = document.getElementById('axis-y');
const axisZCheckbox = document.getElementById('axis-z');
const timerMinutesInput = document.getElementById('timer-minutes');
const timerSecondsInput = document.getElementById('timer-seconds');
const inputStatusText = document.getElementById('input-status-text');
const inputStatusSubtext = document.getElementById('input-status-subtext');
const socialTwitchInput = document.getElementById('social-twitch');
const socialTwitterInput = document.getElementById('social-twitter');
const socialInstagramInput = document.getElementById('social-instagram');
const socialYoutubeInput = document.getElementById('social-youtube');
const socialDiscordInput = document.getElementById('social-discord');
const socialKofiInput = document.getElementById('social-kofi');
const socialPatreonInput = document.getElementById('social-patreon');
const socialTiktokInput = document.getElementById('social-tiktok');
const showTwitchCheckbox = document.getElementById('show-twitch');
const showTwitterCheckbox = document.getElementById('show-twitter');
const showInstagramCheckbox = document.getElementById('show-instagram');
const showYoutubeCheckbox = document.getElementById('show-youtube');
const showDiscordCheckbox = document.getElementById('show-discord');
const showKofiCheckbox = document.getElementById('show-kofi');
const showPatreonCheckbox = document.getElementById('show-patreon');
const showTiktokCheckbox = document.getElementById('show-tiktok');
const themePresetSelect = document.getElementById('theme-preset');
const particleDensitySlider = document.getElementById('particle-density');
const particleVal = document.getElementById('particle-val');
const toggleParticlesCheckbox = document.getElementById('toggle-particles');
const toggleGridCheckbox = document.getElementById('toggle-grid');
const toggleShocksCheckbox = document.getElementById('toggle-shocks');

// Layout Position and Size Controls
const layoutBreakPositionSelect = document.getElementById('layout-break-position');
const layoutTimerPositionSelect = document.getElementById('layout-timer-position');
const widgetScaleSlider = document.getElementById('widget-scale-slider');
const widgetScaleVal = document.getElementById('widget-scale-val');
const panelLeft = document.querySelector('.panel-left');
const panelRight = document.querySelector('.panel-right');

// Social Card Widgets Elements
const socialIconWrapper = document.querySelector('.social-icon-wrapper');
const socialPlatform = document.getElementById('social-platform');
const socialHandle = document.getElementById('social-handle');
const socialBox = document.getElementById('socials-widget');

// Audio elements (Web Audio API synth for collision hums - cool micro-animation detail)
let audioCtx = null;

/* ==========================================================================
   1. Theme Presets Config
   ========================================================================== */
const THEMES = {
    "cream-gold": {
        "--bg-dark": "#13120E",
        "--theme-grad-1": "linear-gradient(135deg, #1f1d17 0%, #0c0b09 100%)",
        "--panel-bg": "rgba(25, 24, 20, 0.82)",
        "--panel-border": "rgba(184, 141, 64, 0.2)",
        "--accent-pink": "#e5b869",
        "--accent-purple": "#b88d40",
        "--accent-cyan": "#F6EAD0",
        "--accent-pink-rgb": "229, 184, 105",
        "--accent-purple-rgb": "184, 141, 64",
        "--accent-cyan-rgb": "246, 234, 208",
        "--glow-pink": "0 0 15px rgba(229, 184, 105, 0.5)",
        "--glow-purple": "0 0 15px rgba(184, 141, 64, 0.5)",
        "--glow-cyan": "0 0 15px rgba(246, 234, 208, 0.5)",
        "particle-colors": ["#F6EAD0", "#e5b869", "#b88d40"]
    },
    "neon-cyber": {
        "--bg-dark": "#09070f",
        "--theme-grad-1": "linear-gradient(135deg, #110924 0%, #050308 100%)",
        "--panel-bg": "rgba(15, 11, 25, 0.75)",
        "--panel-border": "rgba(112, 0, 255, 0.25)",
        "--accent-pink": "#ff007f",
        "--accent-purple": "#7000ff",
        "--accent-cyan": "#00f3ff",
        "--accent-pink-rgb": "255, 0, 127",
        "--accent-purple-rgb": "112, 0, 255",
        "--accent-cyan-rgb": "0, 243, 255",
        "--glow-pink": "0 0 15px rgba(255, 0, 127, 0.5)",
        "--glow-purple": "0 0 15px rgba(112, 0, 255, 0.5)",
        "--glow-cyan": "0 0 15px rgba(0, 243, 255, 0.5)",
        "particle-colors": ["#ff007f", "#7000ff", "#00f3ff"]
    },
    "dark-nebula": {
        "--bg-dark": "#030814",
        "--theme-grad-1": "linear-gradient(135deg, #051330 0%, #02060f 100%)",
        "--panel-bg": "rgba(5, 15, 35, 0.75)",
        "--panel-border": "rgba(0, 243, 255, 0.25)",
        "--accent-pink": "#00f3ff",
        "--accent-purple": "#005eff",
        "--accent-cyan": "#7000ff",
        "--accent-pink-rgb": "0, 243, 255",
        "--accent-purple-rgb": "0, 94, 255",
        "--accent-cyan-rgb": "112, 0, 255",
        "--glow-pink": "0 0 15px rgba(0, 243, 255, 0.5)",
        "--glow-purple": "0 0 15px rgba(0, 94, 255, 0.5)",
        "--glow-cyan": "0 0 15px rgba(112, 0, 255, 0.5)",
        "particle-colors": ["#00f3ff", "#005eff", "#7000ff"]
    },
    "emerald-glow": {
        "--bg-dark": "#040c08",
        "--theme-grad-1": "linear-gradient(135deg, #082415 0%, #020805 100%)",
        "--panel-bg": "rgba(5, 25, 15, 0.75)",
        "--panel-border": "rgba(57, 255, 20, 0.25)",
        "--accent-pink": "#39ff14",
        "--accent-purple": "#00a86b",
        "--accent-cyan": "#00ffcc",
        "--accent-pink-rgb": "57, 255, 20",
        "--accent-purple-rgb": "0, 168, 107",
        "--accent-cyan-rgb": "0, 255, 204",
        "--glow-pink": "0 0 15px rgba(57, 255, 20, 0.5)",
        "--glow-purple": "0 0 15px rgba(0, 168, 107, 0.5)",
        "--glow-cyan": "0 0 15px rgba(0, 255, 204, 0.5)",
        "particle-colors": ["#39ff14", "#00a86b", "#00ffcc"]
    },
    "fire-glow": {
        "--bg-dark": "#0c0805",
        "--theme-grad-1": "linear-gradient(135deg, #240d04 0%, #080302 100%)",
        "--panel-bg": "rgba(25, 12, 5, 0.75)",
        "--panel-border": "rgba(255, 94, 0, 0.25)",
        "--accent-pink": "#ff5e00",
        "--accent-purple": "#ff2a00",
        "--accent-cyan": "#ffbb00",
        "--accent-pink-rgb": "255, 94, 0",
        "--accent-purple-rgb": "255, 42, 0",
        "--accent-cyan-rgb": "255, 187, 0",
        "--glow-pink": "0 0 15px rgba(255, 94, 0, 0.5)",
        "--glow-purple": "0 0 15px rgba(255, 42, 0, 0.5)",
        "--glow-cyan": "0 0 15px rgba(255, 187, 0, 0.5)",
        "particle-colors": ["#ff5e00", "#ff2a00", "#ffbb00"]
    }
};

function applyTheme(themeName) {
    const theme = THEMES[themeName] || THEMES["neon-cyber"];
    Object.keys(theme).forEach(property => {
        if (property !== "particle-colors") {
            document.documentElement.style.setProperty(property, theme[property]);
        }
    });
}

/* ==========================================================================
   2. Settings Management & Local Storage
   ========================================================================== */
function loadSettings() {
    // 1. Start with system defaults
    let baseSettings = { ...DEFAULT_SETTINGS };

    // 2. Override with local config.js values if defined
    if (typeof OVERLAY_CONFIG !== 'undefined') {
        baseSettings = { ...baseSettings, ...OVERLAY_CONFIG };
        // Deep copy nested objects
        if (OVERLAY_CONFIG.axes) baseSettings.axes = { ...DEFAULT_SETTINGS.axes, ...OVERLAY_CONFIG.axes };
        if (OVERLAY_CONFIG.socials) baseSettings.socials = { ...DEFAULT_SETTINGS.socials, ...OVERLAY_CONFIG.socials };
        if (OVERLAY_CONFIG.showSocials) baseSettings.showSocials = { ...DEFAULT_SETTINGS.showSocials, ...OVERLAY_CONFIG.showSocials };
    }

    // 3. Apply cached settings on top if they exist in this environment
    const saved = localStorage.getItem('twitch_break_screen_settings');
    if (saved) {
        try {
            settings = { ...baseSettings, ...JSON.parse(saved) };
            // Migrate old defaults to new default preferences if user hasn't customized them yet
            if (settings.size === 150) {
                settings.size = 300;
            }
            if (settings.rotationSpeed === 2) {
                settings.rotationSpeed = 1;
            }
            if (settings.themePreset === 'neon-cyber') {
                settings.themePreset = 'cream-gold';
            }
            // Migrate social settings if they are still the default placeholders
            if (settings.socials.twitch === "YourChannel" || !settings.socials.twitch) {
                settings.socials.twitch = "FolkFirebrand";
            }
            if (!settings.socials.instagram && (settings.socials.twitter === "YourXHandle" || !settings.socials.twitter)) {
                settings.socials.instagram = "@folkfirebrand";
            }
            if (settings.socials.youtube === "YourYouTube" || !settings.socials.youtube) {
                settings.socials.youtube = "@folkfirebrand";
            }
            if (settings.socials.discord === "discord.gg/invite") {
                settings.socials.discord = "";
            }
            if (!settings.showSocials) {
                settings.showSocials = {
                    twitch: true,
                    twitter: false,
                    instagram: true,
                    youtube: true,
                    discord: true
                };
            }
            if (settings.socials.twitter === undefined) {
                settings.socials.twitter = "";
            }
            if (settings.showSocials.twitter === undefined) {
                settings.showSocials.twitter = false;
            }
            if (settings.socials.kofi === undefined) {
                settings.socials.kofi = "";
            }
            if (settings.showSocials.kofi === undefined) {
                settings.showSocials.kofi = false;
            }
            if (settings.socials.patreon === undefined) {
                settings.socials.patreon = "";
            }
            if (settings.showSocials.patreon === undefined) {
                settings.showSocials.patreon = false;
            }
            if (settings.socials.tiktok === undefined) {
                settings.socials.tiktok = "";
            }
            if (settings.showSocials.tiktok === undefined) {
                settings.showSocials.tiktok = false;
            }
        } catch (e) {
            console.error("Failed to parse settings, using defaults.", e);
            settings = { ...baseSettings };
        }
    } else {
        settings = { ...baseSettings };
    }

    // Apply values to HTML controls
    speedSlider.value = settings.speed;
    speedVal.textContent = settings.speed;
    
    sizeSlider.value = settings.size;
    sizeVal.textContent = `${settings.size}px`;
    
    rotationSpeedSlider.value = settings.rotationSpeed;
    rotSpeedVal.textContent = settings.rotationSpeed;
    
    axisXCheckbox.checked = settings.axes.x;
    axisYCheckbox.checked = settings.axes.y;
    axisZCheckbox.checked = settings.axes.z;

    const mins = Math.floor(settings.timerDuration / 60);
    const secs = settings.timerDuration % 60;
    timerMinutesInput.value = mins;
    timerSecondsInput.value = secs;

    inputStatusText.value = settings.statusText;
    inputStatusSubtext.value = settings.statusSubtext;

    socialTwitchInput.value = settings.socials.twitch;
    socialTwitterInput.value = settings.socials.twitter || "";
    socialInstagramInput.value = settings.socials.instagram || "";
    socialYoutubeInput.value = settings.socials.youtube;
    socialDiscordInput.value = settings.socials.discord;
    socialKofiInput.value = settings.socials.kofi || "";
    socialPatreonInput.value = settings.socials.patreon || "";
    socialTiktokInput.value = settings.socials.tiktok || "";

    showTwitchCheckbox.checked = settings.showSocials ? settings.showSocials.twitch : true;
    showTwitterCheckbox.checked = settings.showSocials ? (settings.showSocials.twitter ?? false) : false;
    showInstagramCheckbox.checked = settings.showSocials ? settings.showSocials.instagram : true;
    showYoutubeCheckbox.checked = settings.showSocials ? settings.showSocials.youtube : true;
    showDiscordCheckbox.checked = settings.showSocials ? settings.showSocials.discord : true;
    showKofiCheckbox.checked = settings.showSocials ? (settings.showSocials.kofi ?? false) : false;
    showPatreonCheckbox.checked = settings.showSocials ? (settings.showSocials.patreon ?? false) : false;
    showTiktokCheckbox.checked = settings.showSocials ? (settings.showSocials.tiktok ?? false) : false;

    themePresetSelect.value = settings.themePreset;
    particleDensitySlider.value = settings.particleDensity;
    particleVal.textContent = settings.particleDensity;
    toggleParticlesCheckbox.checked = settings.toggleParticles;
    toggleGridCheckbox.checked = settings.toggleGrid;
    toggleShocksCheckbox.checked = settings.toggleShocks;

    layoutBreakPositionSelect.value = settings.breakPosition || "center";
    layoutTimerPositionSelect.value = settings.timerPosition || "bottom-right";
    widgetScaleSlider.value = settings.widgetScale || 1.5;
    widgetScaleVal.textContent = `${Math.round((settings.widgetScale || 1.5) * 100)}%`;

    // Apply active overlay styles
    applySettingsToUI();
}

function saveSettings() {
    // Collect settings from UI controls
    settings.speed = parseFloat(speedSlider.value);
    settings.size = parseInt(sizeSlider.value);
    settings.rotationSpeed = parseFloat(rotationSpeedSlider.value);
    settings.axes = {
        x: axisXCheckbox.checked,
        y: axisYCheckbox.checked,
        z: axisZCheckbox.checked
    };
    
    const duration = (parseInt(timerMinutesInput.value) * 60) + parseInt(timerSecondsInput.value);
    // Only update duration if it was changed
    if (duration !== settings.timerDuration) {
        settings.timerDuration = duration;
        resetTimer();
    }

    settings.statusText = inputStatusText.value;
    settings.statusSubtext = inputStatusSubtext.value;

    settings.socials = {
        twitch: socialTwitchInput.value,
        twitter: socialTwitterInput.value,
        instagram: socialInstagramInput.value,
        youtube: socialYoutubeInput.value,
        discord: socialDiscordInput.value,
        kofi: socialKofiInput.value,
        patreon: socialPatreonInput.value,
        tiktok: socialTiktokInput.value
    };

    settings.showSocials = {
        twitch: showTwitchCheckbox.checked,
        twitter: showTwitterCheckbox.checked,
        instagram: showInstagramCheckbox.checked,
        youtube: showYoutubeCheckbox.checked,
        discord: showDiscordCheckbox.checked,
        kofi: showKofiCheckbox.checked,
        patreon: showPatreonCheckbox.checked,
        tiktok: showTiktokCheckbox.checked
    };

    settings.themePreset = themePresetSelect.value;
    settings.particleDensity = parseInt(particleDensitySlider.value);
    settings.toggleParticles = toggleParticlesCheckbox.checked;
    settings.toggleGrid = toggleGridCheckbox.checked;
    settings.toggleShocks = toggleShocksCheckbox.checked;

    settings.breakPosition = layoutBreakPositionSelect.value;
    settings.timerPosition = layoutTimerPositionSelect.value;
    settings.widgetScale = parseFloat(widgetScaleSlider.value);

    // Persist
    localStorage.setItem('twitch_break_screen_settings', JSON.stringify(settings));
    
    // Apply immediately
    applySettingsToUI();
}

function applySettingsToUI() {
    // 1. Theme
    applyTheme(settings.themePreset);

    // 2. Bouncer image size
    bouncer.style.width = `${settings.size}px`;
    bouncer.style.height = `${settings.size}px`;

    // 3. Logo representation
    const fallbackImage = settings.defaultImage || "default-logo.png";
    defaultLogo.src = fallbackImage;

    if (settings.customLogoUrl) {
        customLogo.src = settings.customLogoUrl;
        customLogo.style.display = 'block';
        defaultLogo.style.display = 'none';
        imageUploadPreview.innerHTML = `<img src="${settings.customLogoUrl}" alt="Preview">`;
    } else {
        customLogo.style.display = 'none';
        defaultLogo.style.display = 'block';
        imageUploadPreview.innerHTML = `<img src="${fallbackImage}" alt="Preview">`;
    }

    // 4. Texts
    document.getElementById('status-text').textContent = settings.statusText;
    document.getElementById('status-subtext').textContent = settings.statusSubtext;

    // 5. Aesthetic elements toggles
    gridOverlay.style.opacity = settings.toggleGrid ? "1" : "0";
    
    // Resize particles or change system toggles
    initParticles();
    
    // Reset velocities to enforce speed changes smoothly without losing heading
    const currentHeading = Math.atan2(bouncerState.vy, bouncerState.vx);
    bouncerState.vx = Math.cos(currentHeading) * settings.speed;
    bouncerState.vy = Math.sin(currentHeading) * settings.speed;

    // Refresh social cards list
    startSocialsCarousel();

    // Apply Positioning and Sizing
    const scale = settings.widgetScale || 1.5;
    document.documentElement.style.setProperty('--widget-scale', scale);
    
    // Reset classes and apply position
    panelLeft.className = "panel-left";
    panelRight.className = "panel-right";
    
    const breakPos = settings.breakPosition || "center";
    const timerPos = settings.timerPosition || "bottom-right";
    
    panelLeft.classList.add(`pos-${breakPos}`);
    panelRight.classList.add(`pos-${timerPos}`);

    // Sync custom dropdown selects to native state
    if (typeof updateCustomSelects === 'function') {
        updateCustomSelects();
    }
}

/* ==========================================================================
   3. File Upload handling
   ========================================================================== */
logoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            settings.customLogoUrl = event.target.result;
            // Update preview card immediately
            imageUploadPreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            // Trigger logo update
            customLogo.src = event.target.result;
            customLogo.style.display = 'block';
            defaultLogo.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

btnResetLogo.addEventListener('click', () => {
    settings.customLogoUrl = "";
    customLogo.style.display = 'none';
    defaultLogo.style.display = 'block';
    imageUploadPreview.innerHTML = `<img src="${settings.defaultImage || 'default-logo.png'}" alt="Preview">`;
    logoFileInput.value = ""; // clear selector input
});

/* ==========================================================================
   4. Audio Synth Engine (Boundary Hit Sound FX)
   ========================================================================== */
function playCollisionSound() {
    if (!settings.toggleShocks) return;
    try {
        if (!audioCtx) {
            // Lazy init AudioContext to comply with browser autoplay blocks
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        // Synth sound: subtle glowing chime/sub-bass thump
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Theme specific pitch
        let pitch = 120;
        if (settings.themePreset === 'emerald-glow') pitch = 160;
        if (settings.themePreset === 'fire-glow') pitch = 90;
        if (settings.themePreset === 'dark-nebula') pitch = 110;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
        // Pitch drop slide
        osc.frequency.exponentialRampToValueAtTime(pitch / 2, audioCtx.currentTime + 0.35);
        
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.warn("Audio feedback block or error: ", e);
    }
}

/* ==========================================================================
   5. Bouncer & Physics Core Engine
   ========================================================================== */
function initPhysics() {
    // Initial random heading that is not strictly vertical or horizontal
    const angle = (Math.random() * Math.PI * 0.4) + Math.PI * 0.05 + (Math.random() > 0.5 ? Math.PI : 0);
    bouncerState.vx = Math.cos(angle) * settings.speed;
    bouncerState.vy = Math.sin(angle) * settings.speed;
    
    // Spawn in the top left quadrant
    bouncerState.x = Math.max(20, Math.random() * (window.innerWidth / 3));
    bouncerState.y = Math.max(20, Math.random() * (window.innerHeight / 3));
    
    bouncerState.rotX = 0;
    bouncerState.rotY = 0;
    bouncerState.rotZ = 0;
}

function triggerRipple(x, y) {
    if (!settings.toggleShocks) return;
    
    // Center of bouncer relative to viewport
    const bouncerRadius = settings.size / 2;
    rippleEffect.classList.remove('ripple-active');
    void rippleEffect.offsetWidth; // Reflow to reset CSS animation
    rippleEffect.classList.add('ripple-active');
}

function updatePhysics() {
    const stageWidth = window.innerWidth;
    const stageHeight = window.innerHeight;
    const size = settings.size;

    // Movement
    bouncerState.x += bouncerState.vx;
    bouncerState.y += bouncerState.vy;

    let hitWall = false;

    // Left & Right bounds Check
    if (bouncerState.x <= 0) {
        bouncerState.x = 0;
        bouncerState.vx = -bouncerState.vx;
        hitWall = true;
    } else if (bouncerState.x + size >= stageWidth) {
        bouncerState.x = stageWidth - size;
        bouncerState.vx = -bouncerState.vx;
        hitWall = true;
    }

    // Top & Bottom bounds Check
    if (bouncerState.y <= 0) {
        bouncerState.y = 0;
        bouncerState.vy = -bouncerState.vy;
        hitWall = true;
    } else if (bouncerState.y + size >= stageHeight) {
        bouncerState.y = stageHeight - size;
        bouncerState.vy = -bouncerState.vy;
        hitWall = true;
    }

    if (hitWall) {
        triggerRipple();
        playCollisionSound();
    }

    // Rotations Increment
    if (settings.axes.x) {
        bouncerState.rotX = (bouncerState.rotX + settings.rotationSpeed) % 360;
    } else {
        bouncerState.rotX = 0;
    }

    if (settings.axes.y) {
        bouncerState.rotY = (bouncerState.rotY + settings.rotationSpeed) % 360;
    } else {
        bouncerState.rotY = 0;
    }

    if (settings.axes.z) {
        bouncerState.rotZ = (bouncerState.rotZ + settings.rotationSpeed) % 360;
    } else {
        bouncerState.rotZ = 0;
    }

    // Update element transform styling in viewport space
    bouncer.style.transform = `translate3d(${bouncerState.x}px, ${bouncerState.y}px, 0px) rotateX(${bouncerState.rotX}deg) rotateY(${bouncerState.rotY}deg) rotateZ(${bouncerState.rotZ}deg)`;
}

/* ==========================================================================
   6. Ambient Particles Canvas System
   ========================================================================== */
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 50; // spawn offscreen below
        this.size = Math.random() * 3.5 + 0.5;
        this.speedY = -(Math.random() * 1.2 + 0.3); // moving up
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.7 + 0.15;
        this.colorIdx = Math.floor(Math.random() * 3);
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Wrap around margins
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        
        // Reset if floats off top
        if (this.y < -20) {
            this.reset();
        }
    }

    draw() {
        const colors = THEMES[settings.themePreset]?.["particle-colors"] || THEMES["neon-cyber"]["particle-colors"];
        const baseColor = colors[this.colorIdx];
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Add subtle radial blur/glow to particles
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function initParticles() {
    particleArray = [];
    if (!settings.toggleParticles) return;
    
    for (let i = 0; i < settings.particleDensity; i++) {
        const p = new Particle();
        // pre-populate screen space random Y positions
        p.y = Math.random() * canvas.height;
        particleArray.push(p);
    }
}

function handleParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!settings.toggleParticles) return;
    
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

window.addEventListener('resize', resizeCanvas);

/* ==========================================================================
   7. Countdown Timer Logic
   ========================================================================== */
function updateTimerDisplay() {
    const minutes = Math.floor(timerSecondsRemaining / 60);
    const seconds = timerSecondsRemaining % 60;
    
    // Format: MM:SS
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
    
    // Progress Ring offset calculation
    const progressPercent = timerTotalSeconds > 0 ? (timerSecondsRemaining / timerTotalSeconds) : 0;
    const offset = circumference - (progressPercent * circumference);
    timerProgress.style.strokeDashoffset = offset;

    // Color indicators: Red alert for last 30s
    if (timerSecondsRemaining <= 30 && timerSecondsRemaining > 0) {
        timerProgress.style.stroke = "var(--accent-pink)";
        timerProgress.style.filter = "drop-shadow(var(--glow-pink))";
        timerDisplay.style.textShadow = "var(--glow-pink)";
    } else {
        timerProgress.style.stroke = "var(--accent-cyan)";
        timerProgress.style.filter = "drop-shadow(var(--glow-cyan))";
        timerDisplay.style.textShadow = "var(--glow-cyan)";
    }
}

function startTimer() {
    if (isTimerRunning) return;
    
    // Read input values if timer duration needs recalculating
    const duration = (parseInt(timerMinutesInput.value) * 60) + parseInt(timerSecondsInput.value);
    
    // If it's a fresh start, sync totals
    if (timerSecondsRemaining <= 0 || duration !== timerTotalSeconds) {
        timerTotalSeconds = duration;
        timerSecondsRemaining = duration;
    }
    
    isTimerRunning = true;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (timerSecondsRemaining > 0) {
            timerSecondsRemaining--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isTimerRunning = false;
            // Play a finishing ring alert
            playTimerFinishedSound();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    const duration = (parseInt(timerMinutesInput.value) * 60) + parseInt(timerSecondsInput.value);
    timerTotalSeconds = duration;
    timerSecondsRemaining = duration;
    updateTimerDisplay();
}

function playTimerFinishedSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        // Double chime alert
        const scheduleNote = (time, freq) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            gainNode.gain.setValueAtTime(0.12, time);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
            osc.start(time);
            osc.stop(time + 0.6);
        };
        
        const now = audioCtx.currentTime;
        scheduleNote(now, 523.25); // C5
        scheduleNote(now + 0.15, 659.25); // E5
        scheduleNote(now + 0.3, 783.99); // G5
        scheduleNote(now + 0.45, 1046.50); // C6
    } catch (e) {
        console.warn(e);
    }
}

// Hook up timer controls
document.getElementById('btn-timer-start').addEventListener('click', startTimer);
document.getElementById('btn-timer-pause').addEventListener('click', pauseTimer);
document.getElementById('btn-timer-reset').addEventListener('click', resetTimer);

/* ==========================================================================
   8. Social Carousel Engine
   ========================================================================== */
function getActiveSocials() {
    const active = [];
    const keys = Object.keys(settings.socials);
    keys.forEach(k => {
        const handle = settings.socials[k];
        const enabled = settings.showSocials ? (settings.showSocials[k] ?? true) : true;
        if (enabled && handle && handle.trim() !== "") {
            if (k === 'kofi') {
                active.push({
                    platform: "KO-FI",
                    handle: handle,
                    svgPath: "M11.351 2.715c-2.7 0-4.986.025-6.83.26C2.078 3.285 0 5.154 0 8.61c0 3.506.182 6.13 1.585 8.493 1.584 2.701 4.233 4.182 7.662 4.182h.83c4.209 0 6.494-2.234 7.637-4a9.5 9.5 0 0 0 1.091-2.338C21.792 14.688 24 12.22 24 9.208v-.415c0-3.247-2.13-5.507-5.792-5.87-1.558-.156-2.65-.208-6.857-.208m0 1.947c4.208 0 5.09.052 6.571.182 2.624.311 4.13 1.584 4.13 4v.39c0 2.156-1.792 3.844-3.87 3.844h-.935l-.156.649c-.208 1.013-.597 1.818-1.039 2.546-.909 1.428-2.545 3.064-5.922 3.064h-.805c-2.571 0-4.831-.883-6.078-3.195-1.09-2-1.298-4.155-1.298-7.506 0-2.181.857-3.402 3.012-3.714 1.533-.233 3.559-.26 6.39-.26m6.547 2.287c-.416 0-.65.234-.65.546v2.935c0 .311.234.545.65.545 1.324 0 2.051-.754 2.051-2s-.727-2.026-2.052-2.026m-10.39.182c-1.818 0-3.013 1.48-3.013 3.142 0 1.533.858 2.857 1.949 3.897.727.701 1.87 1.429 2.649 1.896a1.47 1.47 0 0 0 1.507 0c.78-.467 1.922-1.195 2.623-1.896 1.117-1.039 1.974-2.364 1.974-3.897 0-1.662-1.247-3.142-3.039-3.142-1.065 0-1.792.545-2.338 1.298-.493-.753-1.246-1.298-2.312-1.298",
                    colorClass: "text-kofi"
                });
            } else {
                active.push({
                    platform: k.toUpperCase(),
                    handle: handle,
                    iconClass: `fab fa-${k}`,
                    colorClass: `text-${k}`
                });
            }
        }
    });
    return active;
}

function updateSocialsWidget() {
    const list = getActiveSocials();
    if (list.length === 0) {
        socialBox.style.display = 'none';
        return;
    }
    
    socialBox.style.display = 'flex';
    if (socialCarouselIndex >= list.length) {
        socialCarouselIndex = 0;
    }
    
    const activeItem = list[socialCarouselIndex];
    
    // Quick fadeout, transition swap, fadein
    socialBox.style.opacity = 0;
    socialBox.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        // Swap content
        if (activeItem.svgPath) {
            socialIconWrapper.innerHTML = `<svg viewBox="0 0 24 24" class="${activeItem.colorClass}" style="width: 1.25em; height: 1.25em; fill: currentColor;"><path d="${activeItem.svgPath}"/></svg>`;
        } else {
            socialIconWrapper.innerHTML = `<i id="social-icon" class="${activeItem.iconClass} ${activeItem.colorClass}"></i>`;
        }
        socialPlatform.textContent = activeItem.platform;
        socialHandle.textContent = activeItem.handle;
        
        // Fade in
        socialBox.style.opacity = 1;
        socialBox.style.transform = 'translateY(0)';
    }, 400);
    
    socialCarouselIndex = (socialCarouselIndex + 1) % list.length;
}

function startSocialsCarousel() {
    if (socialInterval) clearInterval(socialInterval);
    updateSocialsWidget();
    socialInterval = setInterval(updateSocialsWidget, 6000); // cycle every 6 seconds
}

/* ==========================================================================
   9. Controls & General Handlers
   ========================================================================== */
function setupInputListeners() {
    // Slider values synchronization
    speedSlider.addEventListener('input', () => {
        speedVal.textContent = speedSlider.value;
        const speed = parseFloat(speedSlider.value);
        // Calculate new vx vy magnitude
        const heading = Math.atan2(bouncerState.vy, bouncerState.vx);
        bouncerState.vx = Math.cos(heading) * speed;
        bouncerState.vy = Math.sin(heading) * speed;
    });

    sizeSlider.addEventListener('input', () => {
        sizeVal.textContent = `${sizeSlider.value}px`;
        bouncer.style.width = `${sizeSlider.value}px`;
        bouncer.style.height = `${sizeSlider.value}px`;
    });

    rotationSpeedSlider.addEventListener('input', () => {
        rotSpeedVal.textContent = rotationSpeedSlider.value;
    });

    particleDensitySlider.addEventListener('input', () => {
        particleVal.textContent = particleDensitySlider.value;
    });

    widgetScaleSlider.addEventListener('input', () => {
        const scaleVal = parseFloat(widgetScaleSlider.value);
        widgetScaleVal.textContent = `${Math.round(scaleVal * 100)}%`;
        document.documentElement.style.setProperty('--widget-scale', scaleVal);
    });
}

// Open/Close settings sidebar
function toggleSettingsPanel() {
    settingsPanel.classList.toggle('open');
}

settingsToggleBtn.addEventListener('click', toggleSettingsPanel);
settingsCloseBtn.addEventListener('click', toggleSettingsPanel);

// Close panel when clicking overlay canvas area
stage.addEventListener('click', (e) => {
    // If setting panel is open and click was outside of setting panel and toggle button
    if (settingsPanel.classList.contains('open') && 
        !settingsPanel.contains(e.target) && 
        !settingsToggleBtn.contains(e.target)) {
        settingsPanel.classList.remove('open');
    }
});

// Keypress listener ('C' key toggles panel)
window.addEventListener('keydown', (e) => {
    // Ignore keypresses inside text fields to avoid breaking typing inside control panel
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    if (e.key === 'c' || e.key === 'C') {
        toggleSettingsPanel();
    }
});

// Form submission / Application
btnSaveSettings.addEventListener('click', () => {
    saveSettings();
    toggleSettingsPanel();
});

/* ==========================================================================
   10. App Boot / Lifecycle Loop
   ========================================================================== */
function animate() {
    updatePhysics();
    handleParticles();
    animationFrameId = requestAnimationFrame(animate);
}

/* ==========================================================================
   11. Custom Dropdown Selects for Streamlabs/OBS Compatibility
   ========================================================================== */
function initCustomSelects() {
    const originalSelects = document.querySelectorAll('#settings-panel select');
    originalSelects.forEach(select => {
        if (document.querySelector(`.custom-select[data-select-id="${select.id}"]`)) return;
        
        const container = document.createElement('div');
        container.className = 'custom-select';
        container.setAttribute('data-select-id', select.id);
        
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        
        const triggerText = document.createElement('span');
        triggerText.textContent = select.options[select.selectedIndex]?.textContent || '';
        
        const caret = document.createElement('i');
        caret.className = 'fas fa-chevron-down custom-select-caret';
        
        trigger.appendChild(triggerText);
        trigger.appendChild(caret);
        container.appendChild(trigger);
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-select-options';
        
        Array.from(select.options).forEach(opt => {
            const customOpt = document.createElement('div');
            customOpt.className = 'custom-select-option';
            customOpt.setAttribute('data-value', opt.value);
            customOpt.textContent = opt.textContent;
            
            if (opt.value === select.value) {
                customOpt.classList.add('selected');
            }
            
            customOpt.addEventListener('click', (e) => {
                e.stopPropagation();
                select.value = opt.value;
                triggerText.textContent = opt.textContent;
                
                optionsContainer.querySelectorAll('.custom-select-option').forEach(o => {
                    o.classList.remove('selected');
                });
                customOpt.classList.add('selected');
                
                container.classList.remove('open');
                
                // Dispatch change event to the original select
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });
            
            optionsContainer.appendChild(customOpt);
        });
        
        container.appendChild(optionsContainer);
        
        // Hide original select and insert custom one
        select.style.display = 'none';
        select.parentNode.insertBefore(container, select.nextSibling);
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other custom selects
            document.querySelectorAll('.custom-select').forEach(cs => {
                if (cs !== container) cs.classList.remove('open');
            });
            
            container.classList.toggle('open');
        });

        // Keyboard navigation
        container.setAttribute('tabindex', '0');
        let highlightedIndex = -1;
        
        const updateHighlight = (index) => {
            const opts = optionsContainer.querySelectorAll('.custom-select-option');
            opts.forEach((o, i) => {
                if (i === index) {
                    o.classList.add('highlighted');
                    o.scrollIntoView({ block: 'nearest' });
                } else {
                    o.classList.remove('highlighted');
                }
            });
            highlightedIndex = index;
        };
        
        container.addEventListener('keydown', (e) => {
            const opts = optionsContainer.querySelectorAll('.custom-select-option');
            const isOpen = container.classList.contains('open');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!isOpen) {
                    container.classList.add('open');
                    const currentVal = select.value;
                    const index = Array.from(opts).findIndex(o => o.getAttribute('data-value') === currentVal);
                    updateHighlight(index >= 0 ? index : 0);
                } else {
                    const nextIndex = (highlightedIndex + 1) % opts.length;
                    updateHighlight(nextIndex);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!isOpen) {
                    container.classList.add('open');
                    const currentVal = select.value;
                    const index = Array.from(opts).findIndex(o => o.getAttribute('data-value') === currentVal);
                    updateHighlight(index >= 0 ? index : opts.length - 1);
                } else {
                    const prevIndex = (highlightedIndex - 1 + opts.length) % opts.length;
                    updateHighlight(prevIndex);
                }
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isOpen) {
                    if (highlightedIndex >= 0 && highlightedIndex < opts.length) {
                        opts[highlightedIndex].click();
                    }
                } else {
                    container.classList.add('open');
                    const currentVal = select.value;
                    const index = Array.from(opts).findIndex(o => o.getAttribute('data-value') === currentVal);
                    updateHighlight(index >= 0 ? index : 0);
                }
            } else if (e.key === 'Escape' || e.key === 'Tab') {
                if (isOpen) {
                    if (e.key === 'Escape') e.preventDefault();
                    container.classList.remove('open');
                }
            }
        });
        
        container.addEventListener('blur', () => {
            container.classList.remove('open');
            optionsContainer.querySelectorAll('.custom-select-option').forEach(o => {
                o.classList.remove('highlighted');
            });
            highlightedIndex = -1;
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(cs => {
            cs.classList.remove('open');
        });
    });
}

function updateCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select');
    customSelects.forEach(customSelect => {
        const selectId = customSelect.getAttribute('data-select-id');
        const originalSelect = document.getElementById(selectId);
        if (!originalSelect) return;
        
        const triggerText = customSelect.querySelector('.custom-select-trigger span');
        const options = customSelect.querySelectorAll('.custom-select-option');
        
        const selectedOption = originalSelect.options[originalSelect.selectedIndex];
        if (selectedOption) {
            triggerText.textContent = selectedOption.textContent;
        }
        
        options.forEach(opt => {
            if (opt.getAttribute('data-value') === originalSelect.value) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    });
}

function init() {
    // Setup initial sizes
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Set ring stroke circumference
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = circumference;

    // Initialize custom selects for OBS/Streamlabs compatibility
    initCustomSelects();

    // Load configurations
    loadSettings();
    
    // Initialize physics
    initPhysics();
    
    // Setup controls feedback UI listeners
    setupInputListeners();
    
    // Start timers and carousels
    resetTimer();
    startTimer();
    startSocialsCarousel();
    
    // Start main drawing/physics animation loop
    animate();
}

// Start application
window.onload = init;

