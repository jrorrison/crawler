const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const externalUrlRegEx = new RegExp('^(?:[a-z]+:)?//', 'i');

function isExternalLink(link, base) {
  let result = externalUrlRegEx.test(link);
  if (result) {
    const url = new URL(link);
    const baseUrl = new URL(base)
    result = url.host !== baseUrl.host;
  }
  return result;
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
      internal: [],
      resources: []
    }
    const res = await axios.get(pageUrl);
    // If we were redirected the responseUrl will be the final url.  
    // return it so it can be marked as visited
    result.responseUrl = res.request.res.responseUrl;

    const $ = cheerio.load(res.data);
    $('a').each(function (i,a) {
      const link = $(a).attr('href');
      if (isExternalLink(link, base)) {
        result.external.push(link);
      } else {
        result.internal.push(relToAbsUrl(link, base));
      }
    });
    $('img').each(function (i, img) {
      const link = $(img).attr('src');
      if (isExternalLink(link, base)) {
        result.resources.push(link);
      } else {
        result.resources.push(relToAbsUrl(link, base));
      }
      
    });
   // console.log(hyperLinks);
    //TODO: partition urls in to groups (internal, external, resource)
    return result;
  }
}