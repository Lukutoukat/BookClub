ALTER TABLE "BookClub"
ADD COLUMN "suggestionLimitEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "suggestionLimit" INTEGER;
