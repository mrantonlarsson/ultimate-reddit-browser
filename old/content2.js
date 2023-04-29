function runExtension() {
  if (window.location.href.includes("comments")) {
    return;
  }

  // Save the newCommentsWidth value to chrome.storage
  function saveNewRatio() {
    chrome.storage.local.set({ newRatio: page.ratio }, function () {
      console.log(`newRatio value ${page.ratio} saved`);
    });
  }

  // Load the newCommentsWidth value from chrome.storage
  function loadNewRatio() {
    chrome.storage.local.get(["newRatio"], function (result) {
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
    page.timeoutId = setTimeout(async () => {
      if (page.lastUrl == "") {
        const contentDiv = Array.from(
          document.querySelectorAll(".content")
        ).find((element) => {
          return element.tagName === "DIV";
        });
        containerWidth = contentDiv.offsetWidth + 305;
        // Calculate the new widths of the posts and sidebar elements based on the mouse position
        var newPostsWidth = page.ratio * containerWidth;
        const newCommentsWidth = containerWidth - newPostsWidth;

        // Set the widths of the posts and comments elements
        page.postsContainer.style.width = `${newPostsWidth}px`;
        page.commentsContainer.style.width = `${newCommentsWidth - 10}px`;
      }
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

      page.commentsContainer.style.display = "block";
      page.handle.style.display = "block";

      // Remove the sidebar
      page.sidebar.style.display = "none";
      if (
        page.menuarea?.style?.display !== null &&
        page.container.contains(page.menuarea)
      ) {
        page.menuarea.style.display = "none";
      }

      page.commentsContainer.appendChild(page.loadingMessage);

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
    page.commentsContainer.style.display = "none";
    page.handle.style.display = "none";
    page.sidebar.style.display = "block";
    if (
      page.menuarea?.style?.display !== null &&
      page.container.contains(page.menuarea)
    ) {
      page.menuarea.style.display = "block";
    }
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
    const contentDiv = Array.from(document.querySelectorAll(".content")).find(
      (element) => {
        return element.tagName === "DIV";
      }
    );
    var containerWidth = contentDiv.offsetWidth;
    // Calculate the new widths of the posts and sidebar elements based on the mouse position
    var newPostsWidth = page.ratio * containerWidth;

    newPostsWidth = Math.min(newPostsWidth, 0.75 * containerWidth);
    newPostsWidth = Math.max(newPostsWidth, 0.4 * containerWidth);

    var newCommentsWidth = containerWidth - newPostsWidth;
    // Set the widths of the posts and comments elements
    page.postsContainer.style.width = `${newPostsWidth}px`;
    page.commentsContainer.style.width = `${newCommentsWidth - 10}px`;
  }

  async function loadComments(post) {
    post.commentButton.style.color = "white";
    post.element.style.borderStyle = "solid";
    post.element.style.borderWidth = "1px";
    post.element.style.borderColor = "rgb(100,100,100)";
    post.element.style.borderRadius = "5px";
    post.element.style.backgroundColor = "rgb(48,48,48)";

    return new Promise((resolve) => {
      var time = 0;
      if (post.commentPage == "") {
        let intervalId = setInterval(() => {
          time = time + 1;

          if (post.commentPage !== "") {
            // Update the innerHTML of the comments div with the comments
            page.commentsContainer.innerHTML = post.commentPage;
            clearInterval(intervalId);
            resolve();
          } else {
            // Update the loadingMessage element
            page.loadingMessage.innerHTML = `Loading comments... (Time elapsed: ${time}s)`;
          }
        }, 1000);
      } else {
        page.commentsContainer.innerHTML = post.commentPage;
        resolve();
      }
    });
  }

  class Post {
    constructor(element) {
      this.element = element;
      this.commentButton = this.element.querySelector(".comments");
      // this.thumbnail = this.element.querySelector(".thumbnail");
      // this.title = this.element.querySelectorAll(".title")[1];
      this.commentPage = "";
      this.expandoButton = this.element.querySelector(".expando-button");
      this.getCommentspage();
      this.expandoToggle = false;

      // Set event for commentButtons
      this.commentButton.addEventListener("mouseenter", (event) => {
        if (this.commentButton !== null) {
          showComments(this, 300);
        }
      });

      this.commentButton.addEventListener("mouseleave", () => {
        // Clear the timeout if the user moves the mouse away before 500ms have passed
        clearTimeout(page.timeoutId);
      });

      // // Set event for thumbnails
      // this.thumbnail.addEventListener("mouseenter", (event) => {
      //   showComments(this, 200);
      // });

      // this.thumbnail.addEventListener("mouseleave", () => {
      //   // Clear the timeout if the user moves the mouse away before 500ms have passed
      //   clearTimeout(page.timeoutId);
      // });

      // // Get all titles
      // this.title.addEventListener("mouseenter", (event) => {
      //   showComments(this, 500);
      // });

      // this.title.addEventListener("mouseleave", () => {
      //   // Clear the timeout if the user moves the mouse away before 500ms have passed
      //   clearTimeout(page.timeoutId);
      // });

      if (this?.expandoButton !== null && this?.expandoButton !== undefined) {
        // Get all expando buttons
        this.expandoButton.addEventListener("click", (event) => {
          if (this.expandoToggle == false) {
            this.expandoToggle = true;
            showComments(this, 0);
          } else {
            this.expandoToggle = false;
            hideComments();
          }
        });
      }
    }
    getCommentspage() {
      // Create a new XMLHttpRequest object
      const xhr = new XMLHttpRequest();

      // Set the event listener for when the request finishes loading
      xhr.addEventListener("load", () => {
        // Parse the response text as HTML
        const doc = new DOMParser().parseFromString(
          xhr.responseText,
          "text/html"
        );

        // Select the desired element from the document
        const element = doc.querySelectorAll(".sitetable")[1];

        var children = element.querySelectorAll(".child");
        children.forEach((element) => {
          element.style.borderLeft = "0px";
        });

        if (element?.innerHTML !== undefined) {
          // Store the HTML in the object
          this.commentPage = element.innerHTML;
        }
      });
      // Open the request to the comments URL
      xhr.open("GET", this.commentButton.getAttribute("href"));

      // Send the request
      xhr.send();
    }
  }

  const Page = {
    resizing: false,
    lastUrl: "",
    element: "",
    timeoutId: "",
    posts: [],
    dragging: false,

    container: document.querySelector(".sitetable.linklisting").parentNode,
    postsContainer: document.querySelector(".sitetable.linklisting"),
    sidebar: document.querySelector(".side"),
    menuarea: document.querySelector(".menuarea"),

    commentsContainer: document.createElement("div"),
    handle: document.createElement("div"),
    closeButton: document.createElement("button"),
    loadingMessage: document.createElement("h2"),

    lastButton: document.createElement("button"),
    lastTitle: document.createElement("p"),
    lastPost: document.createElement("div"),
    ratio: 0.6,

    setup: function () {
      loadNewRatio();

      // Insert the handle div as the second child of the container element
      this.container.insertBefore(this.handle, this.container.children[1]);

      // Insert the comments div as the third child of the container element
      this.container.insertBefore(
        this.commentsContainer,
        this.container.children[2]
      );

      this.loadingMessage.innerHTML = "Loading comments...";
      this.loadingMessage.style.padding = "15px";
      this.loadingMessage.style.fontSize = "15px";

      this.closeButton.innerHTML = "X";
      this.closeButton.style.right = "30px";
      this.closeButton.style.position = "fixed";
      this.closeButton.style.top = `${80 - window.scrollY}px`;
      this.closeButton.style.borderRadius = "5px";
      this.postsContainer.style.display = "block";
      this.postsContainer.style.order = "-2";

      this.container.style.display = "flex";
      this.container.style.flexDirection = "row";

      this.commentsContainer.style.right = "5px";
      this.commentsContainer.style.position = "fixed";
      this.commentsContainer.style.top = `${70 - window.scrollY}px`;
      this.commentsContainer.style.bottom = "5px";
      this.commentsContainer.style.overflowY = "scroll";
      this.commentsContainer.style.backgroundColor = "rgb(15,15,15)";
      this.commentsContainer.style.display = "none";
      this.commentsContainer.style.borderRadius = "5px";
      this.commentsContainer.style.zIndex = "2";

      this.handle.style.width = "10px";
      this.handle.classList.add("handle");
      this.handle.style.position = "relative";
      this.handle.style.height = this.commentsContainer.style.height;
      this.handle.style.display = "none";
      this.handle.style.zIndex = "2";
      this.handle.style.order = "-1";

      this.getPosts();
    },

    getPosts: function () {
      const allPosts = this.postsContainer.querySelectorAll(".thing");

      allPosts.forEach((post) => {
        if (!post.classList.contains("promoted")) {
          var newPost = new Post(post);
          this.posts.push(newPost);
        }
      });
    },
  };

  const page = Page;

  page.setup();

  // Attach a mouse down event listener to the handle div
  page.handle.addEventListener("mousedown", (event) => {
    // Set the resizing flag to true
    page.resizing = true;
    page.dragging = true;
  });

  // Attach a mouseup event listener to the document
  document.addEventListener("mouseup", (event) => {
    // Set the resizing flag to false
    page.resizing = false;
    page.dragging = false;
    saveNewRatio();
  });

  // Attach a click event listener to the document
  document.addEventListener("click", (event) => {
    // Check if the clicked target is not within the comments container and not the handle, and not dragging
    if (
      !page.commentsContainer.contains(event.target) &&
      event.target !== page.commentsContainer &&
      event.target !== page.handle &&
      !page.dragging
    ) {
      hideComments();
    }
  });

  page.closeButton.addEventListener("click", (event) => {
    hideComments();
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

  // Attach a mouse move event listener to the document
  document.addEventListener("mousemove", (event) => {
    // Check if the resizing flag is true
    if (page.resizing) {
      page.ratio = event.clientX / window.innerWidth;
      resizeContainerElements();
    }
  });
}

runExtension();
