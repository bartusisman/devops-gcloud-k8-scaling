# NoteSync

A modern React Native mobile application for creating and sharing notes within a community. Built with Expo, TypeScript, and Supabase.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase Account](https://supabase.com/)

## 🛠️ Setup

1. **Clone the repository**
```bash
git clone https://github.com/bartusisman/NoteSync
cd NoteSync
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase Setup**

Execute the following SQL in your Supabase database:
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

5. **Start the development server**
```bash
npx expo start
```

## 📁 Project Structure

```
src/
├── api/                 # API integration layer
│   ├── client.ts       # API client setup
│   └── notes.ts        # Notes-specific API methods
├── app/                # App screens (Expo Router)
│   ├── (app)/         # Authenticated screens
│   └── (auth)/        # Authentication screens
├── components/         # Reusable components
│   ├── ui/            # UI components
│   └── ErrorBoundary.tsx
├── context/           # React Context providers
│   ├── AuthContext.tsx
│   ├── NotesContext.tsx
│   └── ThemeContext.tsx
├── lib/               # Library configurations
│   └── supabase.ts    # Supabase client
└── types/             # TypeScript type definitions
    └── index.ts
```

## 🏗️ Architecture

### Authentication Flow
- Uses Supabase Authentication
- Protected routes with authentication checks
- Automatic token refresh

### State Management
- React Context for global state
- Supabase real-time subscriptions
- Local state for UI components

### API Integration
- Centralized API client
- Type-safe API methods
- Error handling middleware

### UI/UX
- Responsive design with Flexbox
- Smooth animations with Reanimated
- Error boundaries for graceful error handling
- Loading states and pull-to-refresh

## 📱 Running on Device

1. Install Expo Go on your device
2. Scan the QR code from `npx expo start`
3. The app will load on your device

## 🔨 Development Tools

- **TypeScript**: For type safety
- **Expo**: For cross-platform development
- **Supabase**: For backend and authentication
- **React Native Reanimated**: For smooth animations
- **Expo Router**: For navigation
- **react-native-safe-area-context**: For safe area handling


## Case Study Notes

- [Case Study Notes](./CaseStudyNotes.md)