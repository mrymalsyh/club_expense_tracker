'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#ringkasan"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Club Expense Tracker
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#ringkasan"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
            <a
              href="#lejar-transaksi"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Lejar Transaksi
            </a>
            <a
              href="#pecahan-kategori"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Pecahan Kategori
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Rekod</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section id="ringkasan" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
                Sistem Penjejak Bajet &amp; Perbelanjaan Kelab
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Bendahari &amp; Jawatankuasa Program</span>
                <span aria-hidden="true">·</span>
                <span>Rekod Aliran Tunai Kelab</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-xs">Ringgit Malaysia (RM)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={fetchTransactions}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Muat Semula</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isLoading || filteredRecords.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Eksport CSV</span>
              </button>
            </div>
          </div>

          {!databaseConfigured && !fetchError && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
            >
              <div>
                <p className="font-semibold">Sambungan PostgreSQL Belum Dikonfigurasi</p>
                <p className="mt-0.5 text-xs text-amber-800">
                  Tetapkan <span className="font-mono">DATABASE_URL</span> dalam fail{' '}
                  <span className="font-mono">.env</span> atau Secrets, kemudian jalankan{' '}
                  <span className="font-mono">npx prisma db push</span> untuk menyimpan transaksi.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100/60 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Semak Semula
              </button>
            </div>
          )}

          {fetchError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
            >
              <div>
                <p className="font-semibold">Sambungan Pangkalan Data Diperlukan</p>
                <p className="mt-0.5 text-xs text-red-700">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Cuba Lagi
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Jumlah Pendapatan
                </span>
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-3 font-mono text-2xl font-bold tracking-tight tabular-nums text-emerald-700 sm:text-3xl">
                {isLoading ? 'RM —' : formatAbsoluteRM(totalPendapatan)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                + Aliran masuk daripada tajaan dan kutipan yuran
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Jumlah Perbelanjaan
                </span>
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-3 font-mono text-2xl font-bold tracking-tight tabular-nums text-red-700 sm:text-3xl">
                {isLoading ? 'RM —' : formatAbsoluteRM(totalPerbelanjaan)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                − Aliran keluar untuk program, logistik, dan pembelian
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Baki Semasa
                </span>
                <Wallet
                  className={`h-4 w-4 ${
                    bakiSemasa < 0 ? 'text-red-600' : 'text-slate-700'
                  }`}
                />
              </div>
              <p
                className={`mt-3 font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${
                  bakiSemasa < 0 ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {isLoading ? 'RM —' : formatRM(bakiSemasa)}
              </p>
              <p
                className={`mt-2 text-xs font-medium ${
                  bakiSemasa < 0 ? 'text-red-600' : 'text-slate-500'
                }`}
              >
                {bakiSemasa < 0
                  ? 'Defisit · Perbelanjaan melebihi pendapatan semasa'
                  : 'Pendapatan ditolak perbelanjaan semasa'}
              </p>
            </div>
          </div>
        </section>

        <section id="lejar-transaksi" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(['Semua', ...JENIS_TRANSAKSI_OPTIONS] as const).map((jenis) => {
                const active = filterJenis === jenis;
                return (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => setFilterJenis(jenis)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {jenis === 'Semua' ? 'Semua Jenis' : jenis}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari perkara transaksi..."
                  aria-label="Cari perkara transaksi"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  aria-label="Tapis mengikut kategori"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="Semua">Semua Kategori</option>
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Set Semula</span>
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

        <CategoryBreakdown
          records={records}
          activeKategori={filterKategori}
          onSelectKategori={setFilterKategori}
        />
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span>Club Expense Tracker · Sistem Penjejak Bajet &amp; Perbelanjaan Kelab</span>
          <span className="font-mono">Mata Wang: MYR (RM)</span>
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
