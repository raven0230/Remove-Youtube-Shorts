function handleUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.url) {
    // if url matches YouTube Shorts url format,
    const re =
      /(?:http|https):\/\/www.youtube.com\/shorts\/([a-zA-Z0-9_-]{11})/;
    const found = changeInfo.url.match(re);
    if (found[1]) {
      // redirect url to original YouTube video player
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

// listen to url changes
browser.tabs.onUpdated.addListener(handleUpdated, {
  urls: ["*://www.youtube.com/shorts/*"],
});
