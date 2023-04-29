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
  }

  unselect() {
    this.isSelected = false;
  }

  toggleExpandComment() {
    this.expando.click();
  }
}
