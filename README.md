# crawler



### Basic process

* Add base url to queue
* Download page and extract links
* partition links in to to internal, external, image
* Add each link to known urls map
* for each internal link
  * check if we can visit (not visited, strip url hash etc)
  * add url to queue



### Notes & things to consider
  * Types of relative url "/resource/page.html" vs "resource/page.html" 
  * Types of urls (https, http, //)
  * error handing (types of error)
  * rediects 
  * Query strings, url hashes
  * Log urls with hashes but strip before we queue
  * Are there certain qs params we can ignore e.g. utm?
  * throttling
  * Max crawls to prevent never ending loops due to bugs
  * Command line handling
  * robots.txt files
  * scaling (task queues, lambdas / Azure functions)
  * resilence (can we recover if we crash?)
