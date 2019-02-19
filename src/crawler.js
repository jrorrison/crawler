const fs = require("fs");
const async = require("async");
const { getPageLinks, isCrawlableUrl, cleanUrl, siteLinksToXml } = require("./utils");

// Number of concurrent crawls
const MAX_CONCURRENT = 5;

// Number of pages to crawl before stopping.
const MAX_CRAWLS = 50;

// Start url.  If had more time would move this to command line arg
const baseUrl = "https://www.barvas.com";

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
 * Queue processing function.  
 * @param {string} url 
 */
async function processUrl(url) {
  const result = await getPageLinks(baseUrl, url);
  // Bit messy.  If processing the page resulted in following redirects the final url will be returned 
  // as responseUrl.  Mark it as known so we don't process it again.
  knownUrls[result.responseUrl] = true;
  return result;
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
  console.log("processed page", results.pageUrl);
}

/**
 * Callback for when the queue is empty.
 */
function queueDone() {
  console.log("Crawling complete.  Writing results to links.xml");
  fs.writeFile("./links.xml", siteLinksToXml(baseUrl, siteLinks), function(err) {
      if (err) {
        return console.error(err);
      }
      console.log("Complete");
    }); 
  }
  
  const queue = async.queue(processUrl, MAX_CONCURRENT);
  queue.drain = queueDone;  
  // Add start page to the queue to kick us off
  queueLinks([baseUrl]);
