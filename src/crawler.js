/**
 * Simple web crawler.
 */

const fs = require('fs');
const async = require('async');
const {
  getPageLinks,
  isCrawlableUrl,
  cleanUrl,
  siteLinksToXml
} = require('./utils');

// Number of concurrent crawls
const MAX_CONCURRENT = 5;

// Number of pages to crawl before stopping.
const MAX_CRAWLS = 500;

// Start url.  If had more time would move this to command line arg
const baseUrl = 'https://barvas.com/';

// Output xml file
const outputFile = './links.xml';

// All the links that we find.  this is used to generate the xml output.  Storing as an object for ease of lookup
const siteLinks = {};

// list of urls we are crawling or have crawled. Storing as an object for ease of look up
const knownUrls = {};

// How many pages we have craweled so far
let crawlCount = 0;

function addToSiteLinks(newLinks) {
  for (const link of newLinks) {
    if (!siteLinks[link]) {
      siteLinks[link] = true;
    }
  }
}

function canQueue(url) {
  return crawlCount < MAX_CRAWLS && !knownUrls[url] && isCrawlableUrl(url);
}

/**
 * Adds list of links to queue for crawling.
 * Will check if the link is crawlable and hasn't already been processed before adding.
 * @param {array} links
 */
function queueLinks(links) {
  for (const link of links) {
    // Use cleaned urls to prevent duplicatae page crawls.  A cleaned url will have the # removed
    const cleanLink = cleanUrl(link);
    if (canQueue(cleanLink)) {
      knownUrls[cleanLink] = true;
      crawlCount++;
      queue.push(cleanLink, processUrlComplete);
    }
  }
}

/**
 * Callback for completion of a queue item.
 * This will log an error, update the sitelinks and queue any internal links for processing
 * @param {error} err
 * @param {string} results
 */
function processUrlComplete(err, results) {
  if (err) {
    console.error(err);
    return;
  }
  results.external && addToSiteLinks(results.external);
  results.resources && addToSiteLinks(results.resources);
  if (results.internal) {
    results.internal && addToSiteLinks(results.internal);
    queueLinks(results.internal);
  }
  console.log('Processed page: ', results.pageUrl);
}

const queue = async.queue(async function(url) {
    const result = await getPageLinks(baseUrl, url);
    // Bit messy.  If processing the page resulted in following redirects the final url will be returned
    // as responseUrl.  Mark it as known so we don't process it again.
    knownUrls[result.responseUrl] = true;
    return result;
  },
  MAX_CONCURRENT
);

queue.drain = function () {
  console.log(`Crawling complete. ${crawlCount} pages crawled.  Writing results to ${outputFile}`);
  fs.writeFile(outputFile, siteLinksToXml(baseUrl, siteLinks), function(err) {
    if (err) {
      return console.error(err);
    }
    console.log('Complete');
  });
};

// Add start page to the queue to kick us off
queueLinks([baseUrl]);
