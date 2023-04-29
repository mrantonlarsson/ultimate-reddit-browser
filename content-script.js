(async () => {
  const src = chrome.runtime.getURL("scripts/content-main.js");
  const contentScript = await import(src);
  contentScript.runExtension(/* chrome: no need to pass it */);
})();
