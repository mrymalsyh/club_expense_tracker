import { prisma } from '../lib/prisma';

async function main() {
  await prisma.transaksi.deleteMany();

  await prisma.transaksi.createMany({
    data: [
      {
        perkara: 'Tajaan Utama Syarikat Teknologi Melaka Sdn Bhd (Hackathon Kelab)',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Tajaan',
        jumlah_rm: 2500.0,
        tarikh: new Date('2026-11-01T09:00:00.000Z'),
      },
      {
        perkara: 'Kutipan Yuran Keahlian Semester 1 Sesi 2026/2027 (85 Ahli)',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Yuran',
        jumlah_rm: 1275.0,
        tarikh: new Date('2026-11-03T10:30:00.000Z'),
      },
      {
        perkara: 'Sumbangan Tajaan Alumni Fakulti Teknologi Maklumat',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Tajaan',
        jumlah_rm: 800.0,
        tarikh: new Date('2026-11-06T14:15:00.000Z'),
      },
      {
        perkara: 'Tempahan Nasi Lemak & Minuman Pagi Mesyuarat Agung Tahunan',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Makanan',
        jumlah_rm: 345.5,
        tarikh: new Date('2026-11-08T08:00:00.000Z'),
      },
      {
        perkara: 'Percetakan Bunting, Banner & Risalah Minggu Promosi Kelab',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Percetakan',
        jumlah_rm: 268.0,
        tarikh: new Date('2026-11-10T11:20:00.000Z'),
      },
      {
        perkara: 'Sewaan Van & Tol Logistik Lawatan Industri ke Cyberjaya',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Logistik',
        jumlah_rm: 520.0,
        tarikh: new Date('2026-11-12T07:30:00.000Z'),
      },
      {
        perkara: 'Plak Penghargaan & Beg Cenderamata Penceramah Jemputan',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Cenderamata',
        jumlah_rm: 195.0,
        tarikh: new Date('2026-11-14T15:00:00.000Z'),
      },
      {
        perkara: 'Yuran Penyertaan Bengkel Pembangunan Web Pelajar Luar',
        jenis_transaksi: 'Pendapatan',
        kategori: 'Yuran',
        jumlah_rm: 450.0,
        tarikh: new Date('2026-11-16T09:45:00.000Z'),
      },
      {
        perkara: 'Jamuan Minum Petang & Kuih-Muih Bengkel Pembangunan Web',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Makanan',
        jumlah_rm: 210.75,
        tarikh: new Date('2026-11-17T16:00:00.000Z'),
      },
      {
        perkara: 'Pembelian Kertas Sijil, Dakwat Pencetak & Alat Tulis Pejabat Kelab',
        jenis_transaksi: 'Perbelanjaan',
        kategori: 'Lain-lain',
        jumlah_rm: 142.25,
        tarikh: new Date('2026-11-19T13:10:00.000Z'),
      },
    ],
  });

  console.log('Berjaya memasukkan 10 rekod transaksi sampel.');
}

main()
  .catch((error) => {
    console.error('Ralat semasa menjalankan seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
