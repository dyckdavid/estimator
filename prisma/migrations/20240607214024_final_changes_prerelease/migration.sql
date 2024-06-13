/*
  Warnings:

  - You are about to drop the `Estimation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EstimationImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NoteImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EstimationToTeam` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order` to the `CustomInputElement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `TakeoffModel` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Estimation_ownerId_updatedAt_idx";

-- DropIndex
DROP INDEX "Estimation_ownerId_idx";

-- DropIndex
DROP INDEX "EstimationImage_estimationId_idx";

-- DropIndex
DROP INDEX "Note_ownerId_updatedAt_idx";

-- DropIndex
DROP INDEX "Note_ownerId_idx";

-- DropIndex
DROP INDEX "NoteImage_noteId_idx";

-- DropIndex
DROP INDEX "_EstimationToTeam_B_index";

-- DropIndex
DROP INDEX "_EstimationToTeam_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Estimation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EstimationImage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NoteImage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EstimationToTeam";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "attributes" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    "takeoffModelId" TEXT,
    CONSTRAINT "Estimate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Estimate_takeoffModelId_fkey" FOREIGN KEY ("takeoffModelId") REFERENCES "TakeoffModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EstimateResults" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceLookupKey" TEXT NOT NULL,
    "qty" REAL NOT NULL,
    "pricePerUnit" REAL NOT NULL,
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "section" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "estimateId" TEXT NOT NULL,
    CONSTRAINT "EstimateResults_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EstimateFormData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "estimateId" TEXT NOT NULL,
    CONSTRAINT "EstimateFormData_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EstimateToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EstimateToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EstimateToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isManuallyCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "takeoffModelId" TEXT NOT NULL,
    CONSTRAINT "CustomVariable_takeoffModelId_fkey" FOREIGN KEY ("takeoffModelId") REFERENCES "TakeoffModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CustomVariable" ("createdAt", "description", "id", "name", "takeoffModelId", "type", "updatedAt", "value") SELECT "createdAt", "description", "id", "name", "takeoffModelId", "type", "updatedAt", "value" FROM "CustomVariable";
DROP TABLE "CustomVariable";
ALTER TABLE "new_CustomVariable" RENAME TO "CustomVariable";
CREATE UNIQUE INDEX "CustomVariable_takeoffModelId_name_key" ON "CustomVariable"("takeoffModelId", "name");
CREATE TABLE "new_CustomInputElement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "props" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "takeoffModelId" TEXT NOT NULL,
    CONSTRAINT "CustomInputElement_takeoffModelId_fkey" FOREIGN KEY ("takeoffModelId") REFERENCES "TakeoffModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CustomInputElement" ("createdAt", "defaultValue", "description", "id", "label", "name", "props", "takeoffModelId", "type", "updatedAt") SELECT "createdAt", "defaultValue", "description", "id", "label", "name", "props", "takeoffModelId", "type", "updatedAt" FROM "CustomInputElement";
DROP TABLE "CustomInputElement";
ALTER TABLE "new_CustomInputElement" RENAME TO "CustomInputElement";
CREATE TABLE "new_TakeoffModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "TakeoffModel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TakeoffModel" ("createdAt", "description", "id", "name", "ownerId", "updatedAt") SELECT "createdAt", "description", "id", "name", "ownerId", "updatedAt" FROM "TakeoffModel";
DROP TABLE "TakeoffModel";
ALTER TABLE "new_TakeoffModel" RENAME TO "TakeoffModel";
CREATE TABLE "new_BuildingDimensions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "width" REAL NOT NULL,
    "length" REAL NOT NULL,
    "wallHeight" REAL NOT NULL,
    "totalInteriorWallsLength" REAL NOT NULL,
    "roofRisePerFoot" REAL NOT NULL,
    "soffitOverhangWidth" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "estimationId" TEXT NOT NULL,
    CONSTRAINT "BuildingDimensions_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BuildingDimensions" ("createdAt", "estimationId", "id", "length", "roofRisePerFoot", "soffitOverhangWidth", "totalInteriorWallsLength", "updatedAt", "wallHeight", "width") SELECT "createdAt", "estimationId", "id", "length", "roofRisePerFoot", "soffitOverhangWidth", "totalInteriorWallsLength", "updatedAt", "wallHeight", "width" FROM "BuildingDimensions";
DROP TABLE "BuildingDimensions";
ALTER TABLE "new_BuildingDimensions" RENAME TO "BuildingDimensions";
CREATE UNIQUE INDEX "BuildingDimensions_estimationId_key" ON "BuildingDimensions"("estimationId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "Estimate_ownerId_idx" ON "Estimate"("ownerId");

-- CreateIndex
CREATE INDEX "Estimate_ownerId_updatedAt_idx" ON "Estimate"("ownerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateResults_estimateId_name_key" ON "EstimateResults"("estimateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateFormData_estimateId_name_key" ON "EstimateFormData"("estimateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_EstimateToTeam_AB_unique" ON "_EstimateToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_EstimateToTeam_B_index" ON "_EstimateToTeam"("B");
