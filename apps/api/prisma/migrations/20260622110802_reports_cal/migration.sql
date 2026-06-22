-- CreateTable
CREATE TABLE "report_cal" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "days" INTEGER NOT NULL DEFAULT 5,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_cal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_cal_type_role_days_key" ON "report_cal"("type", "role", "days");
