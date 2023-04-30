import { Post } from "./Post.js";
import { UIManager } from "./UIManager.js";
import { KeyboardManager } from "./KeyboardManager.js";

export const Page = {
  lastPost: null,
  currentPost: null,
  commentsContainerToggle: false,
  posts: [],
  postsBuffer: 5,
  postsIterator: 0,

  commentsContainer: document.createElement("div"),
  commentsWrapper: document.createElement("div"),
  postWrapper: document.createElement("div"),
  loadingMessage: document.createElement("h2"),
  handle: document.createElement("div"),
  closeButton: document.createElement("button"),

  setup: function (oldReddit) {
    if (oldReddit) {
      this.container = document.querySelector('[role="main"]');
      this.postsContainer = document.querySelector(".sitetable.linklisting");
      this.sidebar = document.querySelector(".side");
    } else {
      this.container = document.querySelector(
        ".ListingLayout-outerContainer"
      ).childNodes[1].childNodes[1];
      this.postsContainer = document.querySelector(
        ".ListingLayout-outerContainer"
      ).childNodes[1].childNodes[1].childNodes[0];
      this.sidebar = document.querySelector(
        ".ListingLayout-outerContainer"
      ).childNodes[1].childNodes[1].childNodes[1];
    }
    this.uiManager = new UIManager(this, oldReddit);
    this.keyboardManager = new KeyboardManager(this);

    this.uiManager.setupPage(this);

    this.getPosts();

    this.bufferComments(null);

    this.postsContainer.addEventListener("click", this.handleExpandoButtonClick.bind(this));

    this.observePosts();
    this.observeComments();
    this.observeRESMedia();

    // Attach a mouse down event listener to the handle div
    this.handle.addEventListener("mousedown", (event) => {
      // Set the resizing flag to true
      this.uiManager.resizing = true;
      this.uiManager.dragging = true;
      document.body.classList.add("no-select");
    });

    this.closeButton.addEventListener("click", (event) => {
      this.uiManager.toggleCommentsContainer(false);
    });

    // Attach a mouseup event listener to the document
    document.addEventListener("mouseup", (event) => {
      // Set the resizing flag to false
      this.uiManager.resizing = false;
      this.uiManager.dragging = false;
      this.uiManager.saveNewRatio();
      document.body.classList.remove("no-select");
    });

    window.addEventListener("scroll", (event) => {
      if (70 - window.scrollY <= 70 && 70 - window.scrollY >= 5) {
        this.commentsContainer.style.top = `${70 - window.scrollY}px`;
        this.handle.style.top = `${70 - window.scrollY}px`;
        this.closeButton.style.top = `${80 - window.scrollY}px`;
      } else {
        this.commentsContainer.style.top = "5px";
        this.closeButton.style.top = "15px";
      }
      // Get the .res-media-zoomable element
      if (this.currentPost) {
        const mediaZoomable = this.currentPost.querySelector(".res-media-zoomable");
        // Apply the style if the element exists
        if (mediaZoomable) {
          // Calculate the remaining space in the viewport
          let remainingSpace = window.innerHeight - mediaZoomable.getBoundingClientRect().top;
          // Set the maximum height to the remaining space in the viewport

          remainingSpace = Math.min(750, remainingSpace);
          remainingSpace = Math.max(385, remainingSpace);
          mediaZoomable.style.maxHeight = `${remainingSpace}px`;
        }
      }
    });

    // Attach a mouse move event listener to the document
    document.addEventListener("mousemove", (event) => {
      // Check if the resizing flag is true
      if (this.uiManager.resizing) {
        this.uiManager.ratio = event.clientX / window.innerWidth;
        this.uiManager.updateContainerWidths();
        // Get the .res-media-zoomable element
        if (this.currentPost.querySelector(".res-expando-box")) {
          const mediaZoomable = this.currentPost.querySelector(".res-media-zoomable");
          let parentWidth = this.currentPost.querySelector(".res-expando-box").offsetWidth;
          // Apply the style if the element exists
          if (mediaZoomable) {
            mediaZoomable.style.maxWidth = `${parentWidth}px`;
          }
        }
      }
    });
  },

  selectAllPosts() {
    this.posts.forEach((post) => {
      post.isSelected = true;
    });
  },
  unSelectAllPosts() {
    this.posts.forEach((post) => {
      post.isSelected = false;
    });
  },

  getPosts: function () {
    let allPosts;

    if (this.uiManager.oldReddit) {
      allPosts = this.postsContainer.querySelectorAll(".thing");
    } else {
      allPosts = this.postsContainer.querySelectorAll(".Post");
    }

    let nextId = this.posts.length; // Start IDs from the length of the current posts array

    allPosts.forEach((post) => {
      if (
        !post.classList.contains("promoted") &&
        !this.posts.some((existingPost) => existingPost.element === post)
      ) {
        var newPost = new Post(nextId++, post, this);
        this.posts.push(newPost);
      }
    });
  },

  bufferComments: function (currentIndex = null) {
    let startIndex, endIndex;

    if (currentIndex === null) {
      // Initial buffering of the first 5 posts
      startIndex = 0;
      endIndex = this.postsBuffer;
    } else {
      // Buffering when hovering over a comment button
      startIndex = Math.max(0, currentIndex - 2);
      endIndex = Math.min(this.posts.length, currentIndex + 3);
    }

    for (let i = startIndex; i < endIndex; i++) {
      if (!this.posts[i].commentsManager.commentsElement) {
        this.posts[i].commentsManager.getCommentsPage();
      }
    }
  },

  handleExpandoButtonClick: function (event) {
    const target = event.target;
    if (target.classList.contains("expando-button")) {
      // Find the corresponding Post instance
      for (const post of this.posts) {
        if (post.element.contains(target)) {
          if (post.expandoToggle == false) {
            this.uiManager.scrollToPost(post);
            post.onCommentsButtonHover(0);
            post.expandoToggle = true;
          } else if (post.expandoToggle == true) {
            post.expandoToggle = false;
          }
          setTimeout(() => {
            // Get the .res-media-zoomable element
            let parentWidth = "auto";
            const mediaZoomable = post.element.querySelector(".res-media-zoomable");
            if (post.element.querySelector(".res-expando-box")) {
              parentWidth = post.element.querySelector(".res-expando-box").offsetWidth;
            } else {
              // console.log("parentWidth set to auto");
            }

            // Apply the style if the element exists
            if (mediaZoomable) {
              mediaZoomable.style.maxWidth = `${parentWidth}px`;

              // Calculate the remaining space in the viewport
              let remainingSpace = window.innerHeight - mediaZoomable.getBoundingClientRect().top;
              // Set the maximum height to the remaining space in the viewport
              remainingSpace = Math.min(750, remainingSpace);
              remainingSpace = Math.max(385, remainingSpace);

              mediaZoomable.style.maxHeight = `${remainingSpace}px`;
            }
          }, 50);

          break;
        }
      }
    }
  },
  observePosts: function () {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((addedNode) => {
            // Check if the addedNode is a sitetable and not inside the comments container
            if (
              addedNode.classList &&
              addedNode.classList.contains("sitetable") &&
              !this.commentsWrapper.contains(addedNode)
            ) {
              this.getPosts(this.uiManager.oldReddit);
              this.keyboardManager.setCurrentPostId(this.posts[this.posts.length - 1].id); // Update the current post ID here
            }
          });
        }
      });
    });

    // Observe changes in the document
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  },

  observeComments: function () {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((addedNode) => {
            // Check if the addedNode is a sitetable and not inside the comments container
            if (addedNode.classList && addedNode.classList.contains("comment")) {
              this.uiManager.styleCommentsContainerComments();
              addedNode.parentElement.parentElement.style.borderLeft = "0px";
            }
          });
        }
      });
    });

    // Observe changes in the document
    observer.observe(this.commentsWrapper, {
      childList: true,
      subtree: true,
    });
  },
  observeRESMedia: function () {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((addedNode) => {
            // Check if the addedNode is a .res-media-zoomable
            if (addedNode.classList && addedNode.classList.contains("res-media-zoomable")) {
              addedNode.style.maxWidth = "100px";
            }
          });
        }
      });
    });

    // Observe changes in the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
};
