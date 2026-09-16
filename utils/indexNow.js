const https = require('https');
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY || 'fce1ae1289d140dab3b7c5ac526e75c7';
const INDEXNOW_ENDPOINT = 'https://www.indexnow.org/indexnow';

/**
 * Notify IndexNow about a URL change
 * This notifies search engines (Bing, Yandex, etc.) to crawl the updated content
 * @param {string} url - The URL that was created or updated
 * @returns {Promise<boolean>} - Success status
 */
async function notifyIndexNow(url) {
  return new Promise((resolve) => {
    try {
      if (!url) {
        console.error('IndexNow: URL is required');
        resolve(false);
        return;
      }

      const payload = {
        host: new URL(url).hostname,
        key: INDEXNOW_API_KEY,
        urlLocation: url
      };

      console.log('IndexNow: Notifying search engines about:', url);

      const postData = JSON.stringify(payload);

      const options = {
        hostname: 'www.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 202) {
            console.log('IndexNow: Successfully notified search engines');
            resolve(true);
          } else {
            console.error('IndexNow: Failed to notify search engines', res.statusCode);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('IndexNow: Error notifying search engines', error);
        resolve(false);
      });

      req.write(postData);
      req.end();
    } catch (error) {
      console.error('IndexNow: Error notifying search engines', error);
      resolve(false);
    }
  });
}

/**
 * Notify IndexNow about multiple URLs at once
 * @param {string[]} urls - Array of URLs that were created or updated
 * @returns {Promise<boolean>} - Success status
 */
async function notifyIndexNowBatch(urls) {
  return new Promise((resolve) => {
    try {
      if (!urls || urls.length === 0) {
        console.error('IndexNow: URLs array is required');
        resolve(false);
        return;
      }

      const payload = {
        host: new URL(urls[0]).hostname,
        key: INDEXNOW_API_KEY,
        urlList: urls
      };

      console.log('IndexNow: Notifying search engines about batch URLs:', urls.length);

      const postData = JSON.stringify(payload);

      const options = {
        hostname: 'www.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 202) {
            console.log('IndexNow: Successfully notified search engines for batch');
            resolve(true);
          } else {
            console.error('IndexNow: Failed to notify search engines for batch', res.statusCode);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('IndexNow: Error notifying search engines for batch', error);
        resolve(false);
      });

      req.write(postData);
      req.end();
    } catch (error) {
      console.error('IndexNow: Error notifying search engines for batch', error);
      resolve(false);
    }
  });
}

module.exports = {
  notifyIndexNow,
  notifyIndexNowBatch
};
