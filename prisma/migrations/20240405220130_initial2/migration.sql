/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "business_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "costumer_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "message_id" INTEGER NOT NULL,
    "group_id" BIGINT NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "topic_message_id" INTEGER NOT NULL,
    CONSTRAINT "business_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("telegram_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "topics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group_id" BIGINT NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "telegram_id" BIGINT NOT NULL PRIMARY KEY,
    "updated_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "business_connection_id" TEXT,
    "group_id" BIGINT
);
INSERT INTO "new_users" ("created_at", "telegram_id", "updated_at") SELECT "created_at", "telegram_id", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");
CREATE UNIQUE INDEX "users_business_connection_id_key" ON "users"("business_connection_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "topics_group_id_thread_id_key" ON "topics"("group_id", "thread_id");
