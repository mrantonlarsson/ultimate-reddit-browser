// Save the newCommentsWidth value to chrome.storage
function saveNewRatio() {
  chrome.storage.sync.set({ newRatio: page.ratio }, function () {
    console.log(`newRatio value ${page.ratio} saved`);
  });
}

// Load the newCommentsWidth value from chrome.storage
function loadNewRatio() {
  chrome.storage.sync.get(["newRatio"], function (result) {
    page.ratio = result.newRatio;
  });
}

function colorComment(commentThread) {
  commentThread.forEach((topComment) => {
    childThread = topComment.querySelector(".child");

    if (
      childThread?.childNodes[0]?.childNodes !== undefined &&
      childThread?.childNodes[0]?.childNodes !== null
    ) {
      var childComments = childThread.childNodes[0].childNodes;

      childComments.forEach((comment) => {
        if (comment.classList.contains("comment")) {
          if (topComment.classList.contains("black")) {
            comment.style.backgroundColor = "rgb(24,24,24)";
            comment.classList.add("white");
            comment.classList.remove("black");
          } else {
            comment.style.backgroundColor = "rgb(15,15,15)";
          }
        }
      });
    }
  });
}

async function showComments(post, timeout) {
  page.container.insertBefore(page.handle, page.container.children[1]);
  page.sidebar.style.margin = "0px";
  page.commentsContainer.style.display = "block";
  page.commentsContainer.style.width = page.sidebar.style.width;
  page.handle.style.display = "block";

  page.sidebarContent.style.display = "none";

  page.commentsContainer.appendChild(page.loadingMessage);

  resizeContainerElements(post.page);

  page.timeoutId = setTimeout(async () => {
    // Get the comments URL
    const commentsUrl = post.commentButton.getAttribute("href");
    if (page.lastUrl == commentsUrl) {
      return;
    }

    if (page.lastUrl !== "") {
      page.lastButton.style.color = "";
      page.lastPost.element.style.borderStyle = "";
      page.lastPost.element.style.borderWidth = "";
      page.lastPost.element.style.borderColor = "";
      page.lastPost.element.style.borderRadius = "";
      page.lastPost.element.style.backgroundColor = "";
    }

    page.lastPost = post;
    page.lastButton = post.commentButton;
    page.lastUrl = commentsUrl;

    await loadComments(post);

    // Append the close button to the comments element
    page.commentsContainer.appendChild(page.closeButton);

    var comments = page.commentsContainer.querySelectorAll(".comment");

    comments.forEach((comment) => {
      comment.classList.add("black");
      comment.style.backgroundColor = "rgb(15,15,15)";
    });

    colorComment(comments);

    var pElements = page.commentsContainer.getElementsByTagName("p");

    for (let i = 0; i < pElements.length; i++) {
      pElements[i].style.paddingBottom = "3px";
      pElements[i].style.paddingTop = "3px";
    }

    var individualComments =
      page.commentsContainer.querySelectorAll(".comment");

    for (let i = 0; i < individualComments.length; i++) {
      individualComments[i].style.padding = "5px";
      individualComments[i].style.margin = "5px";
      individualComments[i].style.borderStyle = "solid";
      individualComments[i].style.borderWidth = "1px";
      individualComments[i].style.borderColor = "rgb(48,48,48)";
      individualComments[i].style.borderRadius = "5px";
    }

    // Scroll to the top of the comments element
    page.commentsContainer.scrollTop = 0;
  }, timeout);
}

function hideComments() {
  page.container.removeChild(page.handle);
  page.sidebar.style.marginLeft = "24px";
  page.commentsContainer.style.display = "none";
  page.sidebarContent.style.display = "block";
  page.postsContainer.style.width = "100%";
  page.sidebar.style.width = "auto";

  if (page.lastUrl !== "") {
    page.lastButton.style.color = "";
    page.lastPost.element.style.borderStyle = "";
    page.lastPost.element.style.borderWidth = "";
    page.lastPost.element.style.borderColor = "";
    page.lastPost.element.style.borderRadius = "";
    page.lastPost.element.style.backgroundColor = "";
  }
  page.lastUrl = "";
  page.postsContainer.style.width = "auto";
}

function resizeContainerElements() {
  var containerWidth = page.container.offsetWidth;
  // Calculate the new widths of the posts and sidebar elements based on the mouse position
  var newPostsWidth = page.ratio * containerWidth;

  newPostsWidth = Math.min(newPostsWidth, 0.75 * containerWidth);
  newPostsWidth = Math.max(newPostsWidth, 0.4 * containerWidth);

  var newSidebarWidth = containerWidth - newPostsWidth;
  // Set the widths of the posts and comments elements
  page.postsContainer.style.width = `${newPostsWidth - 24}px`;
  page.sidebar.style.width = `${newSidebarWidth - 48}px`;
  page.commentsContainer.style.width = page.sidebar.style.width;
}

async function loadComments(post) {
  post.commentButton.style.color = "white";
  post.element.style.borderStyle = "solid";
  post.element.style.borderWidth = "1px";
  post.element.style.borderColor = "rgb(100,100,100)";
  post.element.style.borderRadius = "5px";
  post.element.style.backgroundColor = "rgb(48,48,48)";

  post.element.classList.add("smooth-transition");

  return new Promise((resolve) => {
    var time = 0;
    if (post.commentPage == "") {
      let intervalId = setInterval(() => {
        time = time + 1;
        if (post.commentPage !== "") {
          // Update the innerHTML of the comments div with the comments
          page.commentsContainer.srcdoc = post.commentPage;
          clearInterval(intervalId);
          resolve();
        } else {
          // Update the loadingMessage element
          page.loadingMessage.srcdoc = `Loading comments... (Time elapsed: ${time}s)`;
        }
      }, 1000);
    } else {
      page.commentsContainer.srcdoc = post.commentPage;
      resolve();
    }
  });
}

class Post {
  constructor(element) {
    this.xhr = new XMLHttpRequest();
    this.element = element;
    this.commentButton = this.element.querySelector(
      '[data-click-id="comments"]'
    );
    this.thumbnail = this.element.querySelector('[data-click-id="image"]');
    this.title = this.element.querySelector('[data-adclicklocation="title"]');

    this.expandoButton = this.element.querySelector(
      '[data-click-id="expando_open"]'
    );
    this.commentPage = "";

    this.getCommentspage();

    // Set event for commentButtons
    this.commentButton.addEventListener("mouseenter", (event) => {
      if (this.commentButton !== null) {
        showComments(this, 200);
      }
    });

    this.commentButton.addEventListener("mouseleave", () => {
      // Clear the timeout if the user moves the mouse away before 500ms have passed
      clearTimeout(page.timeoutId);
    });

    // Set event for thumbnails
    this.thumbnail.addEventListener("mouseenter", (event) => {
      showComments(this, 200);
    });

    this.thumbnail.addEventListener("mouseleave", () => {
      // Clear the timeout if the user moves the mouse away before 500ms have passed
      clearTimeout(page.timeoutId);
    });

    // Get all titles
    this.title.addEventListener("mouseenter", (event) => {
      showComments(this, 500);
    });

    this.title.addEventListener("mouseleave", () => {
      // Clear the timeout if the user moves the mouse away before 500ms have passed
      clearTimeout(page.timeoutId);
    });

    // Set the event listener for when the request finishes loading
    this.xhr.addEventListener("load", () => {
      // Parse the response text as HTML
      const doc = new DOMParser().parseFromString(
        this.xhr.responseText,
        "text/html"
      );

      const head = doc.querySelector("head");

      const headContent = head.innerHTML;

      var content = doc.querySelector(
        "." + this.element.classList[0]
      ).parentElement;

      const contentContent = content.innerHTML;

      if (content?.innerHTML !== undefined) {
        // Store the HTML in the object
        this.commentPage = `<!DOCTYPE html><html><head>${headContent}</head><body>${contentContent}</body></html>`;
      }
    });

    if (this?.expandoButton !== null && this?.expandoButton !== undefined) {
      // Get all expando buttons
      this.expandoButton.addEventListener("click", (event) => {
        showComments(this, 0);
      });
    }
  }

  getCommentspage() {
    // Open the request to the comments URL
    this.xhr.open(
      "GET",
      "https://www.reddit.com" + this.commentButton.getAttribute("href")
    );

    // Send the request
    this.xhr.send();
  }
}

const Page = {
  resizing: false,
  lastUrl: "",
  element: "",
  timeoutId: "",
  posts: [],
  first: true,

  container: document.querySelector(".ListingLayout-outerContainer")
    .childNodes[1].childNodes[1],
  postsContainer: document.querySelector(".ListingLayout-outerContainer")
    .childNodes[1].childNodes[1].childNodes[0],
  sidebar: document.querySelector(".ListingLayout-outerContainer").childNodes[1]
    .childNodes[1].childNodes[1],
  sidebarContent: document.querySelector(".ListingLayout-outerContainer")
    .childNodes[1].childNodes[1].childNodes[1].childNodes[0],

  commentsContainer: document.createElement("iframe"),
  handle: document.createElement("div"),
  closeButton: document.createElement("button"),
  loadingMessage: document.createElement("h2"),

  lastButton: document.createElement("button"),
  lastTitle: document.createElement("p"),
  lastPost: document.createElement("div"),
  ratio: 0.6,

  setup: function () {
    loadNewRatio(this);

    this.sidebar.insertBefore(this.commentsContainer, this.sidebar.children[1]);

    this.loadingMessage.innerHTML = "Loading comments...";
    this.loadingMessage.style.padding = "15px";
    this.loadingMessage.style.fontSize = "15px";

    this.closeButton.innerHTML = "X";
    this.closeButton.style.right = "30px";
    this.closeButton.style.position = "fixed";
    this.closeButton.style.top = `${80 - window.scrollY}px`;
    this.closeButton.style.borderRadius = "5px";

    this.commentsContainer.style.display = "none";
    this.commentsContainer.style.height = "100%";
    this.commentsContainer.style.backgroundColor = "#1A1A1B";
    this.commentsContainer.style.borderColor = "#474748";
    this.commentsContainer.style.color = "#D7DADC";
    this.commentsContainer.style.fill = "#D7DADC";

    this.commentsContainer.style.border = "1px solid #474748";
    this.commentsContainer.style.borderRadius = " 4px";

    this.handle.style.width = "24px";
    this.handle.classList.add("handle");
    this.handle.style.height = this.sidebar;

    this.getPosts();
  },

  getPosts: function () {
    const allPosts = this.postsContainer.querySelectorAll(".Post");
    allPosts.forEach((post) => {
      var newPost = new Post(post);
      this.posts.push(newPost);
    });
  },
};

const page = Page;

page.setup();

page.closeButton.addEventListener("click", (event) => {
  hideComments();
});

// Attach a mouse down event listener to the handle div
page.handle.addEventListener("mousedown", (event) => {
  // Set the resizing flag to true
  page.resizing = true;
});

page.handle.addEventListener("mouseenter", (event) => {
  event.target.style.backgroundColor = "grey";
});

page.handle.addEventListener("mouseleave", (event) => {
  event.target.style.backgroundColor = "";
});

window.addEventListener("scroll", (event) => {
  if (70 - window.scrollY <= 70 && 70 - window.scrollY >= 5) {
    page.commentsContainer.style.top = `${70 - window.scrollY}px`;
    page.closeButton.style.top = `${80 - window.scrollY}px`;
  } else {
    page.commentsContainer.style.top = "5px";
    page.closeButton.style.top = "15px";
  }
});

// Attach a mouseup event listener to the document
document.addEventListener("mouseup", (event) => {
  // Set the resizing flag to false
  page.resizing = false;
  saveNewRatio();
});

// Attach a mouse move event listener to the document
document.addEventListener("mousemove", (event) => {
  // Check if the resizing flag is true
  if (page.resizing) {
    page.ratio = event.clientX / window.innerWidth;
    resizeContainerElements();
  }
});
