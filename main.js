class Todo {
  constructor(selector) {
    this.holder = document.querySelector(selector);
    this.form = null;
    this.textNote = null;
    this.notesHolder = null;
    this.notes = [];
    this.id = 0;
    this.editNoteId = 0;
    this.popup = null;
  }

  init() {
    if (!this.holder) return console.log("There is no such element!");
    this.findElements();
    this.loadNotes();
    this.initPopup();
    this.handleSubmit();
    this.handleCheckboxChange();
    this.handleDeleteNote();
  }

  findElements() {
    this.form = this.holder.querySelector(".todo-form");
    this.textNote = this.holder.querySelector(".note-info");
    this.notesHolder = this.holder.querySelector(".notes-holder");
    this.popup = this.holder.querySelector(".popup");
  }

  loadNotes() {
    const currentNotes = localStorage.getItem("notes");

    if (!currentNotes) return;

    this.notes = JSON.parse(currentNotes);
    this.id = this.notes.reduce((max, obj) => (obj.id > max ? obj.id : max), 0);

    this.notes.forEach(({ id, value, checked }) => {
      this.addNote(id, value, checked);
    });
  }

  handleSubmit() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = this.textNote.value.trim();

      if (!value) return;

      this.editNoteId
        ? this.editNote(this.editNoteId, value)
        : this.addNewNote(value);

      this.form.reset();
      this.closePopup();
      this.editNoteId = 0;
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
      const noteId = Number(note.querySelector("input").getAttribute("id"));

      note.remove();
      this.removeNoteFromStorage(noteId);
    });
  }

  updateNoteInStorage(id, checked) {
    const note = this.notes.find((note) => note.id === id);

    if (note) {
      note.checked = checked;
    }

    this.changeStorage(this.notes);
  }

  addNoteToStorage(id, value, checked = false) {
    const note = { id: id, value: value, checked };

    this.notes.push(note);
    this.changeStorage(this.notes);
  }

  removeNoteFromStorage(id) {
    this.notes = this.notes.filter((note) => note.id !== id);
    this.changeStorage(this.notes);
  }

  changeStorage(notes) {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  addNewNote(value) {
    this.id += 1;
    this.addNote(this.id, value);
    this.addNoteToStorage(this.id, value);
  }

  addNote(id, value, checked = false) {
    const newNote = document.createElement("div");
    const noteClass = !checked ? "note" : "note checked";

    newNote.className = noteClass;
    newNote.innerHTML = `
    <label for="${id}">
      <input type="checkbox" id="${id}" name="todo-notes" value="${value}" ${checked ? "checked" : ""}>
      <span class="checkmark"></span>
      <span class="label">${value}</span>
    </label>
    <button class="btn-edit popup-opener" type="button">
      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.17272 3.49106L0.5 10.1637V13.5H3.83636L10.5091 6.82736M7.17272 3.49106L9.5654 1.09837L9.5669 1.09695C9.8962 0.767585 10.0612 0.602613 10.2514 0.540824C10.4189 0.486392 10.5993 0.486392 10.7669 0.540824C10.9569 0.602571 11.1217 0.767352 11.4506 1.09625L12.9018 2.54738C13.2321 2.87769 13.3973 3.04292 13.4592 3.23337C13.5136 3.40088 13.5136 3.58133 13.4592 3.74885C13.3974 3.93916 13.2324 4.10414 12.9025 4.43398L12.9018 4.43468L10.5091 6.82736M7.17272 3.49106L10.5091 6.82736" 
          stroke="currentColor"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="btn-delete" type="button">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" 
          stroke="currentColor" 
          stroke-width="1" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
      </svg>
    </button>
    `;
    this.notesHolder.appendChild(newNote);
  }

  editNote(id, value) {
    this.updateNoteState(id, value);
    this.updateNoteDOM(id, value);
    this.changeStorage(this.notes);
  }

  updateNoteState(id, value) {
    const note = this.notes.find((note) => note.id === id);

    if (!note) return;

    note.value = value;
  }

  updateNoteDOM(id, value) {
    const checkbox = document.getElementById(id);
    const label = checkbox.closest(".note").querySelector(".label");

    checkbox.value = value;
    label.textContent = value;
  }

  initPopup() {
    this.holder.addEventListener("click", (e) => {
      const isOpenBtn = e.target.closest(".popup-opener");
      const isEditBtn = e.target.closest(".btn-edit");

      if (!isOpenBtn) return;

      if (isEditBtn) {
        const note = isEditBtn.closest(".note");
        const checkbox = note.querySelector("input");

        this.editNoteId = Number(checkbox.getAttribute("id"));
        this.textNote.value = checkbox.value;
      }

      this.openPopup();
    });

    this.form.addEventListener("reset", () => {
      this.closePopup();
    });

    this.popup.addEventListener("click", (e) => {
      const isPopup = e.target.closest(".popup-block");

      if (!isPopup) {
        this.closePopup();
      }
    });
  }

  openPopup() {
    document.body.classList.add("popup-active");
  }

  closePopup() {
    document.body.classList.remove("popup-active");
  }
}

const todo = new Todo(".todo-block");

document.addEventListener("DOMContentLoaded", () => {
  todo.init();
});
