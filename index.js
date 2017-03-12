const fs = require('fs');
const builder = require('xmlbuilder');

const data = require('./hiking.json');

const ways = new Map();
data.elements.filter(({ type }) => type == 'way').forEach(({ id, nodes }) => ways.set(id, nodes));

const nodes = new Map();
data.elements.filter(({ type }) => type == 'node').forEach(({ id, lat, lon, tags = {} }) => nodes.set(id, { lat, lon, tags }));

data.elements.filter(({ type }) => type == 'relation').forEach(function ({ id, members, tags: { name, description, ref, note, fixme, FIXME, 'osmc:symbol': symbol } = {} }) {

  const gpxEle = builder.create('gpx');
  gpxEle.att('xmlns', 'http://www.topografix.com/GPX/1/1');
  gpxEle.att('version', '1.1');

  const metadataEle = gpxEle.ele('metadata');
  metadataEle.ele('link', { href: `http://www.openstreetmap.org/relation/${id}` });
  const copyrightEle = metadataEle.ele('copyright', { author: 'OpenStreetMap contributors' });
  copyrightEle.ele('license', 'https://opendatacommons.org/licenses/odbl/1-0/');
  // metadataEle.ele('time', new Date()); // TODO xml-format time

  const trkEle = gpxEle.ele('trk');

  name && trkEle.ele('name', name);
  (description || ref || symbol) && trkEle.ele('desc', [ ref, symbol, description ].join(', '));
  (note || fixme || FIXME) && trkEle.ele('cmt', [ note, fixme, FIXME ].join(', '));

  const guideposts = [];

  members.forEach(function ({ type, ref }) {
    if (type === 'way') {
      const trksegEle = trkEle.ele('trkseg');

      ways.get(ref).forEach(function (nodeId) {
        const node = nodes.get(nodeId);
        trksegEle.ele('trkpt', { lat: node.lat, lon: node.lon });
      });
    } else if (type === 'node') {
      const node = nodes.get(ref);
      if (node.tags.information === 'guidepost') {
        guideposts.push(node);
      }
    }
  });

  guideposts.forEach(function ({ lat, lon, tags: { name, ele } }) {
    const wptEle = gpxEle.ele('wpt', { lat, lon });
    ele && wptEle.ele('ele', ele);
    name && wptEle.ele('name', name);
    wptEle.ele('type', 'guidepost');
  });

  const filename  = `./out/${ref || '_'}-${id}.gpx`;
  fs.writeFile(filename, gpxEle, function (err) {
    console.log(`${filename} - ${err ? 'ERROR' : 'OK'}`);
  });

});
