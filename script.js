console.log("Brain Anatomy Explorer: Skript wurde geladen.");

let brodmannData = {};

/**
 * Initialisiert die Anwendung, lädt Daten und setzt Event-Listener.
 */
async function init() {
  console.log("init() gestartet...");
  try {
    // 1. Brodmann-Daten laden
    console.log("Lade Brodmann-Daten von data/brodmann.json...");
    const response = await fetch('data/brodmann.json');
    if (!response.ok) throw new Error(`HTTP Fehler! Status: ${response.status}`);
    
    brodmannData = await response.json();
    console.log("Brodmann-Daten erfolgreich geladen:", Object.keys(brodmannData).length, "Areale gefunden.");

    const brainSVGObject = document.getElementById('brain-svg');
    const infoBoxHeader = document.querySelector('#info-box h2');
    const infoElement = document.getElementById('area-info');

    if (!brainSVGObject) {
      console.error("Fehler: Element mit ID 'brain-svg' nicht gefunden!");
      return;
    }

    // Funktion zum Zuweisen der Interaktionen
    const setupInteractions = () => {
      const svgDoc = brainSVGObject.contentDocument;
      if (!svgDoc) {
        console.error("Sicherheitsfehler oder SVG nicht zugänglich: contentDocument ist null. Nutzt du einen lokalen Server (Live Server)?");
        return;
      }

      console.log("SVG Content zugänglich. Starte Färbung...");

      // 1. Farben generieren
      const areaKeys = Object.keys(brodmannData);
      const colorMap = {};
      areaKeys.forEach((key, index) => {
        const hue = (index * (360 / areaKeys.length)) % 360;
        colorMap[key] = `hsl(${hue}, 70%, 80%)`;
      });

      const hoverColor = 'orange';

      const allElements = svgDoc.querySelectorAll('path, polygon, circle, ellipse');
      let coloredCount = 0;
      
      allElements.forEach(element => {
        const rawId = element.id;
        if (!rawId) return;

        const numMatch = rawId.match(/\d+/);
        if (!numMatch) return;

        const formattedId = `area${numMatch[0]}`;
        const info = brodmannData[formattedId];

        if (info) {
          const areaColor = colorMap[formattedId];

          element.style.fill = areaColor;
          element.setAttribute('fill', areaColor);
          coloredCount++;

          element.addEventListener('mouseenter', () => {
            element.style.fill = hoverColor;
            element.setAttribute('fill', hoverColor);
            element.style.cursor = 'pointer';
            
            if (infoBoxHeader) {
              infoBoxHeader.textContent = `Areal ${numMatch[0]}: ${info.name}`;
            }
            if (infoElement) infoElement.innerHTML = info.description;
            console.log("Hover:", formattedId);
          });

          element.addEventListener('mouseleave', () => {
            element.style.fill = areaColor;
            element.setAttribute('fill', areaColor);
            element.style.cursor = '';
            
            if (infoBoxHeader) infoBoxHeader.textContent = 'Hover over a region';
            if (infoElement) infoElement.textContent = '';
          });
        }
      });
      console.log(`${coloredCount} Areale erfolgreich initialisiert.`);
    };

    // Listener für das Laden des SVG-Dokuments
    brainSVGObject.addEventListener('load', () => {
      console.log("Event: SVG geladen.");
      setupInteractions();
    });

    // Falls das SVG bereits geladen ist (Cache)
    if (brainSVGObject.contentDocument) setupInteractions();
  } catch (err) {
    console.error('Fehler beim Laden der App-Daten:', err);
  }
}

init();