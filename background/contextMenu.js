// read addon options
let addonOptions;

browser.storage.local
  .get(["nav", "homefeed", "channel"])
  .then((options) => {
    if (options.nav === undefined) {
      console.log("initializing options");
      // initialize
      addonOptions = {
        nav: true,
        homefeed: true,
        channel: false,
      };
      browser.storage.local.set({
        nav: true,
        homefeed: true,
        channel: false,
      });
    } else addonOptions = options;
  })
  .catch((err) => console.error(err));

// format context menu
function onCreated() {
  if (browser.runtime.lastError) {
    console.log("error creating item:", browser.runtime.lastError);
  } else {
    console.log("item created successfully");
  }
}

function createContextMenu() {
  browser.menus.create(
    {
      id: "reminder",
      title: "Refresh is required to apply changes",
      contexts: ["all"],
      enabled: false,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "separator-1",
      type: "separator",
      contexts: ["all"],
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-nav",
      type: "checkbox",
      title: "Hide Shorts tab in navigation tab",
      contexts: ["all"],
      checked: addonOptions.nav,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-homefeed",
      type: "checkbox",
      title: "Hide Shorts section in Home feed",
      contexts: ["all"],
      checked: addonOptions.homefeed,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-channel",
      type: "checkbox",
      title: "Hide Shorts tab in channel page (Experimental)",
      contexts: ["all"],
      checked: addonOptions.channel,
    },
    onCreated
  );
}

// initialize state
let contextMenuState = false;

function updateContextMenu(currentTabUrl) {
  const re = /(?:http|https):\/\/www.youtube.com\/.*/;
  const found = currentTabUrl.match(re);
  if (contextMenuState && !found) {
    // if menu is shown, and new tab is not in YouTube domain, remove context menu
    browser.menus
      .removeAll()
      .then(console.log("items removed successfully"))
      .catch((err) => console.error(err));
    contextMenuState = false;
  } else if (!contextMenuState && found) {
    // if menu is not shown, and new tab is in YouTube domain, create context menu
    createContextMenu();
    contextMenuState = true;
  }
}

// handle url change in active tab
function handleCurrentTabUpdate(tabId, changeInfo, tabInfo) {
  if (tabInfo.active) updateContextMenu(changeInfo.url);
}

browser.tabs.onUpdated.addListener(handleCurrentTabUpdate, {
  properties: ["url"],
});

// handle tab change
function handleTabChange(activeInfo) {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      if (tabs[0].url !== "about:blank") updateContextMenu(tabs[0].url);
    })
    .catch((err) => console.error(err));
}

browser.tabs.onActivated.addListener(handleTabChange);

// handle menu options on click
function handleContextMenuClick(info, tab) {
  // update options
  switch (info.menuItemId) {
    case "check-nav":
      addonOptions.nav = info.checked;
      break;
    case "check-homefeed":
      addonOptions.homefeed = info.checked;
      break;
    case "check-channel":
      addonOptions.channel = info.checked;
      break;
    default:
      break;
  }

  // save to storage
  browser.storage.local
    .set(addonOptions)
    .then(() => {
      console.log("success");
    })
    .catch((err) => console.error(err));
}

browser.menus.onClicked.addListener(handleContextMenuClick);
