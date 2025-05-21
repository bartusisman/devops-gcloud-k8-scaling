# NoteSync – Cloud-Native Architecture

A fully-integrated cloud-native note synchronization service built on Google Cloud Platform with containerized API, serverless functions, and automated load testing.

## Features

- **Containerized API**: Express.js backend running in Google Kubernetes Engine (GKE) with Horizontal Pod Autoscaling (HPA)
- **Serverless Auditing**: Cloud Function that automatically logs note creation events
- **Load Testing**: Dedicated Compute Engine VM running Locust for performance simulation
- **Scalable Architecture**: Handles traffic spikes with auto-scaling Kubernetes pods
- **Real-time Metrics**: Comprehensive performance statistics captured during load tests

## Architecture Diagram

```mermaid
graph LR
    Client[Mobile Client] -->|HTTP| LB[LoadBalancer IP: 35.189.72.248]
    LB --> GKE[GKE Deployment: notesync]
    GKE --> Pods[Pod(s)]
    GKE -->|Triggers| CF[GCF: noteCreatedHandler]
    VM[Locust VM] -->|Load Tests| LB
```

## Repository Structure

```
NoteSync/
├── api/                  # Express API code
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── load-tests/          # Locust test suite and result CSVs
│   ├── locustfile.py
│   ├── notesync-load_stats.csv
│   ├── notesync-load_failures.csv
│   ├── notesync-load_stats_history.csv
│   └── notesync-load_exceptions.csv
├── note-created-function/ # Cloud Function for note creation events
│   ├── index.js
│   ├── package.json
│   └── README.md
├── kubernetes/          # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
└── README.md
```

## Quick Start

### Prerequisites

- Google Cloud SDK (`gcloud`) installed and initialized
- Docker installed locally
- Git client
- GCP project with billing enabled (`cs436-project-459822`)
- Basic knowledge of Kubernetes and GCP services

### A — Build & Push API image

```bash
cd api
gcloud builds submit \
  --tag europe-west2-docker.pkg.dev/cs436-project-459822/notesync-repo/notesync:v4 .
```

The version tag (`v4`) is incremented to ensure Kubernetes recognizes this as a new deployment image.

### B — Deploy / Roll out on GKE

For first-time setup:

```bash
gcloud container clusters create notesync-cluster \
  --region europe-west2 --num-nodes=2 --enable-autoscaling \
  --min-nodes=2 --max-nodes=5      # allows scaling during traffic spikes
gcloud container clusters get-credentials notesync-cluster --region europe-west2
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/hpa.yaml
```

For updates to an existing deployment:

```bash
gcloud container clusters get-credentials notesync-cluster --region europe-west2
kubectl set image deployment/notesync \
  notesync=europe-west2-docker.pkg.dev/cs436-project-459822/notesync-repo/notesync:v4
kubectl rollout status deployment/notesync
```

### C — Verify LoadBalancer

```bash
kubectl get svc notesync
```

Expected output:

```
NAME       TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)  AGE
notesync   LoadBalancer   34.118.226.195   35.189.72.248   80/TCP   6h
```

Test the API:

```bash
curl http://35.189.72.248/api/notes
```

You should receive a JSON response:

```json
[{ "id": 1, "title": "Demo note from container" }]
```

Here’s an updated **README.md** excerpt that walks through spinning up a VM, cloning your repo, and running the Locust tests exactly as you’ve done:

````markdown

### D — Provisioning & Preparing a Test VM

The idea here is to simulate running the load‐test from “another device,” just like a real user would.

1. **Create a VM** (e.g. on Google Cloud):

   ```bash
   gcloud compute instances create locust-vm \
     --zone=us-central1-a \
     --machine-type=e2-medium \
     --tags=http-server
````

2. **SSH into your VM** and install the basics:

   ```bash
   gcloud compute ssh locust-vm --zone=us-central1-a
   sudo apt update && sudo apt install -y python3 python3-venv git
   ```

3. **Clone your NoteSync repo** and set up Python:

   ```bash
   git clone https://github.com/bartusisman/NoteSync
   cd NoteSync
   python3 -m venv load-tests/locust-env
   source load-tests/locust-env/bin/activate
   pip install locust requests or sudo apt-get install kubectl
   ```

---

### E — Setting Up Locust Tests

At the top of the locustfile.py set these:

```
SUPABASE_URL="https://your-supabase-url.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

HOST="http://YOUR.LB.IP.ADDRESS"
```

Also in run_scripts.sh add ur external ip of load balancer too

> **Tip:** To grab your LoadBalancer’s external IP, run:
>
> ```bash
> kubectl get svc notesync -n default
> ```

Remember u wont be able to have a valid cpu_usage.csv in VM because u cant
sign into your gcloud in VM. If you also want to monitor ur cpu usage as a csv
run this run_scripts.sc in your local device too
---

## F — Run the Load Test

From **within** the VM, with your venv activated and `.env` in place:
You can run the custom run_tests.sh scrip that i implemented it runs 4 tests
saves their stats under folders 1 2 3 4 we have info like cpu_usage also 

```bash
cd ~/NoteSync/load-tests
source locust-env/bin/activate

chmod +x run_tests.sh
./run_tests.sh

```

````markdown
## G — Deploying & Scheduling the `note-created` Cloud Function

To power our in-app notifications (so that whenever someone creates a note, clients get notified), we’ve packaged a small Node.js “poller” into a Google Cloud Function and wired it up on a schedule.

### 1. Folder structure

```text
note-created-function/
├── index.js
├── package.json
└── README.md
````

### 2. index.js

```js
// note-created-function/index.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// This handler is triggered on each HTTP invocation by Cloud Scheduler.
// It pulls any notes created since the last run,
// emits notifications (e.g. via WebSocket, FCM, etc.), and updates state.
exports.fetchNewNotes = async (req, res) => {
  try {
    // 1) Load the timestamp of the last poll (you might store this in Firestore, Redis, etc.)
    const lastPoll = /* your logic here */;

    // 2) Fetch notes newer than lastPoll
    const { data: newNotes, error } = await supabase
      .from('notes')
      .select('*')
      .gt('timestamp', lastPoll);

    if (error) throw error;

    // 3) For each new note, send a notification
    for (const note of newNotes) {
      // e.g. pushViaFCM(note) or broadcastWS(note)
    }

    // 4) Update your saved lastPoll timestamp to now
    /* your logic here */

    res.status(200).send(`Notified ${newNotes.length} new notes.`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
```

### 3. package.json

```json
{
  "name": "note-created-function",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0"
  }
}
```

### 4. Deploy to Cloud Functions

```bash
cd note-created-function

gcloud functions deploy fetchNewNotes \
  --entry-point=fetchNewNotes \
  --runtime=nodejs18 \
  --trigger-http \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars=\
SUPABASE_URL="https://your-supabase-url.supabase.co",\
SUPABASE_SERVICE_KEY="your-service-role-key"
```

> **Note:** Use your Supabase **service\_role** key here so the function can read all rows.

### 5. Wire up Cloud Scheduler

Every 5 seconds (or whatever cadence you prefer), hit your function:

```bash
gcloud scheduler jobs create http note-created-poll \
  --schedule="*/5 * * * *" \
  --time-zone="UTC" \
  --uri="https://us-central1-<YOUR_PROJECT>.cloudfunctions.net/fetchNewNotes" \
  --http-method=GET


```
```



