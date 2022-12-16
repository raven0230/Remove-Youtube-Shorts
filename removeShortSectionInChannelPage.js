function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function removeShortTab() {
  const tabs = document.querySelectorAll(
    "tp-yt-paper-tabs tp-yt-paper-tab div"
  );
  if (tabs.length > 0) {
    tabs.forEach((tab) => {
      if (tab.textContent.trim() === "Shorts") {
        tab.parentElement.remove();
      }
    });
  }
}

browser.storage.local
  .get(["channel"])
  .then((options) => {
    if (options.channel) {
      waitForElm("tp-yt-paper-tabs")
        .then((tabs) => {
          removeShortTab();

          const observer = new MutationObserver((mutations) => {
            removeShortTab();
          });

          observer.observe(tabs, {
            childList: true,
            subtree: true,
          });
        })
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.log(err));
