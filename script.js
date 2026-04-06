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

      console.log("SVG geladen, starte Initialisierung...");

      // 1. Farben generieren
      const areaKeys = Object.keys(brodmannData);
      const colorMap = {};
      areaKeys.forEach((key, index) => {
        const hue = (index * (360 / areaKeys.length)) % 360;
        colorMap[key] = `hsl(${hue}, 70%, 80%)`;
      });

      const hoverColor = 'orange';

      // Wir suchen alle Pfade, Polygone und Kreise
      const allElements = svgDoc.querySelectorAll('path, polygon, circle, ellipse');
      
      allElements.forEach(element => {
        const rawId = element.id;
        if (!rawId) return;

        // Sucht nach der ersten Zahl in der ID (egal ob "path4", "area-4" oder "4")
        const numMatch = rawId.match(/\d+/);
        if (!numMatch) return;

        const formattedId = `area${numMatch[0]}`;
        const info = brodmannData[formattedId];

        if (info) {
          const areaColor = colorMap[formattedId];

          // Farbe permanent zuweisen (sowohl Style als auch Attribut für maximale Kompatibilität)
          element.style.fill = areaColor;
          element.setAttribute('fill', areaColor);
          
          // Debug: Zeige in der Konsole an, welches Areal gefärbt wurde
          console.log(`Gefärbt: ${rawId} als ${formattedId}`);

          element.addEventListener('mouseenter', () => {
            element.style.fill = hoverColor;
            element.setAttribute('fill', hoverColor);
            element.style.cursor = 'pointer';
            
            if (infoBoxHeader) {
              // Wir nutzen die Nummer und den Namen
              infoBoxHeader.textContent = `Areal ${numMatch[0]}: ${info.name}`;
            }
            if (infoElement) {
              infoElement.innerHTML = info.description;
            }
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
    };

    // Listener für das Laden des SVG-Dokuments
    brainSVGObject.addEventListener('load', setupInteractions);
    if (brainSVGObject.contentDocument) setupInteractions();
  } catch (err) {
    console.error('Fehler beim Laden der App-Daten:', err);
  }
}

init();