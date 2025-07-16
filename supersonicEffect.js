// ==UserScript==
// @name         GeoFS Sonic Boom (Fixed)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adds a visible shockwave + loud sonic boom sound when exceeding 767 knots (Mach 1) in GeoFS
// @author       You
// @match        *://*.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let sonicBoomTriggered = false;

    // Load boom sound
    const boomAudio = new Audio('https://freesound.org/data/previews/316/316847_4939433-lq.mp3');
    boomAudio.volume = 1.0;

    // Optional echo effect
    const echoBoom = new Audio('https://freesound.org/data/previews/316/316847_4939433-lq.mp3');
    echoBoom.volume = 0.5;

    // Create shockwave ring
    const shockwave = document.createElement('div');
    shockwave.style.position = 'fixed';
    shockwave.style.top = '50%';
    shockwave.style.left = '50%';
    shockwave.style.width = '120px';
    shockwave.style.height = '120px';
    shockwave.style.border = '6px solid cyan';
    shockwave.style.borderRadius = '50%';
    shockwave.style.pointerEvents = 'none';
    shockwave.style.opacity = '0';
    shockwave.style.transform = 'translate(-50%, -50%) scale(0)';
    shockwave.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    shockwave.style.zIndex = '9999';
    document.body.appendChild(shockwave);

    function triggerShockwave() {
        shockwave.style.transform = 'translate(-50%, -50%) scale(2.0)';
        shockwave.style.opacity = '1';
        setTimeout(() => {
            shockwave.style.transform = 'translate(-50%, -50%) scale(0)';
            shockwave.style.opacity = '0';
        }, 600);
    }

    function triggerBoom() {
        boomAudio.currentTime = 0;
        boomAudio.play();
        setTimeout(() => {
            echoBoom.currentTime = 0;
            echoBoom.play();
        }, 300);
    }

    function startMonitoring() {
        setInterval(() => {
            const plane = geofs?.aircraft?.instance;
            const tas = plane?.trueAirSpeed;
            if (!tas) return;

            const tasKnots = tas * 1.94384;

            if (tasKnots >= 767 && !sonicBoomTriggered) {
                sonicBoomTriggered = true;
                triggerShockwave();
                triggerBoom();
                console.log(`💥 Sonic boom at ${tasKnots.toFixed(1)} knots`);
            }

            if (tasKnots < 767) {
                sonicBoomTriggered = false;
            }
        }, 200);
    }

    // Wait for GeoFS to load before running
    const waitForGeoFS = setInterval(() => {
        if (typeof geofs !== "undefined" && geofs.aircraft?.instance?.trueAirSpeed !== undefined) {
            clearInterval(waitForGeoFS);
            console.log("✅ GeoFS aircraft detected. Sonic boom script ready!");
            startMonitoring();
        }
    }, 500);
})();
