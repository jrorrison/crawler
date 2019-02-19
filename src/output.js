const XMLWriter = require('xml-writer');

function siteLinksToXml(base, siteLinks) {
  const xml = new XMLWriter;
  xml.startDocument();
  xml.startElement('root');
  xml.writeAttribute('base', base);
  Object.keys(siteLinks).forEach(link => {
    xml.startElement('url');
    xml.text(link);
    xml.endElement();
  });
  return xml.toString();
}

module.exports = siteLinksToXml;