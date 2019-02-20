# Crawler

A simple web crawler written in JavaScript (Node.js) 

The crawler will visit all pages within a given domain and compile a list of links. 

External pages will not be visited but will be logged in the output.

The crawler will generate a basic xml file with links to internal, external and image resources that were found.

Sample output files are included in the project.

## Install and run

Node version 8.11.1 or greater is required 

`$ npm install`

To run the crawler:

`$ npm run crawl`

This will generate a `links.xml` file in the same folder.

To run tests:

`$ npm run test`


## Changing the configuration

To change the starting domain and output file update the variables at the top of `crawler.js`


## Design

The code is structured in the following way:

The main crawler (`crawler.js`) who is responsible for:
* Initiating the crawl
* Management of the crawl queue
* Determining if a link should be crawled
* Collation of results
* Output of results to file when the crawl is complete

The 2nd part of the code is a simple page processing worker (in `utils.js`) which does the following:

* Accepts a url to process
* Downloads the page
* Extracts all links from the page
* Partitions the links in to external, internal and resouces lists
* Returns these lists back to the main crawler

The reason for this split was to enable a single crawler to manage the processing of a domain and collation of results, while taking advantage of a pool of page processing workers to do the actual work.  The worker task is independant of the domain being crawled (it just downloads and processes a page) so in the future we could have a pool of workers that can be used by multiple crawlers.

We can adjust how many concurrent tasks we have to take advantage of the fact that a lot of the time is spent in IO bound operations.

This also has the advantages that later, if required, we could move to multi threaded or even distrubuted task processing.

Url handling seems to be the more tricky part here.  I've implemented code to remove url hashes as they should not change the page content.  We can't totally strip query string params from urls as they are important but we could maintain a list of ones we know don't change page content e.g. utm_

Detecting if links are external is also interesting.  At the moment I've went for simply checking if the url contains a protocol and the domain differs from the start one.  There may be other cases we don't handle here e.g. www.google.com (no protocol)


### Libs used

We use the axios library for http requests.  Although is is a bit heavy for what we need it has the advantage of handling redirects for us which simplifies our code.

Cheerio is used to parse the HTML and extract the links.  The library makes it very easy to find and extract links.

We also use the [async](https://github.com/caolan/async) for the task queueing.  This allows us to add a pool of workers without introducing complexity.

## Outstanding / If I had more time

If had more time I would improve on the following

* Ability to specify starting domain and output file via the command line
* Better handling of starting domain e.g. validate format. handle when starting domain contains a path
* Better error handling.  At the moment we just log errors and carry on but there is work we can do here. Some thought would be required around HTTP status codes and we to try and re-queue pages
* Integration tests.  Run the crawler against sample test sites and verify the results
* Finish unit testing.  I wrote some but more can be done.
* Do more work around the detection of external urls and what is crawlable and whats not.  I'm sure we don't cover all cases.
* Improve the xml output to include crawl dates, url types
* Respect robots.txt file
* Set proper request headers


## Other talking points

* Peristence of crawl results and the queue
* Scaling up of page processing tasks
* Resilience e.g. if we crash how can we pick up where we started?
* Proper logging of errors
* Optimistation and use of things like cache headers eg. if-modified-since
* How to throttle requests
* Reliable prevention of infinate crawl loops
