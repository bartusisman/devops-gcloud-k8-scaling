/**
 * HTTP Cloud Function for NoteSync Application.
 * Triggered by HTTP request from NoteSync backend after note creation.
 * 
 * Purpose: Audit logging of note creations - demonstrates Cloud Functions integration
 * Also powers the real-time notification system
 */
exports.logNoteCreated = (req, res) => {
  // Set CORS headers for cross-origin requests
  res.set('Access-Control-Allow-Origin', '*');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }
  
  // Handle actual request
  const { title, timestamp, username, noteId } = req.body;

  // Validate inputs
  if (!title || !timestamp) {
    console.error('Missing required fields');
    res.status(400).send('Missing required fields: title and/or timestamp');
    return;
  }

  // Log the note creation event (this will appear in Cloud Function logs)
  console.log(`[NOTE CREATED] "${title}" by @${username || 'anonymous'} at ${timestamp}`);
  
  // Return success response with enhanced notification data
  res.status(200).json({
    success: true,
    message: 'Note creation logged successfully',
    notification: { 
      id: noteId || `note-${new Date().getTime()}`,
      title, 
      timestamp, 
      username: username || 'anonymous',
      logged_at: new Date().toISOString(),
      type: 'note_created'
    }
  });
}; 