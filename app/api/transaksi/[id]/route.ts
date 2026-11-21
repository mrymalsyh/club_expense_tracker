import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { validateTransaksiInput } from '@/lib/transaksi';

export const dynamic = 'force-dynamic';

function hasDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && url.length > 0);
}

function parseNumericId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null;
  const parsed = Number.parseInt(rawId, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        error:
          'Pangkalan data belum disambungkan (DATABASE_URL belum ditetapkan). Sila tetapkan DATABASE_URL dalam .env atau Secrets.',
      },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const numericId = parseNumericId(id);

  if (!numericId) {
    return NextResponse.json(
      { error: 'ID transaksi tidak sah.' },
      { status: 400 }
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

  const validation = validateTransaksiInput(body, { partial: true });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const updated = await prisma.transaksi.update({
      where: { id: numericId },
      data: validation.data,
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Rekod transaksi tidak ditemui.' },
        { status: 404 }
      );
    }
    console.warn(
      `PATCH /api/transaksi/${numericId} warning:`,
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: 'Gagal mengemas kini rekod transaksi dalam pangkalan data.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        error:
          'Pangkalan data belum disambungkan (DATABASE_URL belum ditetapkan). Sila tetapkan DATABASE_URL dalam .env atau Secrets.',
      },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const numericId = parseNumericId(id);

  if (!numericId) {
    return NextResponse.json(
      { error: 'ID transaksi tidak sah.' },
      { status: 400 }
    );
  }

  try {
    await prisma.transaksi.delete({
      where: { id: numericId },
    });

    return NextResponse.json(
      { message: 'Rekod transaksi berjaya dipadam.', id: numericId },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Rekod transaksi tidak ditemui.' },
        { status: 404 }
      );
    }
    console.warn(
      `DELETE /api/transaksi/${numericId} warning:`,
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: 'Gagal memadam rekod transaksi daripada pangkalan data.' },
      { status: 500 }
    );
  }
}
