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
            transition={{ duration: 0.14 }}
            onClick={() => !isDeleting && onCancel()}
            className="fixed inset-0 bg-black/75"
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-none border-2 border-black bg-white text-black"
          >
            <div className="flex items-start justify-between border-b-2 border-black bg-[#FF4D00] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border-2 border-black bg-black text-[#FF4D00]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="delete-modal-title"
                    className="font-[family-name:var(--font-display)] text-xl leading-[0.9] tracking-[-0.04em] uppercase"
                  >
                    SAHKAN PADAM
                  </h2>
                  <p className="mt-1 font-mono text-[11px] font-bold tracking-[-0.02em] text-black uppercase">
                    TINDAKAN KEKAL · TIDAK BOLEH DIPULIHKAN
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                aria-label="Tutup pengesahan"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-black transition-transform hover:scale-110 hover:bg-black hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-none border-2 border-black bg-white p-4">
                <p className="font-sans text-sm font-semibold text-black">
                  {record.perkara}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-xs tracking-[-0.02em] text-black/80 uppercase">
                  <span>{formatTarikhPaparan(record.tarikh)}</span>
                  <span aria-hidden="true">/</span>
                  <span>{record.kategori}</span>
                  <span aria-hidden="true">/</span>
                  <span
                    className={`font-bold tabular-nums ${
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

            <div className="flex items-center justify-end gap-3 border-t-2 border-black px-6 py-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="rounded-full border-2 border-black bg-white px-5 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase transition-all hover:bg-black hover:text-white whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={() => onConfirm(record.id)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-5 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-[#FF4D00] uppercase transition-transform hover:scale-105 whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isDeleting ? 'MEMADAM...' : 'YA, PADAM REKOD'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
