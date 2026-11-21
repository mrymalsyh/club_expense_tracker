'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
} from 'lucide-react';
import {
  JENIS_TRANSAKSI_OPTIONS,
  KATEGORI_OPTIONS,
  TransaksiRecord,
  formatAbsoluteRM,
  formatRM,
  formatTarikhPaparan,
} from '@/lib/transaksi';
import TransactionModal, { TransactionFormValues } from '@/components/TransactionModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import TransactionTable from '@/components/TransactionTable';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import ToastStack, { ToastItem } from '@/components/ToastStack';

export default function ClubExpenseTrackerPage() {
  const [records, setRecords] = useState<TransaksiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [databaseConfigured, setDatabaseConfigured] = useState(true);

  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TransaksiRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransaksiRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('/api/transaksi', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Gagal memuatkan senarai transaksi.');
      }
      setDatabaseConfigured(json?.databaseConfigured !== false);
      setRecords(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal berhubung dengan pelayan pangkalan data.';
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch('/api/transaksi', { cache: 'no-store' });
        const json = await response.json();
        if (!active) return;
        if (!response.ok) {
          throw new Error(json?.error || 'Gagal memuatkan senarai transaksi.');
        }
        setDatabaseConfigured(json?.databaseConfigured !== false);
        setRecords(Array.isArray(json.data) ? json.data : []);
        setFetchError(null);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal berhubung dengan pelayan pangkalan data.';
        setFetchError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const { totalPendapatan, totalPerbelanjaan, bakiSemasa } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const item of records) {
      if (item.jenis_transaksi === 'Pendapatan') {
        income += item.jumlah_rm;
      } else if (item.jenis_transaksi === 'Perbelanjaan') {
        expense += item.jumlah_rm;
      }
    }
    return {
      totalPendapatan: income,
      totalPerbelanjaan: expense,
      bakiSemasa: income - expense,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((item) => {
      if (filterJenis !== 'Semua' && item.jenis_transaksi !== filterJenis) {
        return false;
      }
      if (filterKategori !== 'Semua' && item.kategori !== filterKategori) {
        return false;
      }
      if (
        q &&
        !item.perkara.toLowerCase().includes(q) &&
        !item.kategori.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [records, filterJenis, filterKategori, searchQuery]);

  const hasActiveFilters =
    filterJenis !== 'Semua' ||
    filterKategori !== 'Semua' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setFilterJenis('Semua');
    setFilterKategori('Semua');
    setSearchQuery('');
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: TransaksiRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (
    values: TransactionFormValues,
    editingId?: number
  ) => {
    const url = editingId ? `/api/transaksi/${editingId}` : '/api/transaksi';
    const method = editingId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const json = await response.json();
    if (!response.ok) {
      const errorMsg = json?.error || 'Gagal menyimpan rekod transaksi.';
      pushToast('error', errorMsg);
      throw new Error(errorMsg);
    }

    setIsModalOpen(false);
    setEditingRecord(null);
    await fetchTransactions();
    pushToast(
      'success',
      editingId
        ? 'Rekod transaksi berjaya dikemas kini.'
        : 'Rekod transaksi baharu berjaya ditambah.'
    );
  };

  const handleConfirmDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/transaksi/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Gagal memadam rekod transaksi.');
      }
      setDeleteTarget(null);
      await fetchTransactions();
      pushToast('success', 'Rekod transaksi berjaya dipadam.');
    } catch (error) {
      pushToast(
        'error',
        error instanceof Error ? error.message : 'Gagal memadam rekod transaksi.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      pushToast('error', 'Tiada rekod untuk dieksport ke CSV.');
      return;
    }

    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const headers = ['ID', 'Tarikh', 'Perkara', 'Jenis Transaksi', 'Kategori', 'Jumlah (RM)'];
    const rows = filteredRecords.map((r) => [
      String(r.id),
      formatTarikhPaparan(r.tarikh),
      escapeCsv(r.perkara),
      escapeCsv(r.jenis_transaksi),
      escapeCsv(r.kategori),
      r.jumlah_rm.toFixed(2),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lejar-kewangan-kelab-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushToast('success', `${filteredRecords.length} rekod berjaya dieksport ke CSV.`);
  };

  const scrollToRingkasan = () => {
    const el = document.getElementById('ringkasan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FF4D00] text-black">
      {/* Floating Navigation */}
      <header className="fixed inset-x-0 top-4 z-40 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a
            href="#hero"
            className="border-2 border-black bg-[#FF4D00] px-3 py-1.5 font-[family-name:var(--font-display)] text-sm tracking-[-0.04em] text-black uppercase whitespace-nowrap shrink-0 transition-transform hover:scale-105"
          >
            CLUB EXPENSE
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-1 rounded-full bg-black p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.32)]"
          >
            <a
              href="#ringkasan"
              className="rounded-full px-4 py-1.5 font-mono text-[12px] font-bold tracking-[-0.02em] text-white uppercase transition-colors hover:bg-white hover:text-black whitespace-nowrap shrink-0"
            >
              RINGKASAN
            </a>
            <a
              href="#lejar-transaksi"
              className="rounded-full px-4 py-1.5 font-mono text-[12px] font-bold tracking-[-0.02em] text-white uppercase transition-colors hover:bg-white hover:text-black whitespace-nowrap shrink-0"
            >
              LEJAR
            </a>
            <a
              href="#pecahan-kategori"
              className="rounded-full px-4 py-1.5 font-mono text-[12px] font-bold tracking-[-0.02em] text-white uppercase transition-colors hover:bg-white hover:text-black whitespace-nowrap shrink-0"
            >
              KATEGORI
            </a>
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-full px-4 py-1.5 font-mono text-[12px] font-bold tracking-[-0.02em] text-white uppercase transition-colors hover:bg-white hover:text-black whitespace-nowrap shrink-0"
            >
              EKSPORT
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={isLoading}
              aria-label="Muat semula transaksi"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white text-black transition-transform hover:scale-110 hover:bg-black hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-black px-4 py-2 font-mono text-[12px] font-bold tracking-[-0.02em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-all hover:scale-110 hover:bg-white hover:text-black whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>TAMBAH</span>
            </button>
          </div>
        </div>
      </header>

      {/* Typographic Hero Section */}
      <section
        id="hero"
        className="flex min-h-[88vh] flex-col justify-between px-4 pt-28 pb-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center py-8">
          <h1 className="text-center font-[family-name:var(--font-display)] text-[16vw] leading-[0.85] tracking-[-0.04em] text-black uppercase select-none">
            BAJET
            <br />
            KELAB
          </h1>
        </div>

        <div className="mx-auto w-full max-w-7xl border-t-2 border-black pt-6">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            <div className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
              <p>BASED IN KAMPUS MALAYSIA</p>
              <p className="mt-1 text-black/80">
                SISTEM PENJEJAK BAJET &amp; PERBELANJAAN KELAB
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={scrollToRingkasan}
                aria-label="Tatal ke bawah ke ringkasan kewangan"
                className="group relative flex h-[152px] w-[152px] items-center justify-center rounded-full border-2 border-black/15 transition-transform duration-200 hover:scale-110 hover:border-black"
              >
                <div className="animate-spin-12s flex h-[144px] w-[144px] items-center justify-center">
                  <svg
                    viewBox="0 0 144 144"
                    className="h-[144px] w-[144px]"
                    aria-hidden="true"
                  >
                    <defs>
                      <path
                        id="scroll-down-circle-path"
                        d="M 72, 72 m -54, 0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0"
                      />
                    </defs>
                    <text
                      fill="#000000"
                      fontSize="9.5"
                      fontWeight="700"
                      letterSpacing="1.6"
                      className="font-mono uppercase"
                    >
                      <textPath
                        href="#scroll-down-circle-path"
                        startOffset="0%"
                        textLength="332"
                      >
                        SCROLL DOWN • SCROLL DOWN • SCROLL DOWN •{' '}
                      </textPath>
                    </text>
                  </svg>
                </div>
                <ArrowDown
                  aria-hidden="true"
                  className="animate-bob-down absolute h-6 w-6 text-black transition-transform group-hover:scale-110"
                />
              </button>
            </div>

            <div className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase md:text-right">
              <p>BENDAHARI KELAB PELAJAR</p>
              <p className="mt-1">JAWATANKUASA PROGRAM</p>
              <p className="mt-1 text-black/80">MATA WANG: RINGGIT MALAYSIA (RM)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skewed Neon-Style Moving Marquee Section */}
      <section
        aria-hidden="true"
        className="my-6 -skew-y-2 overflow-hidden border-y-2 border-black bg-black py-7 shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
      >
        <div className="animate-marquee-left whitespace-nowrap">
          <span className="shrink-0 pr-8 font-[family-name:var(--font-display)] text-[8.5vw] leading-[0.88] tracking-[-0.04em] text-[#FF4D00] uppercase drop-shadow-[0_0_14px_rgba(255,77,0,0.5)]">
            PENDAPATAN • PERBELANJAAN • BAKI SEMASA • TAJAAN • YURAN • LOGISTIK •{' '}
          </span>
          <span className="shrink-0 pr-8 font-[family-name:var(--font-display)] text-[8.5vw] leading-[0.88] tracking-[-0.04em] text-[#FF4D00] uppercase drop-shadow-[0_0_14px_rgba(255,77,0,0.5)]">
            PENDAPATAN • PERBELANJAAN • BAKI SEMASA • TAJAAN • YURAN • LOGISTIK •{' '}
          </span>
        </div>

        <div className="mt-3 animate-marquee-right whitespace-nowrap">
          <span className="shrink-0 pr-8 font-[family-name:var(--font-display)] text-[4.5vw] leading-[0.9] tracking-[-0.04em] text-white/90 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
            CLUB EXPENSE TRACKER • REKOD KEWANGAN KELAB • RINGGIT MALAYSIA (RM) •{' '}
          </span>
          <span className="shrink-0 pr-8 font-[family-name:var(--font-display)] text-[4.5vw] leading-[0.9] tracking-[-0.04em] text-white/90 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
            CLUB EXPENSE TRACKER • REKOD KEWANGAN KELAB • RINGGIT MALAYSIA (RM) •{' '}
          </span>
        </div>
      </section>

      {/* Main Treasury Dashboard: KPI Cards + Filters + Ledger Table */}
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <section id="ringkasan" className="space-y-6">
          <div className="flex flex-col gap-4 border-b-2 border-black pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
                01 / RINGKASAN KEWANGAN SEMASA
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-[0.88] tracking-[-0.04em] text-black uppercase sm:text-5xl">
                STATUS BAJET KELAB
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isLoading || filteredRecords.length === 0}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase transition-transform hover:scale-105 hover:bg-black hover:text-white whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>EKSPORT CSV</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-5 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-white uppercase transition-transform hover:scale-110 hover:bg-white hover:text-black whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>TAMBAH REKOD</span>
              </button>
            </div>
          </div>

          {!databaseConfigured && !fetchError && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-4 rounded-none border-2 border-black bg-white px-5 py-4 text-black"
            >
              <div>
                <p className="font-mono text-xs font-bold tracking-[-0.02em] uppercase">
                  SAMBUNGAN POSTGRESQL BELUM DIKONFIGURASI
                </p>
                <p className="mt-1 font-sans text-xs text-black/80">
                  Tetapkan <span className="font-mono font-bold">DATABASE_URL</span> dalam fail{' '}
                  <span className="font-mono font-bold">.env</span> atau Secrets, kemudian jalankan{' '}
                  <span className="font-mono font-bold">npx prisma db push</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-black px-4 py-1.5 font-mono text-xs font-bold text-white uppercase transition-transform hover:scale-105 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                SEMAK SEMULA
              </button>
            </div>
          )}

          {fetchError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-4 rounded-none border-2 border-black bg-black px-5 py-4 text-white"
            >
              <div>
                <p className="font-mono text-xs font-bold tracking-[-0.02em] text-[#FF4D00] uppercase">
                  RALAT SAMBUNGAN PANGKALAN DATA
                </p>
                <p className="mt-1 font-sans text-xs text-white/90">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white px-4 py-1.5 font-mono text-xs font-bold text-black uppercase transition-transform hover:scale-105 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                CUBA LAGI
              </button>
            </div>
          )}

          {/* 3 Main Statistic Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-none border-2 border-black bg-white p-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
                  JUMLAH PENDAPATAN
                </span>
                <ArrowUpRight className="h-5 w-5 text-emerald-700" />
              </div>
              <p className="mt-4 font-mono text-3xl font-bold tracking-[-0.02em] tabular-nums text-emerald-700">
                {isLoading ? 'RM —' : formatAbsoluteRM(totalPendapatan)}
              </p>
              <p className="mt-3 font-mono text-[11px] font-bold tracking-[-0.02em] text-black/70 uppercase">
                + ALIRAN MASUK (TAJAAN &amp; YURAN)
              </p>
            </div>

            <div className="rounded-none border-2 border-black bg-white p-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
                  JUMLAH PERBELANJAAN
                </span>
                <ArrowDownRight className="h-5 w-5 text-red-700" />
              </div>
              <p className="mt-4 font-mono text-3xl font-bold tracking-[-0.02em] tabular-nums text-red-700">
                {isLoading ? 'RM —' : formatAbsoluteRM(totalPerbelanjaan)}
              </p>
              <p className="mt-3 font-mono text-[11px] font-bold tracking-[-0.02em] text-black/70 uppercase">
                − ALIRAN KELUAR PROGRAM KELAB
              </p>
            </div>

            <div className="rounded-none border-2 border-black bg-white p-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
                  BAKI SEMASA
                </span>
                <Wallet
                  className={`h-5 w-5 ${
                    bakiSemasa < 0 ? 'text-red-600' : 'text-black'
                  }`}
                />
              </div>
              <p
                className={`mt-4 font-mono text-3xl font-bold tracking-[-0.02em] tabular-nums ${
                  bakiSemasa < 0 ? 'text-red-600' : 'text-black'
                }`}
              >
                {isLoading ? 'RM —' : formatRM(bakiSemasa)}
              </p>
              <p
                className={`mt-3 font-mono text-[11px] font-bold tracking-[-0.02em] uppercase ${
                  bakiSemasa < 0 ? 'text-red-600' : 'text-black/70'
                }`}
              >
                {bakiSemasa < 0
                  ? 'DEFISIT BAJET · PERBELANJAAN MELEBIHI PENDAPATAN'
                  : 'PENDAPATAN − PERBELANJAAN SEMASA'}
              </p>
            </div>
          </div>
        </section>

        {/* Transaction Ledger & Filters */}
        <section id="lejar-transaksi" className="space-y-5 pt-4">
          <div className="flex flex-col gap-4 border-b-2 border-black pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
                02 / REKOD ALIRAN TUNAI
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-[0.88] tracking-[-0.04em] text-black uppercase sm:text-5xl">
                LEJAR TRANSAKSI
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-none border-2 border-black bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(['Semua', ...JENIS_TRANSAKSI_OPTIONS] as const).map((jenis) => {
                const active = filterJenis === jenis;
                return (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => setFilterJenis(jenis)}
                    className={`rounded-full border-2 border-black px-4 py-1.5 font-mono text-xs font-bold tracking-[-0.02em] uppercase transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {jenis === 'Semua' ? 'SEMUA JENIS' : jenis}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="CARI PERKARA TRANSAKSI..."
                  aria-label="Cari perkara transaksi"
                  className="w-full rounded-none border-2 border-black bg-white py-2 pr-3 pl-9 font-mono text-xs font-bold tracking-[-0.02em] text-black placeholder:text-black/45 focus:bg-[#FF4D00]/10 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  aria-label="Tapis mengikut kategori"
                  className="rounded-none border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase focus:outline-none"
                >
                  <option value="Semua">SEMUA KATEGORI</option>
                  {KATEGORI_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-black px-4 py-2 font-mono text-xs font-bold tracking-[-0.02em] text-[#FF4D00] uppercase transition-transform hover:scale-105 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>RESET</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <TransactionTable
            records={filteredRecords}
            totalUnfilteredCount={records.length}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onEdit={handleOpenEdit}
            onRequestDelete={setDeleteTarget}
            onResetFilters={handleResetFilters}
            onOpenCreate={handleOpenCreate}
          />
        </section>
      </main>

      {/* Dark Vertical Service / Category Breakdown Section */}
      <CategoryBreakdown
        records={records}
        activeKategori={filterKategori}
        onSelectKategori={setFilterKategori}
      />

      {/* Giant CTA Section */}
      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs font-bold tracking-[-0.02em] text-black uppercase">
            REKOD TRANSAKSI BAHARU KE PANGKALAN DATA
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[14vw] leading-[0.86] tracking-[-0.04em] text-black uppercase">
            CATAT
            <br />
            SEKARANG
          </h2>
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-3 rounded-full border-2 border-black bg-black px-10 py-5 font-mono text-sm font-bold tracking-[-0.02em] text-white uppercase transition-transform duration-200 hover:scale-110 hover:bg-white hover:text-black"
            >
              <Plus className="h-5 w-5" />
              <span>TAMBAH REKOD TRANSAKSI</span>
            </button>
          </div>
        </div>
      </section>

      {/* Brutalist Footer */}
      <footer className="border-t-2 border-black bg-[#FF4D00] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 font-mono text-[12px] font-bold tracking-[-0.02em] text-black uppercase">
          <span>
            © 2026 CLUB EXPENSE TRACKER — SISTEM PENJEJAK BAJET &amp; PERBELANJAAN KELAB
          </span>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#ringkasan" className="hover:translate-x-1 transition-transform">
              RINGKASAN
            </a>
            <a href="#lejar-transaksi" className="hover:translate-x-1 transition-transform">
              LEJAR
            </a>
            <a href="#pecahan-kategori" className="hover:translate-x-1 transition-transform">
              KATEGORI
            </a>
            <button
              type="button"
              onClick={handleExportCsv}
              className="uppercase hover:translate-x-1 transition-transform"
            >
              CSV
            </button>
          </div>
        </div>
      </footer>

      <TransactionModal
        isOpen={isModalOpen}
        editingRecord={editingRecord}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveTransaction}
      />

      <DeleteConfirmModal
        record={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
