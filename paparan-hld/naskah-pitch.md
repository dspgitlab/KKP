# Naskah Pitch — SmartAqua Pond HLD · Paparan Manajemen

Diambil dari speaker notes PPTX versi terbaru (total ±7 menit). Sama dengan notes di tiap slide.

## 1. SmartAqua Pond

(±20 dtk) SmartAqua Pond adalah sistem untuk 10 kolam budidaya: air diukur tiap menit, aerator dan pompa bisa bertindak sendiri, dan setiap kejadian ditangani sampai tuntas lewat aplikasi Neopond. Dalam tujuh menit ke depan: kenapa ini penting, bagaimana cara kerjanya dari sensor sampai layar, status sekarang, dan lima keputusan yang kami minta hari ini. Tujuh garis warna mewakili tujuh lapis arsitektur.

## 2. Satu malam oksigen jatuh bisa menghabiskan satu kolam

(±30 dtk) Risiko terbesar di kolam adalah oksigen. DO paling rendah menjelang subuh, saat tidak ada yang mengukur, dan dari waspada ke kematian massal hanya hitungan jam — satu kolam nila di prototipe kami memegang stok sekitar Rp 30 juta, angka contoh. Di tingkat program, inisiatif digital masih terpisah per lokasi dan kinerjanya tidak bisa dibandingkan. SmartAqua Pond menjawab keduanya: aerator bertindak sebelum batas bahaya, dan satu platform vendor-neutral yang terhubung ke STELINA, SICEKATAN dan Satu Data.

## 3. Satu putaran tertutup: ukur, pastikan, bertindak, buktikan

(±35 dtk) Seluruh sistem adalah satu putaran tertutup. Ukur: sepuluh sensor per kolam tiap menit. Pastikan: data diperiksa mutunya, dua sensor DO dibandingkan. Putuskan: batas per komoditas ditambah prakiraan oksigen subuh. Bertindak: aerator atau pompa menyala otomatis, operator dapat tugas. Verifikasi: sinyal balik alat dan DO naik kembali. Catat dan belajar: bukti, siklus, rupiah — dan batas makin tepat. Pentingnya: putaran keselamatan berjalan di lokasi dalam hitungan detik, jadi tetap jalan walau internet putus.

## 4. Tujuh lapis, dari sensor di kolam sampai keputusan di layar

(±25 dtk) Tujuh lapis, semuanya di Fase 1 kecuali AI prediktif di Fase 2. Lapangan, kabel, edge dan uplink sudah didesain. Aplikasi Neopond sudah berjalan sebagai prototipe. Backend belum dibangun, menunggu keputusan stack. Profil nila tawar atau salin berlaku di semua lapis. Tanda berlian oranye adalah revisi dari rancangan awal yang saya jelaskan berikutnya.

## 5. Per kolam: 10 sensor dan satu modul kendali

(±35 dtk) Di setiap kolam ada sepuluh sensor. Enam sensor kualitas air dikumpulkan di tengah kolam, jauh dari aerator dan titik pakan. Revisi pertama: DO memakai dua sensor, karena DO-lah yang memicu aerator — satu probe kotor tidak boleh menipu sistem, jadi dipakai bacaan terendah. Revisi kedua: satu modul kendali di panel kolam yang mengirim perintah ke aerator dan pompa, dan membaca sinyal balik apakah alat benar-benar berputar. Di tingkat site ada barometer, pyranometer, dan prakiraan BMKG. Totalnya 112 perangkat Modbus.

## 6. Lima segmen RS485, semua di bawah batas 32 perangkat

(±30 dtk) Satu bus RS485 maksimal 32 perangkat, jadi 112 perangkat dibagi ke lima segmen. Tiga segmen kolam terisi 30 dari 32, segmen D berisi kolam 10 dan stasiun cuaca, dan segmen E khusus kendali. Segmen kendali memakai pasangan kabel kedua di jalur yang sama, sehingga perintah ke aerator tidak ikut macet saat bus sensor bermasalah, tanpa galian tambahan. Satu segmen dipasang sebagai rantai dengan terminator di ujung — bukan cabang — supaya sinyal stabil di kabel panjang.

## 7. Di lokasi, kolam tetap terlindungi walau internet putus

(±30 dtk) Ini revisi paling penting: putus jaringan tidak boleh berarti kolam celaka. Di rancangan awal, aerator dinyalakan lewat cloud — kalau 4G putus malam hari, kontrol ikut mati. Sekarang gateway industri di lokasi yang memutuskan: DO rendah, aerator ON; air terlalu tinggi, pompa terkunci. Kalau kedua gateway mati, panel kembali ke posisi aman: aerator menyala. Cadangan mengambil alih lewat relay watchdog, dan data ditahan saat internet putus.

## 8. Di cloud, data diperiksa dulu sebelum dipercaya

(±25 dtk) Di cloud, data tidak langsung dipercaya. Gerbang mutu menandai data macet, lonjakan, dan sensor yang tidak sepakat; mesin aturan memakai konfirmasi tiga bacaan supaya alarm palsu tidak membuat petugas abai. BMKG masuk untuk prakiraan subuh, dan data mengalir ke STELINA, SICEKATAN dan Satu Data lewat API terbuka. Keamanan sejak awal: data di Indonesia, VPN sesuai BSSN, jejak audit.

## 9. Dua kecepatan: keselamatan dalam detik, manajemen dalam menit

(±30 dtk) Ada dua kecepatan. Putaran lokal berjalan setiap siklus polling di lokasi: sensor, edge menilai, perintah ke modul, aerator menyala, lalu sinyal balik memastikan aerator benar-benar jalan — tanpa internet. Putaran cloud dalam menit sampai hari: peringatan, operator, bukti, laporan. Ini dasar keputusan interval polling. Master plan mensyaratkan peringatan kondisi kritis kurang dari 2 menit — dengan polling 5 menit syarat itu tidak terpenuhi. Dengan 1 menit, DO kritis keluar sekitar 1 menit dan peringatan lain sekitar 3 menit. Rekomendasi kami 1 menit; bebannya masih ringan.

## 10. Setiap peringatan ditangani sampai tuntas, dan ada buktinya

(±30 dtk) Ini aplikasi Neopond yang sudah berjalan sebagai prototipe dengan data contoh. Setiap peringatan punya alur: terdeteksi, diterima petugas, ditangani, diverifikasi, selesai. Di detail kolam, operator langsung melihat semua parameter dan satu "Lakukan dulu". Supervisor melihat siapa menangani dan sejak kapan. Sistem juga memberi dugaan penyebab, nilai rupiah yang berisiko, dan setiap override wajib alasan. Lima peran melihat layar yang sesuai tugasnya.

## 11. Dari tebar sampai panen: produksi dan rupiah di satu tempat

(±30 dtk) Sistem ini tidak berhenti di kualitas air. Dari tebar sampai panen, operator mencatat pakan, kematian, sampling dan perawatan langsung di HP, dan aplikasi menghitung FCR dan sintasan lengkap dengan anjuran. Untuk manajemen, semuanya diterjemahkan ke rupiah: stok hidup, HPP, perkiraan margin, nilai yang sedang berisiko, kerugian yang berhasil dicegah, dan balik modal kit. Angka di layar ini contoh dari prototipe; di pilot, harga diisi per kolam.

## 12. Sensor yang dirawat adalah sensor yang bisa dipercaya

(±25 dtk) Infrastruktur juga punya siklus. Secara otomatis sistem terus memantau data macet, sensor yang tidak sepakat, aerator yang tidak merespons, dan kesehatan edge. Mingguan operator membersihkan probe dan mengecek DO dengan alat genggam. Bulanan teknisi mengkalibrasi, dan amonia dicocokkan dengan test kit atau lab. Tiap kuartal kami uji kegagalan secara sengaja. Aplikasi yang mengingatkan: jatuh tempo kalibrasi jadi tugas, dan sensor meragukan tidak dipakai untuk keputusan. Di belakangnya ada SLA: gangguan kritis ditangani 24/7 dengan respons satu jam, dalam satu kontrak. Eskalasi: helpdesk, field engineer, lalu solution architect.

## 13. Setiap risiko di lapangan punya jawabannya

(±25 dtk) Ringkasan risiko dan jawabannya. Yang baru dibanding rancangan awal ada di lima baris atas: internet putus dan edge rusak dijawab dengan kendali di lokasi dan posisi aman; sensor DO kotor dengan dua sensor; aerator yang diperintah tapi tidak jalan dengan sinyal balik; alarm palsu dengan gerbang mutu dan konfirmasi. Plus kunci pengaman pompa dan keamanan akses.

## 14. Pilot bertahap: Fase 1 selesai dalam 12–16 minggu

(±30 dtk) Pilot berjalan tiga fase sesuai master plan. Fase 1 di 10 sampai 20 kolam selama 12 sampai 16 minggu: kunci lokasi, instalasi, integrasi dan kalibrasi, ukur baseline sintasan, FCR, energi dan uptime, UAT, lalu serah terima dengan keputusan ke Fase 2. Hari ini desain lapangan selesai dan prototipe aplikasi berjalan. Kendali otomatis baru dinyalakan setelah empat gerbang lulus.

## 15. Lima keputusan untuk memulai Fase 1

(±35 dtk) Lima keputusan. Satu: pemilik program, lokasi, dan profil nila dikunci saat kickoff. Dua: setujui revisi desain lapangan; anggaran ±Rp 555 juta di master plan kami hitung ulang karena dibuat untuk 15 kolam dan enam parameter. Tiga: polling 1 menit, satu-satunya yang memenuhi syarat peringatan kritis di bawah 2 menit. Empat: backend open-source, TypeScript dan PostgreSQL, di Indonesia. Lima: sistem KKP penerima data dan KPI keberhasilan pilot. Terima kasih.
