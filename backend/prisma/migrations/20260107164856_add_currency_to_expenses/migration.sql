-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "GroupInvite" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';
