const async = require('async');
const page = require('./page');

const MAX_CONCURRENT = 2;
const MAX_CRAWLS = 5000;
const baseUrl = 'https://www.barvas.com';

const siteLinks = {
  
}

const visited = {
  
}

const queue = async.queue(processUrl, MAX_CONCURRENT);

function updateSiteLinks(newLinks) {
  for (const link of newLinks) {
    if (!siteLinks[link]) {
      siteLinks[link] = true;
    }
  }
}

function queueLinks(links) {
  for (const link of links) {
    //TODO: Remove hashes and some url params (e.g. utm_)
    if (!visited[link]) {
      queue.push(link, processUrlComplete);
    }
  }
}

async function processUrl(url) {
  if (visited[url]) {
    return false;
  }
  visited[url] = true;
  const links = page.getPageLinks(baseUrl, url);
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
}

function queueDone() {
  //TODO: write output
  console.log('complete');
}


queue.drain = queueDone;
queueLinks([baseUrl]);
