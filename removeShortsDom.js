const style = document.createElement("style");
style.type = "text/css";

browser.storage.local
  .get(["nav", "homefeed"])
  .then((options) => {
    if (options.nav) {
      style.appendChild(
        document.createTextNode(`
      ytd-guide-section-renderer a[title=Shorts] {
        display: none !important;
      }
    
      ytd-mini-guide-entry-renderer[aria-label=Shorts] {
        display: none !important;
      }`)
      );
    }

    if (options.homefeed) {
      style.appendChild(
        document.createTextNode(`
      ytd-rich-shelf-renderer[is-shorts] {
        display: none !important;
      }
      `)
      );
    }
  })
  .catch((err) => console.log(err));

const head = document.getElementsByTagName("head")[0];
head.appendChild(style);
