import { animate, svg } from 'https://esm.sh/animejs';

let currentAnimation = null;
let prevTarget = null;
let container = null;
let content = null;
let prevYvalue = 0;

const background = document.getElementById('backgroundContainer');
const navbar = document.getElementById('navigationBar');

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

    await new Promise(resolve => setTimeout(resolve, 3000));
    await navbar.animate(fadeShowing, animationSettings).finished;
    await new Promise(resolve => setTimeout(resolve, 1000));
    background.animate(fadeShowing, animationSettings);
}