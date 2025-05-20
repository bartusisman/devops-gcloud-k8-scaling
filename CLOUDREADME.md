

## ✅ **Project Structure **

```
NoteSync/
│
├── api/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── load-tests/
│   ├── locustfile.py
│   ├── notesync-load_exceptions.csv
│   ├── notesync-load_failures.csv
│   ├── notesync-load_stats.csv
│   └── notesync-load_stats_history.csv
│
├── README.md
└── ...
```

---

## 🛠️ **Steps to Run Everything Locally or from the Repo**

### 1. 🐳 Run the Express API on Port 3000

Go to the `api/` folder:

```bash
cd api/
```

Build and run the Docker container:

```bash
docker build -t notesync-api .
docker run -p 3000:3000 notesync-api
```

Check it's working:

```bash
curl http://localhost:3000/api/notes
```

You should get:

```json
[{"id":1,"title":"Demo note from container"}]
```

---

### 2. 🐜 Run Locust Load Test (From `load-tests/`)

Ensure you have Locust installed:

```bash
pip install locust
```

Then:

```bash
cd load-tests/
locust -f locustfile.py --host=http://localhost:3000 --users 100 --spawn-rate 10 --headless --run-time 1m --csv notesync-load
```

This will regenerate:

* `notesync-load_stats.csv`
* `notesync-load_failures.csv`
* `notesync-load_stats_history.csv`
* `notesync-load_exceptions.csv` (if any)

---

## 📄 README.md

Here’s a professional, self-contained README for your GitHub repo:

---

```markdown
# NoteSync Cloud-Native App

This project is part of a **cloud-native architecture** term project for CS436. It integrates containerized workloads, serverless functions, and virtual machines (VMs) deployed on **Google Cloud Platform (GCP)**.

---

## 🚀 System Overview

- **Frontend**: React Native (not included here)
- **Backend API**: A simple Express.js service exposing `/api/notes`
- **Containerized**: Docker image built from `api/` folder
- **VM**: Used to run Locust for load testing
- **Kubernetes**: Deployed via GKE (Google Kubernetes Engine)
- **Load Testing**: Conducted using Locust inside a dedicated VM

---

## 📂 Directory Structure

```

.
├── api/                        # Express API code
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── load-tests/                # Locust test suite and result CSVs
│   ├── locustfile.py
│   ├── notesync-load\_stats.csv
│   ├── notesync-load\_failures.csv
│   ├── notesync-load\_stats\_history.csv
│   └── notesync-load\_exceptions.csv
└── README.md

````

---

## 📦 Running the API Locally

```bash
cd api/
docker build -t notesync-api .
docker run -p 3000:3000 notesync-api
````

Test with:

```bash
curl http://localhost:3000/api/notes
```

---

## 📊 Running Load Tests

```bash
cd load-tests/
pip install locust
locust -f locustfile.py --host=http://localhost:3000 --users 100 --spawn-rate 10 --headless --run-time 1m --csv notesync-load
```

CSV reports will be regenerated in the same folder.

---

## 📁 CSV Reports Explained

| File                              | Purpose                               |
| --------------------------------- | ------------------------------------- |
| `notesync-load_stats.csv`         | Summary of request stats per endpoint |
| `notesync-load_failures.csv`      | Failure reports (if any)              |
| `notesync-load_stats_history.csv` | Request stats over time               |
| `notesync-load_exceptions.csv`    | Exceptions raised during testing      |

---

## 🌐 Cloud Infrastructure

* GCP Project: `cs436-project-459822`
* Docker image hosted on:
  `europe-west2-docker.pkg.dev/cs436-project-459822/notesync-repo/notesync:v3`
* Kubernetes service exposes the container on port 3000 via LoadBalancer.

---

## 🔬 Performance Metrics (Locust)

* **Users:** 100
* **Spawn Rate:** 10 users/s
* **Duration:** 1 minute
* **Target Endpoint:** `GET /api/notes`

---

## 🧪 Example Output

```text
GET /api/notes: 2809 requests, 0 failures, avg response time: 5ms
Max latency: 213ms, 99th percentile: 20ms
```

---

## 👨‍💻 Author

**Bartu Şişman** – CS436 Term Project, Spring 2025
Sabancı University

```

