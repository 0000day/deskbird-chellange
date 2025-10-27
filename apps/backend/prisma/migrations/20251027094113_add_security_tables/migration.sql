-- CreateTable
CREATE TABLE "ip_addresses" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "attack_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attack_attempts" (
    "id" SERIAL NOT NULL,
    "ip_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attack_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ip_addresses_ip_address_key" ON "ip_addresses"("ip_address");

-- AddForeignKey
ALTER TABLE "attack_attempts" ADD CONSTRAINT "attack_attempts_ip_id_fkey" FOREIGN KEY ("ip_id") REFERENCES "ip_addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
