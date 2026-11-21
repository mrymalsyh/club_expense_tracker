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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-12 items-center justify-between gap-4 px-5 animate-pulse"
            >
              <div className="h-3.5 w-24 rounded bg-slate-100" />
              <div className="h-3.5 flex-1 max-w-md rounded bg-slate-100" />
              <div className="h-3.5 w-20 rounded bg-slate-100" />
              <div className="h-3.5 w-24 rounded bg-slate-100" />
              <div className="h-3.5 w-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
        <h3 className="text-base font-semibold text-slate-900">
          {totalUnfilteredCount === 0
            ? 'Belum ada rekod transaksi kelab'
            : 'Tiada transaksi sepadan dengan penapis'}
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
          {totalUnfilteredCount === 0
            ? 'Mulakan lejar kewangan kelab anda dengan merekod tajaan, kutipan yuran, atau perbelanjaan program.'
            : 'Cuba ubah kategori, jenis transaksi, atau kata kunci carian untuk melihat rekod lain.'}
        </p>
        <div className="mt-5 flex justify-center">
          {totalUnfilteredCount === 0 ? (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              Tambah Rekod Pertama
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              Set Semula Penapis
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
              <th className="py-3 pl-5 pr-3 whitespace-nowrap">Tarikh</th>
              <th className="px-3 py-3">Perkara</th>
              <th className="px-3 py-3 whitespace-nowrap">Kategori</th>
              <th className="px-3 py-3 whitespace-nowrap">Jenis</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Jumlah (RM)</th>
              <th className="py-3 pl-3 pr-5 text-right whitespace-nowrap">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {records.map((record) => {
              const isIncome = record.jenis_transaksi === 'Pendapatan';
              return (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-slate-50/90"
                >
                  <td className="py-3 pl-5 pr-3 font-mono text-xs tabular-nums text-slate-500 whitespace-nowrap">
                    {formatTarikhPaparan(record.tarikh)}
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-900 min-w-[220px]">
                    {record.perkara}
                  </td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                    {record.kategori}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-medium ${
                        isIncome ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {isIncome ? '+ Pendapatan' : '− Perbelanjaan'}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-3 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                      isIncome ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isIncome ? '+' : '−'} {formatAbsoluteRM(record.jumlah_rm)}
                  </td>
                  <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        aria-label={`Edit ${record.perkara}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestDelete(record)}
                        aria-label={`Padam ${record.perkara}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Padam</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-600">
        <div>
          Menunjukkan <span className="font-mono font-semibold text-slate-900">{records.length}</span>{' '}
          daripada <span className="font-mono font-semibold text-slate-900">{totalUnfilteredCount}</span>{' '}
          rekod
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
            <span className="text-emerald-700">
              Masuk: +{formatAbsoluteRM(filteredIncome)}
            </span>
            <span className="text-red-700">
              Keluar: −{formatAbsoluteRM(filteredExpense)}
            </span>
            <span className={filteredNet < 0 ? 'font-semibold text-red-600' : 'font-semibold text-slate-900'}>
              Bersih Paparan: {formatRM(filteredNet)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
