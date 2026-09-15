const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY || 'fce1ae1289d140dab3b7c5ac526e75c7';
const INDEXNOW_ENDPOINT = 'https://www.indexnow.org/indexnow';

/**
 * Notify IndexNow about a URL change
 * This notifies search engines (Bing, Yandex, etc.) to crawl the updated content
 * @param {string} url - The URL that was created or updated
 * @returns {Promise<boolean>} - Success status
 */
async function notifyIndexNow(url) {
  try {
    if (!url) {
      console.error('IndexNow: URL is required');
      return false;
    }

    const payload = {
      host: new URL(url).hostname,
      key: INDEXNOW_API_KEY,
      urlLocation: url
    };

    console.log('IndexNow: Notifying search engines about:', url);

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('IndexNow: Successfully notified search engines');
      return true;
    } else {
      console.error('IndexNow: Failed to notify search engines', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('IndexNow: Error notifying search engines', error);
    return false;
  }
}

/**
 * Notify IndexNow about multiple URLs at once
 * @param {string[]} urls - Array of URLs that were created or updated
 * @returns {Promise<boolean>} - Success status
 */
async function notifyIndexNowBatch(urls) {
  try {
    if (!urls || urls.length === 0) {
      console.error('IndexNow: URLs array is required');
      return false;
    }

    const payload = {
      host: new URL(urls[0]).hostname,
      key: INDEXNOW_API_KEY,
      urlList: urls
    };

    console.log('IndexNow: Notifying search engines about batch URLs:', urls.length);

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('IndexNow: Successfully notified search engines for batch');
      return true;
    } else {
      console.error('IndexNow: Failed to notify search engines for batch', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('IndexNow: Error notifying search engines for batch', error);
    return false;
  }
}

module.exports = {
  notifyIndexNow,
  notifyIndexNowBatch
};
