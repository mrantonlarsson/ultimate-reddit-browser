export class UIManager {
  constructor(page, oldReddit) {
    this.page = page;
    this.ratio = 0.6;
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
    this.page.loadingMessage.classList.add("loadingMessage");
    this.page.closeButton.classList.add("closeButton");
    this.page.postsContainer.classList.add("postsContainer");
    this.page.container.classList.add("container");
    this.page.commentsContainer.classList.add("commentsContainer");
    this.page.handle.classList.add("rcb-handle");
    this.page.handle.classList.add("smooth-transition");
    this.page.commentsWrapper.classList.add("commentsWrapper");
    this.page.postWrapper.classList.add("postWrapper");

    //this.page.handle.style.height = this.page.commentsContainer.style.height;
    //console.log(this.page.commentsContainer.style.height);
    this.page.handle.style.borderRadius = "5px";

    this.page.commentsContainer.appendChild(this.page.closeButton);

    this.page.commentsContainer.style.display = "none";
    this.page.handle.style.display = "none";

    this.page.loadingMessage.innerHTML = "Loading comments...";
    this.page.loadingMessage.style.display = "block";
    this.page.closeButton.innerHTML = "X";

    // Set containerPostComments styles
    this.page.commentsContainer.style.flexDirection = "column";

    this.placeElements();

    // document.getElementById('themeSwitcher').addEventListener('click', function() {
    //   const body = document.body;
    //   if(body.classList.contains('dark')) {
    //     body.classList.remove('dark');
    document.body.classList.add("dark");
    //   } else {
    //     body.classList.remove('light');
    //     body.classList.add('dark');
    //   }
    // });
  }

  placeElements() {
    // Insert the handle div as the second child of the container element
    this.page.container.insertBefore(this.page.handle, this.page.container.children[1]);

    // Insert the comments div as the third child of the container element
    this.page.container.insertBefore(this.page.commentsContainer, this.page.container.children[2]);

    this.page.commentsContainer.appendChild(this.page.postWrapper);
    this.page.commentsContainer.appendChild(this.page.commentsWrapper);
  }

  updateContainerWidths() {
    // Calculate the new widths of the posts and sidebar elements based on the mouse position
    let newPostsWidth = this.ratio * this.containerWidth;

    newPostsWidth = Math.min(newPostsWidth, 0.6 * this.containerWidth);
    newPostsWidth = Math.max(newPostsWidth, 0.4 * this.containerWidth);

    let newCommentsWidth = this.containerWidth - newPostsWidth;

    // Set the widths of the posts and comments elements
    this.page.postsContainer.style.width = `${newPostsWidth - 5}px`;
    this.page.commentsContainer.style.width = `${newCommentsWidth - 10}px`;
    this.page.handle.style.right = `${newCommentsWidth - 5}px`;
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
          this.ratio = 0.4;
        }
      } else {
        this.ratio = 0.4;
      }
    });
  }

  showComments() {
    this.updateContainerWidths();
    this.page.commentsContainer.style.display = "flex";
    this.page.handle.style.display = "block";
    this.hideSidebar();
    this.page.commentsContainerToggle = true;
  }

  hideSidebar() {
    this.page.sidebar.style.display = "none";
    if (
      this.page.menuarea?.style?.display !== null &&
      this.page.container.contains(this.page.menuarea)
    ) {
      this.page.menuarea.style.display = "none";
    }
  }

  hideComments() {
    this.page.commentsContainer.style.display = "none";
    this.page.handle.style.display = "none";
    this.page.postsContainer.style.width = "auto";
    this.showSidebar();
    this.page.commentsContainerToggle = false;
  }

  showSidebar() {
    this.page.sidebar.style.display = "block";
    if (
      this.page.menuarea?.style?.display !== null &&
      this.page.container.contains(this.page.menuarea)
    ) {
      this.page.menuarea.style.display = "block";
    }
  }

  // Post-related
  setupPost(post) {
    if (post.commentButton) {
      post.commentButton.classList.add("smooth-transition");
    }

    post.element.classList.add("smooth-transition");

    this.page.commentsWrapper.appendChild(this.page.loadingMessage);
    this.page.loadingMessage.innerHTML = `Loading comments...`;
  }

  toggleActivePost(post) {
    // If another comment has been hovered
    if (this?.page.lastPost !== null) {
      this.page.lastPost.commentButton.classList.remove("activeCommentButton");
      this.page.lastPost.element.classList.remove("activePost");
      this.page.lastPost.element.classList.add("bufferedPost");
    }
    post.element.classList.remove("bufferedPost");
    post.commentButton.classList.add("activeCommentButton");
    post.element.classList.add("activePost");
  }

  // CommentsContainer-related
  styleCommentsContainerComments() {
    var comments = this.page.commentsContainer.querySelectorAll(".comment");

    comments.forEach((comment) => {
      comment.classList.add("black");
    });

    comments.forEach((topComment) => {
      topComment.classList.add("individualComment");
      let childThread = topComment.querySelector(".child");

      if (
        childThread?.childNodes[0]?.childNodes !== undefined &&
        childThread?.childNodes[0]?.childNodes !== null
      ) {
        var childComments = childThread.childNodes[0].childNodes;

        childComments.forEach((comment) => {
          if (comment.classList.contains("comment")) {
            if (topComment.classList.contains("black")) {
              comment.classList.add("white");
              comment.classList.remove("black");
            }
          }
        });
      }
    });

    var pElements = this.page.commentsContainer.getElementsByTagName("p");

    for (let i = 0; i < pElements.length; i++) {
      pElements[i].classList.add("paddingStyle");
    }
  }

  styleCommentsContainerPost(postCopy) {
    // Add the desired styles to postCopy
    if (postCopy.querySelector(".expando-button")) {
      postCopy.querySelector(".expando-button").remove();
    }
    postCopy.classList.add("postCopy");
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

    this.page.commentsContainer.style.top = `${containerTop}px`;
    this.page.handle.style.top = `${containerTop}px`;
    this.page.closeButton.style.top = `${containerTop + 10}px`;
  }
}
