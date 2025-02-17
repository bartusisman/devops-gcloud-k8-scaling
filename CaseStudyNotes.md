# Database Implementation Case Study

## Database Selection Process

### Research Phase

1. **Requirements Analysis**

   - Easiest and fastest to implement
   - User authentication and authorization
   - Real-time data synchronization
   - Easy to implement and maintain

2. **Options Considered**

   - Firebase
   - MongoDB Atlas
   - Supabase
   - Also considered SQLAlchemy with FastAPI for backend but found it to be more complex than Supabase


### Why Supabase?

1. **Familiarity**

   - It was the one that i had most experience with and was really familiar with the interface and the features


## Implementation Process

### 1. Initial Setup

```bash
# Install Supabase client
npm install @supabase/supabase-js
```

### 2. Database Schema

- Pasted this directly into the SQL editor in Supabase

```sql
create table public.notes (
  id uuid not null default gen_random_uuid(),
  user_id uuid null,
  username text not null,
  title text not null,
  content text not null,
  timestamp timestamp without time zone null default now(),
  constraint notes_pkey primary key (id),
  constraint notes_user_id_fkey foreign key (user_id)
    references auth.users (id) on delete cascade
);
```
### 3. Authentication

- Used the default authentication from Supabase
- Disabled email verification
- Created a default email to get rid of email enforcement "deneme1@notesync.com" 

### 4. Security Rules

- Used the default security rules from Supabase
- Didnt add any RLS policies since i was using the default ones

## Challenges and Solutions

### Setting up the initial project

**Challenge**: Had a hard time installing the dependencies for the project and setting up the project since i was using a new computer and had to install all the dependencies again which took a while and i faced with conflicts and issues.

**Solution**:

- Abused ChatGPT to install the dependencies and fix the issues
- Turned off my brain and just followed the instructions until it worked :D

### Type Safety

**Challenge**: Ensuring type safety between database and application.

**Solution**:

- Created TypeScript interfaces for database schema
- Used Supabase's type generator
- Implemented runtime type checking with Zod

```typescript
export interface Note {
  id: UUID;
  user_id: UUID;
  username: string;
  title: string;
  content: string;
  timestamp: string;
}
```

