import { Comment } from "./Comment.js";

export class CommentsManager {
  constructor(post) {
    this.post = post;
    this.commentsElement = null;
    this.comments = [];
  }

  unselectAllComments() {
    this.topLevelComments.forEach((comment) => {
      comment.isSelected = false;
    });
  }

  selectComment(commentId) {
    this.unselectAllComments();
    const commentToSelect = this.topLevelComments.find((comment) => comment.id === commentId);
    if (commentToSelect) {
      commentToSelect.isSelected = true;
    }
  }

  async getCommentsPage(options = "") {
    if (this.post.commentButton) {
      if (this?.commentsElement == null) {
        this.post.page.commentsWrapper.appendChild(this.post.page.loadingMessage);

        return new Promise((resolve, reject) => {
          // Create a new XMLHttpRequest object
          const xhr = new XMLHttpRequest();
          // Set the event listener for when the request finishes loading
          xhr.addEventListener("load", () => {
            // Parse the response text as HTML
            const doc = new DOMParser().parseFromString(xhr.responseText, "text/html");

            // Remove the loading message if it is a child of commentsWrapper
            if (this.post.page.commentsWrapper.contains(this.post.page.loadingMessage)) {
              this.post.page.commentsWrapper.removeChild(this.post.page.loadingMessage);
            }

            if (this.post.page.uiManager.oldReddit) {
              this.commentsElement = doc.querySelector(".commentarea");
              var children = this.commentsElement.querySelectorAll(".child");
              children.forEach((element) => {
                element.style.borderLeft = "0px";
              });
            } else {
              this.commentsElement = doc.querySelector(
                `.${this.post.element.classList[0]}`
              ).parentElement.lastChild;
            }
            resolve();
            this.post.element.classList.add("bufferedPost");
            const commentsElement = doc.querySelector(".sitetable.nestedlisting");
            const topLevelChildren = Array.from(commentsElement.children);
            this.comments = topLevelChildren
              .filter((child) => child.classList.contains("thing"))
              .map((child, index) => new Comment(index, child));
          });

          // Open the request to the comments URL
          xhr.open("GET", this.post.commentButton.getAttribute("href") + options);

          // Send the request
          xhr.send();
        });
      } else {
        return Promise.resolve();
      }
    }
  }

  displayComments() {
    if (
      this.commentsElement?.innerHTML !== undefined &&
      !this.post.page.commentsWrapper.contains(this.commentsElement)
    ) {
      this.post.page.commentsWrapper.innerHTML = "";
      this.post.page.commentsWrapper.appendChild(this.commentsElement);
      this.post.page.uiManager.styleCommentsContainerComments(this.post.page);
    }
  }

  unselectAllComments() {
    this.comments.forEach((comment) => {
      comment.unselect();
    });
  }

  selectComment(commentId) {
    this.unselectAllComments();
    const commentToSelect = this.comments.find((comment) => comment.id === commentId);
    if (commentToSelect) {
      commentToSelect.select();
    }
  }
}
