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
