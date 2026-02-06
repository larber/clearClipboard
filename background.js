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

let cleanupTimer = null;

function scheduleClipboardCleanup() {
  clearTimeout(cleanupTimer);
  cleanupTimer = setTimeout(attemptClipboardCleanup, 500);
}

async function attemptClipboardCleanup() {
  const incognitoUsed = await getIncognitoFlag();
  if (!incognitoUsed) return;

  const stillIncognito = await hasIncognitoWindows();
  if (stillIncognito) return;

  // Safe, stable moment — try to clear clipboard
  clearIncognitoFlag();
  chrome.windows.create({
    url: "clear.html",
    type: "popup",
    focused: true,
    width: 1,
    height: 1
  });
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
  scheduleClipboardCleanup();
});

/* ------------------------------
   Opportunistic wakeups
-------------------------------- */

chrome.runtime.onStartup.addListener(() => {
  scheduleClipboardCleanup();
});

chrome.runtime.onInstalled.addListener(() => {
  scheduleClipboardCleanup();
});

chrome.tabs.onActivated.addListener(() => {
  scheduleClipboardCleanup();
});

chrome.tabs.onUpdated.addListener(() => {
  scheduleClipboardCleanup();
});

