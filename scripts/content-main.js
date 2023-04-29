import { Page } from "./classes/Page.js";

export function runExtension() {
  if (window.location.href.includes("comments")) {
    return;
  }

  if (window.location.href.startsWith("https://old")) {
    const page = Page;
    page.setup(true);
  } else {
    const page = Page;
    page.setup(false);
  }
}
