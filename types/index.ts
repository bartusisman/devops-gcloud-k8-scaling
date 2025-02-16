export type UUID = string;

export interface Note {
  id: UUID;
  user_id: UUID | null;
  username: string;
  title: string;
  content: string;
  timestamp: string;
} 