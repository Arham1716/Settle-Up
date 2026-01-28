-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'ADMIN_TRANSFERRED';

-- AlterTable
ALTER TABLE "GroupInvite" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';
