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

      // Wir suchen nach Pfaden, Polygonen und Gruppen, da IDs oft unterschiedlich vergeben sind
      const allElements = svgDoc.querySelectorAll('path, polygon, g');
      
      allElements.forEach(element => {
        const rawId = element.id;
        if (!rawId) return;

        // Flexibles Matching: Akzeptiert "area1", "area_1" oder einfach nur "1"
        const numericId = rawId.replace(/\D/g, '');
        const formattedId = `area${numericId}`;
        const info = brodmannData[formattedId];

        // Nur Interaktionen hinzufügen, wenn die ID in der Datenbank existiert.
        if (info) {
          element.addEventListener('mouseover', () => {
            element.style.fill = 'orange';
            element.style.cursor = 'pointer';
            infoBoxHeader.textContent = info.name;
            infoElement.innerHTML = `<strong>${info.name}</strong><br>${info.description}`;
          });

          element.addEventListener('mouseout', () => {
            element.style.fill = ''; // Setzt den Style zurück auf den SVG-Standard
            infoBoxHeader.textContent = 'Hover over a region';
            infoElement.textContent = '';
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