// read addon options
let addonOptions;
const optionList = ["nav", "homefeed", "channel", "subs", "menu"];

browser.storage.local
  .get(optionList)
  .then((options) => {
    console.log(options, Object.keys(options));
    if (
      options.nav === undefined ||
      !optionList.every((option) => options.hasOwnProperty(option))
    ) {
      console.log("initializing options");
      // initialize
      addonOptions = {
        nav: true,
        homefeed: true,
        channel: true,
        subs: true,
        menu: true,
      };
      browser.storage.local.set(addonOptions);
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
      title: "Hide Shorts tab in channel page",
      contexts: ["all"],
      checked: addonOptions.channel,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-subs",
      type: "checkbox",
      title: "Hide Shorts from Subscriptions page",
      contexts: ["all"],
      checked: addonOptions.subs,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "separator-2",
      type: "separator",
      contexts: ["all"],
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-menu",
      type: "checkbox",
      title: "Enable context menu",
      contexts: ["all"],
      checked: addonOptions.menu,
    },
    onCreated
  );
}

// initialize state
let contextMenuState = false;

function removeContextMenu() {
  browser.menus
    .removeAll()
    .then(console.log("items removed successfully"))
    .catch((err) => console.error(err));
  contextMenuState = false;
}

function updateContextMenu(currentTabUrl) {
  const re = /(?:http|https):\/\/www.youtube.com\/.*/;
  const found = currentTabUrl.match(re);
  if (contextMenuState && !found) {
    // if menu is shown, and new tab is not in YouTube domain, remove context menu
    removeContextMenu();
  } else if (!contextMenuState && found && addonOptions.menu) {
    // if menu is not shown, and new tab is in YouTube domain, and context menu is enabled, create context menu
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
  // get option type
  const type = info.menuItemId.split("-")[1];

  // update option
  addonOptions[type] = info.checked;

  // update local storage
  let updateOption = {};
  updateOption[type] = info.checked;

  browser.storage.local
    .set(updateOption)
    .then(() => {
      console.log("success");
    })
    .catch((err) => console.error(err));

  // if menu option unchecked, remove context menu
  if (type === "menu" && !info.checked) removeContextMenu();
}

browser.menus.onClicked.addListener(handleContextMenuClick);

function handleLocalStorageChange(changes) {
  // update options on changes from option form
  const changedItems = Object.keys(changes);
  for (const item of changedItems) {
    if (changes[item].oldValue !== changes[item].newValue) {
      addonOptions[item] = changes[item].newValue;
    }
  }
}

browser.storage.local.onChanged.addListener(handleLocalStorageChange);
