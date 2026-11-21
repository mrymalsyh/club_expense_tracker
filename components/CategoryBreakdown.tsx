'use client';

import { KATEGORI_OPTIONS, TransaksiRecord, formatRM } from '@/lib/transaksi';

interface CategoryBreakdownProps {
  records: TransaksiRecord[];
  activeKategori: string;
  onSelectKategori: (kategori: string) => void;
}

export default function CategoryBreakdown({
  records,
  activeKategori,
  onSelectKategori,
}: CategoryBreakdownProps) {
  const breakdown = KATEGORI_OPTIONS.map((kategori) => {
    const matching = records.filter((r) => r.kategori === kategori);
    const pendapatan = matching
      .filter((r) => r.jenis_transaksi === 'Pendapatan')
      .reduce((sum, r) => sum + r.jumlah_rm, 0);
    const perbelanjaan = matching
      .filter((r) => r.jenis_transaksi === 'Perbelanjaan')
      .reduce((sum, r) => sum + r.jumlah_rm, 0);
    const totalVolume = pendapatan + perbelanjaan;

    return {
      kategori,
      count: matching.length,
      pendapatan,
      perbelanjaan,
      totalVolume,
    };
  });

  const maxVolume = Math.max(...breakdown.map((b) => b.totalVolume), 1);

  return (
    <section
      id="pecahan-kategori"
      aria-labelledby="pecahan-kategori-heading"
      className="rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 id="pecahan-kategori-heading" className="text-base font-semibold text-slate-900">
            Ringkasan Mengikut Kategori
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Klik mana-mana kategori untuk menapis jadual transaksi secara langsung
          </p>
        </div>
        {activeKategori !== 'Semua' && (
          <button
            type="button"
            onClick={() => onSelectKategori('Semua')}
            className="text-xs font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            Papar Semua Kategori
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {breakdown.map((item) => {
          const isSelected = activeKategori === item.kategori;
          const barWidth =
            item.totalVolume > 0
              ? Math.max(4, Math.round((item.totalVolume / maxVolume) * 100))
              : 0;

          return (
            <button
              key={item.kategori}
              type="button"
              onClick={() =>
                onSelectKategori(isSelected ? 'Semua' : item.kategori)
              }
              className={`grid w-full grid-cols-1 items-center gap-3 px-5 py-3.5 text-left transition-colors sm:grid-cols-12 ${
                isSelected
                  ? 'bg-slate-100/80'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between sm:col-span-3">
                <span
                  className={`text-sm font-medium ${
                    isSelected ? 'text-slate-900 underline underline-offset-4' : 'text-slate-800'
                  }`}
                >
                  {item.kategori}
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-400">
                  {item.count} rekod
                </span>
              </div>

              <div className="sm:col-span-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  {barWidth > 0 && (
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        item.pendapatan >= item.perbelanjaan
                          ? 'bg-emerald-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 font-mono text-xs tabular-nums sm:col-span-4 sm:justify-end">
                <span className="text-emerald-700">
                  +{formatRM(item.pendapatan)}
                </span>
                <span className="text-red-700">
                  −{formatRM(item.perbelanjaan)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
