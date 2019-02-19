const fs = require("fs");
const async = require("async");
const page = require("./page");
const siteLinksToXml = require("./output");
const { URL } = require("url");
const MAX_CONCURRENT = 2;
const MAX_CRAWLS = 50;


const baseUrl = "https://www.mindgenius.com";
const siteLinks = {};
const knownUrls = {};
let crawlCount = 0;

const queue = async.queue(processUrl, MAX_CONCURRENT);

function updateSiteLinks(newLinks) {
  for (const link of newLinks) {
    if (!siteLinks[link]) {
      siteLinks[link] = true;
    }
  }
}

function isCrawlableUrl(url) {
  return !url.startsWith("mailto:");
}

function canQueue(url) {
  return crawlCount < MAX_CRAWLS && !knownUrls[url] && isCrawlableUrl(url);
}

function cleanUrl(url) {
  //TODO: Remove  utm url params
  const u = new URL(url);
  u.hash = "";
  return u.toString();
}

function queueLinks(links) {
  for (const link of links) {
    const cleanLink = cleanUrl(link);
    if (canQueue(cleanLink)) {
      knownUrls[cleanLink] = true;
      crawlCount++;
      queue.push(cleanLink, processUrlComplete);
    }
  }
}

async function processUrl(url) {
  const links = await page.getPageLinks(baseUrl, url);
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
  console.log("processed page", results.pageUrl);
}

function queueDone() {
  console.log("Crawling complete.  Writing results to links.xml");
  fs.writeFile("./links.xml", siteLinksToXml(baseUrl, siteLinks), function(
    err
  ) {
    if (err) {
      return console.error(err);
    }
    console.log("The file was saved!");
  });

  console.log();
}

queue.drain = queueDone;
queueLinks([baseUrl]);
