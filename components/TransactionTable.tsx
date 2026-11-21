'use client';

import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  TransaksiRecord,
  formatAbsoluteRM,
  formatRM,
  formatTarikhPaparan,
} from '@/lib/transaksi';

interface TransactionTableProps {
  records: TransaksiRecord[];
  totalUnfilteredCount: number;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onEdit: (record: TransaksiRecord) => void;
  onRequestDelete: (record: TransaksiRecord) => void;
  onResetFilters: () => void;
  onOpenCreate: () => void;
}

export default function TransactionTable({
  records,
  totalUnfilteredCount,
  isLoading,
  hasActiveFilters,
  onEdit,
  onRequestDelete,
  onResetFilters,
  onOpenCreate,
}: TransactionTableProps) {
  const filteredIncome = records
    .filter((r) => r.jenis_transaksi === 'Pendapatan')
    .reduce((sum, r) => sum + r.jumlah_rm, 0);

  const filteredExpense = records
    .filter((r) => r.jenis_transaksi === 'Perbelanjaan')
    .reduce((sum, r) => sum + r.jumlah_rm, 0);

  const filteredNet = filteredIncome - filteredExpense;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-none border-2 border-black bg-white">
        <div className="divide-y-2 divide-black/15">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-14 items-center justify-between gap-4 px-5 animate-pulse"
            >
              <div className="h-3.5 w-24 rounded-none bg-black/10" />
              <div className="h-3.5 flex-1 max-w-md rounded-none bg-black/10" />
              <div className="h-3.5 w-20 rounded-none bg-black/10" />
              <div className="h-3.5 w-24 rounded-none bg-black/10" />
              <div className="h-3.5 w-16 rounded-none bg-black/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-none border-2 border-black bg-white px-6 py-14 text-center text-black">
        <h3 className="font-[family-name:var(--font-display)] text-2xl leading-[0.9] tracking-[-0.04em] uppercase sm:text-3xl">
          {totalUnfilteredCount === 0
            ? 'BELUM ADA REKOD TRANSAKSI'
            : 'TIADA TRANSAKSI SEPADAN'}
        </h3>
        <p className="mx-auto mt-3 max-w-md font-sans text-sm text-black/75">
          {totalUnfilteredCount === 0
            ? 'Mulakan lejar kewangan kelab anda dengan merekod tajaan, kutipan yuran, atau perbelanjaan program.'
            : 'Cuba ubah kategori, jenis transaksi, atau kata kunci carian untuk melihat rekod lain.'}
        </p>
        <div className="mt-6 flex justify-center">
          {totalUnfilteredCount === 0 ? (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-6 py-2.5 font-mono text-xs font-bold tracking-[-0.02em] text-white uppercase transition-transform hover:scale-110 hover:bg-[#FF4D00] hover:text-black whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              TAMBAH REKOD PERTAMA
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-6 py-2.5 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase transition-transform hover:scale-110 hover:bg-black hover:text-white whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              SET SEMULA PENAPIS
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-none border-2 border-black bg-white text-black">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black bg-black font-mono text-xs font-bold tracking-[-0.02em] text-white uppercase">
              <th className="py-3.5 pl-5 pr-3 whitespace-nowrap">TARIKH</th>
              <th className="px-3 py-3.5">PERKARA</th>
              <th className="px-3 py-3.5 whitespace-nowrap">KATEGORI</th>
              <th className="px-3 py-3.5 whitespace-nowrap">JENIS</th>
              <th className="px-3 py-3.5 text-right whitespace-nowrap">JUMLAH (RM)</th>
              <th className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">TINDAKAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/20 text-sm">
            {records.map((record) => {
              const isIncome = record.jenis_transaksi === 'Pendapatan';
              return (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-[#FF4D00]/10"
                >
                  <td className="py-3.5 pl-5 pr-3 font-mono text-xs font-bold tabular-nums tracking-[-0.02em] text-black/80 whitespace-nowrap uppercase">
                    {formatTarikhPaparan(record.tarikh)}
                  </td>
                  <td className="px-3 py-3.5 font-sans text-sm font-semibold text-black min-w-[220px]">
                    {record.perkara}
                  </td>
                  <td className="px-3 py-3.5 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase whitespace-nowrap">
                    {record.kategori}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`font-mono text-xs font-bold tracking-[-0.02em] uppercase ${
                        isIncome ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {isIncome ? '+ PENDAPATAN' : '− PERBELANJAAN'}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-3.5 text-right font-mono text-sm font-bold tabular-nums tracking-[-0.02em] whitespace-nowrap ${
                      isIncome ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isIncome ? '+' : '−'} {formatAbsoluteRM(record.jumlah_rm)}
                  </td>
                  <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        aria-label={`Edit ${record.perkara}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-black bg-white px-3 font-mono text-[11px] font-bold tracking-[-0.02em] text-black uppercase transition-all hover:scale-105 hover:bg-black hover:text-white"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>EDIT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestDelete(record)}
                        aria-label={`Padam ${record.perkara}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-black bg-black px-3 font-mono text-[11px] font-bold tracking-[-0.02em] text-[#FF4D00] uppercase transition-all hover:scale-105 hover:bg-red-700 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>PADAM</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black bg-white px-5 py-3.5 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
        <div>
          MENUNJUKKAN <span className="tabular-nums underline">{records.length}</span> DARIPADA{' '}
          <span className="tabular-nums underline">{totalUnfilteredCount}</span> REKOD
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-4 tabular-nums">
            <span className="text-emerald-700">
              MASUK: +{formatAbsoluteRM(filteredIncome)}
            </span>
            <span className="text-red-700">
              KELUAR: −{formatAbsoluteRM(filteredExpense)}
            </span>
            <span className={filteredNet < 0 ? 'text-red-700' : 'text-black'}>
              BERSIH PAPARAN: {formatRM(filteredNet)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
