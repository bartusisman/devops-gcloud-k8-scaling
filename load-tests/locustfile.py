import os
import random
import string
import json
import requests
from locust import HttpUser, task, between

# Supabase settings (set via env vars or hardcode for testing)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://asioeolrooqlsotuowbd.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzaW9lb2xyb29xbHNvdHVvd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MDA4NzUsImV4cCI6MjA1NTI3Njg3NX0.IYvgeDPrt4CU3C0eypFZwy0QehGRRIIj6SwKc6PdXOc")

class NoteSyncUser(HttpUser):
    # point this at your LoadBalancer IP or hostname
    host = os.getenv("LOCUST_TARGET", "http://35.189.72.248")
    wait_time = between(1, 2)

    # will hold note UUIDs
    created_notes = []

    def on_start(self):
        # --- 1) Sign up & login to Supabase ---
        username = f"testuser_{random.randint(1,100000)}"
        password = "Password123!"
        email = f"{username.lower()}@notesync.com"

        # Sign up
        resp = requests.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
            json={"email": email, "password": password,
                  "options": {"data": {"username": username}}}
        )
        # ignore failures if user already exists

        # Login
        resp = requests.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
            json={"email": email, "password": password}
        )
        resp.raise_for_status()
        token = resp.json()["access_token"]
        self.api_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # --- 2) Seed 10 notes so updates/deletes succeed ---
        for _ in range(10):
            title = f"seed_{random.randint(1,1e6)}"
            content = "".join(random.choices(string.ascii_letters + " ", k=100))
            r = self.client.post(
                "/api/notes",
                json={"title": title, "content": content},
                headers=self.api_headers,
                catch_response=True
            )
            if r.status_code == 201:
                try:
                    self.created_notes.append(r.json()["id"])
                except (ValueError, KeyError):
                    r.failure("Missing id in seed response")

    @task(3)
    def get_all_notes(self):
        self.client.get("/api/notes", headers=self.api_headers)

    @task(2)
    def get_user_notes(self):
        self.client.get("/api/notes/user", headers=self.api_headers)

    @task(4)
    def create_note(self):
        title = f"Test_{random.randint(1,1e6)}"
        content = "".join(random.choices(string.ascii_letters + " ", k=200))
        with self.client.post(
            "/api/notes",
            json={"title": title, "content": content},
            headers=self.api_headers,
            catch_response=True
        ) as r:
            if r.status_code == 201:
                try:
                    self.created_notes.append(r.json()["id"])
                except (ValueError, KeyError):
                    r.failure("Missing id in create response")

    @task(2)
    def update_note(self):
        if len(self.created_notes) >= 5:
            note_id = random.choice(self.created_notes)
            title = f"Upd_{random.randint(1,1e6)}"
            content = "".join(random.choices(string.ascii_letters + " ", k=150))
            self.client.put(
                f"/api/notes/{note_id}",
                json={"title": title, "content": content},
                headers=self.api_headers
            )

    @task(1)
    def delete_note(self):
        if len(self.created_notes) > 15:
            note_id = self.created_notes.pop(0)
            self.client.delete(
                f"/api/notes/{note_id}",
                headers=self.api_headers
            )
