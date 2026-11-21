import { Prisma, PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  ensureTablePromise: Promise<void> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [{ emit: 'event', level: 'error' }],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export function isTableMissingError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021'
  );
}

export async function ensureTransaksiTable(): Promise<void> {
  if (!globalForPrisma.ensureTablePromise) {
    globalForPrisma.ensureTablePromise = prisma
      .$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Transaksi" (
          "id" SERIAL NOT NULL,
          "perkara" TEXT NOT NULL,
          "jenis_transaksi" TEXT NOT NULL,
          "kategori" TEXT NOT NULL,
          "jumlah_rm" DOUBLE PRECISION NOT NULL,
          "tarikh" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
        );
      `)
      .then(() => undefined)
      .catch((err) => {
        globalForPrisma.ensureTablePromise = undefined;
        throw err;
      });
  }
  return globalForPrisma.ensureTablePromise;
}
