// background.js (MV3 service worker)

const incognitoTabIds = new Set();
const incognitoWindowIds = new Set();

chrome.windows.onCreated.addListener((win) => {
  if (win.incognito) incognitoWindowIds.add(win.id);
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  if (incognitoWindowIds.delete(windowId)) {
    await clearClipboardViaPopup();
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.incognito) incognitoTabIds.add(tab.id);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (incognitoTabIds.delete(tabId)) {
    await clearClipboardViaPopup();
  }
});

// Seed state in case the service worker restarted
(async () => {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    for (const w of windows) {
      if (!w.incognito) continue;
      incognitoWindowIds.add(w.id);
      for (const t of (w.tabs || [])) {
        if (t.incognito) incognitoTabIds.add(t.id);
      }
    }
  } catch (e) {
    console.warn('Seed failed:', e);
  }
})();

// Create a tiny focused popup to satisfy the Clipboard API "focused document" rule,
// write an empty string, then close it.
async function clearClipboardViaPopup() {
  try {
    // Open a tiny focused popup (non-incognito is fine; we just need focus)
    const popup = await chrome.windows.create({
      url: chrome.runtime.getURL('clear.html'),
      type: 'popup',
      focused: true,
      width: 220,
      height: 120,
      left: 10,
      top: 10
    });

    // Wait for a success/failure message from the page
    const ok = await waitForOnce('CLIPBOARD_CLEAR_RESULT', 2000);

    // Close the popup window
    if (popup && popup.id !== undefined) {
      try { await chrome.windows.remove(popup.id); } catch (_) {}
    }

    if (!ok?.ok) {
      console.warn('Clipboard clear reported failure:', ok?.error || ok);
    }
  } catch (err) {
    console.warn('Failed to clear clipboard via popup:', err);
  }
}

function waitForOnce(type, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let timeoutId;
    function handler(msg, _sender, sendResponse) {
      if (msg && msg.type === type) {
        clearTimeout(timeoutId);
        chrome.runtime.onMessage.removeListener(handler);
        resolve(msg.payload);
        sendResponse?.({ received: true });
      }
    }
    chrome.runtime.onMessage.addListener(handler);
    timeoutId = setTimeout(() => {
      chrome.runtime.onMessage.removeListener(handler);
      resolve({ ok: false, error: 'timeout' });
    }, timeoutMs);
  });
}

