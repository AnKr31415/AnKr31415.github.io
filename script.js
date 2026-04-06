console.log("DEBUG: Skript geladen. URL-Protokoll:", window.location.protocol);

let brodmannData = {};

/**
 * Initialisiert die Anwendung, lädt Daten und setzt Event-Listener.
 */
async function init() {
  console.log("init() gestartet...");
  try {
    // 1. Brodmann-Daten laden
    console.log("Lade Brodmann-Daten von data/brodmann.json...");
    const response = await fetch('./data/brodmann.json');
    if (!response.ok) throw new Error(`HTTP Fehler! Status: ${response.status}`);
    
    brodmannData = await response.json();
    console.log("Brodmann-Daten erfolgreich geladen:", Object.keys(brodmannData).length, "Areale gefunden.");

    const brainSVGObject = document.querySelector('#brain-svg');
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
        console.error("ZUGRIFFS-FEHLER: Das SVG-Innere ist nicht erreichbar. Nutze einen Webserver (Live Server)!");
        return;
      }

      console.log("SVG Content zugänglich. Starte Färbung...");

      // 1. Farben basierend auf Hirnlappen (Lobes) definieren
      const lobeMapping = {
        frontal: { ids: [4, 6, 8, 9, 10, 11, 44, 45, 46, 47], color: 'hsl(210, 65%, 85%)' }, // Blau-Töne
        parietal: { ids: [1, 2, 3, 5, 7, 39, 40, 43], color: 'hsl(40, 70%, 85%)' },         // Gelb/Orange-Töne
        temporal: { ids: [20, 21, 22, 37, 38, 41, 42], color: 'hsl(130, 50%, 85%)' },       // Grün-Töne
        occipital: { ids: [17, 18, 19], color: 'hsl(0, 65%, 90%)' },                       // Rot-Töne
        limbic: { ids: [23, 24], color: 'hsl(280, 45%, 90%)' }                             // Lila-Töne
      };

      const colorMap = {};
      Object.keys(brodmannData).forEach(key => {
        const areaNum = parseInt(key.replace('area', ''));
        let foundColor = 'hsl(0, 0%, 90%)'; // Standard Grau, falls keine Zuordnung

        for (const lobe in lobeMapping) {
          if (lobeMapping[lobe].ids.includes(areaNum)) {
            foundColor = lobeMapping[lobe].color;
            break;
          }
        }
        colorMap[key] = foundColor;
      });

      const hoverColor = 'orange';

      // Wir untersuchen alle relevanten SVG-Elemente (inkl. Text für die Zahlen-Kästchen)
      const allElements = svgDoc.querySelectorAll('path, polygon, g, circle, text, tspan');
      console.log(`Untersuche ${allElements.length} Elemente im SVG...`);
      let coloredCount = 0;
      
      allElements.forEach(element => {
        // Prüfe, ob das Element oder eines seiner Eltern-Elemente eine Brodmann-ID hat
        let current = element;
        let info = null;
        let areaNumber = null;
        let formattedId = null;

        // Suche nach der ID im aktuellen Element oder den Eltern (max 2 Ebenen hoch)
        for (let i = 0; i < 2; i++) {
          if (current && current.id) {
            const numMatch = current.id.match(/\d+/);
            if (numMatch) {
              const tempId = `area${numMatch[0]}`;
              if (brodmannData[tempId]) {
                info = brodmannData[tempId];
                areaNumber = numMatch[0];
                formattedId = tempId;
                break;
              }
            }
          }
          current = current.parentElement;
        }

        if (!info) {
          // Wenn das Element (oder sein Parent) kein Areal ist, machen wir es "durchklickbar".
          // Das ist entscheidend, damit Text-Zahlen die Flächen darunter nicht blockieren.
          element.style.pointerEvents = 'none';
        } else {
          const areaColor = colorMap[formattedId];

          element.style.fill = areaColor;
          element.setAttribute('fill', areaColor);
          coloredCount++;

          element.addEventListener('mouseenter', () => {
            element.style.fill = hoverColor;
            element.setAttribute('fill', hoverColor);
            element.style.cursor = 'pointer';
            
            if (infoBoxHeader) {
              infoBoxHeader.textContent = `Areal ${areaNumber}: ${info.name}`;
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
      
      if (coloredCount === 0) {
        console.warn("WARNUNG: Keine Areale zum Färben gefunden. Prüfe die IDs in der SVG-Datei!");
      } else {
        console.log(`${coloredCount} Areale erfolgreich initialisiert.`);
      }
    };

    // Listener für das Laden des SVG-Dokuments
    brainSVGObject.addEventListener('load', setupInteractions);

    // Falls das SVG bereits geladen ist (Cache)
    if (brainSVGObject.contentDocument) setupInteractions();
  } catch (err) {
    console.error('Fehler beim Laden der App-Daten:', err);
  }
}

init();