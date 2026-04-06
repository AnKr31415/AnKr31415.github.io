// Load Brodmann data
let brodmannData = {};
fetch('data/brodmann.json')
  .then(response => response.json())
  .then(data => brodmannData = data)
  .catch(err => console.error('Failed to load Brodmann data', err));

// Wait for SVG to load
const brainSVGObject = document.getElementById('brain-svg');
brainSVGObject.addEventListener('load', () => {
  const svgDoc = brainSVGObject.contentDocument;
  const areas = svgDoc.querySelectorAll('path');

  areas.forEach(area => {
    area.addEventListener('mouseover', () => {
      area.style.fill = 'orange';
      const info = brodmannData[area.id];
      if(info) {
        document.getElementById('area-info').innerHTML =
          `<strong>${info.name}</strong><br>${info.description}`;
      }
    });

    area.addEventListener('mouseout', () => {
      area.style.fill = 'lightgray';
      document.getElementById('area-info').innerHTML = '';
    });
  });
});