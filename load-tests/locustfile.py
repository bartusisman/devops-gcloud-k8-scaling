from locust import HttpUser, task, between

class NoteSyncUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def notes(self):
        self.client.get("/api/notes")
