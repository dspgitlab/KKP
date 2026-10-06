# Naskah Pitch — Neopond · High-Level Design (Paparan Manajemen)

Sama dengan speaker notes di deck dan di Neopond_HLD_Animasi.pptx.

## 1. cover

⏱ ±20 detik
PESAN UTAMA: Neopond adalah ekosistem yang meningkatkan survival rate ikan dan memberi dampak ekonomi lewat FCR yang optimal.

UCAPKAN:
"Selamat pagi, Bapak dan Ibu. Saya akan memaparkan Neopond — ekosistem pemantauan dan kontrol kolam budidaya.

Tujuannya dua: meningkatkan survival rate (SR) — tingkat hidup ikan, dan memberi dampak ekonomi lewat FCR — efisiensi pakan — yang optimal. Caranya sederhana: air kolam diukur setiap menit, kincir air menyala sendiri saat oksigen turun, pakan dan pertumbuhan tercatat, dan setiap masalah ditangani sampai tuntas.

Dalam tujuh menit, saya sampaikan empat hal: kenapa ini penting, bagaimana cara kerjanya, posisi kita sekarang, dan lima keputusan yang kami perlukan dari Bapak dan Ibu hari ini."

PINDAH: "Kita mulai dari kenapa ini penting."

## 2. penting

⏱ ±35 detik
PESAN UTAMA: Oksigen menentukan survival rate, pakan menentukan FCR — Neopond mengelola keduanya dengan data.

UCAPKAN:
"Ada dua hal yang paling menentukan hasil sebuah kolam.

Pertama, survival rate — berapa banyak ikan yang bertahan sampai panen. Risiko terbesarnya oksigen di dalam air. Oksigen paling rendah menjelang subuh, justru saat tidak ada yang mengukur. Kalau kincir terlambat menyala, dalam hitungan jam ikan bisa mati massal.

Kedua, FCR — berapa kilo pakan untuk menghasilkan satu kilo ikan. Kalau pakan tidak disesuaikan dengan kondisi ikan dan air, FCR membengkak dan margin tergerus.

(jeda)

Di tingkat program, alat dan aplikasi masih berbeda di tiap lokasi dan tidak saling terhubung, sehingga survival rate dan FCR antar lokasi tidak bisa dibandingkan.

Neopond menjawab ketiganya: kincir bertindak sebelum terlambat, pakan dan pertumbuhan tercatat sehingga FCR bisa dioptimalkan, dan semua lokasi masuk ke satu platform yang terhubung ke STELINA, SICEKATAN, dan Satu Data."

TUNJUK: kartu "Survival rate" dan "FCR" di kiri, lalu tiga baris "Hari ini → Dengan Neopond" di kanan.

PINDAH: "Bagaimana caranya? Ini satu putaran kerjanya."

## 3. carakerja

⏱ ±35 detik
PESAN UTAMA: Neopond bekerja end-to-end — satu siklus penuh, dari sensor kembali ke sensor.

UCAPKAN:
"Neopond bekerja end-to-end, sebagai satu siklus penuh — dari sensor, kembali lagi ke sensor. Ikuti angka satu sampai enam.

Satu, sensor mengukur air setiap menit, dilengkapi laporan operator lewat WhatsApp.
Dua, sistem memastikan datanya benar — misalnya dua sensor oksigen dibandingkan.
Tiga, sistem memutuskan: apakah sudah melewati batas aman.
Empat, bertindak: kincir menyala otomatis, dan petugas mendapat tugas.
Lima, dicek: apakah kincir benar-benar berputar dan oksigen naik lagi.
Enam, semuanya dicatat sebagai bukti — lalu sensor kembali mengukur hasilnya. Siklusnya tertutup.

Yang paling penting ada di kotak kanan atas: langkah penyelamatan ini terjadi langsung di lokasi dalam hitungan detik, jadi tetap jalan walaupun internet putus."

TUNJUK: ikuti angka 1–6 di lingkaran, lalu kotak oranye "Putaran keselamatan".
CATATAN: animasi slide ini ±18 detik — bicara sambil animasinya berjalan.

PINDAH: "Putaran ini dibangun dari tujuh lapis."

## 4. arsitektur

⏱ ±25 detik
PESAN UTAMA: Ini peta lengkapnya — tujuh lapis yang bekerja end-to-end, dari sensor kembali ke sensor.

UCAPKAN:
"Ini peta lengkapnya: dari sensor di dalam air di bagian bawah, sampai aplikasi di bagian atas. Cukup perhatikan label di sebelah kanan.

Ketujuh lapis ini membentuk satu siklus end-to-end: data naik dari sensor dan laporan WhatsApp, diolah di cloud, tampil di Neopond, lalu kembali ke kolam sebagai tindakan — dan sensor mengukur lagi hasilnya.

Tanda belah ketupat oranye menandai bagian yang kami perbaiki dari rancangan awal. Saya jelaskan di tiga slide berikutnya."

TUNJUK: titik data yang naik di tumpukan kiri, lalu label tiap lapis di kanan.

KALAU DITANYA "Apa itu profil nila?": "Batas aman air untuk nila air tawar dan nila payau berbeda. Sistem memakai batas sesuai jenis kolamnya."

PINDAH: "Kita lihat satu kolam dulu."

## 5. lapangan

⏱ ±30 detik
PESAN UTAMA: Setiap kolam punya 10 sensor dan 1 pengendali kincir.

UCAPKAN:
"Di setiap kolam ada sepuluh sensor. Sebagian besar dikumpulkan di tengah kolam, jauh dari kincir dan tempat pakan, supaya bacaannya mewakili kondisi kolam.

Ada dua perbaikan dari rancangan awal.

Pertama, sensor oksigen dipasang dua, bukan satu. Karena oksigen yang memicu kincir, satu sensor yang kotor tidak boleh menipu sistem. Kami pakai bacaan yang lebih rendah, supaya selalu di sisi aman.

Kedua, di panel listrik kolam ada satu modul pengendali. Modul ini menyalakan kincir dan pompa, sekaligus mengecek apakah alatnya benar-benar berputar.

Total ada 112 perangkat untuk sepuluh kolam."

TUNJUK: kotak "Klaster tengah" (DO-1 dan DO-2), lalu kotak "Panel · modul I/O" di bawah.

PINDAH: "Semua perangkat ini terhubung lewat kabel data."

## 6. konektivitas

⏱ ±25 detik
PESAN UTAMA: Kabel dibagi supaya tidak kelebihan beban; jalur ke kincir dipisah supaya selalu jalan.

UCAPKAN:
"Satu jalur kabel data hanya kuat untuk 32 perangkat. Jadi 112 perangkat kami bagi ke lima jalur, semuanya masih di bawah batas.

Jalur kelima, yang berwarna merah, khusus untuk perintah ke kincir. Kenapa dipisah? Kalau jalur sensor bermasalah, perintah ke kincir tetap jalan. Dan karena memakai pasangan kabel kedua di dalam kabel yang sama, tidak perlu galian tambahan.

Kabelnya disambung berantai dari kolam ke kolam. Lemari panel utama diletakkan di tengah area, di tempat yang tidak tergenang."

TUNJUK: lima meteran di atas (30/32 … 10/32), lalu "Segmen E · kontrol".

KALAU DITANYA "Kenapa batasnya 32?": "Itu batas standar kabel data RS485 yang dipakai sensor kelas industri."

PINDAH: "Sekarang perbaikan yang paling penting."

## 7. edge

⏱ ±30 detik
PESAN UTAMA: Internet putus tidak berarti kolam celaka.

UCAPKAN:
"Ini perbaikan yang paling penting.

Di rancangan awal, perintah menyalakan kincir harus lewat cloud. Artinya, kalau sinyal 4G putus malam hari, kincir tidak bisa dinyalakan otomatis.

Sekarang keputusannya dibuat langsung di lokasi, oleh perangkat industri di lemari panel. Oksigen turun, kincir menyala. Air terlalu tinggi, pompa dikunci.

Perangkatnya dua: satu utama, satu cadangan. Kalau yang utama mati, cadangan otomatis mengambil alih. Kalau dua-duanya mati, panel kembali ke fail-safe: kincir tetap menyala.

Data juga disimpan dulu di lokasi, lalu dikirim saat internet kembali."

TUNJUK: kotak "Local safety control", lalu "Fail-safe".

KALAU DITANYA "Kenapa bukan Raspberry Pi?": "Untuk pilot di lapangan kami pakai perangkat kelas industri yang tahan air dan panas. Raspberry Pi hanya untuk uji internal, sesuai master plan."

PINDAH: "Lalu apa yang terjadi saat data sampai di cloud?"

## 8. backend

⏱ ±30 detik
PESAN UTAMA: Data dicek dulu sebelum dipakai, terhubung ke sistem KKP, dan aman.

UCAPKAN:
"Setelah sampai di cloud, data tidak langsung dipercaya. Sistem memeriksa dulu: apakah sensor macet, angkanya melonjak tidak wajar, atau dua sensor tidak sepakat. Untuk peringatan biasa, sistem menunggu tiga bacaan berturut-turut, supaya petugas tidak dibanjiri alarm palsu.

Prakiraan cuaca BMKG ikut dipakai untuk memperkirakan oksigen menjelang subuh.

Data kemudian dikirim ke STELINA, SICEKATAN, dan Satu Data — melengkapi sistem KKP, bukan menggantikannya.

Untuk keamanan: server berada di Indonesia, jalurnya terenkripsi sesuai standar BSSN, dan setiap tindakan tercatat."

TUNJUK: alur kotak dari kiri ke kanan, lalu kotak "STELINA · SICEKATAN · Satu Data", lalu baris keamanan di bawah.

PINDAH: "Berapa cepat peringatan sampai ke petugas? Ini yang menentukan satu keputusan."

## 9. alur

⏱ ±30 detik
PESAN UTAMA: Sensor dibaca setiap 1 menit — satu-satunya pilihan yang memenuhi syarat master plan.

UCAPKAN:
"Slide ini menjelaskan kenapa kami merekomendasikan sensor dibaca setiap 1 menit.

Ada dua kecepatan. Di kiri, putaran di lokasi untuk keselamatan — berjalan tanpa internet. Di kanan, putaran di cloud untuk petugas dan manajemen.

Sekarang lihat tabelnya. Master plan mensyaratkan peringatan kondisi kritis keluar kurang dari 2 menit. Kalau sensor dibaca tiap 5 menit, syarat itu tidak terpenuhi. Kalau tiap 1 menit, terpenuhi — dan beban datanya masih ringan.

Karena itu rekomendasi kami: 1 menit."

TUNJUK: baris "Syarat kritis < 2 menit" (Memenuhi / Tidak memenuhi), lalu kotak "Rekomendasi 1 menit".

PINDAH: "Sekarang yang dilihat petugas setiap hari: aplikasinya."

## 10. neopond

⏱ ±30 detik
PESAN UTAMA: Setiap peringatan diikuti sampai selesai, dan ada buktinya.

UCAPKAN:
"Ini aplikasi Neopond.

Setiap peringatan punya jalur yang jelas — lihat baris atas: terdeteksi, diterima petugas, ditangani, dicek, lalu selesai. Jadi tidak ada peringatan yang menggantung tanpa penanggung jawab.

Di layar kolam, petugas langsung melihat kondisi air dan satu instruksi: 'Lakukan dulu'. Sistem juga memberi dugaan penyebab dan nilai rupiah yang sedang berisiko.

Lima peran — operator, supervisor, teknisi, manajer, dan auditor — masing-masing melihat layar sesuai tugasnya, sampai peta tingkat nasional."

TUNJUK: baris alur di atas (Terdeteksi → Selesai), lalu screenshot di kiri.

PINDAH: "Di lapangan, laporan dan peringatan berjalan lewat WhatsApp."

## 11. wamasuk

⏱ ±30 detik
PESAN UTAMA: Laporan lapangan masuk lewat WhatsApp dalam format terstruktur — inilah yang membuat FCR, survival rate, dan hemat energi bisa dihitung.

UCAPKAN:
"Tidak semua data datang dari sensor. Operator melaporkan sembilan jenis catatan lewat WhatsApp — bukan teks bebas, tapi format terstruktur yang divalidasi sistem.

Contohnya: kecerahan air setiap pagi jam sembilan, cek oksigen dengan alat genggam dua kali seminggu untuk mendeteksi sensor yang bergeser, hasil lab, kematian ikan, pakan, perlakuan, air sumber, hasil panen, dan foto meteran listrik.

Ini instrumentasi paling murah, sekaligus paling penting: FCR, survival rate, dan bukti hemat listrik hanya bisa dihitung kalau laporan ini masuk.

Di Neopond, catatan dari WhatsApp bisa difilter di riwayat Catat dan Siklus, dan tampil di panel Log manual."

TUNJUK: sembilan kotak entri, lalu kotak berwarna (kematian, pakan, panen, kWh).

PINDAH: "Sebaliknya, WhatsApp juga jalur peringatan keluar."

## 12. wakeluar

⏱ ±35 detik
PESAN UTAMA: Peringatan naik bertingkat sampai ada yang menerima — dan setiap kejadian kritis meninggalkan bukti.

UCAPKAN:
"Peringatan dibagi empat tingkat.

S1 kritis — misalnya oksigen di bawah 3 atau aerator tidak merespons: pesan WhatsApp, diulang, lalu telepon. Kalau 15 menit belum diterima, diteruskan ke supervisor; 30 menit, ke kepala lokasi.

S2 waspada: pesan WhatsApp, diteruskan ke supervisor kalau dua jam tidak diterima. S3 saran: ringkasan harian jam delapan pagi. S4 masalah alat sengaja tidak lewat WhatsApp — cukup dashboard dan ringkasan mingguan ke teknisi.

Setiap konfirmasi 'diterima' dicatat, jadi waktu respons petugas terukur. Setelah kejadian S1 selesai, operator menjawab tiga pertanyaan di thread yang sama: apa yang dilakukan, apa yang terjadi tanpa peringatan, dan tanda tangan. Itu menjadi bukti kejadian yang berhasil dicegah.

Biayanya sekitar 206 ribu rupiah per kolam per tahun."

TUNJUK: baris S1 dari kiri ke kanan, lalu tiga kotak di bawah.

KALAU DITANYA "Bagaimana kalau HP operator tidak ada sinyal?": "Itu salah satu skenario failover test di modul Kesiapan Neopond — peringatan naik ke telepon dan ke supervisor."

PINDAH: "Dan sistem ini tidak berhenti di kualitas air."

## 13. budidaya

⏱ ±30 detik
PESAN UTAMA: Di sinilah dampak ekonominya terlihat — survival rate dan FCR terukur per kolam.

UCAPKAN:
"Dari tebar benih sampai panen, petugas mencatat pakan, kematian, dan berat ikan langsung dari HP atau WhatsApp. Aplikasi menghitung FCR dan survival rate, lengkap dengan saran pakan. FCR yang lebih efisien berarti biaya pakan per kilo ikan lebih rendah — di situlah dampak ekonominya.

Untuk manajemen, semuanya diterjemahkan ke rupiah: nilai stok, biaya per kilo, perkiraan margin, dan kerugian yang berhasil dicegah.

Di pilot, kami ukur baseline untuk empat ukuran yang bisa dibandingkan antar lokasi: tingkat hidup ikan, efisiensi pakan atau FCR, energi per kilo, dan waktu alat menyala."

TUNJUK: baris Tebar → Panen di atas, lalu kotak "KPI sebanding antar site" di kanan.

PINDAH: "Supaya angka-angka ini bisa dipercaya, sensornya harus dirawat."

## 14. infrastruktur

⏱ ±25 detik
PESAN UTAMA: Perawatan sensor terjadwal jelas, dan ada SLA.

UCAPKAN:
"Sensor di dalam air perlu dirawat supaya tetap bisa dipercaya. Jadwalnya kami bagi empat:

yang dipantau otomatis setiap saat,
yang dibersihkan operator setiap minggu,
yang dikalibrasi teknisi setiap bulan,
dan failover test setiap tiga bulan.

Aplikasi yang mengingatkan — jadwal kalibrasi otomatis menjadi tugas.

Di belakangnya ada layanan dukungan: gangguan kritis ditangani 24 jam, dengan respons satu jam, semuanya dalam satu kontrak."

TUNJUK: empat kotak dari kiri ke kanan, lalu baris SLA di bawah.

PINDAH: "Kalau ada yang salah, apa jawabannya? Ini ringkasannya."

## 15. risiko

⏱ ±20 detik
PESAN UTAMA: Setiap risiko sudah punya jawaban di desain.

UCAPKAN:
"Ini ringkasan risiko dan jawabannya. Saya tidak akan bacakan semuanya.

Lima baris bertanda oranye adalah yang baru kami tambahkan: internet putus, perangkat rusak, sensor kotor, kincir yang tidak berputar, dan alarm palsu. Semuanya sudah dijawab di desain yang tadi saya tunjukkan.

Sisanya — air asin, petir, dan keamanan data — juga sudah ada jawabannya."

TUNJUK: lima baris dengan tanda oranye di atas.

PINDAH: "Lalu bagaimana pelaksanaannya?"

## 16. operasi

⏱ ±35 detik
PESAN UTAMA: Fase 1 selesai dalam 12–16 minggu, dan kincir otomatis baru dinyalakan setelah lulus empat uji.

UCAPKAN:
"Pelaksanaannya bertahap, mengikuti master plan.

Fase 1 di 10 sampai 20 kolam, selama 12 sampai 16 minggu: dua minggu pertama mengunci lokasi, lalu pemasangan, uji data, pengukuran baseline, uji bersama operator, dan serah terima. Fase 2 menambah prediksi. Fase 3 memperluas ke banyak lokasi.

Satu hal penting — lihat baris bawah. Kincir otomatis tidak langsung dinyalakan. Sistem harus lulus empat uji dulu: dibandingkan dengan alat ukur tangan, batasnya disahkan, diuji saat terjadi kegagalan, dan operator dilatih. Setelah semuanya lulus, baru fitur otomatis diaktifkan."

TUNJUK: kotak Fase 1, garis minggu 1–16, lalu empat kotak "Gerbang" di bawah.

KALAU DITANYA "Posisi kita sekarang di mana?": "Arsitektur end-to-end sudah lengkap dan aplikasi Neopond sudah berjalan. Fase 1 mulai setelah keputusan hari ini."

PINDAH: "Untuk memulai Fase 1, kami butuh lima keputusan."

## 17. keputusan

⏱ ±35 detik
PESAN UTAMA: Lima keputusan yang kami minta hari ini.

UCAPKAN:
"Terakhir, lima keputusan yang kami minta.

Satu: siapa pemilik program, di mana lokasi pilot, dan apakah kolamnya nila air tawar atau payau.

Dua: persetujuan atas perbaikan desain tadi. Anggaran sekitar 555 juta di master plan akan kami hitung ulang, karena angka itu dibuat untuk 15 kolam dengan enam sensor.

Tiga: sensor dibaca setiap 1 menit.

Empat: teknologi server — kami rekomendasikan open-source, berada di Indonesia.

Lima: sistem KKP mana yang menerima data, dan ukuran apa yang menjadi tanda pilot berhasil — kami usulkan survival rate dan FCR sebagai ukuran utama.

Terima kasih. Saya persilakan pertanyaan dan masukan."

TUNJUK: nomor 01–05 satu per satu.

KALAU DITANYA "Jadi berapa anggarannya?": "Angka finalnya kami sampaikan setelah lokasi pilot dan perbaikan desain disetujui, berdasarkan survei lapangan dan penawaran resmi."
