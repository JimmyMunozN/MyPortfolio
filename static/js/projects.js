import { componentAnimation } from "./animation.js";

export async function portfolioStart(toScale) {
    const projectButton = document.querySelector('.projectsButton');
    const techStackButton = document.querySelector('.techStackButton');
    projectButton.classList.remove('portfolioButtonActive');
    techStackButton.classList.remove('portfolioButtonActive');

    portfolioContent(projectButton, techStackButton);
    componentAnimation(toScale, '-30vw', '-6rem');

    if (toScale === '.portfolio') {
        projectButton.classList.add('portfolioButtonActive');
    } else {
        techStackButton.classList.add('portfolioButtonActive');
    }

    projectCarousel();
}

function portfolioContent(projectButton, techStackButton) {
    projectButton.addEventListener('click', () => {
        componentAnimation('.portfolio', '-30vw', '-8rem');
        projectButton.classList.add('portfolioButtonActive');
        techStackButton.classList.remove('portfolioButtonActive');
    });

    techStackButton.addEventListener('click', () => {
        componentAnimation('.techStack', '-30vw', '-4rem');
        projectButton.classList.remove('portfolioButtonActive');
        techStackButton.classList.add('portfolioButtonActive');
    });
}

function projectCarousel () {
    let amount = 6;
    var carousel = $(".carousel"),
        currdeg  = 0;

    const cube = document.getElementById('animationCube');

    const projects = carousel.find('.project');

    $(".next").on("click", { d: "n" }, rotate);
    $(".prev").on("click", { d: "p" }, rotate);
    
    function updateFrontProject() {
        let normalizedDeg = currdeg % 360;
        if (normalizedDeg < 0) {
            normalizedDeg += 360;
        }
        const anglePerProject = 360 / amount;

        let frontIndex = Math.round(normalizedDeg / anglePerProject);

        let actualFrontIndex = (amount - frontIndex) % amount;

        if (!projects.eq(actualFrontIndex).hasClass('b')) {
            cube.classList.remove('is-3d');
        }

        if (projects.eq(actualFrontIndex).hasClass('b')) {
            cube.classList.add('is-3d');
        }

        projects.removeClass('is-front');

        projects.eq(actualFrontIndex).addClass('is-front');
    }

    function rotate(e){
        if(e.data.d=="n"){
            currdeg = currdeg - (360/amount);
        }
        if(e.data.d=="p"){
            currdeg = currdeg + (360/amount);
        }
        
        let transformValue = `rotateY(${currdeg}deg)`;
        
        carousel.css({
            "transform": transformValue
        });

        setTimeout(updateFrontProject, 1000 / 2);
    }

    updateFrontProject();
}
