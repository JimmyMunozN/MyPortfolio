import { pulseAnimation, componentAnimation, showBackground } from "./animation.js";
import { homeStart } from "./home.js";
import { aboutStart } from "./about.js";
import { portfolioStart } from "./projects.js";
import { contactStart } from "./contact.js";

const vwToPx = (vw) => (vw * window.innerWidth) / 100;

const SECTION_NAMES = ['start', 'home', 'about', 'projects', 'contact'];
const TRANSITION_TIME = 500;
const BG_WIDTH_VW = 205;
const BG_HEIGHT_VW = 130;
let actualTarget = 0;
let isScrolling = false;
let animationObject = null;
let previousTarget = null;

function animationScroll(target) {
    const targets = {
        'home':      { x: BG_WIDTH_VW / 2, y: 0 },
        'about':     { x: 0, y: BG_HEIGHT_VW / 2 },
        'projects':  { x: BG_WIDTH_VW, y: BG_HEIGHT_VW / 2 },
        'contact':   { x: BG_WIDTH_VW / 2, y: BG_HEIGHT_VW },
        'start':    { x: BG_WIDTH_VW / 2, y: BG_HEIGHT_VW / 2 } 
    };

    const targetVW = targets[target];
    if (!targetVW) return;

    const scrollX = vwToPx(targetVW.x) - (window.innerWidth / 2);
    const scrollY = vwToPx(targetVW.y) - (window.innerHeight / 2);

    window.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
    });
}

async function scrollToTarget(target) {
    if (actualTarget != 'start') {
        animationScroll('start');
        await new Promise(resolve => setTimeout(resolve, TRANSITION_TIME + 50));
    }
    animationScroll(target);
    actualTarget = SECTION_NAMES.indexOf(target);
    await new Promise(resolve => setTimeout(resolve, TRANSITION_TIME + 50));
}

// main.js - Modificación clave

async function handlePageTransition(targetPageName) {
    if (isScrolling) {
        console.warn("Transición bloqueada: Otra animación está en curso.");
        return;
    }

    if (previousTarget !== targetPageName) {
        isScrolling = true;
        
        try {
            scrollToTarget(targetPageName);
            await loadContent(targetPageName);
            
            previousTarget = targetPageName;
            
        } catch (error) {
            console.error("Error durante la transición de página:", error);
        } finally {
            isScrolling = false;
        }
    }
}

async function loadContent(pageName) {
    const contentDiv = document.getElementById('content');
    const newContentDiv = contentDiv.querySelector('.newContent');
    const oldContentDiv = contentDiv.querySelector('.oldContent');
    const url = `/get-content/${pageName}`;
    const xValue = '0'; 
    const yValue = '0';

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error al cargar la página: ${response.status}`);
        }

        pulseAnimation(pageName);

        const htmlContent = await response.text();

        navIndicator(pageName);

        oldContentDiv.innerHTML = newContentDiv.innerHTML;

        newContentDiv.innerHTML = htmlContent;

        componentAnimation(pageName, xValue, yValue);
        await new Promise(resolve => setTimeout(resolve, 1200));

        oldContentDiv.innerHTML = null;

        if (pageName === 'projects') {
            if (animationObject === 'techStack') {
                portfolioStart('.techStack');
            } else {
                portfolioStart('.portfolio');
            }
        } else if (pageName === 'home') {
            homeStart();
            setLinks();
        } else if (pageName === 'about') {
            aboutStart();
            setLinks();
        } else if (pageName === 'contact') {
            contactStart();
        }

    } catch (error) {
        console.error("Fallo al cargar el contenido:", error);
        contentDiv.innerHTML = `<p>Lo sentimos, no pudimos cargar la sección de ${pageName}.</p>`;
    }
}

async function handleVerticalScroll(event) {
    event.preventDefault(); 

    if (isScrolling) {
        return;
    }
    
    animationObject = null;
    
    const direction = event.deltaY > 0 ? 1 : -1;
    let newIndex = actualTarget + direction;

    if (newIndex >= 0 && newIndex < SECTION_NAMES.length) {
        
        const target = SECTION_NAMES[newIndex];

        await handlePageTransition(target);
        actualTarget = SECTION_NAMES.indexOf(target);
    }
}

function setLinks() {
    const validPages = new Set(['home', 'about', 'projects', 'contact']);

    document.querySelectorAll('#newContent a').forEach(link => {
        link.addEventListener('click', (e) => {

            const pageName = e.currentTarget.getAttribute('data-page');
            const targetAnimation = e.currentTarget.getAttribute('data-target-animation');
            
            if (pageName && validPages.has(pageName)) {
                e.preventDefault();

                if (targetAnimation === 'techStack') {
                    animationObject = 'techStack';
                } else {
                    animationObject = null;
                }

                handlePageTransition(pageName);
            }
        });
    });
}

function navIndicator(target) {
    document.querySelectorAll('#navbar a').forEach(link => {
        const pageName = link.getAttribute('data-page'); 

        if (pageName === target) {
            link.classList.add('navigateIndicator');
        } else {
            link.classList.remove('navigateIndicator');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const validPages = new Set(['home', 'about', 'projects', 'contact']);
    pulseAnimation('start');
    window.addEventListener('wheel', handleVerticalScroll, { passive: false });
    setTimeout(() => {
        scrollToTarget('start');
        actualTarget = SECTION_NAMES.indexOf('start');
    }, 200); 

    document.querySelectorAll('#navbar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const pageName = e.currentTarget.getAttribute('data-page'); 
            
            if (pageName && validPages.has(pageName)) {
                handlePageTransition(pageName);
                animationObject = null;
            }
        });
    });

    document.querySelector('#navbar button').addEventListener('click', (e) => {
        e.preventDefault();
        handlePageTransition('start');
        animationObject = null;
    });

    showBackground();
});


