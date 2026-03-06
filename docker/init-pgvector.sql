-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    name VARCHAR(255),
    image VARCHAR(500),
    username VARCHAR(255),
    profile_picture VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

-- Better Auth accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT accounts_provider_account_unique UNIQUE (provider_id, account_id)
);

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS accounts_provider_id_idx ON accounts(provider_id);

-- Better Auth sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token);

-- Better Auth verification table
CREATE TABLE IF NOT EXISTS verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);

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
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL DEFAULT true,
    embedding vector(768) NOT NULL,  -- Gemini text-embedding-004 produces 768-dimensional vectors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Indexes for faster lookups
    CONSTRAINT unique_message_embedding UNIQUE (message_id, is_user_message)
);

-- Create index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS message_embeddings_user_id_idx ON message_embeddings(user_id);

-- Create index on conversation_id for faster conversation-specific queries
CREATE INDEX IF NOT EXISTS message_embeddings_conversation_id_idx ON message_embeddings(conversation_id);

-- Create index on combination for optimal vector search
CREATE INDEX IF NOT EXISTS message_embeddings_user_conversation_idx ON message_embeddings(user_id, conversation_id);

-- Create HNSW index for fast vector similarity search
-- This uses Hierarchical Navigable Small World graphs for efficient nearest neighbor search
CREATE INDEX IF NOT EXISTS message_embeddings_vector_idx 
ON message_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create timestamp index for temporal queries
CREATE INDEX IF NOT EXISTS message_embeddings_created_at_idx ON message_embeddings(created_at DESC);
