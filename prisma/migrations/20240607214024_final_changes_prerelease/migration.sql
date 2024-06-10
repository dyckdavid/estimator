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

INSERT INTO Permission VALUES('clx55md8o00001n7ditbxeawp','create','user','own','',1717793035657,1717793035657);
INSERT INTO Permission VALUES('clx55md8q00011n7d7tupdh3z','create','user','any','',1717793035658,1717793035658);
INSERT INTO Permission VALUES('clx55md8q00021n7dxy0yh3s7','create','user','team','',1717793035659,1717793035659);
INSERT INTO Permission VALUES('clx55md8r00031n7dqle5twk3','read','user','own','',1717793035660,1717793035660);
INSERT INTO Permission VALUES('clx55md8s00041n7dlkawj5c5','read','user','any','',1717793035660,1717793035660);
INSERT INTO Permission VALUES('clx55md8s00051n7d28su8su4','read','user','team','',1717793035661,1717793035661);
INSERT INTO Permission VALUES('clx55md8t00061n7dy0hixoxn','update','user','own','',1717793035661,1717793035661);
INSERT INTO Permission VALUES('clx55md8u00071n7dtqefxyqc','update','user','any','',1717793035663,1717793035663);
INSERT INTO Permission VALUES('clx55md8v00081n7d3cppaz96','update','user','team','',1717793035664,1717793035664);
INSERT INTO Permission VALUES('clx55md8w00091n7d9ds8p3g3','delete','user','own','',1717793035665,1717793035665);
INSERT INTO Permission VALUES('clx55md8x000a1n7dkscq61pb','delete','user','any','',1717793035665,1717793035665);
INSERT INTO Permission VALUES('clx55md8x000b1n7dcf3c21gx','delete','user','team','',1717793035666,1717793035666);
INSERT INTO Permission VALUES('clx55md8y000c1n7d76ird8xg','create','note','own','',1717793035667,1717793035667);
INSERT INTO Permission VALUES('clx55md8z000d1n7d0a3n3yxs','create','note','any','',1717793035667,1717793035667);
INSERT INTO Permission VALUES('clx55md90000e1n7d54f02ugv','create','note','team','',1717793035668,1717793035668);
INSERT INTO Permission VALUES('clx55md90000f1n7dkxpl1r9v','read','note','own','',1717793035669,1717793035669);
INSERT INTO Permission VALUES('clx55md91000g1n7dwokidk0f','read','note','any','',1717793035670,1717793035670);
INSERT INTO Permission VALUES('clx55md92000h1n7dz5vah0ox','read','note','team','',1717793035671,1717793035671);
INSERT INTO Permission VALUES('clx55md93000i1n7d356w6tnc','update','note','own','',1717793035671,1717793035671);
INSERT INTO Permission VALUES('clx55md94000j1n7do72y396s','update','note','any','',1717793035672,1717793035672);
INSERT INTO Permission VALUES('clx55md94000k1n7dgjfk7hwv','update','note','team','',1717793035673,1717793035673);
INSERT INTO Permission VALUES('clx55md95000l1n7d9g4r24gm','delete','note','own','',1717793035673,1717793035673);
INSERT INTO Permission VALUES('clx55md95000m1n7d9vqu8uru','delete','note','any','',1717793035674,1717793035674);
INSERT INTO Permission VALUES('clx55md96000n1n7dypy2365p','delete','note','team','',1717793035674,1717793035674);
INSERT INTO Permission VALUES('clx55md96000o1n7dqa7vzm5s','create','estimate','own','',1717793035675,1717793035675);
INSERT INTO Permission VALUES('clx55md97000p1n7dc82f81d7','create','estimate','any','',1717793035675,1717793035675);
INSERT INTO Permission VALUES('clx55md97000q1n7dnji2nqc2','create','estimate','team','',1717793035676,1717793035676);
INSERT INTO Permission VALUES('clx55md98000r1n7ddvn6ux9n','read','estimate','own','',1717793035677,1717793035677);
INSERT INTO Permission VALUES('clx55md99000s1n7dpodx4ra5','read','estimate','any','',1717793035677,1717793035677);
INSERT INTO Permission VALUES('clx55md99000t1n7d5rm7pwzb','read','estimate','team','',1717793035678,1717793035678);
INSERT INTO Permission VALUES('clx55md9a000u1n7dstfjkmgs','update','estimate','own','',1717793035679,1717793035679);
INSERT INTO Permission VALUES('clx55md9b000v1n7d98vaeq7z','update','estimate','any','',1717793035679,1717793035679);
INSERT INTO Permission VALUES('clx55md9c000w1n7dunfhn5uf','update','estimate','team','',1717793035680,1717793035680);
INSERT INTO Permission VALUES('clx55md9c000x1n7dq4t946oa','delete','estimate','own','',1717793035681,1717793035681);
INSERT INTO Permission VALUES('clx55md9d000y1n7d41hy68f9','delete','estimate','any','',1717793035681,1717793035681);
INSERT INTO Permission VALUES('clx55md9e000z1n7dom5fbnin','delete','estimate','team','',1717793035682,1717793035682);
INSERT INTO Permission VALUES('clx55md9e00101n7duaamswos','create','pricelist','own','',1717793035683,1717793035683);
INSERT INTO Permission VALUES('clx55md9f00111n7dzyk3l9pk','create','pricelist','any','',1717793035684,1717793035684);
INSERT INTO Permission VALUES('clx55md9g00121n7dkx8mdtzu','create','pricelist','team','',1717793035684,1717793035684);
INSERT INTO Permission VALUES('clx55md9h00131n7dqvrmaa02','read','pricelist','own','',1717793035685,1717793035685);
INSERT INTO Permission VALUES('clx55md9h00141n7dcwout0ah','read','pricelist','any','',1717793035686,1717793035686);
INSERT INTO Permission VALUES('clx55md9i00151n7da1amkqrh','read','pricelist','team','',1717793035686,1717793035686);
INSERT INTO Permission VALUES('clx55md9j00161n7d3h43evhq','update','pricelist','own','',1717793035687,1717793035687);
INSERT INTO Permission VALUES('clx55md9j00171n7dw7xh5bjn','update','pricelist','any','',1717793035688,1717793035688);
INSERT INTO Permission VALUES('clx55md9k00181n7dv82l9op0','update','pricelist','team','',1717793035688,1717793035688);
INSERT INTO Permission VALUES('clx55md9k00191n7dr1a43iw1','delete','pricelist','own','',1717793035689,1717793035689);
INSERT INTO Permission VALUES('clx55md9l001a1n7dmnrw0pqf','delete','pricelist','any','',1717793035690,1717793035690);
INSERT INTO Permission VALUES('clx55md9m001b1n7dqsjxleia','delete','pricelist','team','',1717793035690,1717793035690);
INSERT INTO Permission VALUES('clx55md9m001c1n7dqmhcrjng','create','takeoff-model','own','',1717793035691,1717793035691);
INSERT INTO Permission VALUES('clx55md9n001d1n7djiqm5j7r','create','takeoff-model','any','',1717793035691,1717793035691);
INSERT INTO Permission VALUES('clx55md9n001e1n7dppop0rim','create','takeoff-model','team','',1717793035692,1717793035692);
INSERT INTO Permission VALUES('clx55md9o001f1n7dvlr52btk','read','takeoff-model','own','',1717793035692,1717793035692);
INSERT INTO Permission VALUES('clx55md9p001g1n7dc4hky0h5','read','takeoff-model','any','',1717793035693,1717793035693);
INSERT INTO Permission VALUES('clx55md9p001h1n7du5hsc40d','read','takeoff-model','team','',1717793035694,1717793035694);
INSERT INTO Permission VALUES('clx55md9q001i1n7d3gmx20qs','update','takeoff-model','own','',1717793035694,1717793035694);
INSERT INTO Permission VALUES('clx55md9q001j1n7dqk716fio','update','takeoff-model','any','',1717793035695,1717793035695);
INSERT INTO Permission VALUES('clx55md9r001k1n7dcdr6tuiq','update','takeoff-model','team','',1717793035695,1717793035695);
INSERT INTO Permission VALUES('clx55md9r001l1n7d8n4mde6o','delete','takeoff-model','own','',1717793035696,1717793035696);
INSERT INTO Permission VALUES('clx55md9s001m1n7drllowpdh','delete','takeoff-model','any','',1717793035696,1717793035696);
INSERT INTO Permission VALUES('clx55md9t001n1n7d9pj46bfp','delete','takeoff-model','team','',1717793035697,1717793035697);
INSERT INTO Permission VALUES('clx55md9t001o1n7dstu2xfca','create','code','own','',1717793035698,1717793035698);
INSERT INTO Permission VALUES('clx55md9u001p1n7de6fbopwa','create','code','any','',1717793035698,1717793035698);
INSERT INTO Permission VALUES('clx55md9u001q1n7d1vopzgur','create','code','team','',1717793035699,1717793035699);
INSERT INTO Permission VALUES('clx55md9v001r1n7ds8ql9k3k','read','code','own','',1717793035699,1717793035699);
INSERT INTO Permission VALUES('clx55md9w001s1n7d1qqa398p','read','code','any','',1717793035700,1717793035700);
INSERT INTO Permission VALUES('clx55md9x001t1n7ddjj51b3v','read','code','team','',1717793035701,1717793035701);
INSERT INTO Permission VALUES('clx55md9x001u1n7d24pci0rf','update','code','own','',1717793035702,1717793035702);
INSERT INTO Permission VALUES('clx55md9y001v1n7dptdr9sqx','update','code','any','',1717793035702,1717793035702);
INSERT INTO Permission VALUES('clx55md9y001w1n7di738swi2','update','code','team','',1717793035703,1717793035703);
INSERT INTO Permission VALUES('clx55md9z001x1n7dxrbmudkb','delete','code','own','',1717793035703,1717793035703);
INSERT INTO Permission VALUES('clx55md9z001y1n7dcei4ndpc','delete','code','any','',1717793035704,1717793035704);
INSERT INTO Permission VALUES('clx55mda0001z1n7dltipfx4r','delete','code','team','',1717793035704,1717793035704);
INSERT INTO Role VALUES('clx55mda100201n7d76dzcqal','admin','',1717793035706,1717793035706);
INSERT INTO Role VALUES('clx55mda300211n7dnn4y0kft','user','',1717793035708,1717793035708);
INSERT INTO _PermissionToRole VALUES('clx55md8q00011n7d7tupdh3z','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md8s00041n7dlkawj5c5','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md8u00071n7dtqefxyqc','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md8x000a1n7dkscq61pb','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md8z000d1n7d0a3n3yxs','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md91000g1n7dwokidk0f','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md94000j1n7do72y396s','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md95000m1n7d9vqu8uru','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md97000p1n7dc82f81d7','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md99000s1n7dpodx4ra5','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9b000v1n7d98vaeq7z','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9d000y1n7d41hy68f9','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9f00111n7dzyk3l9pk','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9h00141n7dcwout0ah','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9j00171n7dw7xh5bjn','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9l001a1n7dmnrw0pqf','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9n001d1n7djiqm5j7r','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9p001g1n7dc4hky0h5','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9q001j1n7dqk716fio','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9s001m1n7drllowpdh','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9u001p1n7de6fbopwa','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9w001s1n7d1qqa398p','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9y001v1n7dptdr9sqx','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md9z001y1n7dcei4ndpc','clx55mda100201n7d76dzcqal');
INSERT INTO _PermissionToRole VALUES('clx55md8o00001n7ditbxeawp','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md8r00031n7dqle5twk3','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md8t00061n7dy0hixoxn','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md8w00091n7d9ds8p3g3','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md8y000c1n7d76ird8xg','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md90000f1n7dkxpl1r9v','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md93000i1n7d356w6tnc','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md95000l1n7d9g4r24gm','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md96000o1n7dqa7vzm5s','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md98000r1n7ddvn6ux9n','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9a000u1n7dstfjkmgs','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9c000x1n7dq4t946oa','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9e00101n7duaamswos','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9h00131n7dqvrmaa02','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9j00161n7d3h43evhq','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9k00191n7dr1a43iw1','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9m001c1n7dqmhcrjng','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9o001f1n7dvlr52btk','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9q001i1n7d3gmx20qs','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9r001l1n7d8n4mde6o','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9t001o1n7dstu2xfca','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9v001r1n7ds8ql9k3k','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9x001u1n7d24pci0rf','clx55mda300211n7dnn4y0kft');
INSERT INTO _PermissionToRole VALUES('clx55md9z001x1n7dxrbmudkb','clx55mda300211n7dnn4y0kft');
