/*
  Warnings:

  - You are about to drop the column `topic_id` on the `business_messages` table. All the data in the column will be lost.
  - Added the required column `thread_id` to the `business_messages` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_business_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "costumer_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "message_id" INTEGER NOT NULL,
    "group_id" BIGINT NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "topic_message_id" INTEGER NOT NULL,
    CONSTRAINT "business_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("telegram_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_business_messages" ("costumer_id", "created_at", "group_id", "id", "message_id", "topic_message_id", "user_id") SELECT "costumer_id", "created_at", "group_id", "id", "message_id", "topic_message_id", "user_id" FROM "business_messages";
DROP TABLE "business_messages";
ALTER TABLE "new_business_messages" RENAME TO "business_messages";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
