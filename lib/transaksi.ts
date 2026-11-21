export const JENIS_TRANSAKSI_OPTIONS = ['Pendapatan', 'Perbelanjaan'] as const;
export type JenisTransaksi = (typeof JENIS_TRANSAKSI_OPTIONS)[number];

export const KATEGORI_OPTIONS = [
  'Tajaan',
  'Yuran',
  'Makanan',
  'Percetakan',
  'Logistik',
  'Cenderamata',
  'Lain-lain',
] as const;
export type KategoriTransaksi = (typeof KATEGORI_OPTIONS)[number];

export interface TransaksiRecord {
  id: number;
  perkara: string;
  jenis_transaksi: JenisTransaksi | string;
  kategori: KategoriTransaksi | string;
  jumlah_rm: number;
  tarikh: string;
  createdAt: string;
}

export interface TransaksiPayload {
  perkara: string;
  jenis_transaksi: JenisTransaksi;
  kategori: KategoriTransaksi;
  jumlah_rm: number;
  tarikh: Date;
}

const rmNumberFormatter = new Intl.NumberFormat('en-MY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric value strictly as "RM 1,234.50" (or "-RM 1,234.50" for negative values).
 */
export function formatRM(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const absFormatted = rmNumberFormatter.format(Math.abs(safe));
  return safe < 0 ? `-RM ${absFormatted}` : `RM ${absFormatted}`;
}

export function formatAbsoluteRM(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.abs(amount) : 0;
  return `RM ${rmNumberFormatter.format(safe)}`;
}

export function formatTarikhPaparan(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  }).format(date);
}

export function toDateInputValue(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export function validateTransaksiInput(
  raw: unknown,
  options: { partial?: boolean } = {}
):
  | { ok: true; data: Partial<TransaksiPayload> }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Format data tidak sah. Sila hantar objek JSON.' };
  }

  const body = raw as Record<string, unknown>;
  const data: Partial<TransaksiPayload> = {};
  const isPartial = Boolean(options.partial);

  if (!isPartial || 'perkara' in body) {
    if (typeof body.perkara !== 'string' || body.perkara.trim().length === 0) {
      return { ok: false, error: 'Medan "perkara" wajib diisi dengan teks yang sah.' };
    }
    const trimmed = body.perkara.trim();
    if (trimmed.length > 200) {
      return { ok: false, error: 'Medan "perkara" tidak boleh melebihi 200 aksara.' };
    }
    data.perkara = trimmed;
  }

  if (!isPartial || 'jenis_transaksi' in body) {
    if (
      typeof body.jenis_transaksi !== 'string' ||
      !(JENIS_TRANSAKSI_OPTIONS as readonly string[]).includes(body.jenis_transaksi)
    ) {
      return {
        ok: false,
        error: 'Medan "jenis_transaksi" mestilah "Pendapatan" atau "Perbelanjaan".',
      };
    }
    data.jenis_transaksi = body.jenis_transaksi as JenisTransaksi;
  }

  if (!isPartial || 'kategori' in body) {
    if (
      typeof body.kategori !== 'string' ||
      !(KATEGORI_OPTIONS as readonly string[]).includes(body.kategori)
    ) {
      return {
        ok: false,
        error: `Medan "kategori" mestilah salah satu daripada: ${KATEGORI_OPTIONS.join(', ')}.`,
      };
    }
    data.kategori = body.kategori as KategoriTransaksi;
  }

  if (!isPartial || 'jumlah_rm' in body) {
    const num =
      typeof body.jumlah_rm === 'number'
        ? body.jumlah_rm
        : typeof body.jumlah_rm === 'string' && body.jumlah_rm.trim() !== ''
          ? Number(body.jumlah_rm)
          : NaN;

    if (!Number.isFinite(num) || num <= 0) {
      return { ok: false, error: 'Medan "jumlah_rm" mestilah nombor positif melebihi RM 0.00.' };
    }
    if (num > 100_000_000) {
      return { ok: false, error: 'Medan "jumlah_rm" melebihi had maksimum yang dibenarkan.' };
    }
    data.jumlah_rm = Math.round(num * 100) / 100;
  }

  if (!isPartial || 'tarikh' in body) {
    if (typeof body.tarikh !== 'string' && !(body.tarikh instanceof Date)) {
      return { ok: false, error: 'Medan "tarikh" wajib diisi dengan tarikh yang sah.' };
    }
    const parsedDate = new Date(body.tarikh);
    if (Number.isNaN(parsedDate.getTime())) {
      return { ok: false, error: 'Format "tarikh" tidak sah.' };
    }
    data.tarikh = parsedDate;
  }

  if (isPartial && Object.keys(data).length === 0) {
    return { ok: false, error: 'Tiada medan sah diberikan untuk dikemas kini.' };
  }

  return { ok: true, data };
}
