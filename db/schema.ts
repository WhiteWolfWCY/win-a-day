import { pgTable, text } from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
    id: text().primaryKey()
})