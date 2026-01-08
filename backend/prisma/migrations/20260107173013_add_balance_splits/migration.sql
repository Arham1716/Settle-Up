-- AlterTable
ALTER TABLE "GroupInvite" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';

-- CreateTable
CREATE TABLE "BalanceSplit" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceSplit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BalanceSplit_groupId_idx" ON "BalanceSplit"("groupId");

-- CreateIndex
CREATE INDEX "BalanceSplit_userId_idx" ON "BalanceSplit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSplit_groupId_userId_key" ON "BalanceSplit"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "BalanceSplit" ADD CONSTRAINT "BalanceSplit_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSplit" ADD CONSTRAINT "BalanceSplit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
