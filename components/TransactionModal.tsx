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
      setFormError('SILA MASUKKAN KETERANGAN PERKARA TRANSAKSI.');
      return;
    }

    const numericAmount = Number(jumlahRm);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('SILA MASUKKAN JUMLAH RM YANG SAH (LEBIH DARIPADA 0.00).');
      return;
    }

    if (!tarikh) {
      setFormError('SILA PILIH TARIKH TRANSAKSI.');
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
        transition={{ duration: 0.14 }}
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-black/75"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-none border-2 border-black bg-white text-black"
      >
        <div className="flex items-center justify-between border-b-2 border-black bg-[#FF4D00] px-6 py-4">
          <div>
            <h2
              id="transaction-modal-title"
              className="font-[family-name:var(--font-display)] text-2xl leading-[0.88] tracking-[-0.04em] uppercase"
            >
              {editingRecord ? 'KEMAS KINI REKOD' : 'TAMBAH REKOD'}
            </h2>
            <p className="mt-1 font-mono text-[11px] font-bold tracking-[-0.02em] text-black uppercase">
              {editingRecord
                ? `ID REKOD #${editingRecord.id} · KEMAS KINI DATA LEJAR`
                : 'ALIRAN TUNAI KELAB · RINGGIT MALAYSIA (RM)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup modal"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white text-black transition-transform hover:scale-110 hover:bg-black hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {formError && (
            <div
              role="alert"
              className="rounded-none border-2 border-black bg-black px-3.5 py-2.5 font-mono text-xs font-bold tracking-[-0.02em] text-[#FF4D00]"
            >
              {formError}
            </div>
          )}

          <div>
            <label className="mb-2 block font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-3">
              {JENIS_TRANSAKSI_OPTIONS.map((option) => {
                const active = jenisTransaksi === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleJenisChange(option)}
                    className={`rounded-full border-2 border-black px-4 py-2.5 font-mono text-xs font-bold tracking-[-0.02em] uppercase transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? option === 'Pendapatan'
                          ? 'bg-black text-emerald-400'
                          : 'bg-black text-[#FF4D00]'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {option === 'Pendapatan' ? '+ PENDAPATAN' : '− PERBELANJAAN'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="perkara-input"
              className="mb-1.5 block font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase"
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
              className="w-full rounded-none border-2 border-black bg-white px-3.5 py-2.5 font-sans text-sm text-black placeholder:text-black/45 focus:bg-[#FF4D00]/10 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="kategori-select"
                className="mb-1.5 block font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase"
              >
                Kategori
              </label>
              <select
                id="kategori-select"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as KategoriTransaksi)}
                className="w-full rounded-none border-2 border-black bg-white px-3.5 py-2.5 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase focus:outline-none"
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
                className="mb-1.5 block font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase"
              >
                Tarikh Transaksi
              </label>
              <input
                id="tarikh-input"
                type="date"
                required
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                className="w-full rounded-none border-2 border-black bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-black focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="jumlah-input"
              className="mb-1.5 block font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase"
            >
              Jumlah (RM)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-xs font-bold text-black">
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
                className="w-full rounded-none border-2 border-black bg-white py-2.5 pr-3.5 pl-11 font-mono text-sm font-bold tabular-nums text-black placeholder:text-black/45 focus:bg-[#FF4D00]/10 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t-2 border-black pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border-2 border-black bg-white px-5 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase transition-all hover:bg-black hover:text-white whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-5 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-white uppercase transition-transform hover:scale-105 hover:bg-[#FF4D00] hover:text-black whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting
                ? 'MENYIMPAN...'
                : editingRecord
                  ? 'SIMPAN PERUBAHAN'
                  : 'SIMPAN REKOD'}
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
