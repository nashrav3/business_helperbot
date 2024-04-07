/*
  Warnings:

  - Added the required column `customer_id` to the `topics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `topics` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_topics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "owner_id" BIGINT NOT NULL,
    "group_id" BIGINT NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "topics_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("telegram_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_topics" ("created_at", "group_id", "id", "thread_id") SELECT "created_at", "group_id", "id", "thread_id" FROM "topics";
DROP TABLE "topics";
ALTER TABLE "new_topics" RENAME TO "topics";
CREATE UNIQUE INDEX "topics_group_id_thread_id_key" ON "topics"("group_id", "thread_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
