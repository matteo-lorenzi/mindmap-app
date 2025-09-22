-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mindmaps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "mindmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL DEFAULT 150,
    "height" REAL NOT NULL DEFAULT 50,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "shape" TEXT NOT NULL DEFAULT 'rectangle',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mindmapId" TEXT NOT NULL,
    CONSTRAINT "nodes_mindmapId_fkey" FOREIGN KEY ("mindmapId") REFERENCES "mindmaps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT,
    "style" TEXT NOT NULL DEFAULT 'solid',
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mindmapId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    CONSTRAINT "connections_mindmapId_fkey" FOREIGN KEY ("mindmapId") REFERENCES "mindmaps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "connections_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "connections_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "collaborations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "mindmapId" TEXT NOT NULL,
    CONSTRAINT "collaborations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collaborations_mindmapId_fkey" FOREIGN KEY ("mindmapId") REFERENCES "mindmaps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "collaborations_userId_mindmapId_key" ON "collaborations"("userId", "mindmapId");
