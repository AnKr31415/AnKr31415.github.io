let brodmannData = {};
let currentTargetId = null;
let score = 0;

async function initQuiz() {
    try {
        const response = await fetch('./data/brodmann.json');
        brodmannData = await response.json();
        
        const brainSVGObject = document.querySelector('#brain-svg');
        
        const setupQuizLogic = () => {
            const svgDoc = brainSVGObject.contentDocument;
            if (!svgDoc) return;

            // Initiale Färbung wie im Explorer (optional, hilft bei der Orientierung)
            colorSvgByLobes(svgDoc);
            
            // Zentraler Click-Handler auf dem gesamten SVG-Dokument
            // Dies verhindert Bubbling-Probleme mit Layer-IDs (wie Layer_3)
            svgDoc.addEventListener('click', (event) => {
                const area = getQuizAreaInfo(event.target, svgDoc);
                if (area) {
                    handleAreaClick(area.element, area.number);
                }
            });

            // Cursor für alle interaktiven Areale anpassen
            svgDoc.querySelectorAll('path, polygon').forEach(el => {
                const numMatch = el.id ? el.id.match(/\d+/) : null;
                if (numMatch && brodmannData[`area${numMatch[0]}`]) {
                    el.style.cursor = 'pointer';
                }
            });

            nextQuestion();
        };

        brainSVGObject.addEventListener('load', setupQuizLogic);
        if (brainSVGObject.contentDocument) setupQuizLogic();

    } catch (err) {
        console.error('Quiz konnte nicht geladen werden:', err);
    }
}

function getQuizAreaInfo(element, svgDoc) {
    let curr = element;
    while (curr && curr !== svgDoc) {
        if (curr.id) {
            const match = curr.id.match(/^area(\d+)/);
            if (match && brodmannData[`area${match[1]}`]) {
                return { element: curr, number: match[1] };
            }
        }
        curr = curr.parentElement;
    }
    return null;
}

function colorSvgByLobes(svgDoc) {
    const lobeMapping = {
        frontal: { ids: [4, 6, 8, 9, 10, 11, 44, 45, 46, 47], color: 'hsl(210, 65%, 85%)' },
        parietal: { ids: [1, 2, 3, 5, 7, 39, 40, 43], color: 'hsl(40, 70%, 85%)' },
        temporal: { ids: [20, 21, 22, 37, 38, 41, 42], color: 'hsl(130, 50%, 85%)' },
        occipital: { ids: [17, 18, 19], color: 'hsl(0, 65%, 90%)' },
        limbic: { ids: [23, 24], color: 'hsl(280, 45%, 90%)' }
    };

    svgDoc.querySelectorAll('path, polygon, circle').forEach(el => {
        const numMatch = el.id ? el.id.match(/^area(\d+)/) : null;
        if (numMatch && brodmannData[`area${numMatch[1]}`]) {
            const areaNum = parseInt(numMatch[1]);
            let color = 'hsl(0, 0%, 90%)';
            for (const lobe in lobeMapping) {
                if (lobeMapping[lobe].ids.includes(areaNum)) {
                    color = lobeMapping[lobe].color;
                    break;
                }
            }
            el.style.fill = color;
            el.setAttribute('fill', color);
        }
    });
}

function nextQuestion() {
    const keys = Object.keys(brodmannData);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    currentTargetId = randomKey; // z.B. "area4"
    
    const areaName = brodmannData[randomKey].name;
    document.getElementById('question-text').textContent = `Klicke auf: ${areaName}`;
}

function handleAreaClick(element, clickedNumber) {
    // Konvertiere beide in Zahlen für einen sicheren Vergleich
    const targetNumber = parseInt(currentTargetId.replace('area', ''));
    const clickedNum = parseInt(clickedNumber);
    const feedbackText = document.getElementById('question-text');

    if (clickedNum === targetNumber) {
        // Richtig!
        score++;
        document.getElementById('score').textContent = score;
        
        const originalColor = element.style.fill;
        element.style.fill = '#2ecc71'; // Grün
        element.setAttribute('fill', '#2ecc71');

        feedbackText.textContent = "Richtig! Gut gemacht.";
        feedbackText.style.color = "#2ecc71";

        setTimeout(() => {
            element.style.fill = originalColor;
            element.setAttribute('fill', originalColor);
            feedbackText.style.color = "#e67e22";
            nextQuestion();
        }, 1000);
    } else {
        // Falsch
        const originalColor = element.style.fill;
        element.style.fill = '#e74c3c'; // Rot
        element.setAttribute('fill', '#e74c3c');

        feedbackText.textContent = "Leider falsch, versuch es nochmal!";
        feedbackText.style.color = "#e74c3c";

        setTimeout(() => {
            element.style.fill = originalColor;
            element.setAttribute('fill', originalColor);
            feedbackText.style.color = "#e67e22";
            const areaName = brodmannData[currentTargetId].name;
            feedbackText.textContent = `Klicke auf: ${areaName}`;
        }, 500);
    }
}

initQuiz();