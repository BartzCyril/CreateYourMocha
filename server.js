const express = require('express');
const app = express();
const {addNote,getAllNotes,getNoteById,updateNote, deleteNote} = require('./functions/notes')

app.use(express.json());

app.get('/notes', (req, res) => {
    res.json(getAllNotes());
});

app.post('/notes', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }
    const newNote = addNote(title, content);
    res.status(201).json(newNote);
});

app.get('/notes/:id', (req, res) => {
    const note = getNoteById(parseInt(req.params.id));
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
});

app.put('/notes/:id', (req, res) => {
    const { title, content } = req.body;
    const updatedNote = updateNote(parseInt(req.params.id), title, content);
    if (!updatedNote) return res.status(404).json({ error: "Note not found" });
    res.json(updatedNote);
});

app.delete('/notes/:id', (req, res) => {
    const deletedNote = deleteNote(parseInt(req.params.id));
    if (!deletedNote) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted", deletedNote });
});

if (require.main === module) {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;