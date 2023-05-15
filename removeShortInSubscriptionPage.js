function firstLoadRemove(subContents) {
  // search for existing grid renderer in grid view and remove shorts
  subContents
    .querySelectorAll("ytd-grid-renderer")
    .forEach((renderer) => removeFromGridRenderer(renderer));

  // search for shorts in list view and remove them
  subContents
    .querySelectorAll(
      "ytd-shelf-renderer ytd-video-renderer ytd-thumbnail a[href^='/shorts']"
    )
    .forEach((video) => video.closest("ytd-shelf-renderer").remove());
}

function checkIfShelfVideoIsShort(elem) {
  // search for shorts link
  const a = elem.querySelector("ytd-thumbnail a[href^='/shorts']");
  if (a) {
    // if found, remove video shelf
    a.closest("ytd-shelf-renderer").remove();
  }
}

function removeFromGridRenderer(renderer) {
  // search for shorts
  renderer
    .querySelectorAll(
      "ytd-grid-video-renderer ytd-thumbnail a[href^='/shorts']"
    )
    .forEach((video) => {
      // remove shorts
      video.closest("ytd-grid-video-renderer").remove();
    });
}

browser.storage.local
  .get(["subs"])
  .then((options) => {
    if (options.subs) {
      waitForElm(
        "ytd-section-list-renderer[page-subtype='subscriptions'] div#contents"
      )
        .then((subContents) => {
          // initial remove
          firstLoadRemove(subContents);

          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeName === "YTD-ITEM-SECTION-RENDERER") {
                  if (!node.querySelector("ytd-grid-renderer")) {
                    // if new section node doesn't contain grid renderer, check if it is shorts
                    checkIfShelfVideoIsShort(node);
                  }
                } else if (node.nodeName === "YTD-CONTINUATION-ITEM-RENDERER") {
                  // node added when video loading is finished
                  // check if view mode in grid mode
                  const grids =
                    subContents.querySelectorAll("ytd-grid-renderer");

                  if (grids.length) {
                    // if so, remove shorts from grid renderers
                    grids.forEach((renderer) =>
                      removeFromGridRenderer(renderer)
                    );
                  } else {
                    // else, double check all shelf video in case of view mode changes to list mode
                    subContents
                      .querySelectorAll(
                        "ytd-shelf-renderer ytd-video-renderer ytd-thumbnail a[href^='/shorts']"
                      )
                      .forEach((video) =>
                        video.closest("ytd-shelf-renderer").remove()
                      );
                  }
                }
              });
            });
          });

          observer.observe(subContents, {
            childList: true,
          });
        })
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.log(err));
