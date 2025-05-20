import os
import random
import string
import json
import requests
from locust import HttpUser, task, between, events

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-key")

# Credentials for a single “loadtest” account you must pre-create in Supabase
LOADTEST_EMAIL    = os.getenv("LOADTEST_EMAIL",    "loadtest@notesync.com")
LOADTEST_PASSWORD = os.getenv("LOADTEST_PASSWORD", "Password123!")

class NoteSyncUser(HttpUser):
    host = os.getenv("LOCUST_TARGET", "http://YOUR.LB.ADDRESS")
    wait_time = between(1, 2)
    created_notes = []

    def on_start(self):
        # 1) Login once per Locust user (reuse the same loadtest@notesync.com account)
        login_payload = {
            "grant_type": "password",
            "email":      LOADTEST_EMAIL,
            "password":   LOADTEST_PASSWORD
        }
        resp = requests.post(
            f"{SUPABASE_URL}/auth/v1/token",
            headers={
                "apikey":       SUPABASE_KEY,
                "Content-Type": "application/json"
            },
            json=login_payload,
        )

        if resp.status_code != 200:
            # if we can’t login, kill this greenlet so it doesn’t spam failures
            resp.error(f"🛑 login failed: {resp.status_code} {resp.text}")
            self.environment.runner.quit()
            return

        token = resp.json().get("access_token")
        if not token:
            resp.error("🛑 login returned no access_token")
            self.environment.runner.quit()
            return

        self.api_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json"
        }

        # 2) Seed 5 notes so update/delete tasks always have something to work on
        for _ in range(5):
            title   = f"seed_{random.randint(1,1000000)}"
            content = "".join(random.choices(string.ascii_letters + " ", k=80))
            r = self.client.post(
                "/api/notes",
                json={"title": title, "content": content},
                headers=self.api_headers,
                catch_response=True
            )
            if r.status_code == 201:
                try:
                    self.created_notes.append(r.json()["id"])
                except Exception:
                    r.failure("no id in seed response")

    @task(3)
    def get_all_notes(self):
        self.client.get("/api/notes", headers=self.api_headers)

    @task(2)
    def get_user_notes(self):
        self.client.get("/api/notes/user", headers=self.api_headers)

    @task(4)
    def create_note(self):
        title   = f"T_{random.randint(1,1000000)}"
        content = "".join(random.choices(string.ascii_letters + " ", k=150))
        with self.client.post(
            "/api/notes",
            json={"title": title, "content": content},
            headers=self.api_headers,
            catch_response=True
        ) as r:
            if r.status_code == 201:
                try:
                    self.created_notes.append(r.json()["id"])
                except Exception:
                    r.failure("no id in create response")

    @task(2)
    def update_note(self):
        if len(self.created_notes) >= 2:
            note_id = random.choice(self.created_notes)
            title   = f"U_{random.randint(1,1000000)}"
            content = "".join(random.choices(string.ascii_letters + " ", k=120))
            self.client.put(
                f"/api/notes/{note_id}",
                json={"title": title, "content": content},
                headers=self.api_headers
            )

    @task(1)
    def delete_note(self):
        if len(self.created_notes) > 8:
            note_id = self.created_notes.pop(0)
            self.client.delete(
                f"/api/notes/{note_id}",
                headers=self.api_headers
            )
