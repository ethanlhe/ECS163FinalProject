const fs = require('fs');

// Read the GeoJSON file
const geojsonData = JSON.parse(fs.readFileSync('./data/world.geojson', 'utf8'));

// Extract names from features
const names = geojsonData.features.map(feature => feature.properties.name);

// Filter out any undefined or null names and sort them
const uniqueNames = [...new Set(names.filter(name => name))].sort();

// Write the names to a file
fs.writeFileSync('./data/names.txt', uniqueNames.join('\n'));

console.log(`Extracted ${uniqueNames.length} unique names to data/names.txt`); 