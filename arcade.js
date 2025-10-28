// --- MAIN SCRIPT EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {

    // Initialize the new, high-quality 2D poop overlay
    const poopOverlay = new PoopOverlayEffect();
    poopOverlay.init();

    // Initialize all other page effects
    loadAndDisplayMedia();
    initializeImageZapper();
    initializeHeaderGlich();
    initializeSnakeGame();
});


// --- NEW: HIGH-QUALITY 2D POOP OVERLAY EFFECT ---
class PoopOverlayEffect {
    constructor() {
        this.canvas = document.getElementById('poop-overlay-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.poops = [];
        this.smearParticles = []; // For the drip trail effect
        this.gravity = 0.2;
        this.poopAsset = this.createGrossPoopAsset(); // Pre-render the gross asset
        this.animate = this.animate.bind(this);
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        setInterval(() => this.spawnPoop(), 3000);
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createGrossPoopAsset() {
        const size = 100; // Use a larger canvas for more detail
        const poopCanvas = document.createElement('canvas');
        poopCanvas.width = size;
        poopCanvas.height = size;
        const poopCtx = poopCanvas.getContext('2d');

        // 1. Draw the base, lumpy shape with a shadow for depth
        poopCtx.shadowColor = '#1a1008';
        poopCtx.shadowBlur = 15;
        poopCtx.beginPath();
        poopCtx.moveTo(size * 0.2, size * 0.5);
        poopCtx.quadraticCurveTo(size * 0.4, size * 0.2, size * 0.6, size * 0.4);
        poopCtx.quadraticCurveTo(size * 0.8, size * 0.6, size * 0.7, size * 0.8);
        poopCtx.quadraticCurveTo(size * 0.6, size * 0.95, size * 0.4, size * 0.8);
        poopCtx.quadraticCurveTo(size * 0.2, size * 0.7, size * 0.2, size * 0.5);
        poopCtx.closePath();

        // 2. Fill with a base brown color
        poopCtx.fillStyle = '#5c3a26';
        poopCtx.fill();
        poopCtx.shadowBlur = 0; // Turn off shadow for subsequent layers

        // 3. Add disgusting "chunks" and speckles
        for (let i = 0; i < 15; i++) {
            // Darker chunks
            poopCtx.fillStyle = `rgba(40, 20, 10, ${Math.random() * 0.7})`;
            poopCtx.beginPath();
            poopCtx.arc(size * (Math.random() * 0.6 + 0.2), size * (Math.random() * 0.6 + 0.2), Math.random() * 3 + 1, 0, Math.PI * 2);
            poopCtx.fill();
            // Undigested "corn" chunks
            if (i < 5) {
                poopCtx.fillStyle = `rgba(225, 200, 100, ${Math.random() * 0.8})`;
                poopCtx.beginPath();
                poopCtx.arc(size * (Math.random() * 0.6 + 0.2), size * (Math.random() * 0.6 + 0.2), Math.random() * 2 + 1, 0, Math.PI * 2);
                poopCtx.fill();
            }
        }

        // 4. Add a "wet" specular highlight
        const gradient = poopCtx.createRadialGradient(size * 0.4, size * 0.3, 1, size * 0.5, size * 0.5, size * 0.4);
        gradient.addColorStop(0, 'rgba(255, 255, 230, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 255, 230, 0)');
        poopCtx.fillStyle = gradient;
        poopCtx.fill(); // Apply the highlight over the shape

        return poopCanvas;
    }

    spawnPoop() {
        this.poops.push({
            x: Math.random() * this.canvas.width,
            y: -100,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 + 1,
            size: Math.random() * 30 + 50, // size 50-80px
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            wobble: Math.random() * 10 + 5, // Wobble amount
            wobbleSpeed: Math.random() * 0.1 + 0.05,
        });
    }

    animate() {
        // FIX: Clear the canvas completely transparent. This STOPS the darkening effect.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- Animate Smear Particles (the trail) ---
        for (let i = this.smearParticles.length - 1; i >= 0; i--) {
            const particle = this.smearParticles[i];
            particle.life--;
            if (particle.life <= 0) {
                this.smearParticles.splice(i, 1);
            } else {
                this.ctx.globalAlpha = particle.life / particle.maxLife;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalAlpha = 1.0; // Reset alpha

        // --- Animate Main Poop Objects ---
        for (let i = this.poops.length - 1; i >= 0; i--) {
            const poop = this.poops[i];
            poop.vy += this.gravity;
            poop.y += poop.vy;
            const wobbleOffset = Math.sin(poop.y * poop.wobbleSpeed) * poop.wobble;
            poop.x += poop.vx;
            poop.rotation += poop.rotationSpeed;

            // Spawn a smear particle for the trail
            this.smearParticles.push({
                x: poop.x + poop.size / 2 + (Math.random() * 10 - 5),
                y: poop.y + poop.size / 2 + (Math.random() * 10 - 5),
                size: Math.random() * (poop.size * 0.2) + 2,
                life: 60, maxLife: 60,
                color: `rgba(61, 43, 31, ${Math.random() * 0.3 + 0.2})`
            });

            // Draw the pre-rendered poop asset
            this.ctx.save();
            this.ctx.translate(poop.x + wobbleOffset + poop.size / 2, poop.y + poop.size / 2);
            this.ctx.rotate(poop.rotation * Math.PI / 180);
            this.ctx.drawImage(this.poopAsset, -poop.size / 2, -poop.size / 2, poop.size, poop.size);
            this.ctx.restore();

            // Remove poop if it falls off screen
            if (poop.y > this.canvas.height) {
                this.poops.splice(i, 1);
            }
        }

        requestAnimationFrame(this.animate);
    }
}


// --- AUTOMATIC MEDIA LOADER ---
function loadAndDisplayMedia() {
    const photoGrid = document.querySelector('#photos .media-grid');
    const videoGrid = document.querySelector('#videos .media-grid');
    const imageZapperList = [];

    const loadMediaSequentially = (type, extensions, container, callback) => {
        let index = 1; let currentExtensionIndex = 0;
        const tryNext = () => {
            if (currentExtensionIndex >= extensions.length) { index++; currentExtensionIndex = 0; }
            const extension = extensions[currentExtensionIndex];
            const actualFolder = (type === 'photo') ? 'pics' : 'vids';
            const path = `media/${actualFolder}/${type}-${index}.${extension}`;
            let element;
            if (type === 'photo') { element = new Image(); } else { element = document.createElement('video'); }
            element.onload = element.oncanplay = () => { callback(path); index++; currentExtensionIndex = 0; tryNext(); };
            element.onerror = () => { currentExtensionIndex++; if (currentExtensionIndex >= extensions.length) { console.log(`Stopped searching for ${type}s at index ${index}.`); } else { tryNext(); } };
            element.src = path;
        };
        tryNext();
    };

    if (photoGrid) { loadMediaSequentially('photo', ['jpg', 'png', 'jpeg', 'gif'], photoGrid, (path) => { const gridItem = document.createElement('div'); gridItem.className = 'grid-item'; gridItem.innerHTML = `<img src="${path}" alt="Chookie Photo ${photoGrid.children.length + 1}">`; photoGrid.appendChild(gridItem); imageZapperList.push(path); }); }
    if (videoGrid) { loadMediaSequentially('video', ['webm', 'mp4'], videoGrid, (path) => { const gridItem = document.createElement('div'); gridItem.className = 'grid-item'; gridItem.innerHTML = `<video src="${path}" autoplay loop muted playsinline></video>`; videoGrid.appendChild(gridItem); }); }
    window.availableImagesForZapper = imageZapperList;
}

// --- OTHER 2D EFFECTS & GAME ---

function initializeImageZapper() {
    const loudButton = document.querySelector('.loud-button');
    const zapperContainer = document.getElementById('image-zapper-container');
    if (loudButton && zapperContainer) {
        loudButton.addEventListener('click', () => {
            const availableImages = window.availableImagesForZapper || [];
            if (availableImages.length === 0) { console.warn("Image Zapper: No images found."); return; }
            for (let i = 0; i < 5; i++) { setTimeout(() => launchImage(availableImages, zapperContainer), i * 150); }
        });
    }
}
function launchImage(availableImages, zapperContainer) {
    const img = document.createElement('img');
    img.classList.add('zapper-image');
    img.src = availableImages[Math.floor(Math.random() * availableImages.length)];
    const randomSize = Math.random() * 150 + 150;
    img.style.width = `${randomSize}px`; img.style.top = `${Math.random() * 80}%`;
    const randomDuration = Math.random() * 1 + 1.5;
    img.style.animationDuration = `${randomDuration}s`;
    if (Math.random() > 0.5) { img.style.left = `-${randomSize}px`; } else { img.style.right = `-${randomSize}px`; img.style.animationDirection = 'reverse'; }
    zapperContainer.appendChild(img);
    setTimeout(() => img.remove(), randomDuration * 1000);
}

function initializeHeaderGlich() {
    const glitchHeaders = document.querySelectorAll('h2.glitch');
    if (glitchHeaders.length > 0) {
        setInterval(() => {
            const randomHeader = glitchHeaders[Math.floor(Math.random() * glitchHeaders.length)];
            randomHeader.classList.add('is-glitching');
            setTimeout(() => { randomHeader.classList.remove('is-glitching'); }, 500);
        }, 3000);
    }
}

function initializeSnakeGame() {
    const canvas = document.getElementById('snake-game-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-game-btn');
    const scoreDisplay = document.getElementById('score-display');
    const gridSize = 20;
    const tileCountX = canvas.width / gridSize;
    const tileCountY = canvas.height / gridSize;
    const snakeHeadImage = new Image();
    snakeHeadImage.src = 'media/pics/snakehead.png';
    let snake, food, direction, score, gameLoopInterval, isGameOver;

    function drawFatPersonSegment(segment, isHead = false) { if (isHead) { ctx.drawImage(snakeHeadImage, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize); } else { ctx.fillStyle = '#f2d3b3'; ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize); ctx.fillStyle = '#8a9a5b'; ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4); } }
    function drawPoop(food) { ctx.fillStyle = '#66402e'; const x = food.x * gridSize; const y = food.y * gridSize; ctx.beginPath(); ctx.arc(x + gridSize / 2, y + gridSize - 5, gridSize / 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x + gridSize / 2, y + gridSize - 10, gridSize / 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x + gridSize / 2, y + gridSize - 14, gridSize / 6, 0, Math.PI * 2); ctx.fill(); }
    function generateFood() { food = { x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY) }; for (let segment of snake) { if (segment.x === food.x && segment.y === food.y) { generateFood(); break; } } }
    function update() { if (isGameOver) return; const head = { x: snake[0].x, y: snake[0].y }; if (direction === 'right') head.x++; if (direction === 'left') head.x--; if (direction === 'up') head.y--; if (direction === 'down') head.y++; if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) return gameOver(); for (let i = 1; i < snake.length; i++) { if (head.x === snake[i].x && head.y === snake[i].y) return gameOver(); } snake.unshift(head); if (head.x === food.x && head.y === food.y) { score++; scoreDisplay.textContent = score; generateFood(); } else { snake.pop(); } draw(); }
    function draw() { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height); snake.forEach((segment, index) => drawFatPersonSegment(segment, index === 0)); drawPoop(food); }
    function startGame() { isGameOver = false; snake = [{ x: 10, y: 10 }]; direction = 'right'; score = 0; scoreDisplay.textContent = score; startButton.style.display = 'none'; generateFood(); clearInterval(gameLoopInterval); gameLoopInterval = setInterval(update, 150); }
    function gameOver() { isGameOver = true; clearInterval(gameLoopInterval); startButton.style.display = 'block'; }
    function handleKeyPress(e) { const newDirection = e.key.replace('Arrow', '').toLowerCase(); if (newDirection === 'up' && direction !== 'down') direction = 'up'; if (newDirection === 'down' && direction !== 'up') direction = 'down'; if (newDirection === 'left' && direction !== 'right') direction = 'left'; if (newDirection === 'right' && direction !== 'left') direction = 'right'; }
    startButton.addEventListener('click', startGame); document.addEventListener('keydown', handleKeyPress);
}