console.log("DEBUG: Skript geladen.");

// Hilfreicher Hinweis für Mobile-Testing
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.warn("TIPP: Für den Zugriff vom Handy nutze nicht 'localhost', sondern deine lokale IP-Adresse im WLAN.");
} else {
    console.log("Verbunden über:", window.location.origin);
}

let brodmannData = {};
let lastSelectedArea = null; // Speichert das aktuell hervorgehobene Areal
const hoverColor = 'orange';

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

      // 2. Hilfsfunktion: Findet die Areal-Nummer eines Elements oder seiner Eltern
      const getAreaInfo = (element) => {
        let curr = element;
        while (curr && curr !== svgDoc) {
          if (curr.id) {
            const match = curr.id.match(/^area(\d+)/);
            if (match) {
              const num = match[1];
              const key = `area${num}`;
              if (brodmannData[key]) return { element: curr, id: key, number: num, data: brodmannData[key] };
            }
          }
          curr = curr.parentElement;
        }
        return null;
      };

      // 3. UI-Update Funktion
      const selectArea = (area) => {
        // Vorheriges Areal zurücksetzen
        if (lastSelectedArea) {
          lastSelectedArea.element.style.fill = colorMap[lastSelectedArea.id];
          lastSelectedArea = null;
        }

        if (area) {
          area.element.style.fill = hoverColor;
          if (infoBoxHeader) infoBoxHeader.textContent = `Areal ${area.number}: ${area.data.name}`;
          if (infoElement) infoElement.innerHTML = area.data.description;
          lastSelectedArea = area;
        }
      };

      // 4. Initialisierung der SVG-Elemente
      const allPaths = svgDoc.querySelectorAll('path, polygon, circle');
      allPaths.forEach(el => {
        const area = getAreaInfo(el);
        if (area) {
          el.style.fill = colorMap[area.id];
          el.style.cursor = 'pointer';
          el.style.pointerEvents = 'auto';
        } else {
          el.style.pointerEvents = 'none'; // Hintergrund und Deko-Elemente ignorieren
        }
      });

      // Zahlen und Texte "durchklickbar" machen
      svgDoc.querySelectorAll('text, tspan, g:not([id^="area"])').forEach(el => {
        el.style.pointerEvents = 'none';
      });

      // 5. Zentraler Click/Touch Handler
      svgDoc.addEventListener('click', (e) => {
        const area = getAreaInfo(e.target);
        if (area) {
          e.preventDefault();
          selectArea(area);
        }
      });

      // Mouseover nur für Desktop aktivieren
      svgDoc.addEventListener('mouseover', (e) => {
        if (window.matchMedia("(pointer: fine)").matches) {
          const area = getAreaInfo(e.target);
          if (area) selectArea(area);
        }
      });

      console.log("Interaktions-Setup abgeschlossen.");
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