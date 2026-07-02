-- CreateTable
CREATE TABLE "todos" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "completed" BOOLEAN DEFAULT false,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);
