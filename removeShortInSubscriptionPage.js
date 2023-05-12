function removeShorts(subVideoList) {
  subVideoList
    .querySelectorAll(
      // "ytd-shelf-renderer:not([style*='display: none']) ytd-thumbnail span[aria-label='Shorts']"
      "ytd-shelf-renderer:not([style*='display: none']) ytd-thumbnail a[href^='/shorts']"
    )
    .forEach(
      (video) => (video.closest("ytd-shelf-renderer").style.display = "none")
    );
}

function removeIfShort(elem) {
  if (elem.querySelector("ytd-thumbnail a[href^='/shorts']")) {
    elem.style.display = "none";
    console.log("removed");
  }
}

browser.storage.local
  .get(["subs"])
  .then((options) => {
    if (options.subs) {
      waitForElm(
        "ytd-section-list-renderer[page-subtype='subscriptions'] div#contents"
      )
        .then((subVideoList) => {
          removeShorts(subVideoList);

          const observer = new MutationObserver((mutations) => {
            console.log("test");
            mutations.forEach((mutation) =>
              mutation.addedNodes.forEach((node) => removeIfShort(node))
            );
          });

          observer.observe(subVideoList, {
            childList: true,
          });
        })
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.log(err));
