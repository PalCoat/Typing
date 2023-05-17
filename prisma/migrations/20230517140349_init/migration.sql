-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "session" TEXT,
    "hash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_salt_key" ON "User"("salt");

-- CreateIndex
CREATE UNIQUE INDEX "User_session_key" ON "User"("session");
