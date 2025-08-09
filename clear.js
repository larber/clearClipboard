// Runs in a focused extension page, so navigator.clipboard.writeText('') is allowed.

(async () => {
  try {
    // Ensure the document is focused; some platforms are picky.
    window.focus();

    // Two attempts: Clipboard API first; fallback to execCommand.
    let ok = false;
    try {
      await navigator.clipboard.writeText('');
      ok = true;
    } catch (e) {
      // Fallback: create a textarea, select empty value, execCommand('copy')
      try {
        const ta = document.createElement('textarea');
        ta.value = '';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand('copy'); // returns boolean
        ta.remove();
      } catch (_) {
        ok = false;
      }
    }

    chrome.runtime.sendMessage({
      type: 'CLIPBOARD_CLEAR_RESULT',
      payload: ok ? { ok: true } : { ok: false, error: 'write failed' }
    });
  } catch (err) {
    chrome.runtime.sendMessage({
      type: 'CLIPBOARD_CLEAR_RESULT',
      payload: { ok: false, error: String(err) }
    });
  } finally {
    // Give the background a split second to receive the message before closing.
    setTimeout(() => window.close(), 100);
  }
})();

