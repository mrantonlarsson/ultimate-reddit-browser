export class Comment {
  constructor(id, element) {
    this.id = id;
    this.element = element;
    this.isSelected = false;
    this.expando = this.element.querySelector(".expand");
    this.isExpanded = true;
  }

  select() {
    this.isSelected = true;
    this.element.style.borderColor = "white";
  }

  unselect() {
    this.isSelected = false;
    this.element.style.borderColor = "";
  }

  toggleExpandComment() {
    this.expando.click();
  }
}
