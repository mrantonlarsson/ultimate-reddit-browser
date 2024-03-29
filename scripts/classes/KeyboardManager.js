export class KeyboardManager {
  constructor(page) {
    this.page = page;
    this.currentPostId = this.page.posts.length > 0 ? this.page.posts[0].id : null;
    this.currentCommentIndex = 0;
    this.currentPostIndex = 0;
    this.setup();
  }

  setup() {
    document.addEventListener("keydown", (event) => {
      if (event.metaKey) {
        // CMD key in MacOS
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            this.selectPreviousPost();
            break;
          case "ArrowDown":
            event.preventDefault();
            this.selectNextPost();
            break;
          default:
            break;
        }
      } else if (event.shiftKey) {
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            this.selectPreviousComment();
            break;
          case "ArrowDown":
            event.preventDefault();
            this.selectNextComment();
            break;
          default:
            break;
        }
      }
    });
  }

  setCurrentPostId(postId) {
    this.currentPostId = postId;
  }

  selectPreviousPost() {
    const currentPostIndex = this.page.posts.findIndex((post) => post.id === this.currentPostId);
    if (currentPostIndex > 0) {
      this.currentPostId = this.page.posts[currentPostIndex - 1].id;
      this.updateSelectedPost();
    }
  }

  selectNextPost() {
    const currentPostIndex = this.page.posts.findIndex((post) => post.id === this.currentPostId);
    if (currentPostIndex < this.page.posts.length - 1) {
      this.currentPostId = this.page.posts[currentPostIndex + 1].id;
      this.updateSelectedPost();
    }
  }

  updateSelectedPost() {
    const currentPost = this.page.posts.find((post) => post.id === this.currentPostId);

    if (this.page.lastPost) {
      let lastPostExpandoButton = this.page.lastPost.element.querySelector(".expando-button");
      if (
        lastPostExpandoButton &&
        this.isAttachedToDOM(lastPostExpandoButton) &&
        this.page.lastPost.expandoToggle == true
      ) {
        lastPostExpandoButton.click();
        this.page.lastPost.expandoToggle = false;
      }
    }

    let currentPostExpandoButton = currentPost.element.querySelector(".expando-button");
    if (currentPostExpandoButton && this.isAttachedToDOM(currentPostExpandoButton)) {
      if (currentPost.expandoToggle == false) {
        currentPostExpandoButton.click();
        currentPost.expandoToggle = true;
        this.page.uiManager.toggleActivePost(currentPost);
      }
    } else {
      this.page.uiManager.scrollToPost(currentPost);
      currentPost.onCommentsButtonHover(0, true);
    }

    this.page.lastPost = currentPost;
    this.currentCommentIndex = 0;
  }

  selectPreviousComment() {
    const currentPost = this.page.posts.find((post) => post.id === this.currentPostId);
    const commentThread = currentPost.commentsManager;

    if (this.currentCommentIndex === 1) {
      this.currentCommentIndex--;
      commentThread.unselectAllComments();
      this.page.commentsWrapper.scrollTo({ top: top, behavior: "smooth" });
    } else if (this.currentCommentIndex > 0) {
      this.currentCommentIndex--;
      this.updateSelectedComment();
      // commentThread[this.currentCommentIndex - 1].toggleExpandComment();
      this.page.uiManager.scrollToComment(commentThread.comments[this.currentCommentIndex - 1]);
      commentThread.unselectAllComments();
      commentThread.comments[this.currentCommentIndex - 1].select();
    }
  }

  selectNextComment() {
    const currentPost = this.page.posts.find((post) => post.id === this.currentPostId);
    const commentThread = currentPost.commentsManager.comments;

    if (this.currentCommentIndex < commentThread.length) {
      this.updateSelectedComment();
      if (this.currentCommentIndex == 0) {
        this.page.uiManager.scrollToComment(commentThread[this.currentCommentIndex]);
      } else {
        // commentThread[this.currentCommentIndex - 1].toggleExpandComment();
        this.page.uiManager.scrollToComment(commentThread[this.currentCommentIndex]);
      }
      this.currentCommentIndex++;
    }
  }

  updateSelectedComment() {
    if (this.currentCommentIndex >= 0) {
      const currentPost = this.page.posts.find((post) => post.id === this.currentPostId);
      const commentThread = currentPost.commentsManager;
      const currentComment = commentThread.comments[this.currentCommentIndex];

      commentThread.unselectAllComments();
      currentComment.select();
    }
  }
  isAttachedToDOM(element) {
    return document.body.contains(element);
  }
  setCurrentPostId(postId) {
    this.currentPostId = postId;
  }
}
