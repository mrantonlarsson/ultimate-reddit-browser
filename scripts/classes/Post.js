import { CommentsManager } from "./CommentsManager.js";

export class Post {
  constructor(id, element, page) {
    this.id = id;
    this.element = element;
    this.postCopy;
    this.page = page;
    this.commentsManager = new CommentsManager(this);
    this.expandoToggle = false;
    this.isLoadingComments = false;
    this.isSelected = false;

    if (this.page.uiManager.oldReddit) {
      this.commentButton = this.element.querySelector(".comments");
      this.title = this.element.querySelector(".title.may-blank");
      this.expandoButton = this.element.querySelector(".expando-button");
      // this.thumbnail = this.element.querySelector(".thumbnail");
    } else {
      this.commentButton = this.element.querySelector('[data-click-id="comments"]');
      this.title = this.element.querySelector('[data-click-id="image"]');
      this.expandoButton = this.element.querySelector('[data-click-id="expando_open"]');
      // this.thumbnail = this.element.querySelector('[data-click-id="image"]');
    }
    this.postCopy = this.element.cloneNode(true);
    this.postCopy.classList.remove("res-thing-filter-unprocessed");

    this.page.uiManager.styleCommentsContainerPost(this.postCopy);
    this.page.uiManager.setupPost(this);

    // Set event for commentButtons
    if (this.commentButton) {
      this.commentButton.addEventListener("mouseenter", (event) => {
        if (this.commentButton !== null) {
          this.onCommentsButtonHover(300, true);
        }
      });
    }

    if (this.commentButton) {
      this.commentButton.addEventListener("mouseleave", () => {
        // Clear the timeout if the user moves the mouse away before 500ms have passed
        clearTimeout(this.page.uiManager.timeoutId);
      });
    }
  }

  select() {
    this.isSelected = true;
  }

  unselect() {
    this.isSelected = false;
  }

  onCommentsButtonHover(timeout, displayComments) {
    // If this comment is already opened
    if (this.page.lastPost == this.element) {
      return;
    }

    // Clear the existing timeout before setting a new one
    clearTimeout(this.page.uiManager.timeoutId);

    this.page.uiManager.timeoutId = setTimeout(async () => {
      this.page.uiManager.toggleActivePost(this);
      // Update the current post id in the keyboard manager
      this.page.keyboardManager.setCurrentPostId(this.id);
      this.page.uiManager.toggleCommentsContainer(true);
      this.displayPost();
      this.page.currentPost = this.element;
      this.page.commentsWrapper.innerHTML = "";
      this.page.commentsWrapper.appendChild(this.page.loadingMessage);
      await this.commentsManager.getCommentsPage("").then(() => {
        if (displayComments == true) {
          this.commentsManager.displayComments();
        }
      });

      this.page.lastPost = this;

      // Scroll to the top of the comments element
      this.page.commentsWrapper.scrollTop = 0;

      const currentIndex = this.page.posts.findIndex((post) => post === this);
      this.page.bufferComments(currentIndex);
    }, timeout);
  }

  displayPost() {
    // Create a deep copy of the post element
    this.page.postWrapper.innerHTML = "";
    this.page.postWrapper.appendChild(this.postCopy);
  }
}
