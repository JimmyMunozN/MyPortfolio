import { animate, svg } from 'https://esm.sh/animejs';

let currentAnimation = null;
let prevTarget = null;
let container = null;
let content = null;
let prevYvalue = 0;

const background = document.getElementById('backgroundContainer');
const navbar = document.getElementById('navigationBar');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
        iniciarExplosionAlCargar();
    }
}



let explosionesActivas = [];

function iniciarExplosionAlCargar() {
    if (!animacionIniciada) {
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

export async function showBackground() {
    const animationSettings = {
        duration: 2000,
        fill: 'forwards',
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    };

    const fadeShowing = [
        {opacity: 0},
        {opacity: 1}
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
    background.animate(fadeShowing, animationSettings);
    
}

export function loop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = explosionesActivas.length - 1; i >= 0; i--) {
        explosionesActivas[i].dibujar(timestamp);
        if (explosionesActivas[i].done) {
            explosionesActivas.splice(i, 1);
        }
    }

    requestAnimationFrame(loop);
}