function handleUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.url) {
    const re = /https:\/\/www.youtube.com\/shorts\/([a-zA-Z0-9_-]{11})/;
    const found = changeInfo.url.match(re);
    if (found[1]) {
      browser.tabs
        .update(tabId, {
          url: `https://www.youtube.com/watch?v=${found[1]}`,
          loadReplace: true,
        })
        .then(console.log("Redirecting Shorts..."))
        .catch(console.error);
    }
  }
}

browser.tabs.onUpdated.addListener(handleUpdated, {
  urls: ["https://www.youtube.com/*"],
});
