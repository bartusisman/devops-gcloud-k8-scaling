from locust import HttpUser, task, between
import random
import string
import json

class NoteSyncUser(HttpUser):
    wait_time = between(1, 3)
    
    # Storage for note IDs so update/delete can hit real records
    created_notes = []

    def on_start(self):
        # 1) Sign up & login once per user
        username = f"testuser_{random.randint(1, 100000)}"
        password = "Password123!"
        # Supabase sign-up (ignores redirect)
        self.client.post("/auth/signup", json={
            "username": username,
            "password": password
        })
        # Then login to get session & set cookies/token
        r = self.client.post("/auth/login", json={
            "username": username,
            "password": password
        })
        if r.status_code != 200:
            r.failure(f"Login failed: {r.text}")

        # 2) Seed 10 notes so updates/deletes succeed
        for _ in range(10):
            title = f"seed_{random.randint(1,1e6)}"
            content = ''.join(random.choices(string.ascii_letters + ' ', k=100))
            with self.client.post("/api/notes",
                                  json={"title": title, "content": content},
                                  catch_response=True) as post_res:
                if post_res.status_code == 201:
                    try:
                        note = post_res.json()
                        self.created_notes.append(note["id"])
                    except (ValueError, KeyError):
                        post_res.failure("Invalid JSON or missing id")

    @task(3)
    def get_all_notes(self):
        self.client.get("/api/notes")

    @task(2)
    def get_user_notes(self):
        self.client.get("/api/notes/user")

    @task(4)
    def create_note(self):
        title = f"Test_{random.randint(1,1e6)}"
        content = ''.join(random.choices(string.ascii_letters + ' ', k=200))
        with self.client.post("/api/notes",
                              json={"title": title, "content": content},
                              catch_response=True) as response:
            if response.status_code == 201:
                try:
                    note = response.json()
                    self.created_notes.append(note["id"])
                except (ValueError, KeyError):
                    response.failure("Response missing id")

    @task(2)
    def update_note(self):
        # only update if we have at least 5 IDs queued
        if len(self.created_notes) >= 5:
            note_id = random.choice(self.created_notes)
            title = f"Upd_{random.randint(1,1e6)}"
            content = ''.join(random.choices(string.ascii_letters + ' ', k=150))
            self.client.put(f"/api/notes/{note_id}", 
                            json={"title": title, "content": content})

    @task(1)
    def delete_note(self):
        # only delete when we have a surplus of IDs
        if len(self.created_notes) > 15:
            note_id = self.created_notes.pop(0)
            self.client.delete(f"/api/notes/{note_id}")
