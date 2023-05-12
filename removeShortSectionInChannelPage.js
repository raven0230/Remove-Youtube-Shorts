function removeShortTab(tabList) {
  const tabs = tabList.querySelectorAll("div.tab-title");
  tabs.forEach((tab) => {
    if (tab.textContent.trim() === "Shorts") {
      tab.closest("tp-yt-paper-tab").remove();
    }
  });
}

browser.storage.local
  .get(["channel"])
  .then((options) => {
    if (options.channel) {
      waitForElm("tp-yt-paper-tabs div#tabsContent")
        .then((tabList) => {
          removeShortTab(tabList);

          const observer = new MutationObserver((mutations) => {
            removeShortTab(tabList);
          });

          observer.observe(tabList, {
            childList: true,
          });
        })
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.log(err));
