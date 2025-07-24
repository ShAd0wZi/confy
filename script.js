let isOpen = false;
let isPlaying = false;

const envelopeFlap = document.getElementById('envelopeFlap');
const loveNote = document.getElementById('loveNote');
const toggleBtn = document.getElementById('toggleBtn');
const audioControl = document.getElementById('audioControl');
const envelopeContainer = document.getElementById('envelopeContainer');
const waxSeal = document.getElementById('waxSeal');
const statusIndicator = document.getElementById('statusIndicator');
const container = document.querySelector('.container');
const backgroundMusic = document.getElementById('backgroundMusic');
const vinylRecord = document.getElementById('vinylRecord');
const tonearm = document.getElementById('tonearm');
const visualizer = document.getElementById('visualizer');

// Audio visualizer setup
let audioContext;
let analyser;
let dataArray;
let source;

function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        if (!source) {
            source = audioContext.createMediaElementSource(backgroundMusic);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        }
    }
}

function drawVisualizer() {
    if (!isPlaying || !analyser) return;
    
    const canvas = visualizer;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 80;
    const height = canvas.height = 30;
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = width / dataArray.length * 2;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.8;
        
        const hue = 340 + (i / dataArray.length) * 30; // Pink to purple range
        ctx.fillStyle = `hsla(${hue}, 70%, 70%, 0.8)`;
        
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
    }
    
    requestAnimationFrame(drawVisualizer);
}

// Show initial hint
setTimeout(() => {
    statusIndicator.classList.add('show');
    setTimeout(() => {
        statusIndicator.classList.remove('show');
    }, 3000);
}, 1000);

function toggleMusic() {
    if (!isPlaying) {
        // Setup audio context on first play (required by browsers)
        setupAudioContext();
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        backgroundMusic.play().then(() => {
            audioControl.textContent = '⏸';
            audioControl.title = 'Pause music';
            audioControl.classList.add('playing');
            vinylRecord.classList.add('spinning');
            tonearm.classList.add('playing');
            visualizer.classList.add('active');
            isPlaying = true;
            showStatus('Playing romantic music 🎵');
            drawVisualizer();
        }).catch(error => {
            console.log('Audio play failed:', error);
            showStatus('Could not play music');
        });
    } else {
        backgroundMusic.pause();
        audioControl.textContent = '▶';
        audioControl.title = 'Play romantic music';
        audioControl.classList.remove('playing');
        vinylRecord.classList.remove('spinning');
        tonearm.classList.remove('playing');
        visualizer.classList.remove('active');
        isPlaying = false;
        showStatus('Music paused');
    }
}

function showStatus(msg) {
    statusIndicator.textContent = msg;
    statusIndicator.classList.add('show');
    setTimeout(() => statusIndicator.classList.remove('show'), 2000);
}

function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = ['💕', '💖', '✨', '💫', '🌸'][Math.floor(Math.random() * 5)];
    heart.style.left = `${Math.random() * window.innerWidth}px`;
    heart.style.top = `${window.innerHeight}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 4000);
}

function createConfetti() {
    const colors = ['#f48fb1', '#f06292', '#e91e63', '#ffc1cc', '#ffb3d1'];
    
    // Create multiple small bursts instead of one big one
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 40,
                spread: 55,
                origin: { y: 0.6 },
                colors: colors,
                scalar: 0.8,
                gravity: 0.8,
                ticks: 200
            });
        }, i * 200);
    }
}

function toggleEnvelope() {
    if (!isOpen) {
        // Opening the note
        toggleBtn.textContent = 'Close Note ✨';
        toggleBtn.classList.add('closing');
        container.classList.add('note-open');
        waxSeal.classList.add('broken');
        envelopeFlap.classList.add('open');
        
        setTimeout(() => {
            loveNote.classList.add('visible');
            createConfetti();
            
            // Create floating hearts with staggered timing
            for (let i = 0; i < 5; i++) {
                setTimeout(createFloatingHeart, i * 300);
            }
            
            showStatus('Note opened 💌');
        }, 600);
        
    } else {
        // Closing the note
        toggleBtn.textContent = 'Read My Note 💌';
        toggleBtn.classList.remove('closing');
        container.classList.remove('note-open');
        loveNote.classList.remove('visible');
        envelopeFlap.classList.remove('open');
        waxSeal.classList.remove('broken');
        showStatus('Note closed');
    }
    isOpen = !isOpen;
}

// Event listeners
toggleBtn.addEventListener('click', toggleEnvelope);
audioControl.addEventListener('click', toggleMusic);
envelopeContainer.addEventListener('click', toggleEnvelope);

// Keyboard shortcuts with better accessibility
document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        toggleEnvelope();
    }
    if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMusic();
    }
    if (e.code === 'Escape' && isOpen) {
        toggleEnvelope();
    }
});

// Occasional floating hearts (less frequent)
setInterval(() => {
    if (Math.random() < 0.15) {
        createFloatingHeart();
    }
}, 4000);

// Add some hover effects for better interactivity
envelopeContainer.addEventListener('mouseenter', () => {
    if (!isOpen) {
        showStatus('Click to open 💌');
        setTimeout(() => statusIndicator.classList.remove('show'), 1500);
    }
});

// Handle music errors gracefully
backgroundMusic.addEventListener('error', (e) => {
    console.log('Music loading error:', e);
    showStatus('Music unavailable');
    // Hide vinyl player if music fails to load
    document.querySelector('.vinyl-player').style.opacity = '0.5';
});

backgroundMusic.addEventListener('loadeddata', () => {
    console.log('Music loaded successfully');
});

// Set volume to a comfortable level
backgroundMusic.volume = 0.3;