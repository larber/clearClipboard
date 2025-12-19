async function clearClipboard() {
  try {
    await navigator.clipboard.writeText("");
  } catch {
    // Ignore — best effort
  }
}

(async () => {
  // Try a few times to survive focus timing quirks
  for (let i = 0; i < 3; i++) {
    await clearClipboard();
    await new Promise(r => setTimeout(r, 100));
  }

  window.close();
})();

