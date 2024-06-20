-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expirationDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "charSet" TEXT NOT NULL,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
CREATE TABLE "BuildingDimensions" (
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
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pricelist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "supplier" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Pricelist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricelistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pricePerUnit" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pricelistId" TEXT NOT NULL,
    CONSTRAINT "PricelistItem_pricelistId_fkey" FOREIGN KEY ("pricelistId") REFERENCES "Pricelist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TakeoffModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "TakeoffModel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomInputElement" (
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

-- CreateTable
CREATE TABLE "CustomVariable" (
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

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Collaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EstimateToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EstimateToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EstimateToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EstimateToPricelist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EstimateToPricelist_A_fkey" FOREIGN KEY ("A") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EstimateToPricelist_B_fkey" FOREIGN KEY ("B") REFERENCES "Pricelist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TeamToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TeamToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TeamToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PricelistToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PricelistToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Pricelist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PricelistToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TakeoffModelToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TakeoffModelToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "TakeoffModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TakeoffModelToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userId_key" ON "UserImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_target_type_key" ON "Verification"("target", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_providerName_providerId_key" ON "Connection"("providerName", "providerId");

-- CreateIndex
CREATE INDEX "Estimate_ownerId_idx" ON "Estimate"("ownerId");

-- CreateIndex
CREATE INDEX "Estimate_ownerId_updatedAt_idx" ON "Estimate"("ownerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BuildingDimensions_estimationId_key" ON "BuildingDimensions"("estimationId");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateResults_estimateId_name_key" ON "EstimateResults"("estimateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateFormData_estimateId_name_key" ON "EstimateFormData"("estimateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomVariable_takeoffModelId_name_key" ON "CustomVariable"("takeoffModelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EstimateToTeam_AB_unique" ON "_EstimateToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_EstimateToTeam_B_index" ON "_EstimateToTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EstimateToPricelist_AB_unique" ON "_EstimateToPricelist"("A", "B");

-- CreateIndex
CREATE INDEX "_EstimateToPricelist_B_index" ON "_EstimateToPricelist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TeamToUser_AB_unique" ON "_TeamToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamToUser_B_index" ON "_TeamToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PricelistToTeam_AB_unique" ON "_PricelistToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_PricelistToTeam_B_index" ON "_PricelistToTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TakeoffModelToTeam_AB_unique" ON "_TakeoffModelToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_TakeoffModelToTeam_B_index" ON "_TakeoffModelToTeam"("B");

INSERT INTO Permission VALUES('clxdvqngn0000jihwlo25rnse','create','user','own','',1718320634951,1718320634951);
INSERT INTO Permission VALUES('clxdvqngo0001jihwrela6xmm','create','user','any','',1718320634952,1718320634952);
INSERT INTO Permission VALUES('clxdvqngo0002jihws0oxjl95','create','user','team','',1718320634953,1718320634953);
INSERT INTO Permission VALUES('clxdvqngp0003jihwdlgqib4t','read','user','own','',1718320634953,1718320634953);
INSERT INTO Permission VALUES('clxdvqngp0004jihwu2mk3652','read','user','any','',1718320634954,1718320634954);
INSERT INTO Permission VALUES('clxdvqngq0005jihwva4yf9o3','read','user','team','',1718320634954,1718320634954);
INSERT INTO Permission VALUES('clxdvqngq0006jihw144u9lu9','write','user','own','',1718320634955,1718320634955);
INSERT INTO Permission VALUES('clxdvqngr0007jihwsumbm9j5','write','user','any','',1718320634956,1718320634956);
INSERT INTO Permission VALUES('clxdvqngs0008jihwao1xlkao','write','user','team','',1718320634956,1718320634956);
INSERT INTO Permission VALUES('clxdvqngs0009jihw5n00f1pj','delete','user','own','',1718320634957,1718320634957);
INSERT INTO Permission VALUES('clxdvqngt000ajihw4ihylthe','delete','user','any','',1718320634958,1718320634958);
INSERT INTO Permission VALUES('clxdvqngu000bjihwod3xzlcf','delete','user','team','',1718320634959,1718320634959);
INSERT INTO Permission VALUES('clxdvqngv000cjihw1d0hik6a','create','estimate','own','',1718320634959,1718320634959);
INSERT INTO Permission VALUES('clxdvqngw000djihwoc32cg1e','create','estimate','any','',1718320634960,1718320634960);
INSERT INTO Permission VALUES('clxdvqngx000ejihwm2e92tyf','create','estimate','team','',1718320634961,1718320634961);
INSERT INTO Permission VALUES('clxdvqngx000fjihwh4r8yswf','read','estimate','own','',1718320634962,1718320634962);
INSERT INTO Permission VALUES('clxdvqngy000gjihwkxcle6jk','read','estimate','any','',1718320634962,1718320634962);
INSERT INTO Permission VALUES('clxdvqngy000hjihwokrt7mak','read','estimate','team','',1718320634963,1718320634963);
INSERT INTO Permission VALUES('clxdvqngz000ijihwuw51ihlo','write','estimate','own','',1718320634963,1718320634963);
INSERT INTO Permission VALUES('clxdvqngz000jjihwoxlbcsyq','write','estimate','any','',1718320634964,1718320634964);
INSERT INTO Permission VALUES('clxdvqnh0000kjihwaexnbnxn','write','estimate','team','',1718320634964,1718320634964);
INSERT INTO Permission VALUES('clxdvqnh0000ljihwrc6d5edk','delete','estimate','own','',1718320634965,1718320634965);
INSERT INTO Permission VALUES('clxdvqnh1000mjihwc1zypayp','delete','estimate','any','',1718320634965,1718320634965);
INSERT INTO Permission VALUES('clxdvqnh1000njihwbvzhxric','delete','estimate','team','',1718320634966,1718320634966);
INSERT INTO Permission VALUES('clxdvqnh2000ojihw8m4sz5rm','create','pricelist','own','',1718320634966,1718320634966);
INSERT INTO Permission VALUES('clxdvqnh2000pjihwwc6caxsg','create','pricelist','any','',1718320634967,1718320634967);
INSERT INTO Permission VALUES('clxdvqnh3000qjihwouyqsw38','create','pricelist','team','',1718320634967,1718320634967);
INSERT INTO Permission VALUES('clxdvqnh3000rjihwdoexwsgs','read','pricelist','own','',1718320634968,1718320634968);
INSERT INTO Permission VALUES('clxdvqnh3000sjihwyi9yolcj','read','pricelist','any','',1718320634968,1718320634968);
INSERT INTO Permission VALUES('clxdvqnh4000tjihwttoof5v6','read','pricelist','team','',1718320634968,1718320634968);
INSERT INTO Permission VALUES('clxdvqnh4000ujihwq0zulk4w','write','pricelist','own','',1718320634969,1718320634969);
INSERT INTO Permission VALUES('clxdvqnh5000vjihwdhavbutf','write','pricelist','any','',1718320634970,1718320634970);
INSERT INTO Permission VALUES('clxdvqnh6000wjihw0mkh0ydu','write','pricelist','team','',1718320634970,1718320634970);
INSERT INTO Permission VALUES('clxdvqnh6000xjihw1k5kr8ci','delete','pricelist','own','',1718320634971,1718320634971);
INSERT INTO Permission VALUES('clxdvqnh7000yjihwy403k8fj','delete','pricelist','any','',1718320634971,1718320634971);
INSERT INTO Permission VALUES('clxdvqnh8000zjihwzm3hith3','delete','pricelist','team','',1718320634972,1718320634972);
INSERT INTO Permission VALUES('clxdvqnh80010jihwqrpgf8h3','create','takeoffModel','own','',1718320634973,1718320634973);
INSERT INTO Permission VALUES('clxdvqnh90011jihwn9bx8bzg','create','takeoffModel','any','',1718320634974,1718320634974);
INSERT INTO Permission VALUES('clxdvqnha0012jihw92ml8mk2','create','takeoffModel','team','',1718320634974,1718320634974);
INSERT INTO Permission VALUES('clxdvqnha0013jihwo1nffxaa','read','takeoffModel','own','',1718320634975,1718320634975);
INSERT INTO Permission VALUES('clxdvqnhb0014jihwa8a08ubl','read','takeoffModel','any','',1718320634975,1718320634975);
INSERT INTO Permission VALUES('clxdvqnhc0015jihwyuir8urf','read','takeoffModel','team','',1718320634976,1718320634976);
INSERT INTO Permission VALUES('clxdvqnhc0016jihwxg51l9es','write','takeoffModel','own','',1718320634977,1718320634977);
INSERT INTO Permission VALUES('clxdvqnhd0017jihw27azwpv7','write','takeoffModel','any','',1718320634977,1718320634977);
INSERT INTO Permission VALUES('clxdvqnhd0018jihwc1cgwqlu','write','takeoffModel','team','',1718320634978,1718320634978);
INSERT INTO Permission VALUES('clxdvqnhe0019jihw91xk6v27','delete','takeoffModel','own','',1718320634979,1718320634979);
INSERT INTO Permission VALUES('clxdvqnhf001ajihwwjn434tm','delete','takeoffModel','any','',1718320634979,1718320634979);
INSERT INTO Permission VALUES('clxdvqnhf001bjihwqwjvztud','delete','takeoffModel','team','',1718320634980,1718320634980);
INSERT INTO Permission VALUES('clxdvqnhg001cjihwb41dp02g','create','code','own','',1718320634980,1718320634980);
INSERT INTO Permission VALUES('clxdvqnhg001djihwi66f58ky','create','code','any','',1718320634981,1718320634981);
INSERT INTO Permission VALUES('clxdvqnhh001ejihw437s5mqi','create','code','team','',1718320634982,1718320634982);
INSERT INTO Permission VALUES('clxdvqnhi001fjihwjq1fa2t9','read','code','own','',1718320634982,1718320634982);
INSERT INTO Permission VALUES('clxdvqnhi001gjihwp5iatapi','read','code','any','',1718320634983,1718320634983);
INSERT INTO Permission VALUES('clxdvqnhj001hjihwjzp9dmn9','read','code','team','',1718320634983,1718320634983);
INSERT INTO Permission VALUES('clxdvqnhj001ijihwhmn3ucx6','write','code','own','',1718320634984,1718320634984);
INSERT INTO Permission VALUES('clxdvqnhk001jjihw72me38y1','write','code','any','',1718320634984,1718320634984);
INSERT INTO Permission VALUES('clxdvqnhk001kjihwkvqw2xr8','write','code','team','',1718320634985,1718320634985);
INSERT INTO Permission VALUES('clxdvqnhl001ljihwdobmcww4','delete','code','own','',1718320634985,1718320634985);
INSERT INTO Permission VALUES('clxdvqnhl001mjihwod2dk2bd','delete','code','any','',1718320634986,1718320634986);
INSERT INTO Permission VALUES('clxdvqnhm001njihwea2ec07k','delete','code','team','',1718320634986,1718320634986);
INSERT INTO Role VALUES('clxdvqnhn001ojihwcnsntqbh','admin','',1718320634988,1718320634988);
INSERT INTO Role VALUES('clxdvqnhp001pjihw9a9o5zj7','user','',1718320634990,1718320634990);
INSERT INTO _PermissionToRole VALUES('clxdvqngo0001jihwrela6xmm','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqngp0004jihwu2mk3652','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqngr0007jihwsumbm9j5','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqngt000ajihw4ihylthe','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqngw000djihwoc32cg1e','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqngy000gjihwkxcle6jk','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqngz000jjihwoxlbcsyq','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnh1000mjihwc1zypayp','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnh2000pjihwwc6caxsg','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnh3000sjihwyi9yolcj','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnh5000vjihwdhavbutf','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnh7000yjihwy403k8fj','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnh90011jihwn9bx8bzg','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnhb0014jihwa8a08ubl','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnhd0017jihw27azwpv7','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnhf001ajihwwjn434tm','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnhg001djihwi66f58ky','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnhi001gjihwp5iatapi','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnhk001jjihw72me38y1','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqnhl001mjihwod2dk2bd','clxdvqnhn001ojihwcnsntqbh');
INSERT INTO _PermissionToRole VALUES('clxdvqngn0000jihwlo25rnse','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqngp0003jihwdlgqib4t','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqngq0006jihw144u9lu9','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqngs0009jihw5n00f1pj','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqngv000cjihw1d0hik6a','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqngx000fjihwh4r8yswf','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqngz000ijihwuw51ihlo','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnh0000ljihwrc6d5edk','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnh2000ojihw8m4sz5rm','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnh3000rjihwdoexwsgs','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnh4000ujihwq0zulk4w','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnh6000xjihw1k5kr8ci','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnh80010jihwqrpgf8h3','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnha0013jihwo1nffxaa','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnhc0016jihwxg51l9es','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnhe0019jihw91xk6v27','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnhg001cjihwb41dp02g','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnhi001fjihwjq1fa2t9','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnhj001ijihwhmn3ucx6','clxdvqnhp001pjihw9a9o5zj7');
INSERT INTO _PermissionToRole VALUES('clxdvqnhl001ljihwdobmcww4','clxdvqnhp001pjihw9a9o5zj7');
