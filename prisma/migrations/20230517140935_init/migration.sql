/*
  Warnings:

  - Made the column `session` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);
INSERT INTO "new_User" ("hash", "id", "name", "salt", "session") SELECT "hash", "id", "name", "salt", "session" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE UNIQUE INDEX "User_salt_key" ON "User"("salt");
CREATE UNIQUE INDEX "User_session_key" ON "User"("session");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
