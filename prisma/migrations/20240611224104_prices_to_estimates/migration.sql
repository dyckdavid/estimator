-- CreateTable
CREATE TABLE "_EstimateToPricelist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EstimateToPricelist_A_fkey" FOREIGN KEY ("A") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EstimateToPricelist_B_fkey" FOREIGN KEY ("B") REFERENCES "Pricelist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_EstimateToPricelist_AB_unique" ON "_EstimateToPricelist"("A", "B");

-- CreateIndex
CREATE INDEX "_EstimateToPricelist_B_index" ON "_EstimateToPricelist"("B");
