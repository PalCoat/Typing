/*
  Warnings:

  - You are about to drop the column `length` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Test` table. All the data in the column will be lost.
  - Added the required column `WPS` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "WPS" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Test_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("date", "id", "userId") SELECT "date", "id", "userId" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
