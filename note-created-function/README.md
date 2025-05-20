# NoteSync - logNoteCreated Cloud Function

This Cloud Function serves as a serverless component for the NoteSync application. It receives notifications whenever a note is created and logs these events.

## Purpose

- Demonstrate integration of Google Cloud Functions with NoteSync
- Provide audit logging for note creation events
- Serve as a lightweight external service integration example

## Function Details

- **Runtime**: Node.js 18
- **Trigger Type**: HTTP
- **Authentication**: Unauthenticated (for demo purposes)

## API

### Endpoint

`POST https://europe-west2-[PROJECT_ID].cloudfunctions.net/logNoteCreated`

### Request Format

```json
{
  "title": "Note Title",
  "timestamp": "2023-05-15T14:30:00.000Z"
}
```

### Response

```json
{
  "success": true,
  "message": "Note creation logged successfully",
  "data": {
    "title": "Note Title",
    "timestamp": "2023-05-15T14:30:00.000Z",
    "logged_at": "2023-05-15T14:30:01.234Z"
  }
}
```

## Deployment

Deploy using the following command:

```bash
gcloud functions deploy logNoteCreated \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --region europe-west2
```

## Viewing Logs

```bash
gcloud functions logs read logNoteCreated --region=europe-west2
```
