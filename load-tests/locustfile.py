from locust import HttpUser, task, between
import random, string

HOST = "http://35.189.72.248"             
SUPABASE_URL      = "https://asioeolrooqlsotuowbd.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzaW9lb2xyb29xbHNvdHVvd2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MDA4NzUsImV4cCI6MjA1NTI3Njg3NX0.IYvgeDPrt4CU3C0eypFZwy0QehGRRIIj6SwKc6PdXOc"

class NoteSyncUser(HttpUser):
    host = HOST
    wait_time = between(1, 2)
    created_notes = []
    headers = {}

    def on_start(self):
        # 1) Sign up
        username = f"testuser{random.randint(10000,99999)}"
        email    = f"{username}@notesync.com"
        password = "Password123!"

        with self.client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            json={"email": email, "password": password},
            headers={
                "Content-Type": "application/json",
                "apikey":       SUPABASE_ANON_KEY
            },
            name="/supabase/signup",
            catch_response=True
        ) as res:
            if res.status_code not in (200,201):
                res.failure(f"signup {res.status_code}")
                return

        # 2) Login
        with self.client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            json={"email": email, "password": password},
            headers={
                "Content-Type": "application/json",
                "apikey":       SUPABASE_ANON_KEY
            },
            name="/supabase/login",
            catch_response=True
        ) as res:
            if res.status_code != 200:
                res.failure(f"login {res.status_code}")
                return
            token = res.json().get("access_token")
            if not token:
                res.failure("no token")
                return
            self.headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type":  "application/json"
            }

        # 3) Seed a few notes
        for _ in range(10):
            title   = f"Seed {random.randint(1,999999)}"
            content = "".join(random.choices(string.ascii_letters + " ", k=80))
            with self.client.post(
                "/api/notes",
                json={"title": title, "content": content},
                headers=self.headers,
                name="/notes (seed)",
                catch_response=True
            ) as r:
                if r.status_code == 201:
                    try:
                        self.created_notes.append(r.json()["id"])
                    except:
                        r.failure("no id")
                else:
                    r.failure(f"seed failed {r.status_code}")

    @task(3)
    def get_all(self):
        self.client.get("/api/notes", headers=self.headers, name="/notes (all)")

    @task(2)
    def get_mine(self):
        self.client.get("/api/notes/user", headers=self.headers, name="/notes/user")

    @task(4)
    def create(self):
        title   = f"Note {random.randint(1,999999)}"
        content = "".join(random.choices(string.ascii_letters + " ", k=150))
        with self.client.post(
            "/api/notes",
            json={"title": title, "content": content},
            headers=self.headers,
            name="/notes (create)",
            catch_response=True
        ) as r:
            if r.status_code == 201:
                try:
                    self.created_notes.append(r.json()["id"])
                except:
                    r.failure("no id on create")
            else:
                r.failure(f"create {r.status_code}")

    @task(2)
    def update(self):
        if len(self.created_notes) >= 5:
            nid     = random.choice(self.created_notes)
            title   = f"Upd {random.randint(1,999999)}"
            content = "".join(random.choices(string.ascii_letters + " ", k=120))
            self.client.put(
                f"/api/notes/{nid}",
                json={"title": title, "content": content},
                headers=self.headers,
                name="/notes/:id (update)"
            )

    @task(1)
    def delete(self):
        if len(self.created_notes) > 15:
            nid = self.created_notes.pop(0)
            self.client.delete(
                f"/api/notes/{nid}",
                headers=self.headers,
                name="/notes/:id (delete)"
            )
