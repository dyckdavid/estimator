/*
  Warnings:

  - You are about to drop the column `entityType` on the `Collaboration` table. All the data in the column will be lost.
  - Added the required column `entity` to the `Collaboration` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collaboration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Collaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Collaboration" ("accessLevel", "createdAt", "entityId", "id", "updatedAt", "userId") SELECT "accessLevel", "createdAt", "entityId", "id", "updatedAt", "userId" FROM "Collaboration";
DROP TABLE "Collaboration";
ALTER TABLE "new_Collaboration" RENAME TO "Collaboration";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

INSERT INTO _prisma_migrations VALUES('e13c619e-39e2-4786-98cc-774125a81c3f','f9ca7ec7eed7cb2979b59614d6195249e224aa1966c439a86c7ef5997b16d108',1718316954597,'20230914194400_init',NULL,NULL,1718316954591,1);
INSERT INTO _prisma_migrations VALUES('2c350eb0-2fe0-4561-876d-6b6c2ade5488','e6cf9236969c7098e0466b8926db7054bc4f73484dfd701e7d066b90331961ad',1718316954600,'20240504203638_added_estimations',NULL,NULL,1718316954597,1);
INSERT INTO _prisma_migrations VALUES('94d400e9-adcc-4ddb-b691-aa7db9eb38e8','23bf055c32c0ddc0588451bc97f92584a4a898dd55ff5e729e7a929fff2d0fcc',1718316954602,'20240517152720_changed_content',NULL,NULL,1718316954600,1);
INSERT INTO _prisma_migrations VALUES('c6314c34-4f8a-466c-9970-a71a4482cad9','b0ed2685dcc31fe0996f5d16adef1fb43b4ec36aaf0c30832fd096ec50b8d2e3',1718316954604,'20240517195659_changed_bd',NULL,NULL,1718316954603,1);
INSERT INTO _prisma_migrations VALUES('bd84e613-e6af-48cc-bce4-711e4fc469e5','80d4d03080796acc3cb0b3ff8ff9c30ebba3e01a304570d1f2a06629ad6b8262',1718316954608,'20240525170222_custom_calculations',NULL,NULL,1718316954605,1);
INSERT INTO _prisma_migrations VALUES('66d2cecf-60e6-49bc-85d5-2a9699185214','d3f802c06bf5404048cfabc774159d4747fa3f55a077d1accd3d690835021865',1718316954612,'20240527143449_rename_to_model',NULL,NULL,1718316954608,1);
INSERT INTO _prisma_migrations VALUES('7d378906-8072-4c1a-a274-f604d1ec0ccf','1b68af6e7d5af955c04b25e1a728acaac10d981d15a5424387f85db21c7533c1',1718316954615,'20240527150509_more_renames',NULL,NULL,1718316954612,1);
INSERT INTO _prisma_migrations VALUES('07e40f0a-900f-41f9-adeb-a08fedef26b3','1ebdc32a3679e866d8ea122594f40cfa39829f79a006117bd59c701957f55881',1718316954625,'20240607214024_final_changes_prerelease',NULL,NULL,1718316954616,1);
INSERT INTO _prisma_migrations VALUES('c2d95055-f694-4b5b-900a-009a86f9502f','fafb431052d4f732b4b428b95effa274ca83f8f2e4b2d3a81c97047106aaaf66',1718316954627,'20240610221311_collaborations',NULL,NULL,1718316954625,1);
INSERT INTO _prisma_migrations VALUES('1f065dbc-4c02-4756-aeb5-c2b25fe4dcb5','461f992b5a4d90b83a2a20089d1d2b168feaebe580cfb92ff74d3bc975613a1e',1718316954628,'20240611224104_prices_to_estimates',NULL,NULL,1718316954628,1);
INSERT INTO _prisma_migrations VALUES('b633d5c0-9625-482f-a557-bd61b5514b76','a71480c72b24c2919f68fdbb6822c267af26703faf5bebc607824fa66505b80d',1718316954630,'20240613220834_improved_collaborations',NULL,NULL,1718316954629,1);
INSERT INTO Permission VALUES('clxdtkkis0000uutjaycl81lj','create','user','own','',1718316991972,1718316991972);
INSERT INTO Permission VALUES('clxdtkkit0001uutjmpyeqjxc','create','user','any','',1718316991974,1718316991974);
INSERT INTO Permission VALUES('clxdtkkiu0002uutjppx0mv7k','create','user','team','',1718316991975,1718316991975);
INSERT INTO Permission VALUES('clxdtkkiw0003uutjoob2b04d','read','user','own','',1718316991976,1718316991976);
INSERT INTO Permission VALUES('clxdtkkix0004uutjzlob3gu1','read','user','any','',1718316991977,1718316991977);
INSERT INTO Permission VALUES('clxdtkkiy0005uutjmod8rw74','read','user','team','',1718316991978,1718316991978);
INSERT INTO Permission VALUES('clxdtkkiy0006uutjxj6fhlgv','write','user','own','',1718316991979,1718316991979);
INSERT INTO Permission VALUES('clxdtkkiz0007uutjl17sh8dz','write','user','any','',1718316991980,1718316991980);
INSERT INTO Permission VALUES('clxdtkkj00008uutjt84xgc3k','write','user','team','',1718316991980,1718316991980);
INSERT INTO Permission VALUES('clxdtkkj00009uutjfvzmm46h','delete','user','own','',1718316991981,1718316991981);
INSERT INTO Permission VALUES('clxdtkkj1000auutjkycyt153','delete','user','any','',1718316991981,1718316991981);
INSERT INTO Permission VALUES('clxdtkkj2000buutjz638fesz','delete','user','team','',1718316991982,1718316991982);
INSERT INTO Permission VALUES('clxdtkkj2000cuutj7ybqv44z','create','estimate','own','',1718316991983,1718316991983);
INSERT INTO Permission VALUES('clxdtkkj4000duutj7yserzm3','create','estimate','any','',1718316991984,1718316991984);
INSERT INTO Permission VALUES('clxdtkkj5000euutjgqacjvjg','create','estimate','team','',1718316991985,1718316991985);
INSERT INTO Permission VALUES('clxdtkkj6000fuutjdmd4jqhu','read','estimate','own','',1718316991986,1718316991986);
INSERT INTO Permission VALUES('clxdtkkj6000guutj4towfy9q','read','estimate','any','',1718316991987,1718316991987);
INSERT INTO Permission VALUES('clxdtkkj7000huutjx4eet49e','read','estimate','team','',1718316991987,1718316991987);
INSERT INTO Permission VALUES('clxdtkkj8000iuutjwntcwthy','write','estimate','own','',1718316991988,1718316991988);
INSERT INTO Permission VALUES('clxdtkkj9000juutj4utgio58','write','estimate','any','',1718316991989,1718316991989);
INSERT INTO Permission VALUES('clxdtkkj9000kuutjoynem1o2','write','estimate','team','',1718316991990,1718316991990);
INSERT INTO Permission VALUES('clxdtkkja000luutjexod3a0d','delete','estimate','own','',1718316991990,1718316991990);
INSERT INTO Permission VALUES('clxdtkkja000muutj4radesmf','delete','estimate','any','',1718316991991,1718316991991);
INSERT INTO Permission VALUES('clxdtkkjb000nuutjjwu2i4bp','delete','estimate','team','',1718316991991,1718316991991);
INSERT INTO Permission VALUES('clxdtkkjc000ouutjn11l3ipq','create','pricelist','own','',1718316991992,1718316991992);
INSERT INTO Permission VALUES('clxdtkkjc000puutjiyjp3rka','create','pricelist','any','',1718316991993,1718316991993);
INSERT INTO Permission VALUES('clxdtkkjd000quutje9t9on06','create','pricelist','team','',1718316991993,1718316991993);
INSERT INTO Permission VALUES('clxdtkkjd000ruutjk99l2d83','read','pricelist','own','',1718316991994,1718316991994);
INSERT INTO Permission VALUES('clxdtkkje000suutjixejkb5b','read','pricelist','any','',1718316991994,1718316991994);
INSERT INTO Permission VALUES('clxdtkkje000tuutjigi4lqd8','read','pricelist','team','',1718316991995,1718316991995);
INSERT INTO Permission VALUES('clxdtkkjf000uuutjw5uw8lxb','write','pricelist','own','',1718316991996,1718316991996);
INSERT INTO Permission VALUES('clxdtkkjg000vuutjv2zhbtd6','write','pricelist','any','',1718316991997,1718316991997);
INSERT INTO Permission VALUES('clxdtkkjh000wuutjjnaf0cdj','write','pricelist','team','',1718316991997,1718316991997);
INSERT INTO Permission VALUES('clxdtkkji000xuutjrolkomjp','delete','pricelist','own','',1718316991998,1718316991998);
INSERT INTO Permission VALUES('clxdtkkjj000yuutjqdqq67zt','delete','pricelist','any','',1718316991999,1718316991999);
INSERT INTO Permission VALUES('clxdtkkjj000zuutjgmrbhacu','delete','pricelist','team','',1718316992000,1718316992000);
INSERT INTO Permission VALUES('clxdtkkjk0010uutjjqosahg2','create','takeoffModel','own','',1718316992001,1718316992001);
INSERT INTO Permission VALUES('clxdtkkjl0011uutjujtkus7d','create','takeoffModel','any','',1718316992001,1718316992001);
INSERT INTO Permission VALUES('clxdtkkjl0012uutjws18ljbl','create','takeoffModel','team','',1718316992002,1718316992002);
INSERT INTO Permission VALUES('clxdtkkjm0013uutjlwphrzmr','read','takeoffModel','own','',1718316992003,1718316992003);
INSERT INTO Permission VALUES('clxdtkkjn0014uutjbppz2p5h','read','takeoffModel','any','',1718316992003,1718316992003);
INSERT INTO Permission VALUES('clxdtkkjn0015uutjz75l9k76','read','takeoffModel','team','',1718316992004,1718316992004);
INSERT INTO Permission VALUES('clxdtkkjo0016uutjoav0nhwn','write','takeoffModel','own','',1718316992004,1718316992004);
INSERT INTO Permission VALUES('clxdtkkjp0017uutj8t4312my','write','takeoffModel','any','',1718316992005,1718316992005);
INSERT INTO Permission VALUES('clxdtkkjp0018uutjunn1fiun','write','takeoffModel','team','',1718316992006,1718316992006);
INSERT INTO Permission VALUES('clxdtkkjq0019uutj4qabx79a','delete','takeoffModel','own','',1718316992006,1718316992006);
INSERT INTO Permission VALUES('clxdtkkjq001auutj7a4ktimm','delete','takeoffModel','any','',1718316992007,1718316992007);
INSERT INTO Permission VALUES('clxdtkkjr001buutjt4mmg6h2','delete','takeoffModel','team','',1718316992007,1718316992007);
INSERT INTO Permission VALUES('clxdtkkjr001cuutj1m8qsiea','create','code','own','',1718316992008,1718316992008);
INSERT INTO Permission VALUES('clxdtkkjs001duutjau1van5v','create','code','any','',1718316992008,1718316992008);
INSERT INTO Permission VALUES('clxdtkkjs001euutjseem9wiw','create','code','team','',1718316992009,1718316992009);
INSERT INTO Permission VALUES('clxdtkkjt001fuutjz5g9vdje','read','code','own','',1718316992009,1718316992009);
INSERT INTO Permission VALUES('clxdtkkjt001guutjr0cweqxz','read','code','any','',1718316992010,1718316992010);
INSERT INTO Permission VALUES('clxdtkkju001huutj2kpyfnsy','read','code','team','',1718316992010,1718316992010);
INSERT INTO Permission VALUES('clxdtkkju001iuutjuwpd2lyq','write','code','own','',1718316992011,1718316992011);
INSERT INTO Permission VALUES('clxdtkkjv001juutjghm7385t','write','code','any','',1718316992012,1718316992012);
INSERT INTO Permission VALUES('clxdtkkjw001kuutjw1z0t4b1','write','code','team','',1718316992012,1718316992012);
INSERT INTO Permission VALUES('clxdtkkjw001luutj9etaxuva','delete','code','own','',1718316992013,1718316992013);
INSERT INTO Permission VALUES('clxdtkkjx001muutjuhwv6avg','delete','code','any','',1718316992013,1718316992013);
INSERT INTO Permission VALUES('clxdtkkjx001nuutjlmdov8h4','delete','code','team','',1718316992014,1718316992014);
INSERT INTO _PermissionToRole VALUES('clxdtkkit0001uutjmpyeqjxc','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkix0004uutjzlob3gu1','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkiz0007uutjl17sh8dz','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkj1000auutjkycyt153','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkj4000duutj7yserzm3','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkj6000guutj4towfy9q','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkj9000juutj4utgio58','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkja000muutj4radesmf','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjc000puutjiyjp3rka','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkje000suutjixejkb5b','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjg000vuutjv2zhbtd6','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjj000yuutjqdqq67zt','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjl0011uutjujtkus7d','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjn0014uutjbppz2p5h','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjp0017uutj8t4312my','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjq001auutj7a4ktimm','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjs001duutjau1van5v','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjt001guutjr0cweqxz','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjv001juutjghm7385t','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkjx001muutjuhwv6avg','clxdtkkjz001ouutjpku8yvy3');
INSERT INTO _PermissionToRole VALUES('clxdtkkis0000uutjaycl81lj','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkiw0003uutjoob2b04d','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkiy0006uutjxj6fhlgv','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkj00009uutjfvzmm46h','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkj2000cuutj7ybqv44z','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkj6000fuutjdmd4jqhu','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkj8000iuutjwntcwthy','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkja000luutjexod3a0d','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjc000ouutjn11l3ipq','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjd000ruutjk99l2d83','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjf000uuutjw5uw8lxb','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkji000xuutjrolkomjp','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjk0010uutjjqosahg2','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjm0013uutjlwphrzmr','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjo0016uutjoav0nhwn','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjq0019uutj4qabx79a','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjr001cuutj1m8qsiea','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjt001fuutjz5g9vdje','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkju001iuutjuwpd2lyq','clxdtkkk1001puutjg3ha3s77');
INSERT INTO _PermissionToRole VALUES('clxdtkkjw001luutj9etaxuva','clxdtkkk1001puutjg3ha3s77');
