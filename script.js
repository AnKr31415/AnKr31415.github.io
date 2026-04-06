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
    const infoElement = document.getElementById('area-info');

    // Funktion zum Zuweisen der Interaktionen
    const setupInteractions = () => {
      const svgDoc = brainSVGObject.contentDocument;
      if (!svgDoc) return;

      const areas = svgDoc.querySelectorAll('path');
      areas.forEach(area => {
        area.addEventListener('mouseover', () => {
          const info = brodmannData[area.id];
          if (info) {
            area.style.fill = 'orange';
            area.style.cursor = 'pointer';
            infoElement.innerHTML = `<strong>${info.name}</strong><br>${info.description}`;
          }
        });

        area.addEventListener('mouseout', () => {
          area.style.fill = 'lightgray';
          infoElement.innerHTML = '';
        });
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