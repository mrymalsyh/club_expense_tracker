'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import {
  TransaksiRecord,
  formatAbsoluteRM,
  formatTarikhPaparan,
} from '@/lib/transaksi';

interface DeleteConfirmModalProps {
  record: TransaksiRecord | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export default function DeleteConfirmModal({
  record,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!record) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [record, isDeleting, onCancel]);

  return (
    <AnimatePresence>
      {record && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !isDeleting && onCancel()}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="flex items-start justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="delete-modal-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Sahkan Pemadaman Rekod
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tindakan ini tidak boleh dipulihkan semula.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                aria-label="Tutup pengesahan"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-medium text-slate-900">{record.perkara}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatTarikhPaparan(record.tarikh)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{record.kategori}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      record.jenis_transaksi === 'Pendapatan'
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {record.jenis_transaksi === 'Pendapatan' ? '+' : '−'}{' '}
                    {formatAbsoluteRM(record.jumlah_rm)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onConfirm(record.id)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? 'Memadam...' : 'Ya, Padam Rekod'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
