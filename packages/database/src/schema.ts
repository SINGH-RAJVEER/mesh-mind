import {
  pgTable,
  varchar,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const providerEnum = pgEnum("provider", ["local", "google", "github"]);

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    profilePicture: varchar("profile_picture", { length: 500 }),
    provider: providerEnum("provider").notNull().default("local"),
    providerId: varchar("provider_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    usernameIdx: index("users_username_idx").on(table.username),
    providerIdx: index("users_provider_idx").on(
      table.provider,
      table.providerId,
    ),
  }),
);

// Conversations table
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("conversations_user_id_idx").on(table.userId),
  }),
);

// Messages table
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userMessage: text("user_message").notNull(),
    botResponse: text("bot_response").notNull(),
    mood: varchar("mood", { length: 50 }),
    isCrisis: boolean("is_crisis").notNull().default(false),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("messages_user_id_idx").on(table.userId),
    conversationIdIdx: index("messages_conversation_id_idx").on(
      table.conversationId,
    ),
    timestampIdx: index("messages_timestamp_idx").on(table.timestamp),
    isCrisisIdx: index("messages_is_crisis_idx").on(table.isCrisis),
    userConversationIdx: index("messages_user_conversation_idx").on(
      table.userId,
      table.conversationId,
    ),
  }),
);

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
