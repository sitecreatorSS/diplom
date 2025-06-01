/*
  Warnings:

  - You are about to drop the column `size` on the `products` table. All the data in the column will be lost.
  - Added the required column `sizes` to the `products` table without a default value. This is not possible if the table is not empty.
  - Made the column `colors` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "color" TEXT;
ALTER TABLE "order_items" ADD COLUMN "size" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "sizes" TEXT NOT NULL,
    "colors" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "numReviews" INTEGER NOT NULL DEFAULT 0,
    "seller_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("category", "colors", "created_at", "description", "id", "name", "numReviews", "price", "rating", "seller_id", "stock", "updated_at") SELECT "category", "colors", "created_at", "description", "id", "name", "numReviews", "price", "rating", "seller_id", "stock", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
