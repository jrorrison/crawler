const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  async getPageLinks(host, pageUrl) {
    const res = await axios.get(pageUrl);
    const $ = cheerio.load(res.data);
    $('a').each((i, a) => console.log($(a).attr('href')));
    //TODO: partition urls in to groups (internal, external, resource)
    return {};
  }
}