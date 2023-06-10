-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wpm" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_salt_key" ON "User"("salt");

-- CreateIndex
CREATE UNIQUE INDEX "User_session_key" ON "User"("session");

-- CreateIndex
CREATE UNIQUE INDEX "Score_userId_key" ON "Score"("userId");
