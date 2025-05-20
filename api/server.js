const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();

// Cloud Function URL
const LOG_NOTE_CREATED_URL = "https://europe-west2-notesync-project.cloudfunctions.net/logNoteCreated";

// In-memory store for notes
const notes = [
  { id: 1, title: "Demo note from container", content: "This is a sample note", user_id: "demo-user", username: "demo", timestamp: new Date().toISOString() }
];
let nextId = 2;

// Middleware
app.use(bodyParser.json());

// Authentication middleware (simplified)
const auth = (req, res, next) => {
  // This is a simplified auth for testing
  // In real app, you'd verify tokens, etc.
  req.user = { id: "demo-user", username: "demo" };
  next();
};

// Routes
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  // Simple mock auth
  if (username && password) {
    return res.json({ token: "mock-token", user: { id: "demo-user", username } });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// Get all notes
app.get('/api/notes', (req, res) => {
  res.json(notes);
});

// Get user notes
app.get('/api/notes/user', auth, (req, res) => {
  const userNotes = notes.filter(note => note.user_id === req.user.id);
  res.json(userNotes);
});

// Create note
app.post('/api/notes', auth, (req, res) => {
  const { title, content } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: "Title is required" });
  }
  
  const newNote = {
    id: nextId++,
    title: title.trim(),
    content: content || '',
    user_id: req.user.id,
    username: req.user.username,
    timestamp: new Date().toISOString()
  };
  
  notes.push(newNote);
  
  // Call the Cloud Function to log the note creation
  try {
    fetch(LOG_NOTE_CREATED_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newNote.title,
        timestamp: newNote.timestamp
      })
    }).catch(err => {
      console.error("Failed to log note creation:", err);
    });
    // Non-blocking - we don't wait for the response
  } catch (error) {
    console.error("Error calling Cloud Function:", error);
  }
  
  res.status(201).json(newNote);
});

// Update note
app.put('/api/notes/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  
  const noteIndex = notes.findIndex(note => note.id === id && note.user_id === req.user.id);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: "Note not found" });
  }
  
  if (title) notes[noteIndex].title = title;
  if (content !== undefined) notes[noteIndex].content = content;
  
  res.json(notes[noteIndex]);
});

// Delete note
app.delete('/api/notes/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const noteIndex = notes.findIndex(note => note.id === id && note.user_id === req.user.id);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: "Note not found" });
  }
  
  notes.splice(noteIndex, 1);
  res.status(204).send();
});

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log('API listening on port', process.env.PORT || 3000);
});
