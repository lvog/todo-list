class Todo {
  constructor(selector) {
    this.holder = document.querySelector(selector);
    this.textNote = null;
    this.notesHolder = null;
    this.notes = [];
    this.id = 0;
  }

  init() {
    if (!this.holder) return console.log("There is no such element!");
    this.findElements();
    this.loadNotes();
    this.handleSubmit();
    this.handleCheckboxChange();
    this.handleDeleteNote();
  }

  findElements() {
    this.textNote = this.holder.querySelector(".note-info");
    this.notesHolder = this.holder.querySelector(".notes-holder");
  }

  loadNotes() {
    const currentNotes = localStorage.getItem("notes");

    if (!currentNotes) return;

    this.notes = JSON.parse(currentNotes);
    this.id = this.notes.reduce((max, obj) => (obj.id > max ? obj.id : max), 0);

    this.notes.forEach((note) => {
      const { id, value, checked } = note;
      this.addNote(id, value, checked);
    });
  }

  handleSubmit() {
    this.holder.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = this.textNote.value.trim();

      if (!value) return;

      this.id += 1;
      this.addNote(this.id, value);
      this.addNoteToStorage(this.id, value);
      this.holder.reset();
    });
  }

  handleCheckboxChange() {
    this.notesHolder.addEventListener("change", (e) => {
      const checkbox = e.target.closest('input[type="checkbox"]');

      if (!checkbox) return;

      const note = e.target.closest(".note");
      const noteId = Number(checkbox.getAttribute("id"));

      note.classList.toggle("checked", checkbox.checked);

      this.updateNoteInStorage(noteId, checkbox.checked);
    });
  }

  handleDeleteNote() {
    this.notesHolder.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");

      if (!btn) return;

      const note = btn.closest(".note");
      const noteId = Number(
        note.querySelector("input[type='checkbox']").getAttribute("id"),
      );

      note.remove();
      this.removeNoteFromStorage(noteId);
    });
  }

  updateNoteInStorage(id, checked) {
    const note = this.notes.find((note) => note.id === id);

    if (note) {
      note.checked = checked;
    }

    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  addNoteToStorage(id, value, checked = false) {
    const note = { id: id, value: value, checked };

    this.notes.push(note);
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  removeNoteFromStorage(id) {
    this.notes = this.notes.filter((note) => note.id !== id);
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  addNote(id, value, checked = false) {
    const newNote = document.createElement("div");
    const noteClass = !checked ? "note" : "note checked";

    newNote.className = noteClass;
    newNote.innerHTML = `
    <label for="${id}">
      <input type="checkbox" id="${id}" name="todo-notes" value="${value}" ${checked ? "checked" : ""}>
      <span class="checkmark"></span>
      ${value}
    </label>
    <button class="btn-delete" type="button">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
      </svg>
    </button>
    `;
    this.notesHolder.appendChild(newNote);
  }
}

const todo = new Todo(".todo-form");

document.addEventListener("DOMContentLoaded", () => {
  todo.init();
});
