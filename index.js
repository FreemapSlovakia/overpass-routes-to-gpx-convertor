const fs = require('fs');
const builder = require('xmlbuilder');

const data = require('./hiking.json');

const ways = new Map();
data.elements.filter(({ type }) => type == 'way').forEach(({ id, nodes }) => ways.set(id, nodes));

const nodes = new Map();
data.elements.filter(({ type }) => type == 'node').forEach(({ id, lat, lon }) => nodes.set(id, { lat, lon }));

data.elements.filter(({ type }) => type == 'relation').forEach(function ({ id, members, tags }) {

  const gpxEle = builder.create('gpx');
  const metadataEle = gpxEle.ele('metadata');
  metadataEle.ele('link', { href: `http://www.openstreetmap.org/relation/${id}` });
  const copyrightEle = metadataEle.ele('copyright', { author: 'OpenStreetMap contributors' });
  copyrightEle.ele('license', 'https://opendatacommons.org/licenses/odbl/1-0/');
  // metadataEle.ele('time', new Date()); // TODO xml-format time

  gpxEle.att('xmlns', 'http://www.topografix.com/GPX/1/1');

  const trkEle = gpxEle.ele('trk');

  members.filter(({ type }) => type === 'way').forEach(function ({ ref }) {
    const trksegEle = trkEle.ele('trkseg');

    ways.get(ref).forEach(function (nodeId) {
      const node = nodes.get(nodeId);
      trksegEle.ele('trkpt', { lat: node.lat, lon: node.lon });
    });

  });

  const filename  = `./out/${id}.gpx`;
  fs.writeFile(filename, gpxEle, function (err) {
    console.log(`${filename} - ${err ? 'ERROR' : 'OK'}`);
  });

});
