-- AlterEnum
ALTER TYPE "UsageAction" ADD VALUE 'UPLOAD';

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "fileHash" TEXT,
ADD COLUMN     "isDupe" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
