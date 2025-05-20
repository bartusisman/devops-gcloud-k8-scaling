
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

I’ve added a new step under **D — Provision Locust VM** to show how to upload your `locustfile.py` via a single `cat` command, and I’ve fleshed out the **E — Run load test** section to reference it. Here’s the updated excerpt from your `README.md`:

````markdown
### D — Provision Locust VM

Create a VM for load testing:

```bash
gcloud compute instances create locust-vm \
  --zone=europe-west2-b \
  --machine-type=e2-medium \
  --tags=locust \
  --metadata-from-file=startup-script=<(cat << 'EOF'
#!/bin/bash
apt update && apt install -y git python3-venv
git clone https://github.com/bartusisman/NoteSync.git
cd NoteSync/load-tests
python3 -m venv locust-env
source locust-env/bin/activate
pip install locust
EOF
)
````

Open an SSH session and **upload** the `locustfile.py`:

```bash
gcloud compute ssh locust-vm --zone=europe-west2-b

# In the VM’s shell:
cd ~/NoteSync/load-tests
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between
import random
import string
import json

class NoteSyncUser(HttpUser):
    wait_time = between(1, 3)
    
    # Storage for created note IDs so we can update/delete them
    created_notes = []
    
    def on_start(self):
        # Perform login to get authenticated
        username = f"testuser_{random.randint(1, 1000)}"
        password = "password123"
        self.client.post("/auth/login", json={
            "username": username,
            "password": password
        })
    
    @task(3)
    def get_all_notes(self):
        self.client.get("/api/notes")
    
    @task(2)
    def get_user_notes(self):
        self.client.get("/api/notes/user")
    
    @task(1)
    def create_note(self):
        title = f"Test Note {random.randint(1, 1000)}"
        content = ''.join(random.choices(string.ascii_letters + ' ', k=50))
        with self.client.post("/api/notes", 
                              json={"title": title, "content": content},
                              catch_response=True) as response:
            if response.status_code == 201:
                try:
                    note_data = response.json()
                    if 'id' in note_data:
                        self.created_notes.append(note_data['id'])
                except json.JSONDecodeError:
                    pass
    
    @task(1)
    def update_note(self):
        if self.created_notes:
            note_id = random.choice(self.created_notes)
            title = f"Updated Note {random.randint(1, 1000)}"
            content = ''.join(random.choices(string.ascii_letters + ' ', k=50))
            self.client.put(f"/api/notes/{note_id}", 
                            json={"title": title, "content": content})
    
    @task(1)
    def delete_note(self):
        if self.created_notes and len(self.created_notes) > 5:
            note_id = self.created_notes.pop()
            self.client.delete(f"/api/notes/{note_id}")
EOF
```

### E — Run Load Test

With `locustfile.py` in place:

```bash
# Still on locust-vm
source ~/NoteSync/load-tests/locust-env/bin/activate

locust -f ~/NoteSync/load-tests/locustfile.py \
  --host="http://35.189.72.248" \
  --users 100 --spawn-rate 10 \
  --headless --run-time 1m \
  --csv notesync-load
```

This will spin up 100 virtual users at 10 users/sec over 1 minute and output:

```
notesync-load_stats.csv
notesync-load_failures.csv
notesync-load_stats_history.csv
notesync-load_exceptions.csv
```
