import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ensureTransaksiTable, isTableMissingError, prisma } from '@/lib/prisma';
import {
  JENIS_TRANSAKSI_OPTIONS,
  KATEGORI_OPTIONS,
  TransaksiPayload,
  validateTransaksiInput,
} from '@/lib/transaksi';

export const dynamic = 'force-dynamic';

function hasDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && url.length > 0);
}

function getDatabaseErrorMessage(error: unknown): string {
  if (!hasDatabaseUrl()) {
    return 'Pemboleh ubah persekitaran DATABASE_URL belum dikonfigurasi pada pelayan.';
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021') {
      return 'Jadual Transaksi belum wujud dalam pangkalan data. Sila jalankan npx prisma db push.';
    }
    if (error.code === 'P1001' || error.code === 'P1000') {
      return 'Tidak dapat menyambung ke pelayan PostgreSQL. Sila semak DATABASE_URL anda.';
    }
  }
  return 'Gagal berhubung dengan pangkalan data PostgreSQL. Sila semak sambungan DATABASE_URL anda.';
}

export async function GET(request: NextRequest) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { data: [], databaseConfigured: false },
      { status: 200 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const kategori = searchParams.get('kategori');
  const jenis = searchParams.get('jenis_transaksi');

  const where: { kategori?: string; jenis_transaksi?: string } = {};

  if (kategori && kategori !== 'Semua') {
    if (!(KATEGORI_OPTIONS as readonly string[]).includes(kategori)) {
      return NextResponse.json(
        { error: 'Penapis kategori tidak sah.' },
        { status: 400 }
      );
    }
    where.kategori = kategori;
  }

  if (jenis && jenis !== 'Semua') {
    if (!(JENIS_TRANSAKSI_OPTIONS as readonly string[]).includes(jenis)) {
      return NextResponse.json(
        { error: 'Penapis jenis transaksi tidak sah.' },
        { status: 400 }
      );
    }
    where.jenis_transaksi = jenis;
  }

  const runQuery = () =>
    prisma.transaksi.findMany({
      where,
      orderBy: [{ tarikh: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    });

  try {
    let transaksi;
    try {
      transaksi = await runQuery();
    } catch (firstError) {
      if (isTableMissingError(firstError)) {
        await ensureTransaksiTable();
        transaksi = await runQuery();
      } else {
        throw firstError;
      }
    }

    return NextResponse.json(
      { data: transaksi, databaseConfigured: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        error:
          'Pangkalan data belum disambungkan (DATABASE_URL belum ditetapkan). Sila tetapkan DATABASE_URL dalam .env atau Secrets.',
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Muatan JSON tidak sah.' },
      { status: 400 }
    );
  }

  const validation = validateTransaksiInput(body, { partial: false });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const payload = validation.data as TransaksiPayload;

  const runCreate = () =>
    prisma.transaksi.create({
      data: {
        perkara: payload.perkara,
        jenis_transaksi: payload.jenis_transaksi,
        kategori: payload.kategori,
        jumlah_rm: payload.jumlah_rm,
        tarikh: payload.tarikh,
      },
    });

  try {
    let created;
    try {
      created = await runCreate();
    } catch (firstError) {
      if (isTableMissingError(firstError)) {
        await ensureTransaksiTable();
        created = await runCreate();
      } else {
        throw firstError;
      }
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: getDatabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
