-- Add seenAt timestamp to Activity to track when a user has seen an item
ALTER TABLE "Activity" ADD COLUMN "seenAt" TIMESTAMP(3);

