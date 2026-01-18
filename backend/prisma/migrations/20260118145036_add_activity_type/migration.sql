-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'MEMBER_INVITED';

-- AlterTable
ALTER TABLE "GroupInvite" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';
