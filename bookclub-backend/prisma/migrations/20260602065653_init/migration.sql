-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "isbn" TEXT,
    "name" TEXT,
    "author" TEXT,
    "year" INTEGER,
    "pages" INTEGER,
    "comment" TEXT,
    "language" TEXT,
    "genre" TEXT,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookClub" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "status" INTEGER,
    "owner_id" INTEGER,

    CONSTRAINT "BookClub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookClubMembers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "user_role" INTEGER,
    "bookclub_id" INTEGER,

    CONSTRAINT "BookClubMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookProposed" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER,
    "bookclub_id" INTEGER,

    CONSTRAINT "BookProposed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookSaved" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "book_id" INTEGER,

    CONSTRAINT "BookSaved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookVoted" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER,
    "user_id" INTEGER,
    "bookclub_id" INTEGER,
    "score" INTEGER,

    CONSTRAINT "BookVoted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" SERIAL NOT NULL,
    "bookclub_id" INTEGER,
    "invite_code" TEXT,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "BookClub" ADD CONSTRAINT "BookClub_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookClubMembers" ADD CONSTRAINT "BookClubMembers_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookClubMembers" ADD CONSTRAINT "BookClubMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookProposed" ADD CONSTRAINT "BookProposed_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookSaved" ADD CONSTRAINT "BookSaved_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookSaved" ADD CONSTRAINT "BookSaved_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookVoted" ADD CONSTRAINT "BookVoted_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_bookclub_id_fkey" FOREIGN KEY ("bookclub_id") REFERENCES "BookClub"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
