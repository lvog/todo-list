class Todo {
  constructor(selector) {
    this.holder = document.querySelector(selector);
    this.form = null;
    this.search = null;
    this.select = null;
    this.textNote = null;
    this.notesHolder = null;
    this.noteTemplate = null;
    this.notes = [];
    this.filterNotes = [];
    this.filterCategory = "all";
    this.editNoteId = 0;
    this.popup = null;
  }

  init() {
    if (!this.holder) return;
    this.findElements();
    this.loadNotes();
    this.initPopup();
    this.handleSubmit();
    this.handleCheckboxChange();
    this.handleDeleteNote();
    this.initFiltration();
    this.handleSearch();
    this.handleAnimateObserver();
  }

  findElements() {
    this.form = this.holder.querySelector(".todo-form");
    this.search = this.holder.querySelector(".search");
    this.select = this.holder.querySelector("#filter");
    this.textNote = this.holder.querySelector(".note-info");
    this.notesHolder = this.holder.querySelector(".notes-holder");
    this.popup = this.holder.querySelector(".popup");
    this.noteTemplate = this.holder.querySelector("#note-template");
  }

  loadNotes() {
    const currentNotes = localStorage.getItem("notes");

    if (!currentNotes) return;

    this.notes = JSON.parse(currentNotes);
    this.filterNotes = [...this.notes];

    if (this.notes.length > 0) {
      this.notes.forEach(({ id, value, checked }) => {
        this.addNote(id, value, checked);
      });
    } else {
      this.addImage();
    }
  }

  handleSearch() {
    this.search.addEventListener("input", (e) => {
      const value = e.target.value.trim().toLowerCase();

      const searchResult = this.filterNotes.filter((note) =>
        note.value.toLowerCase().includes(value),
      );

      if (searchResult.length > 0) {
        this.clearNotesDOM();
        searchResult.forEach(({ id, value, checked }) => {
          this.addNote(id, value, checked);
        });
      } else {
        this.clearNotesDOM();
        this.addImage();
      }
    });
  }

  handleSubmit() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = this.textNote.value.trim();

      if (!value) return;

      this.addClass(this.notesHolder, "is-animate");
      this.editNoteId
        ? this.editNote(this.editNoteId, value)
        : this.addNewNote(value);

      this.form.reset();
      this.removeClass(document.body, "popup-active");
      this.editNoteId = 0;
    });
  }

  handleCheckboxChange() {
    this.notesHolder.addEventListener("change", (e) => {
      const checkbox = e.target.closest("input[type='checkbox']");

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

      this.addClass(this.notesHolder, "is-animate");
      const note = btn.closest(".note");
      const noteId = Number(
        note.querySelector("input[type='checkbox']").getAttribute("id"),
      );

      note.remove();
      this.removeNoteFromStorage(noteId);

      if (this.notes.length < 1) {
        this.addImage();
      }
    });
  }

  handleAnimateObserver() {
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        this.removeClass(this.notesHolder, "is-animate");
      }, 100);
    });

    observer.observe(this.notesHolder, {
      childList: true,
      subtree: true,
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
    const id = Date.now();

    this.addNote(id, value);
    this.addNoteToStorage(id, value);
  }

  addNote(id, value, checked = false) {
    const newNote = this.noteTemplate.content.cloneNode(true);

    const note = newNote.querySelector(".note");
    const labelHolder = newNote.querySelector("label");
    const checkbox = newNote.querySelector("input");
    const label = newNote.querySelector(".label");

    note.className = !checked ? "note" : "note checked";
    labelHolder.setAttribute("for", id);
    checkbox.id = id;
    checkbox.value = value;
    checkbox.checked = checked;
    label.textContent = value;

    this.removeImage();
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
        const checkbox = note.querySelector("input[type='checkbox']");

        this.editNoteId = Number(checkbox.getAttribute("id"));
        this.textNote.value = checkbox.value;
      }

      this.addClass(document.body, "popup-active");
    });

    this.form.addEventListener("reset", () => {
      this.removeClass(document.body, "popup-active");
    });

    this.popup.addEventListener("click", (e) => {
      const isPopup = e.target.closest(".popup-block");

      if (!isPopup) {
        this.removeClass(document.body, "popup-active");
      }
    });
  }

  addClass(el, className) {
    el.classList.add(className);
  }

  removeClass(el, className) {
    el.classList.remove(className);
  }

  initFiltration() {
    this.select.addEventListener("change", (e) => {
      this.filterCategory = e.target.value;
      this.renderNotes();
    });
  }

  renderNotes() {
    this.addClass(this.notesHolder, "is-animate");
    this.filterNotes = this.filter();
    this.clearNotesDOM();

    if (this.filterNotes.length > 0) {
      this.filterNotes.forEach(({ id, value, checked }) => {
        this.addNote(id, value, checked);
      });
    } else {
      this.addImage();
    }

    this.search.value = "";
  }

  filter() {
    switch (this.filterCategory) {
      case "completed":
        return this.notes.filter((note) => note.checked);
      case "active":
        return this.notes.filter((note) => !note.checked);
      default:
        return this.notes;
    }
  }

  clearNotesDOM() {
    this.notesHolder.innerHTML = "";
  }

  addImage() {
    const img = document.createElement("img");
    img.classList.add("main-img");
    img.src = "images/empty.svg";
    img.alt = "Detective check footprint";

    this.notesHolder.appendChild(img);
  }

  removeImage() {
    const img = this.notesHolder.querySelector(".main-img");
    if (img) {
      img.remove();
    }
  }
}

const todo = new Todo(".todo-block");

document.addEventListener("DOMContentLoaded", () => {
  todo.init();
});
