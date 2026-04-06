let brodmannData = {};

/**
 * Initialisiert die Anwendung, lädt Daten und setzt Event-Listener.
 */
async function init() {
  try {
    // 1. Brodmann-Daten laden
    const response = await fetch('data/brodmann.json');
    brodmannData = await response.json();

    const brainSVGObject = document.getElementById('brain-svg');
    const infoBoxHeader = document.querySelector('#info-box h2');
    const infoElement = document.getElementById('area-info');

    // Funktion zum Zuweisen der Interaktionen
    const setupInteractions = () => {
      const svgDoc = brainSVGObject.contentDocument;
      if (!svgDoc) return;

      // Wir suchen nur nach Pfaden und Polygonen (Flächen), um Text/Zahlen auszuschließen
      const allElements = svgDoc.querySelectorAll('path, polygon');
      
      allElements.forEach(element => {
        const rawId = element.id;
        if (!rawId) return;

        // Strenge ID-Prüfung: Nur IDs, die rein numerisch sind oder mit 'area'/'path' beginnen
        const match = rawId.match(/^(?:area|path)?(\d+)$/i);
        if (!match) return;

        const formattedId = `area${match[1]}`;
        const info = brodmannData[formattedId];

        if (info) {
          // Mouseenter ist stabiler als Mouseover bei komplexen SVGs
          element.addEventListener('mouseenter', () => {
            // Wir nutzen setProperty für höhere Priorität
            element.style.setProperty('fill', 'orange', 'important');
            element.style.cursor = 'pointer';
            
            if (infoBoxHeader) infoBoxHeader.textContent = info.name;
            if (infoElement) {
              infoElement.innerHTML = `<strong>${info.name}</strong><br>${info.description}`;
            }
            // Kleiner Debug-Check in der Konsole
            console.log(`Hovering over: ${formattedId}`);
          });

          element.addEventListener('mouseleave', () => {
            // removeProperty stellt sicher, dass die ursprüngliche Farbe (aus CSS oder Attribut) wieder gilt
            element.style.removeProperty('fill');
            element.style.cursor = '';
            
            if (infoBoxHeader) infoBoxHeader.textContent = 'Hover over a region';
            if (infoElement) infoElement.textContent = '';
          });
        }
      });
    };

    // Listener für das Laden des SVG-Dokuments
    brainSVGObject.addEventListener('load', setupInteractions);
    if (brainSVGObject.contentDocument) setupInteractions();
  } catch (err) {
    console.error('Fehler beim Laden der App-Daten:', err);
  }
}

init();