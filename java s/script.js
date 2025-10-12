document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note');
    const addBtn = document.getElementById('addNote');
    const clearBtn = document.getElementById('clearNotes');
    const notesList = document.getElementById('notesList');

    // Load notes from localStorage
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notesList.innerHTML = '';
        notes.forEach((note, index) => {
            const li = document.createElement('li');
            li.textContent = note;
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.style.marginLeft = '10px';
            delBtn.addEventListener('click', () => {
                deleteNote(index);
            });
            li.appendChild(delBtn);
            notesList.appendChild(li);
        });
    }

    // Add note
    function addNote() {
        const note = noteInput.value.trim();
        if (note === '') {
            alert('Please enter a note');
            return;
        }
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        noteInput.value = '';
        loadNotes();
    }

    // Delete note by index
    function deleteNote(index) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }

    // Clear all notes
    function clearNotes() {
        if (confirm('Are you sure you want to clear all notes?')) {
            localStorage.removeItem('notes');
            loadNotes();
        }
    }

    addBtn.addEventListener('click', addNote);
    clearBtn.addEventListener('click', clearNotes);

    loadNotes();
});
