'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import {
  JENIS_TRANSAKSI_OPTIONS,
  JenisTransaksi,
  KATEGORI_OPTIONS,
  KategoriTransaksi,
  TransaksiRecord,
  toDateInputValue,
} from '@/lib/transaksi';

export interface TransactionFormValues {
  perkara: string;
  jenis_transaksi: JenisTransaksi;
  kategori: KategoriTransaksi;
  jumlah_rm: number;
  tarikh: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  editingRecord: TransaksiRecord | null;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues, editingId?: number) => Promise<void>;
}

interface TransactionModalBodyProps {
  editingRecord: TransaksiRecord | null;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues, editingId?: number) => Promise<void>;
}

function TransactionModalBody({
  editingRecord,
  onClose,
  onSubmit,
}: TransactionModalBodyProps) {
  const [perkara, setPerkara] = useState(() => editingRecord?.perkara ?? '');
  const [jenisTransaksi, setJenisTransaksi] = useState<JenisTransaksi>(() =>
    editingRecord?.jenis_transaksi === 'Pendapatan' ? 'Pendapatan' : 'Perbelanjaan'
  );
  const [kategori, setKategori] = useState<KategoriTransaksi>(() =>
    editingRecord && (KATEGORI_OPTIONS as readonly string[]).includes(editingRecord.kategori)
      ? (editingRecord.kategori as KategoriTransaksi)
      : 'Makanan'
  );
  const [jumlahRm, setJumlahRm] = useState(() =>
    editingRecord ? editingRecord.jumlah_rm.toFixed(2) : ''
  );
  const [tarikh, setTarikh] = useState(() =>
    editingRecord ? toDateInputValue(editingRecord.tarikh) : toDateInputValue()
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleJenisChange = (nextJenis: JenisTransaksi) => {
    setJenisTransaksi(nextJenis);
    if (!editingRecord) {
      if (nextJenis === 'Pendapatan' && !['Tajaan', 'Yuran', 'Lain-lain'].includes(kategori)) {
        setKategori('Tajaan');
      } else if (nextJenis === 'Perbelanjaan' && ['Tajaan', 'Yuran'].includes(kategori)) {
        setKategori('Makanan');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedPerkara = perkara.trim();
    if (!trimmedPerkara) {
      setFormError('Sila masukkan keterangan perkara transaksi.');
      return;
    }

    const numericAmount = Number(jumlahRm);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Sila masukkan jumlah RM yang sah (lebih daripada 0.00).');
      return;
    }

    if (!tarikh) {
      setFormError('Sila pilih tarikh transaksi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          perkara: trimmedPerkara,
          jenis_transaksi: jenisTransaksi,
          kategori,
          jumlah_rm: Math.round(numericAmount * 100) / 100,
          tarikh,
        },
        editingRecord?.id
      );
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Gagal menyimpan rekod transaksi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="transaction-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {editingRecord ? 'Kemas Kini Transaksi' : 'Tambah Rekod Transaksi'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {editingRecord
                ? `ID Rekod #${editingRecord.id} · Sila semak butiran sebelum menyimpan`
                : 'Rekod aliran tunai masuk atau keluar kelab pelajar'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              {JENIS_TRANSAKSI_OPTIONS.map((option) => {
                const active = jenisTransaksi === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleJenisChange(option)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-900 ${
                      active
                        ? option === 'Pendapatan'
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'bg-white text-red-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option === 'Pendapatan' ? '+ Pendapatan' : '− Perbelanjaan'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="perkara-input"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Perkara / Keterangan Item
            </label>
            <input
              id="perkara-input"
              type="text"
              required
              maxLength={200}
              value={perkara}
              onChange={(e) => setPerkara(e.target.value)}
              placeholder="cth. Tempahan makanan mesyuarat agung"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="kategori-select"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Kategori
              </label>
              <select
                id="kategori-select"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as KategoriTransaksi)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                {KATEGORI_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tarikh-input"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Tarikh Transaksi
              </label>
              <input
                id="tarikh-input"
                type="date"
                required
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="jumlah-input"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Jumlah (RM)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-medium text-slate-500">
                RM
              </span>
              <input
                id="jumlah-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                inputMode="decimal"
                value={jumlahRm}
                onChange={(e) => setJumlahRm(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3.5 pl-11 font-mono text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? 'Menyimpan...'
                : editingRecord
                  ? 'Simpan Perubahan'
                  : 'Simpan Rekod'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function TransactionModal({
  isOpen,
  editingRecord,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <TransactionModalBody
          key={editingRecord ? `edit-${editingRecord.id}` : 'create-new'}
          editingRecord={editingRecord}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </AnimatePresence>
  );
}
