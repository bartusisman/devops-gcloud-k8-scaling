/**
 * HTTP Cloud Function for NoteSync Application.
 * Triggered by HTTP request from NoteSync backend after note creation.
 * 
 * Purpose: Audit logging of note creations - demonstrates Cloud Functions integration
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
  const { title, timestamp } = req.body;

  // Validate inputs
  if (!title || !timestamp) {
    console.error('Missing required fields');
    res.status(400).send('Missing required fields: title and/or timestamp');
    return;
  }

  // Log the note creation event (this will appear in Cloud Function logs)
  console.log(`[NOTE CREATED] "${title}" at ${timestamp}`);
  
  // Return success response
  res.status(200).json({
    success: true,
    message: 'Note creation logged successfully',
    data: { title, timestamp, logged_at: new Date().toISOString() }
  });
}; 