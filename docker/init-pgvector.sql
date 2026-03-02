-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create provider enum type
CREATE TYPE provider AS ENUM ('local', 'google', 'github');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    profile_picture VARCHAR(500),
    provider provider NOT NULL DEFAULT 'local',
    provider_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_provider_idx ON users(provider, provider_id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index for conversations
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    mood VARCHAR(50),
    is_crisis BOOLEAN NOT NULL DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_timestamp_idx ON messages(timestamp);
CREATE INDEX IF NOT EXISTS messages_is_crisis_idx ON messages(is_crisis);
CREATE INDEX IF NOT EXISTS messages_user_conversation_idx ON messages(user_id, conversation_id);

-- Create table for message embeddings
CREATE TABLE IF NOT EXISTS message_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL DEFAULT true,
    embedding vector(768),  -- Gemini text-embedding-004 produces 768-dimensional vectors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for faster lookups
    CONSTRAINT unique_message_embedding UNIQUE (message_id, is_user_message)
);

-- Create index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_id ON message_embeddings(user_id);

-- Create index on conversation_id for faster conversation-specific queries
CREATE INDEX IF NOT EXISTS idx_message_embeddings_conversation_id ON message_embeddings(conversation_id);

-- Create index on combination for optimal vector search
CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_conversation ON message_embeddings(user_id, conversation_id);

-- Create HNSW index for fast vector similarity search
-- This uses Hierarchical Navigable Small World graphs for efficient nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector 
ON message_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create timestamp index for temporal queries
CREATE INDEX IF NOT EXISTS idx_message_embeddings_created_at ON message_embeddings(created_at DESC);
