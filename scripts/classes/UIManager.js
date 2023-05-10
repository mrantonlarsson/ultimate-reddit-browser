export class UIManager {
  constructor(page, oldReddit) {
    this.page = page;
    this.ratio = 0.5;
    this.resizing;
    this.dragging = false;
    this.timeoutId;
    this.oldReddit = oldReddit;
    this.containerWidth = this.page.container.offsetWidth;
    this.setup();
  }
  setup() {
    this.loadNewRatio();
    this.setStyles();
  }

  // Page-related
  setupPage() {
    this.page.loadingMessage.classList.add("urb-loadingMessage");
    this.page.closeButton.classList.add("urb-closeButton");
    this.page.postsContainer.classList.add("urb-postsContainer");
    this.page.commentsContainer.classList.add("urb-commentsContainer");
    this.page.handle.classList.add("urb-handle");
    this.page.handle.classList.add("urb-smooth-transition");
    this.page.commentsWrapper.classList.add("urb-commentsWrapper");
    this.page.commentsWrapperContainer.classList.add("urb-commentsWrapperContainer");
    this.page.postWrapper.classList.add("urb-postWrapper");

    //this.page.handle.style.height = this.page.commentsContainer.style.height;
    //console.log(this.page.commentsContainer.style.height);
    this.page.handle.style.borderRadius = "5px";

    this.page.commentsContainer.style.display = "none";
    this.page.handle.style.display = "none";

    this.page.loadingMessage.innerHTML = "Loading comments...";
    this.page.loadingMessage.style.display = "block";
    this.page.closeButton.innerHTML = "X";

    // Set containerPostComments styles
    this.page.commentsContainer.style.flexDirection = "column";

    this.placeElements();

    this.detectAndApplyTheme();
  }

  placeElements() {
    // Insert the handle div as the second child of the container element
    this.page.container.insertBefore(this.page.handle, this.page.container.children[1]);

    // Insert the comments div as the third child of the container element
    this.page.container.insertBefore(this.page.commentsContainer, this.page.container.children[2]);

    this.page.commentsContainer.appendChild(this.page.postWrapper);
    this.page.commentsContainer.appendChild(this.page.commentsWrapperContainer);
    this.page.commentsContainer.appendChild(this.page.closeButton);

    this.page.commentsWrapperContainer.appendChild(this.page.commentsWrapper);

    if (this.page.infobar) {
      this.page.container.parentElement.insertBefore(this.page.infobar, this.page.container);
      if (this.page.menuarea) {
        this.page.container.parentElement.insertBefore(this.page.menuarea, this.page.infobar);
      }
    }

    if (this.page.menuarea) {
      this.page.container.parentElement.insertBefore(this.page.menuarea, this.page.container);
      this.page.menuarea.style.marginLeft = "16px";
    }

    if (this.page.filterLine) {
      this.page.container.parentElement.insertBefore(this.page.filterLine, this.page.container);
      this.page.filterLine.style.padding = "5px";
      this.page.filterLine.style.marginLeft = "22px";
      this.page.filterLine.style.paddingLeft = "3px";
    }
  }

  updateContainerWidths() {
    // Calculate the new widths of the posts and sidebar elements based on the mouse position
    let newPostsWidth = this.ratio * this.containerWidth;

    newPostsWidth = Math.min(newPostsWidth, 0.6 * this.containerWidth);
    newPostsWidth = Math.max(newPostsWidth, 0.4 * this.containerWidth);

    let newCommentsWidth = this.containerWidth - newPostsWidth - 10;

    // Set the widths of the posts and comments elements
    this.page.postsContainer.style.width = `${newPostsWidth}px`;

    if (this.page.menuarea) {
      this.page.menuarea.style.width = `${newPostsWidth - 20}px`;
    }
    if (this.page.infobar) {
      this.page.infobar.style.width = `${newPostsWidth}px`;
    }
    if (this.page.filterLine) {
      this.page.filterLine.style.width = `${newPostsWidth - 20}px`;
    }

    this.page.commentsContainer.style.width = `${newCommentsWidth - 21}px`;

    this.page.handle.style.transform = `translateX(${newPostsWidth}px)`;
  }

  saveNewRatio() {
    chrome.storage.local.set({ newRatio: this.ratio }, function () {});
  }

  loadNewRatio() {
    chrome.storage.local.get(["newRatio"], (result) => {
      if (result?.newRatio !== null) {
        if (result.newRatio >= 0.4 && result.newRatio <= 0.6) {
          this.ratio = result.newRatio;
        } else {
          this.ratio = 0.5;
        }
      } else {
        this.ratio = 0.5;
      }
    });
  }

  showComments() {
    this.updateContainerWidths();
    this.page.commentsContainer.style.display = "flex";
    this.page.handle.style.display = "block";
    this.hideSidebar();
    this.page.commentsContainerToggle = true;
    this.page.container.classList.add("urb-container");
  }

  hideSidebar() {
    this.page.sidebar.style.display = "none";
  }

  hideComments() {
    this.page.commentsContainer.style.display = "none";
    this.page.handle.style.display = "none";
    this.page.postsContainer.style.width = "auto";
    this.page.container.classList.remove("urb-container");

    if (this.page.menuarea) {
      this.page.menuarea.style.width = "auto";
    }
    if (this.page.infobar) {
      this.page.infobar.style.width = "auto";
    }
    if (this.page.filterLine) {
      this.page.filterLine.style.width = "auto";
    }

    this.showSidebar();
    this.page.commentsContainerToggle = false;
  }

  showSidebar() {
    this.page.sidebar.style.display = "block";
  }

  // Post-related
  setupPost(post) {
    if (post.commentButton) {
      post.commentButton.classList.add("urb-smooth-transition");
    }

    post.element.classList.add("urb-smooth-transition");

    this.page.commentsWrapper.appendChild(this.page.loadingMessage);
    this.page.loadingMessage.innerHTML = `Loading comments...`;
  }

  toggleActivePost(post) {
    // If another comment has been hovered
    if (this?.page.lastPost !== null) {
      this.page.lastPost.commentButton.classList.remove("urb-activeCommentButton");
      this.page.lastPost.element.classList.remove("urb-activePost");
      this.page.lastPost.element.classList.add("urb-bufferedPost");
    }
    post.element.classList.remove("urb-bufferedPost");
    post.commentButton.classList.add("urb-activeCommentButton");
    post.element.classList.add("urb-activePost");
  }

  // CommentsContainer-related
  styleCommentsContainerComments() {
    var comments = this.page.commentsContainer.querySelectorAll(".comment");

    comments.forEach((comment) => {
      comment.classList.add("urb-black");
    });

    comments.forEach((topComment) => {
      topComment.classList.add("urb-individualComment");
      let childThread = topComment.querySelector(".child");

      if (
        childThread?.childNodes[0]?.childNodes !== undefined &&
        childThread?.childNodes[0]?.childNodes !== null
      ) {
        var childComments = childThread.childNodes[0].childNodes;

        childComments.forEach((comment) => {
          if (comment.classList.contains("comment")) {
            if (topComment.classList.contains("urb-black")) {
              comment.classList.add("urb-white");
              comment.classList.remove("urb-black");
            }
          }
        });
      }
    });

    var pElements = this.page.commentsContainer.getElementsByTagName("p");

    for (let i = 0; i < pElements.length; i++) {
      pElements[i].classList.add("urb-paddingStyle");
    }
  }

  styleCommentsContainerPost(postCopy) {
    // Add the desired styles to postCopy
    if (postCopy.querySelector(".expando-button")) {
      postCopy.querySelector(".expando-button").remove();
    }
    postCopy.classList.add("urb-postCopy");
  }

  displayLoadingMessage() {
    this.page.commentsWrapper.innerHTML = "";
    this.page.commentsWrapper.appendChild(this.page.loadingMessage);
  }

  // KeyboardManager
  scrollToPost(post) {
    const top = post.element.getBoundingClientRect().top + window.pageYOffset - 5;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  scrollToComment(comment) {
    const commentsWrapperRect = this.page.commentsWrapper.getBoundingClientRect();
    const commentRect = comment.element.getBoundingClientRect();

    const top =
      commentRect.top - commentsWrapperRect.top + this.page.commentsWrapper.scrollTop - 10;
    this.page.commentsWrapper.scrollTo({ top: top, behavior: "smooth" });
  }

  // Miscelaneous
  toggleCommentsContainer(toggle) {
    if (toggle == true) {
      this.showComments();
    } else {
      this.hideComments();
    }
  }

  setStyles() {
    const containerTop = this.page.container.getBoundingClientRect().top;

    this.page.commentsContainer.style.top = "70px";
    this.page.handle.style.top = "70px";
    this.page.closeButton.style.top = "100px";
  }

  detectAndApplyTheme() {
    const darkThemeClass = "res-nightmode";

    const isDarkTheme =
      document.documentElement.classList.contains(darkThemeClass) ||
      document.body.classList.contains(darkThemeClass);

    if (isDarkTheme) {
      this.applyTheme(true);
    } else {
      this.applyTheme(false);
    }
  }

  applyTheme(darkTheme) {
    document.body.classList.toggle("urb-dark", darkTheme);
    document.body.classList.toggle("urb-light", !darkTheme);
  }
}
