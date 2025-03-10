const { addNote, getAllNotes, getNoteById, updateNote, deleteNote } = require('../functions/notes');
const request = require('supertest');
const app = require('../server');

describe('Notes', () => {
    it('should add a new note', () => {
        const note = addNote('Test Title', 'Test Content');
        expect(note).toHaveProperty('id');
        expect(note.title).toBe('Test Title');
        expect(note.content).toBe('Test Content');
    });

    it('should retrieve all notes', () => {
        addNote('Title 1', 'Content 1');
        addNote('Title 2', 'Content 2');
        const notes = getAllNotes();
        expect(notes).toHaveLength(3);
    });

    it('should retrieve a note by ID', () => {
        const note = addNote('Title', 'Content');
        const retrievedNote = getNoteById(note.id);
        expect(retrievedNote).toEqual(note);
    });

    it('should update a note', () => {
        const note = addNote('Old Title', 'Old Content');
        const updatedNote = updateNote(note.id, 'New Title', 'New Content');
        expect(updatedNote.title).toBe('New Title');
        expect(updatedNote.content).toBe('New Content');
    });

    it('should delete a note', () => {
        const note = addNote('Title', 'Content');
        const deletedNote = deleteNote(note.id);
        expect(deletedNote).toEqual(note);
        expect(getNoteById(note.id)).toBeUndefined();
    });

    it('should return null when updating a non-existent note', () => {
        const updatedNote = updateNote(999, 'New Title', 'New Content');
        expect(updatedNote).toBeUndefined();
    });

    it('should return null when deleting a non-existent note', () => {
        const deletedNote = deleteNote(999);
        expect(deletedNote).toBeNull();
    });
});

describe('Notes API', () => {
    it('should retrieve all notes', async () => {
        const response = await request(app).get('/notes');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should add a new note', async () => {
        const newNote = { title: 'Test Title', content: 'Test Content' };
        const response = await request(app).post('/notes').send(newNote);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newNote.title);
        expect(response.body.content).toBe(newNote.content);
    });

    it('should return 400 if title or content is missing when adding a note', async () => {
        const response = await request(app).post('/notes').send({ title: 'Test Title' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Title and content are required');
    });

    it('should retrieve a note by ID', async () => {
        const newNote = { title: 'Test Title', content: 'Test Content' };
        const addResponse = await request(app).post('/notes').send(newNote);
        const response = await request(app).get(`/notes/${addResponse.body.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(addResponse.body);
    });

    it('should return 404 if note is not found by ID', async () => {
        const response = await request(app).get('/notes/999');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Note not found');
    });

    it('should update a note', async () => {
        const newNote = { title: 'Old Title', content: 'Old Content' };
        const addResponse = await request(app).post('/notes').send(newNote);
        const updatedNote = { title: 'New Title', content: 'New Content' };
        const response = await request(app).put(`/notes/${addResponse.body.id}`).send(updatedNote);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updatedNote.title);
        expect(response.body.content).toBe(updatedNote.content);
    });

    it('should return 404 if note to update is not found', async () => {
        const updatedNote = { title: 'New Title', content: 'New Content' };
        const response = await request(app).put('/notes/999').send(updatedNote);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Note not found');
    });

    it('should delete a note', async () => {
        const newNote = { title: 'Test Title', content: 'Test Content' };
        const addResponse = await request(app).post('/notes').send(newNote);
        const response = await request(app).delete(`/notes/${addResponse.body.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Note deleted');
        expect(response.body.deletedNote).toEqual(addResponse.body);
    });

    it('should return 404 if note to delete is not found', async () => {
        const response = await request(app).delete('/notes/999');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Note not found');
    });
});