const async = require('async');
const page = require('./page');
const { URL } = require('url');
const MAX_CONCURRENT = 2;
const MAX_CRAWLS = 5000;
const baseUrl = 'https://www.barvas.com';

const siteLinks = {
  
}

const knownUrls = {
  
}

const queue = async.queue(processUrl, MAX_CONCURRENT);

function updateSiteLinks(newLinks) {
  for (const link of newLinks) {
    if (!siteLinks[link]) {
      siteLinks[link] = true;
    }
  }
}

function cleanUrl(url) {
  //TODO: Remove  utm url params 
  const u = new URL(url);
  u.hash = '';
  return u.toString();
}

function queueLinks(links) {
  for (const link of links) {
    const cleanLink = cleanUrl(link);
    if (!knownUrls[cleanLink]) {
      knownUrls[cleanLink] = true;
      queue.push(cleanLink, processUrlComplete);
    }
  }
}

async function processUrl(url) {
  const links = page.getPageLinks(baseUrl, url);
  knownUrls[links.responseUrl] = true;
  return links;
}

function processUrlComplete(err, results) {
  if (err) {
    console.error(err);
    return;
  }
  results.external && updateSiteLinks(results.external);
  results.resources && updateSiteLinks(results.resources);
  if (results.internal) {
    results.internal && updateSiteLinks(results.internal);
    queueLinks(results.internal);
  }
  console.log('processed', results.pageUrl);
}

function queueDone() {
  //TODO: write output
  console.log('complete', siteLinks);
}


queue.drain = queueDone;
queueLinks([baseUrl]);
