-- AlterTable
ALTER TABLE "GroupInvite" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '7 days';
