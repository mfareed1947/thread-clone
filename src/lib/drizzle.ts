import {
  pgTable,
  serial,
  uniqueIndex,
  varchar,
  timestamp,
  integer,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { relations } from "drizzle-orm";
import { sql } from "@vercel/postgres";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  username: varchar("username", { length: 100 }),
  email: varchar("email", { length: 256 }),
  password: varchar("password", { length: 256 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const posts = pgTable("Posts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  image: varchar("image", { length: 100 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  user_posts: one(users, {
    fields: [posts.user_id],
    references: [users.id],
  }),
}));

export const profileInfo = pgTable("profile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  metadata: jsonb("metadata"),
});

// export const usersProfileRelations = relations(users, ({ one }) => ({
//   invitee: one(users, {
//     fields: [users.invitedBy],
//     references: [users.id],
//   }),
// }));

export type selectUsers = InferSelectModel<typeof users>;
export type newUser = InferInsertModel<typeof users>;

export const db = drizzle(sql);
