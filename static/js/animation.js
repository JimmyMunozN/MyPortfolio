import { animate, svg, stagger } from 'https://esm.sh/animejs';
import { setInputsState } from './main.js';

let currentAnimation = null;
let prevTarget = null;
let container = null;
let content = null;
let prevYvalue = 0;

const background = document.getElementById('backgroundContainer');
const navbar = document.getElementById('navigationBar');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let explosionesActivas = [];

const entryProps = (x, y) => ({
    opacity: [0, 1],
    translateX: [x, 0],
    translateY: [y, 0],
    scale: [0, 1],
    duration: 700
});

const exitProps = (x, y) => ({
    opacity: [1, 0],
    translateX: [0, x],
    translateY: [0, y],
    scale: [1, 0],
    duration: 700
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', () => {
    resizeCanvas();
    if (explosionesActivas.length > 0) {
        explosionesActivas[0].x = window.innerWidth / 2;
        explosionesActivas[0].y = window.innerHeight / 2;
    }
});

const frames = [];
const totalFrames = 72;
let framesLoaded = 0;
let animacionIniciada = false;

for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    const numeroFormateado = i.toString().padStart(4, '0');
    img.src = `/static/img/explosion/fotograma${numeroFormateado}.png`;
    
    img.onload = () => {
        verificarCarga();
    };

    img.onerror = () => {
        console.error(`No se pudo cargar el fotograma: ${numeroFormateado}`);
        verificarCarga();
    };

    frames.push(img);
}

function verificarCarga() {
    framesLoaded++;
    if (framesLoaded === totalFrames) {
        console.log("Recursos listos. Iniciando bienvenida...");
        welcome(); 
    }
}

function iniciarExplosionAlCargar() {
    if (!animacionIniciada && framesLoaded === totalFrames) {
        const explosion = new ExplosionSakuga(
            canvas.width / 2, 
            canvas.height / 2, 
            () => { showBackground(); }
        );
        
        explosionesActivas.push(explosion);
        animacionIniciada = true;
    }
}

class ExplosionSakuga {
    constructor(x, y, onComplete) {
        this.x = x;
        this.y = y;
        this.onComplete = onComplete;
        this.currentFrame = 0;
        this.done = false;
        this.lastUpdate = 0;
        this.fps = 30; 
        this.scaleW = window.innerWidth;
        this.scaleH = window.innerHeight;
    }

    dibujar(timestamp) {
        if (this.done) return;

        if (timestamp - this.lastUpdate > 1000 / this.fps) {
            this.currentFrame++;
            this.lastUpdate = timestamp;
            if (this.currentFrame >= totalFrames) {
                this.done = true;
                if (this.onComplete) this.onComplete(); 
                return;
            }
        }

        const imgActual = frames[this.currentFrame];
        if (imgActual && imgActual.complete) {
            ctx.drawImage(
                imgActual, 
                this.x - (this.scaleW / 2), 
                this.y - (this.scaleH / 2), 
                this.scaleW, 
                this.scaleH
            );
        }
    }
}

async function animateExit(targetElement, xvalue, yvalue) {
    if (targetElement) {
        await animate(targetElement, exitProps(xvalue, yvalue)).finished;
    }
}

export async function componentAnimation(target, xvalue, yvalue) {
    const componentClass = {
        'home': '.homeInfo',
        'about': '.aboutMe',
        'projects': '.portfolioButtons',
        'contact': '.contactSection',
        'start': '.start'
    };

    const selector = componentClass[target] ?? target;
    const isTargetContainer = componentClass.hasOwnProperty(target);
    
    if (target !== prevTarget) {

        if (content !== null) {
            await animateExit(content, xvalue, prevYvalue);
        }

        if (isTargetContainer && container !== null) {
            await animateExit(content, xvalue, prevYvalue);
            await animateExit(container, 0, 0);
        }

        if (isTargetContainer) {
            await new Promise(resolve => setTimeout(resolve, 700));
            container = selector;
        } else {
            content = selector;
        }

        const newAnimation = animate(selector, entryProps(xvalue, yvalue));
        prevYvalue = yvalue;
    }

    prevTarget = target;
}

const PATH_SELECTORS = {
    'home':      '#path_flow_top',
    'about':     '#path_flow_left',
    'projects':  '#path_flow_right',
    'contact':   '#path_flow_bottom',
    'start':    ['#path_flow_left', '#path_flow_right', '#path_flow_bottom', '#path_flow_top']
};

const ALL_PATHS = Object.values(PATH_SELECTORS);


function stopAnimation() {
    if (currentAnimation) {
        currentAnimation.pause();
        currentAnimation.seek(0);
        currentAnimation = null;
    }

    animate(svg.createDrawable(ALL_PATHS), {
        draw: '0 0',
        duration: 1,
        delay: 0
    });
}

export async function pulseAnimation(target) {
    
    const animationTarget = PATH_SELECTORS[target];
    stopAnimation();

    let durationPulse = 2000;
    
    if (target === 'home') {
        durationPulse = 5000;
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));

    if (target === 'start') {
        
        const centerTargets = PATH_SELECTORS['start']

        const baseDuration = 2000;

        currentAnimation = animate(svg.createDrawable(centerTargets), {
            draw: ['-0.1 -0.1', '-0.02 0.005', '1 1'], 
            ease: 'linear',
            duration: baseDuration,
            loop: true,
        });
        
    } else if (target === 'home') {
        currentAnimation = animate(svg.createDrawable(animationTarget), {
                draw: ['0 0', '0.05 0.5', '1 1'],
                ease: 'linear',
                duration: durationPulse,
                delay: 100,
                loop: true
            });
    } else {
        durationPulse = 2300;
        currentAnimation = animate(svg.createDrawable(animationTarget), {
                draw: ['0 0', '0.05 0.5', '1 1'],
                ease: 'linear',
                duration: durationPulse,
                delay: 100,
                loop: true
            });
    }
};

export function animateBgComponents() {

    animate(svg.createDrawable('.toDraw'), {
        draw: ['0 0', '0 1', '0 0'],
        ease: 'inOutQuad',
        duration: 3000,
        loop: true,
        delay: () => Math.random() * 1000
    });

    animate('.charge', {
        scaleY: [.3, 1],
        alternate: true,
        loop: true,
        duration: 2000,
        delay: () => Math.random() * 2000
    });

    animate('.erase', {
        opacity: [.2, 1],
        alternate: true,
        loop: true,
        duration: 1000,
        delay: () => Math.random() * 1000
    });

    animate('#pulseShadow', {
        '--blur-size': ['10px', '30px'],
        alternate: true,
        duration: 2000,
        easing: 'easeInOutQuad',
        loop: true
    });
}

async function showBackground() {
    const animationSettings = {
        duration: 2000,
        fill: 'forwards',
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    };

    const fadeShowing = [
        { opacity: 0 },
        { opacity: 1 }
    ];

    navbar.animate(fadeShowing, animationSettings);
    animate(svg.createDrawable('#background_animation'), {
        draw: ['0 0', '0 1', '0 1'],
        ease: 'inOutQuad',
        duration: 1000,
    });
    animate(svg.createDrawable('#chipset'), {
        draw: ['0 0', '1 1', '0 1'],
        ease: 'inOutQuad',
        duration: 6000,
    });

    await background.animate(fadeShowing, animationSettings);
    setInputsState(true);
}

function loop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = explosionesActivas.length - 1; i >= 0; i--) {
        explosionesActivas[i].dibujar(timestamp);
        if (explosionesActivas[i].done) {
            explosionesActivas.splice(i, 1);
        }
    }

    requestAnimationFrame(loop);
}

export async function welcome(config = {}) {
    setInputsState(false);
    const {
        linea1       = "WELCOME TO MY",
        linea2       = "PORTFOLIO",
        fontSizeL1   = 70,
        fontSizeL2   = 60,
        colorCian    = "#b3f1ff",
        colorNaranja = "#d17016",
    } = config;

    return new Promise((resolve) => {

        const CHARS = '!@#$%^&*<>?/|\\[]{}~+=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const PORTFOLIO = linea2;

        let phase = 0;
        let t = 0, lastTs = null;

        let welcomeAlpha = 0;

        let letters = [];

        let chargeLevel = 0;

        let explodeTimer    = null;
        let letterParticles = [];
        let shockR = 0, shockAlpha = 0, flashAlpha = 0;

        let beamTimer = null, beamY = 0, beamAlpha = 0, beamWidth = 0;
        let trailParticles = [];

        function easeOut(v) { return 1 - Math.pow(1 - v, 3); }
        function randomChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

        function initLetters() {
            letters = PORTFOLIO.split('').map((ch, i) => ({
                target:           ch,
                display:          ' ',
                state:            'waiting',
                scrambleTimer:    0,
                scrambleDuration: 380 + Math.random() * 200,
                scrambleInterval: 0,
                startDelay:       i * 110,
                startedAt:        null,
            }));
        }

        function updateLetters(dt) {
            let allLocked = true;
            letters.forEach(l => {
                if (l.state === 'waiting') {
                    allLocked = false;
                    if (l.startedAt === null) l.startedAt = t;
                    if (t - l.startedAt >= l.startDelay) {
                        l.state = 'scrambling';
                        l.scrambleTimer = 0;
                        l.display = randomChar();
                    }
                } else if (l.state === 'scrambling') {
                    allLocked = false;
                    l.scrambleTimer    += dt;
                    l.scrambleInterval += dt;
                    if (l.scrambleInterval > 50) {
                        l.display = randomChar();
                        l.scrambleInterval = 0;
                    }
                    if (l.scrambleTimer >= l.scrambleDuration) {
                        l.state   = 'locked';
                        l.display = l.target;
                    }
                }
            });
            return allLocked;
        }

        function drawPortfolio(cx, titleY, fs2) {
            ctx.font = `bold ${fs2}px 'Courier New', monospace`;
            const totalW = ctx.measureText(PORTFOLIO).width;
            let lx = cx - totalW / 2;

            letters.forEach(l => {
                ctx.save();
                ctx.font         = `bold ${fs2}px 'Courier New', monospace`;
                ctx.textBaseline = 'alphabetic';

                if (l.state === 'waiting') {
                    ctx.fillStyle  = 'rgba(100,200,255,0.15)';
                    ctx.shadowBlur = 0;
                    ctx.fillText('_', lx, titleY);

                } else if (l.state === 'scrambling') {
                    ctx.fillStyle   = '#00e6ff';
                    ctx.shadowColor = '#00e6ff';
                    ctx.shadowBlur  = 12;
                    ctx.globalAlpha = 0.7 + Math.random() * 0.3;
                    ctx.fillText(l.display, lx, titleY);

                } else {
                    const charge = phase === 2 ? chargeLevel : 0;
                    const r = Math.min(255, 209 + charge * 46);
                    const g = Math.min(255, 112 + charge * 143);
                    const b = Math.min(255, 22  + charge * 233);
                    ctx.fillStyle   = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
                    ctx.shadowColor = charge > 0.5 ? '#ffffff' : '#ff8800';
                    ctx.shadowBlur  = 14 + charge * 120;
                    ctx.fillText(l.display, lx, titleY);
                }

                ctx.restore();
                lx += ctx.measureText(l.target).width;
            });
        }

        function buildLetterParticles(cx, baseY, fs2) {
            ctx.font = `bold ${fs2}px 'Courier New', monospace`;
            const totalW = ctx.measureText(PORTFOLIO).width;
            let lx = cx - totalW / 2;
            letterParticles = [];

            for (let i = 0; i < PORTFOLIO.length; i++) {
                const ch    = PORTFOLIO[i];
                const cw    = ctx.measureText(ch).width;
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
                const speed = 3 + Math.random() * 6;
                letterParticles.push({
                    ch, x: lx + cw / 2, y: baseY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.5,
                    rot: 0, rotV: (Math.random() - 0.5) * 0.22,
                    alpha: 1, fs: fs2, colorT: 0,
                });
                lx += cw;
            }
        }

        function drawCornerBrackets(cx, cy, w, h, alpha, progress) {
            ctx.save();
            ctx.strokeStyle = `rgba(179,241,255,${alpha})`;
            ctx.lineWidth   = 2;
            ctx.shadowColor = '#00e6ff';
            ctx.shadowBlur  = 12 * alpha;
            const arm = 36 * progress;
            const x = cx - w / 2, y = cy - h / 2;
            ctx.beginPath(); ctx.moveTo(x + arm, y);     ctx.lineTo(x, y);         ctx.lineTo(x, y + arm);         ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w - arm, y); ctx.lineTo(x + w, y);     ctx.lineTo(x + w, y + arm);     ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + arm, y + h); ctx.lineTo(x, y + h);     ctx.lineTo(x, y + h - arm);     ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w - arm, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - arm); ctx.stroke();
            ctx.restore();
        }

        function frame(ts) {
            if (!lastTs) lastTs = ts;
            const dt = Math.min(ts - lastTs, 50);
            lastTs = ts;
            t += dt;

            const W  = canvas.width;
            const H  = canvas.height;
            const cx = W / 2;
            const cy = H / 2;
            const fs1     = fontSizeL1;
            const fs2     = fontSizeL2;
            const titleY  = cy + fs2 * 0.38;
            const titleCY = cy - fs2 * 0.1;

            ctx.clearRect(0, 0, W, H);
            ctx.font = `500 ${fs1}px 'Courier New', monospace`;
            const line1W = ctx.measureText(linea1).width;
            ctx.font = `bold ${fs2}px 'Courier New', monospace`;
            const line2W = ctx.measureText(PORTFOLIO).width;

            const bw = Math.max(line1W, line2W) * 1.15;
            const line1Y = cy - fs2 * 0.92;
            const line2Y = titleY;
            const vertPad = fs1 * 0.55;
            const boxTop    = line1Y - fs1 * 0.85 - vertPad;
            const boxBottom = line2Y + fs2 * 0.3  + vertPad;
            const bh = boxBottom - boxTop;
            const boxCY = (boxTop + boxBottom) / 2;

            if (phase === 0) {
                welcomeAlpha = Math.min(1, welcomeAlpha + dt / 650);
                if (welcomeAlpha >= 1 && t > 900) {
                    phase = 1;
                    initLetters();
                }
            }

            if (phase <= 3) {
                const wFade   = phase === 3 ? Math.max(0, 1 - (t - explodeTimer) / 400) : 1;
                const wLetters = linea1.split('');
                ctx.font = `500 ${fs1}px 'Courier New', monospace`;
                const tw = ctx.measureText(linea1).width;
                let lx = cx - tw / 2;

                wLetters.forEach((ch, i) => {
                    const delay = i / wLetters.length;
                    const la    = Math.max(0, Math.min(1, (welcomeAlpha - delay * 0.45) / 0.55));
                    const ly    = (1 - easeOut(la)) * 28;
                    ctx.save();
                    ctx.font        = `500 ${fs1}px 'Courier New', monospace`;
                    ctx.globalAlpha = la * wFade;
                    ctx.fillStyle   = colorCian;
                    ctx.shadowColor = '#00e6ff';
                    ctx.shadowBlur  = 8 * la;
                    ctx.fillText(ch, lx, line1Y + ly);
                    ctx.restore();
                    lx += ctx.measureText(ch).width;
                });
            }

            if (phase === 1) {
                const allLocked = updateLetters(dt);
                drawPortfolio(cx, titleY, fs2);
                if (allLocked) phase = 2;
            }

            if (phase === 2) {
                chargeLevel = Math.min(1, chargeLevel + dt / 3000);

                if (chargeLevel > 0.3) {
                    ctx.save();
                    ctx.font        = `bold ${fs2}px 'Courier New', monospace`;
                    ctx.textAlign   = 'center';
                    ctx.shadowColor = '#00e6ff';
                    ctx.shadowBlur  = chargeLevel * 180;
                    ctx.fillStyle   = `rgba(0,200,255,${0.12 * chargeLevel})`;
                    ctx.fillText(PORTFOLIO, cx, titleY);
                    ctx.restore();
                }

                drawPortfolio(cx, titleY, fs2);

                if (chargeLevel > 0.85) {
                    const vib = (chargeLevel - 0.85) / 0.15;
                    ctx.save();
                    ctx.font        = `bold ${fs2}px 'Courier New', monospace`;
                    ctx.textAlign   = 'center';
                    ctx.globalAlpha = 0.22 * vib;
                    ctx.fillStyle   = '#00ffff';
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur  = 35;
                    ctx.fillText(PORTFOLIO,
                        cx + (Math.random() - 0.5) * 4 * vib,
                        titleY + (Math.random() - 0.5) * 4 * vib
                    );
                    ctx.restore();
                }

                const bp = Math.min(1, chargeLevel * 2.2);
                drawCornerBrackets(cx, boxCY, bw, bh, Math.min(1, bp * 1.8), bp);

                if (chargeLevel >= 1) {
                    phase        = 3;
                    explodeTimer = t;
                    shockR       = 0;
                    shockAlpha   = 1;
                    flashAlpha   = 1;
                    buildLetterParticles(cx, titleY, fs2);
                }
            }

            if (phase === 3) {
                const ot = t - explodeTimer;

                flashAlpha = Math.max(0, 1 - ot / 200);
                if (flashAlpha > 0) {
                    ctx.save();
                    ctx.fillStyle = `rgba(255,255,255,${flashAlpha * 0.6})`;
                    ctx.fillRect(0, 0, W, H);
                    ctx.restore();
                }

                shockR    += dt * 1.1;
                shockAlpha = Math.max(0, 1 - ot / 600);
                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, boxCY, shockR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0,230,255,${shockAlpha})`;
                ctx.lineWidth   = 3 * shockAlpha;
                ctx.shadowColor = '#00e6ff';
                ctx.shadowBlur  = 25;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(cx, boxCY, shockR * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(179,241,255,${shockAlpha * 0.5})`;
                ctx.lineWidth   = 1;
                ctx.stroke();
                ctx.restore();

                for (let i = letterParticles.length - 1; i >= 0; i--) {
                    const p = letterParticles[i];
                    p.x += p.vx; p.y += p.vy;
                    p.vy += 0.12; p.vx *= 0.98;
                    p.rot   += p.rotV;
                    p.alpha -= dt * 0.0018;
                    p.colorT = Math.min(1, p.colorT + dt * 0.003);
                    if (p.alpha <= 0) { letterParticles.splice(i, 1); continue; }
                    const lr = Math.floor(209 - 209 * p.colorT);
                    const lg = Math.floor(112 + 143 * p.colorT);
                    const lb = Math.floor(22  + 233 * p.colorT);
                    ctx.save();
                    ctx.globalAlpha  = p.alpha;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.font         = `bold ${p.fs}px 'Courier New', monospace`;
                    ctx.textAlign    = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle    = `rgb(${lr},${lg},${lb})`;
                    ctx.shadowColor  = '#00e6ff';
                    ctx.shadowBlur   = 16;
                    ctx.fillText(p.ch, 0, 0);
                    ctx.restore();
                }

                if (ot > 700) {
                    phase     = 4;
                    beamTimer = t;
                    beamY     = boxCY;
                    beamAlpha = 1;
                    beamWidth = 12;
                }
            }

            if (phase === 4) {
                const bt = t - beamTimer;

                const beamSpeed = 0.55 + (bt / 1200) * (1.65 - 0.55);
                beamY    -= dt * beamSpeed;

                beamAlpha = Math.max(0, 1 - bt / 1200);
                beamWidth = Math.max(0, 12 - bt * 0.006);

                if (beamAlpha > 0 && Math.random() < 0.6) {
                    trailParticles.push({
                        x:     cx + (Math.random() - 0.5) * beamWidth * 2,
                        y:     beamY + Math.random() * 60,
                        vx:    (Math.random() - 0.5) * 1.2,
                        vy:    -(0.5 + Math.random() * 1.5),
                        r:     1 + Math.random() * 2,
                        alpha: 0.7 + Math.random() * 0.3,
                        decay: 0.018 + Math.random() * 0.018,
                    });
                }

                if (beamAlpha > 0) {
                    ctx.save();
                    const g1 = ctx.createLinearGradient(cx, beamY, cx, H);
                    g1.addColorStop(0,    'rgba(0,230,255,0)');
                    g1.addColorStop(0.15, `rgba(0,230,255,${beamAlpha * 0.9})`);
                    g1.addColorStop(1,    `rgba(179,241,255,${beamAlpha * 0.3})`);
                    ctx.strokeStyle = g1;
                    ctx.lineWidth   = beamWidth * 3;
                    ctx.shadowColor = '#00e6ff';
                    ctx.shadowBlur  = 30;
                    ctx.globalAlpha = 0.25 * beamAlpha;
                    ctx.beginPath(); ctx.moveTo(cx, H + 20); ctx.lineTo(cx, beamY); ctx.stroke();
                    const g2 = ctx.createLinearGradient(cx, beamY, cx, H);
                    g2.addColorStop(0,   'rgba(255,255,255,0)');
                    g2.addColorStop(0.1, `rgba(255,255,255,${beamAlpha})`);
                    g2.addColorStop(1,   `rgba(179,241,255,${beamAlpha * 0.6})`);
                    ctx.strokeStyle = g2;
                    ctx.lineWidth   = beamWidth * 0.6;
                    ctx.shadowBlur  = 18;
                    ctx.globalAlpha = beamAlpha;
                    ctx.beginPath(); ctx.moveTo(cx, H + 20); ctx.lineTo(cx, beamY); ctx.stroke();
                    ctx.restore();
                }

                for (let i = trailParticles.length - 1; i >= 0; i--) {
                    const p = trailParticles[i];
                    p.x += p.vx; p.y += p.vy;
                    p.alpha -= p.decay;
                    if (p.alpha <= 0) { trailParticles.splice(i, 1); continue; }
                    ctx.save();
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle   = '#b3f1ff';
                    ctx.globalAlpha = p.alpha;
                    ctx.shadowColor = '#00e6ff';
                    ctx.shadowBlur  = 8;
                    ctx.fill();
                    ctx.restore();
                }

                for (let i = letterParticles.length - 1; i >= 0; i--) {
                    const p = letterParticles[i];
                    p.x += p.vx; p.y += p.vy;
                    p.vy += 0.12; p.vx *= 0.98;
                    p.rot   += p.rotV;
                    p.alpha -= dt * 0.002;
                    p.colorT = Math.min(1, p.colorT + dt * 0.004);
                    if (p.alpha <= 0) { letterParticles.splice(i, 1); continue; }
                    const lr = Math.floor(209 - 209 * p.colorT);
                    const lg = Math.floor(112 + 143 * p.colorT);
                    const lb = Math.floor(22  + 233 * p.colorT);
                    ctx.save();
                    ctx.globalAlpha  = p.alpha;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.font         = `bold ${p.fs}px 'Courier New', monospace`;
                    ctx.textAlign    = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle    = `rgb(${lr},${lg},${lb})`;
                    ctx.shadowColor  = '#00e6ff';
                    ctx.shadowBlur   = 10;
                    ctx.fillText(p.ch, 0, 0);
                    ctx.restore();
                }

                if (beamY < -80 || beamAlpha <= 0) phase = 5;
            }

            if (phase < 5) {
                requestAnimationFrame(frame);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setTimeout(() => {
                    requestAnimationFrame(loop);
                    iniciarExplosionAlCargar();
                    resolve();
                }, 200);
            }
        }

        requestAnimationFrame(frame);
    });
}