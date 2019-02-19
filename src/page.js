const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const externalUrlRegEx = new RegExp('^(?:[a-z]+:)?//', 'i');

function isExternalLink(link) {
  return externalUrlRegEx.test(link);
}

function relToAbsUrl(url, base) {
  const absUrl = new URL(url, base);
  return absUrl.toString();
}

module.exports = {

  isExternalLink,

  async getPageLinks(base, pageUrl) {
    result = {
      base,
      pageUrl,
      external: [],
      internal: []
    }
    const res = await axios.get(pageUrl);
    // If we were redirected the responseUrl will be the final url.  
    // return it so it can be marked as visited
    result.responseUrl = res.request.res.responseUrl;

    const $ = cheerio.load(res.data);
    const hyperLinks = $('a').each(function (i,a) {
      const link = $(a).attr('href');
      if (isExternalLink(link)) {
        result.external.push(link);
      } else {
        result.internal.push(relToAbsUrl(link, base));
      }
    });
   // console.log(hyperLinks);
    //TODO: partition urls in to groups (internal, external, resource)
    return result;
  }
}