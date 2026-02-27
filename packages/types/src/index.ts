// User types
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Auth types
export interface AuthResponse {
  message?: string;
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

// Message types
export interface Message {
  id: string;
  user_message?: string;
  bot_response?: string;
  mood?: string | null;
  is_crisis?: boolean;
  timestamp?: string | Date;
  type?: "user" | "ai";
}

// Conversation types
export interface Conversation {
  id: string;
  messages: Message[];
  timestamp?: string | Date;
}

// Chat API types
export interface SendMessageParams {
  message: string;
  conversationId?: string | null;
}

export interface SendMessageResponse {
  response: string;
  conversation_id: string;
  mood: string | null;
  user_message?: string;
  message?: string;
}

export interface DeleteChatResponse {
  message: string;
}

// Mood and crisis detection
export interface MoodDetectionMap {
  [key: string]: string[];
}

export const CRISIS_WORDS: string[] = [
  "suicide",
  "depressed",
  "self-harm",
  "kill myself",
  "hopeless",
  "give up",
];

export const DETECT_MOOD: MoodDetectionMap = {
  happy: ["joy", "excited", "great", "happy", "pleased", "wonderful"],
  sad: ["sad", "unhappy", "down", "miserable", "depressed", "gloomy"],
  angry: ["angry", "furious", "annoyed", "frustrated", "mad"],
  anxious: ["nervous", "worried", "anxious", "stressed", "scared"],
  calm: ["calm", "relaxed", "peaceful", "content"],
};
