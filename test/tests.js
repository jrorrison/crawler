const chai = require('chai');
var assert = chai.assert;
const { isExternalUrl, isCrawlableUrl, processPage } = require('../src/utils');

const baseUrl = 'http://www.google.com';

describe('Tests for crawler', function () {

  describe('#isExternalUrl', function () {

    it('return false for url relative to root', function () {
      assert.equal(isExternalUrl('/path/page.html', baseUrl), false);
    });

    it('return false for url relative to current page', function () {
      assert.equal(isExternalUrl('path/page.html', baseUrl), false);
    });

    it('return true for abs url relative with different domain', function () {
      assert.equal(isExternalUrl('http://www.bing.com/path/page.html', baseUrl), true);
    });

    it('return false for abs url relative on same domain', function () {
      assert.equal(isExternalUrl('http://www.google.com/path/page.html', baseUrl), false);
    });
  });

  describe('#isCrawlableUrl', function () {
    it('returns false for mailto links', function () {
      assert.equal(isCrawlableUrl('mailto:test@test.com'), false);
    });
  });

  describe('#processPage', function () {
    // TODO: If had more time would write more tests to cover various page and link types
    const html = `<html><body><img src="https://www.facebook.com/tr"/><a href="test.html" /><a href="https://www.google.com/rel.html" /> <a href="https://www.bing.com" /></body></html>`;
    
    it('returns correct page links', function () {
      const links = processPage(html, baseUrl);
      // TODO: Assert results 
      console.log(links);
    });
  });
});