const STORAGE_KEY = "incognitoUsed";

/* ------------------------------
   Utility helpers
-------------------------------- */

function markIncognitoUsed() {
  chrome.storage.local.set({ [STORAGE_KEY]: true });
}

function clearIncognitoFlag() {
  chrome.storage.local.remove(STORAGE_KEY);
}

function getIncognitoFlag() {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, result => {
      resolve(Boolean(result[STORAGE_KEY]));
    });
  });
}

function hasIncognitoWindows() {
  return new Promise(resolve => {
    chrome.windows.getAll({}, windows => {
      resolve(windows.some(w => w.incognito));
    });
  });
}

/* ------------------------------
   Clipboard cleanup trigger
-------------------------------- */

async function attemptClipboardCleanup() {
  const incognitoUsed = await getIncognitoFlag();
  if (!incognitoUsed) return;

  const stillIncognito = await hasIncognitoWindows();
  if (stillIncognito) return;

  // Safe, stable moment — try to clear clipboard
  chrome.windows.create(
    {
      url: "clear.html",
      type: "popup",
      focused: true,
      width: 1,
      height: 1
    },
    () => {
      // Regardless of popup success, we do not retry endlessly
      clearIncognitoFlag();
    }
  );
}

/* ------------------------------
   Incognito detection
-------------------------------- */

chrome.windows.onCreated.addListener(window => {
  if (window.incognito) {
    markIncognitoUsed();
  }
});

chrome.windows.onRemoved.addListener(() => {
  // Opportunistic check only — no teardown assumptions
  attemptClipboardCleanup();
});

/* ------------------------------
   Opportunistic wakeups
-------------------------------- */

chrome.runtime.onStartup.addListener(() => {
  attemptClipboardCleanup();
});

chrome.runtime.onInstalled.addListener(() => {
  attemptClipboardCleanup();
});

chrome.tabs.onActivated.addListener(() => {
  attemptClipboardCleanup();
});

chrome.tabs.onUpdated.addListener(() => {
  attemptClipboardCleanup();
});

