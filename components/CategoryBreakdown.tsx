'use client';

import { ArrowUp } from 'lucide-react';
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
  const breakdown = KATEGORI_OPTIONS.map((kategori, idx) => {
    const matching = records.filter((r) => r.kategori === kategori);
    const pendapatan = matching
      .filter((r) => r.jenis_transaksi === 'Pendapatan')
      .reduce((sum, r) => sum + r.jumlah_rm, 0);
    const perbelanjaan = matching
      .filter((r) => r.jenis_transaksi === 'Perbelanjaan')
      .reduce((sum, r) => sum + r.jumlah_rm, 0);

    return {
      index: String(idx + 1).padStart(2, '0'),
      kategori,
      count: matching.length,
      pendapatan,
      perbelanjaan,
    };
  });

  const handleCategoryClick = (kategori: string) => {
    const next = activeKategori === kategori ? 'Semua' : kategori;
    onSelectKategori(next);
    const ledger = document.getElementById('lejar-transaksi');
    if (ledger) {
      ledger.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="pecahan-kategori"
      aria-labelledby="pecahan-kategori-heading"
      className="w-full border-y-2 border-black bg-black text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold tracking-[-0.02em] text-[#FF4D00] uppercase">
              PECAHAN KATEGORI / TAPIS LEJAR
            </p>
            <h2
              id="pecahan-kategori-heading"
              className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-[0.88] tracking-[-0.04em] text-white uppercase sm:text-6xl"
            >
              SENARAI KATEGORI
            </h2>
          </div>

          {activeKategori !== 'Semua' && (
            <button
              type="button"
              onClick={() => onSelectKategori('Semua')}
              className="rounded-full border-2 border-white bg-transparent px-5 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-white uppercase transition-all hover:scale-110 hover:bg-white hover:text-black whitespace-nowrap shrink-0"
            >
              PAPAR SEMUA ({records.length})
            </button>
          )}
        </div>

        <div className="border-b border-white/20">
          {breakdown.map((item) => {
            const isSelected = activeKategori === item.kategori;
            return (
              <button
                key={item.kategori}
                type="button"
                onClick={() => handleCategoryClick(item.kategori)}
                className={`group flex w-full items-center justify-between gap-4 border-t border-white/20 px-2 py-6 text-left transition-colors sm:px-4 sm:py-8 ${
                  isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                  <span className="font-mono text-sm font-bold tracking-[-0.02em] text-[#FF4D00] shrink-0 sm:text-base">
                    {item.index}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="font-[family-name:var(--font-display)] text-[9vw] leading-[0.88] tracking-[-0.04em] text-white uppercase transition-transform duration-200 group-hover:translate-x-4 sm:text-[5.5vw] lg:text-[4.5vw]">
                      {item.kategori}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 transition-transform duration-200 group-hover:translate-x-4">
                      <span className="rounded-full border border-white/40 px-3 py-1 font-mono text-[11px] font-bold tracking-[-0.02em] text-white uppercase">
                        {item.count} REKOD
                      </span>
                      <span className="rounded-full border border-emerald-400/60 bg-emerald-950/60 px-3 py-1 font-mono text-[11px] font-bold tabular-nums tracking-[-0.02em] text-emerald-300 uppercase">
                        MASUK +{formatRM(item.pendapatan)}
                      </span>
                      <span className="rounded-full border border-[#FF4D00]/70 bg-[#FF4D00]/15 px-3 py-1 font-mono text-[11px] font-bold tabular-nums tracking-[-0.02em] text-[#FF4D00] uppercase">
                        KELUAR −{formatRM(item.perbelanjaan)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <ArrowUp
                    aria-hidden="true"
                    className={`h-8 w-8 text-[#FF4D00] transition-all duration-200 sm:h-12 sm:w-12 ${
                      isSelected
                        ? 'opacity-100 rotate-45'
                        : 'opacity-0 rotate-0 group-hover:opacity-100 group-hover:rotate-45'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
