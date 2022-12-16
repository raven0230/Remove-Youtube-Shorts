function restoreOptions() {
  // read options and set value to checkboxes
  browser.storage.local
    .get(["nav", "homefeed"])
    .then((options) => {
      document.querySelector("input#nav").checked = options.nav;
      document.querySelector("input#homefeed").checked = options.homefeed;
      document.querySelector("input#channel").checked = options.channel;
    })
    .catch((err) => console.log(err));
}

// restore options to form on load
document.addEventListener("DOMContentLoaded", restoreOptions);

function reset_animation() {
  var el = document.getElementById("saved-label");
  el.style.animation = "none";
  el.offsetHeight; /* trigger reflow */
  el.style.animation = null;
}

const savedLabel = document.getElementById("saved-label");

function saveOptions(e) {
  e.preventDefault();

  if (savedLabel.className === "") savedLabel.className = "fadeOut";
  else reset_animation();

  const newOptions = {
    nav: document.querySelector("input#nav").checked,
    homefeed: document.querySelector("input#homefeed").checked,
    channel: document.querySelector("input#channel").checked,
  };
  browser.storage.local
    .set(newOptions)
    .then(() => {
      console.log("success");
    })
    .catch((err) => console.log(err));
}

document.querySelector("form").addEventListener("submit", saveOptions);
