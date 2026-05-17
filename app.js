import { FilesetResolver, HandLandmarker, DrawingUtils } from 
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs";

// ── YouTube Video Data ──
const GOJO_INFINITE_VOID_VIDEOS = [
    { id: "nmvkhLz8t7I", title: "Gojo Uses His Domain Expansion — 4K" },
    { id: "gILoWjMCLZY", title: "Gojo 0.2 Seconds Domain Expansion — Season 2 (4K)" },
    { id: "HzCeyfNjSbo", title: "Domain Expansion: Infinite Void — Sound Re-Design" },
];
const SUKUNA_MALEVOLENT_SHRINE_VIDEOS = [
    { id: "ztK_7KVnze0", title: "Sukuna's Domain Expansion — 4K UHD" },
    { id: "7WXKlCmOtVI", title: "Sukuna Domain Expansion vs Mahoraga — Sound Re-Design" },
    { id: "lDzXBSxAxKw", title: "Malevolent Shrine Full Fight — Blu-Ray 4K 60FPS" },
];
const MEGUMI_MAHORAGA_VIDEOS = [
    { id: "HQpipG1Pr5Y", title: "Sukuna vs Mahoraga Part 2 — Season 2 Ep 17 (4K)" },
    { id: "SK5opEqDf8Q", title: "Megumi Using 'With This Treasure I Summon' — Mahoraga" },
    { id: "patkhan_uYs", title: "Megumi Unleashes His Final Ploy: Mahoraga — JJK S2" },
];

// ── Domain Expansion Config ──
const DOMAIN_CONFIG = {
    gojo: {
        kanji: "領域展開",
        name: "INFINITE VOID",
        subtitle: "Gojo Satoru",
        icon: "💠",
        kanjiClass: "gojo",
    },
    sukuna: {
        kanji: "領域展開",
        name: "MALEVOLENT SHRINE",
        subtitle: "Ryomen Sukuna",
        icon: "👹",
        kanjiClass: "sukuna",
    },
    megumi: {
        kanji: "布瑠部由良由良",
        name: "CHIMERA SHADOW GARDEN",
        subtitle: "Megumi Fushiguro — Mahoraga",
        icon: "🐉",
        kanjiClass: "megumi",
    },
};

// ── DOM References ──
const loadingScreen   = document.getElementById("loadingScreen");
const loadingBarFill  = document.getElementById("loadingBarFill");
const loadingStatus   = document.getElementById("loadingStatus");
const appContainer    = document.getElementById("appContainer");
const webcamEl        = document.getElementById("webcam");
const canvasEl        = document.getElementById("outputCanvas");
const noHandMsg       = document.getElementById("noHandMsg");
const fingerCountEl   = document.getElementById("fingerCount");
const handCountEl     = document.getElementById("handCount");
const modeDisplayEl   = document.getElementById("modeDisplay");
const confidenceEl    = document.getElementById("confidenceDisplay");
const countRing       = document.getElementById("countRing");
const parityBadge     = document.getElementById("parityBadge");
const parityIcon      = document.getElementById("parityIcon");
const parityText      = document.getElementById("parityText");
const modeBanner      = document.getElementById("modeBanner");
const modeIconLarge   = document.getElementById("modeIconLarge");
const modeTitle       = document.getElementById("modeTitle");
const modeDesc        = document.getElementById("modeDesc");
const videoFrame      = document.getElementById("videoFrame");
const videoPlaceholder= document.getElementById("videoPlaceholder");
const youtubeContainer= document.getElementById("youtubeContainer");
const youtubePlayer   = document.getElementById("youtubePlayer");
const videoNav        = document.getElementById("videoNav");
const videoCounter    = document.getElementById("videoCounter");
const prevVideoBtn    = document.getElementById("prevVideoBtn");
const nextVideoBtn    = document.getElementById("nextVideoBtn");
const videoSectionTitle = document.getElementById("videoSectionTitle");
const videoInfoBar    = document.getElementById("videoInfoBar");
const videoInfoIcon   = document.getElementById("videoInfoIcon");
const videoInfoText   = document.getElementById("videoInfoText");
const toggleCameraBtn = document.getElementById("toggleCameraBtn");

// Theater DOM
const domainOverlay   = document.getElementById("domainOverlay");
const domainKanji     = document.getElementById("domainKanji");
const domainName      = document.getElementById("domainName");
const domainSubtitle  = document.getElementById("domainSubtitle");
const theaterMode     = document.getElementById("theaterMode");
const theaterPlayer   = document.getElementById("theaterPlayer");
const theaterExitBtn  = document.getElementById("theaterExitBtn");
const theaterModeIcon = document.getElementById("theaterModeIcon");
const theaterModeName = document.getElementById("theaterModeName");
const theaterPrevBtn  = document.getElementById("theaterPrevBtn");
const theaterNextBtn  = document.getElementById("theaterNextBtn");
const theaterNavCounter = document.getElementById("theaterNavCounter");
const miniWebcam      = document.getElementById("miniWebcam");
const miniCanvas      = document.getElementById("miniCanvas");
const miniFingerCount = document.getElementById("miniFingerCount");
const miniModeEl      = document.getElementById("miniMode");
const miniCamToggle   = document.getElementById("miniCamToggle");
const theaterMiniCam  = document.getElementById("theaterMiniCam");

// Sound prompt
const soundPrompt     = document.getElementById("soundPrompt");
const soundYesBtn     = document.getElementById("soundYes");
const soundNoBtn      = document.getElementById("soundNo");

const canvasCtx = canvasEl.getContext("2d");

// ── State ──
let handLandmarker = null;
let cameraRunning = false;
let lastVideoTime = -1;
let currentMode = null;
let currentVideoIndex = 0;
let stableCount = 0;
let lastFingerCount = -1;
let stabilityThreshold = 8;
let isTheaterActive = false;
let soundEnabled = false;
let audioCtx = null;

// ── Finger Tip / PIP landmark indices ──
const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_PIPS = [6, 10, 14, 18];
const THUMB_TIP = 4;
const THUMB_IP  = 3;

// ═══════════════════════════════════════
//  SOUND ENGINE (Web Audio API)
// ═══════════════════════════════════════
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playDomainSound(mode) {
    if (!soundEnabled || !audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    // Layer 1: Deep bass impact
    playBassImpact(mode);
    // Layer 2: Dramatic sweep
    setTimeout(() => playDramaticSweep(mode), 200);
    // Layer 3: Character-specific tone
    setTimeout(() => playCharacterTone(mode), 500);
    // Layer 4: Reverb tail
    setTimeout(() => playReverbTail(mode), 800);
}

function playBassImpact(mode) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(60, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 0.8);
    
    filter.type = "lowpass";
    filter.frequency.value = 200;
    
    gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
    
    osc.connect(filter).connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 1.2);

    // Sub-bass hit
    const sub = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    sub.type = "sine";
    sub.frequency.value = 30;
    subGain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    sub.connect(subGain).connect(audioCtx.destination);
    sub.start(); sub.stop(audioCtx.currentTime + 0.6);
}

function playDramaticSweep(mode) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const freqs = { gojo: 800, sukuna: 400, megumi: 600 };
    osc.type = mode === "sukuna" ? "sawtooth" : "sine";
    osc.frequency.setValueAtTime(freqs[mode] || 600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqs[mode] * 3, audioCtx.currentTime + 0.6);
    osc.frequency.exponentialRampToValueAtTime(freqs[mode] * 0.5, audioCtx.currentTime + 1.5);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 1.5);
}

function playCharacterTone(mode) {
    // Gojo: crystalline shimmer | Sukuna: dark growl | Megumi: ethereal chime
    const notes = {
        gojo: [1200, 1600, 2000, 2400],
        sukuna: [150, 200, 120, 180],
        megumi: [500, 700, 900, 1100],
    };
    const tones = notes[mode] || notes.gojo;
    
    tones.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = mode === "sukuna" ? "sawtooth" : "sine";
        osc.frequency.value = freq;

        const startTime = audioCtx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(mode === "sukuna" ? 0.06 : 0.08, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain).connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.8);
    });
}

function playReverbTail(mode) {
    // White noise burst for reverb effect
    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.4));
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    const filterFreqs = { gojo: 2000, sukuna: 500, megumi: 1200 };
    filter.frequency.value = filterFreqs[mode] || 1000;
    filter.Q.value = 2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

    source.connect(filter).connect(gain).connect(audioCtx.destination);
    source.start();
}

function playModeChangeClick() {
    if (!soundEnabled || !audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 1000;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
}

// ═══════════════════════════════════════
//  SOUND PROMPT
// ═══════════════════════════════════════
soundYesBtn.addEventListener("click", () => {
    soundEnabled = true;
    initAudio();
    soundPrompt.classList.add("hidden");
});
soundNoBtn.addEventListener("click", () => {
    soundEnabled = false;
    soundPrompt.classList.add("hidden");
});

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
async function init() {
    updateLoading(10, "Loading MediaPipe Vision WASM...");
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );

    updateLoading(40, "Creating Hand Landmarker...");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });

    updateLoading(70, "Accessing camera...");
    await startCamera();

    updateLoading(100, "Ready!");
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
        appContainer.style.display = "block";
    }, 600);
}

function updateLoading(pct, msg) {
    loadingBarFill.style.width = pct + "%";
    loadingStatus.textContent = msg;
}

// ═══════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════
let mediaStream = null;

async function startCamera() {
    mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
    });
    webcamEl.srcObject = mediaStream;
    miniWebcam.srcObject = mediaStream;
    await new Promise(r => webcamEl.onloadeddata = r);
    canvasEl.width = webcamEl.videoWidth;
    canvasEl.height = webcamEl.videoHeight;
    miniCanvas.width = webcamEl.videoWidth;
    miniCanvas.height = webcamEl.videoHeight;
    cameraRunning = true;
    requestAnimationFrame(detectLoop);
}

toggleCameraBtn.addEventListener("click", async () => {
    if (cameraRunning) {
        mediaStream?.getTracks().forEach(t => t.stop());
        cameraRunning = false;
        toggleCameraBtn.querySelector(".cam-icon").textContent = "📷";
    } else {
        await startCamera();
        toggleCameraBtn.querySelector(".cam-icon").textContent = "🎥";
    }
});

// ═══════════════════════════════════════
//  DETECTION LOOP
// ═══════════════════════════════════════
function detectLoop() {
    if (!cameraRunning) return;
    const now = performance.now();
    if (webcamEl.currentTime !== lastVideoTime) {
        lastVideoTime = webcamEl.currentTime;
        const results = handLandmarker.detectForVideo(webcamEl, now);
        processResults(results);
    }
    requestAnimationFrame(detectLoop);
}

// ═══════════════════════════════════════
//  PROCESS RESULTS
// ═══════════════════════════════════════
function processResults(results) {
    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // Also draw on mini canvas in theater mode
    const miniCtx = miniCanvas.getContext("2d");
    miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);

    const numHands = results.landmarks?.length || 0;
    handCountEl.textContent = numHands;

    if (numHands === 0) {
        noHandMsg.classList.remove("hidden");
        fingerCountEl.textContent = "0";
        miniFingerCount.textContent = "0";
        confidenceEl.textContent = "—";
        return;
    }
    noHandMsg.classList.add("hidden");

    const drawingUtils = new DrawingUtils(canvasCtx);
    const miniDrawingUtils = new DrawingUtils(miniCtx);
    let totalFingers = 0;
    let avgConfidence = 0;

    for (let h = 0; h < numHands; h++) {
        const landmarks = results.landmarks[h];
        const handedness = results.handednesses[h]?.[0];
        const isRightHand = handedness?.categoryName === "Right";

        const color = isRightHand ? "#60a5fa" : "#f87171";
        const fill = isRightHand ? "#3b82f6" : "#ef4444";

        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color, lineWidth: 3 });
        drawingUtils.drawLandmarks(landmarks, { color: "#ffffff", lineWidth: 1, radius: 4, fillColor: fill });

        // Mini canvas
        miniDrawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color, lineWidth: 2 });
        miniDrawingUtils.drawLandmarks(landmarks, { color: "#fff", lineWidth: 1, radius: 2, fillColor: fill });

        totalFingers += countFingers(landmarks, isRightHand);
        if (handedness) avgConfidence += handedness.score;
    }
    avgConfidence = numHands > 0 ? (avgConfidence / numHands) : 0;

    fingerCountEl.textContent = totalFingers;
    miniFingerCount.textContent = totalFingers;
    confidenceEl.textContent = (avgConfidence * 100).toFixed(0) + "%";

    // Stability check
    if (totalFingers === lastFingerCount) {
        stableCount++;
    } else {
        stableCount = 0;
        lastFingerCount = totalFingers;
    }

    if (stableCount >= stabilityThreshold && totalFingers > 0) {
        let newMode;
        if (totalFingers === 7) {
            newMode = "megumi";
        } else if (totalFingers % 2 !== 0) {
            newMode = "gojo";
        } else {
            newMode = "sukuna";
        }

        updateModeUI(newMode, totalFingers);

        if (newMode !== currentMode) {
            currentMode = newMode;
            currentVideoIndex = 0;
            triggerDomainExpansion(newMode);
        }
    }
}

// ═══════════════════════════════════════
//  FINGER COUNTING
// ═══════════════════════════════════════
function countFingers(landmarks, isRightHand) {
    let count = 0;
    if (isRightHand) {
        if (landmarks[THUMB_TIP].x > landmarks[THUMB_IP].x) count++;
    } else {
        if (landmarks[THUMB_TIP].x < landmarks[THUMB_IP].x) count++;
    }
    for (let i = 0; i < FINGER_TIPS.length; i++) {
        if (landmarks[FINGER_TIPS[i]].y < landmarks[FINGER_PIPS[i]].y) count++;
    }
    return count;
}

// ═══════════════════════════════════════
//  MODE UI UPDATE
// ═══════════════════════════════════════
function updateModeUI(mode, count) {
    const modeLabels = { megumi: "MEGUMI", gojo: "GOJO", sukuna: "SUKUNA" };
    const modeColors = { megumi: "var(--megumi-color)", gojo: "var(--gojo-color)", sukuna: "var(--sukuna-color)" };
    const ringClass = { megumi: "megumi", gojo: "odd", sukuna: "even" };
    const badgeClass = ringClass;
    const icons = { megumi: "🟢", gojo: "🔵", sukuna: "🔴" };
    const badgeTexts = { megumi: "SEVEN", gojo: "ODD", sukuna: "EVEN" };
    const bannerIcons = { megumi: "🐉", gojo: "💠", sukuna: "👹" };
    const titles = { megumi: "MAHORAGA SUMMONED", gojo: "INFINITE VOID", sukuna: "MALEVOLENT SHRINE" };
    const descs = {
        megumi: `${count} fingers — "With this treasure, I summon..."`,
        gojo: `${count} finger${count !== 1 ? "s" : ""} — Odd → Domain Expansion`,
        sukuna: `${count} finger${count !== 1 ? "s" : ""} — Even → Domain Expansion`,
    };

    countRing.className = "count-ring " + ringClass[mode];
    parityBadge.className = "parity-badge " + badgeClass[mode];
    parityIcon.textContent = icons[mode];
    parityText.textContent = badgeTexts[mode];
    modeDisplayEl.textContent = modeLabels[mode];
    modeDisplayEl.style.color = modeColors[mode];
    modeBanner.className = "mode-banner " + mode;
    modeIconLarge.textContent = bannerIcons[mode];
    modeTitle.textContent = titles[mode];
    modeDesc.textContent = descs[mode];
    miniModeEl.textContent = modeLabels[mode];

    // Dynamic Background Glow
    document.getElementById("particles").className = "bg-particles " + mode;
}

// ═══════════════════════════════════════
//  DOMAIN EXPANSION TRANSITION
// ═══════════════════════════════════════
function triggerDomainExpansion(mode) {
    const config = DOMAIN_CONFIG[mode];
    
    // Play domain expansion sound
    playDomainSound(mode);

    // Set overlay content
    domainKanji.textContent = config.kanji;
    domainKanji.className = "domain-kanji " + config.kanjiClass;
    domainName.textContent = config.name;
    domainSubtitle.textContent = config.subtitle;

    // Show overlay
    domainOverlay.classList.add("active");

    // After transition, open theater
    setTimeout(() => {
        domainOverlay.classList.remove("active");
        openTheater(mode);
    }, 2500);
}

// ═══════════════════════════════════════
//  FULLSCREEN THEATER
// ═══════════════════════════════════════
function openTheater(mode) {
    isTheaterActive = true;
    const videos = getVideosForMode();
    const video = videos[currentVideoIndex];
    const config = DOMAIN_CONFIG[mode];

    // Set theater video
    theaterPlayer.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;

    // Update theater UI
    theaterModeIcon.textContent = config.icon;
    theaterModeName.textContent = config.name;
    theaterNavCounter.textContent = `${currentVideoIndex + 1}/${videos.length}`;

    // Show theater
    theaterMode.classList.add("active");

    // Try native fullscreen
    try {
        document.documentElement.requestFullscreen?.();
    } catch (e) { /* Fullscreen may require user gesture */ }

    // Also update small video panel
    updateSmallVideo();
}

function closeTheater() {
    isTheaterActive = false;
    theaterMode.classList.remove("active");
    theaterPlayer.src = "";

    try {
        if (document.fullscreenElement) document.exitFullscreen?.();
    } catch (e) {}

    playModeChangeClick();
}

function updateSmallVideo() {
    const videos = getVideosForMode();
    const video = videos[currentVideoIndex];

    // Update small panel too
    videoPlaceholder.style.display = "none";
    youtubeContainer.style.display = "block";
    youtubePlayer.src = `https://www.youtube.com/embed/${video.id}?rel=0`;
    videoNav.style.display = "flex";
    videoCounter.textContent = `${currentVideoIndex + 1}/${videos.length}`;

    const frameClasses = { gojo: "gojo-active", sukuna: "sukuna-active", megumi: "megumi-active" };
    videoFrame.className = "video-frame " + (frameClasses[currentMode] || "");

    const titles = { gojo: "Infinite Void", sukuna: "Malevolent Shrine", megumi: "Mahoraga" };
    const icons = { gojo: "💠", sukuna: "👹", megumi: "🐉" };

    videoSectionTitle.textContent = titles[currentMode] || "Fight Scene";
    videoInfoBar.style.display = "block";
    videoInfoIcon.textContent = icons[currentMode] || "⚔️";
    videoInfoText.textContent = video.title;
}

// ── Get videos for current mode ──
function getVideosForMode() {
    if (currentMode === "megumi") return MEGUMI_MAHORAGA_VIDEOS;
    if (currentMode === "gojo") return GOJO_INFINITE_VOID_VIDEOS;
    return SUKUNA_MALEVOLENT_SHRINE_VIDEOS;
}

// ═══════════════════════════════════════
//  THEATER CONTROLS
// ═══════════════════════════════════════
theaterExitBtn.addEventListener("click", closeTheater);

theaterPrevBtn.addEventListener("click", () => {
    if (!currentMode) return;
    playModeChangeClick();
    const videos = getVideosForMode();
    currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    const video = videos[currentVideoIndex];
    theaterPlayer.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
    theaterNavCounter.textContent = `${currentVideoIndex + 1}/${videos.length}`;
    updateSmallVideo();
});

theaterNextBtn.addEventListener("click", () => {
    if (!currentMode) return;
    playModeChangeClick();
    const videos = getVideosForMode();
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    const video = videos[currentVideoIndex];
    theaterPlayer.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
    theaterNavCounter.textContent = `${currentVideoIndex + 1}/${videos.length}`;
    updateSmallVideo();
});

// Mini cam toggle
miniCamToggle.addEventListener("click", () => {
    theaterMiniCam.classList.toggle("hidden");
});

// ESC key to exit theater
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isTheaterActive) {
        closeTheater();
    }
});

// ── Small panel Video Navigation ──
prevVideoBtn.addEventListener("click", () => {
    if (!currentMode) return;
    playModeChangeClick();
    const videos = getVideosForMode();
    currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    updateSmallVideo();
    if (isTheaterActive) {
        const video = videos[currentVideoIndex];
        theaterPlayer.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
        theaterNavCounter.textContent = `${currentVideoIndex + 1}/${videos.length}`;
    }
});
nextVideoBtn.addEventListener("click", () => {
    if (!currentMode) return;
    playModeChangeClick();
    const videos = getVideosForMode();
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    updateSmallVideo();
    if (isTheaterActive) {
        const video = videos[currentVideoIndex];
        theaterPlayer.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
        theaterNavCounter.textContent = `${currentVideoIndex + 1}/${videos.length}`;
    }
});

// ═══════════════════════════════════════
//  START
// ═══════════════════════════════════════
init().catch(err => {
    console.error("Init error:", err);
    loadingStatus.textContent = "Error: " + err.message;
});

// ═══════════════════════════════════════
//  CURSED ENERGY CURSOR TRAIL
// ═══════════════════════════════════════
document.addEventListener("mousemove", (e) => {
    if (!currentMode) return;
    
    // Throttle particle creation slightly
    if (Math.random() > 0.6) return;

    const particle = document.createElement("div");
    particle.className = "cursor-particle " + currentMode;
    particle.style.left = e.clientX + "px";
    particle.style.top = e.clientY + "px";
    
    // Add randomness to initial position
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    document.body.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
        particle.remove();
    }, 600);
});
