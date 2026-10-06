# Naskah Pitch — SmartAqua Pond High-Level Design

Durasi target ±1 menit per slide (±130–150 kata, tempo bicara normal). Total ±15 menit sebelum tanya jawab.

## 1. cover — SmartAqua Pond

Selamat pagi, Bapak dan Ibu. Terima kasih atas waktunya. Hari ini saya akan memaparkan High-Level Design SmartAqua Pond. Persoalan di kolam budidaya itu sederhana tapi mahal: kualitas air bisa berubah dalam hitungan jam, dan sering baru ketahuan setelah ikan atau udang stres. SmartAqua Pond menjawabnya dengan tiga hal: mengukur kualitas air secara terus-menerus, mengirim datanya ke cloud, dan menyalakan aerator atau pompa secara otomatis saat dibutuhkan, tanpa menunggu petambak berkeliling kolam. Ilustrasi di layar sebenarnya sudah merangkum sistemnya: di tengah ada edge unit, di sekelilingnya sembilan sensor per kolam, dan di lingkar luar sepuluh kolam yang dipantau. Tujuh garis warna di bawah adalah tujuh layer arsitektur yang akan kita telusuri satu per satu, dari sensor di dalam air sampai aksi di kolam.

## 2. ringkasan — 92 node sensor

Kalau harus diringkas dalam satu angka, angkanya 92. Itu jumlah node sensor di satu site. Donut di kiri menunjukkan komposisinya: sepuluh potongan teal adalah sepuluh kolam, masing-masing sembilan sensor, jadi 90 node. Potongan kecil oranye adalah dua sensor cuaca yang dipakai bersama, yaitu tekanan udara dan radiasi matahari. Semua node ini dibagi ke empat segmen jaringan RS485 dan dibaca setiap satu sampai lima menit. Alurnya, kalau dibaca dalam satu napas: sensor dibaca edge unit di lokasi, dikirim ke cloud lewat 4G, diolah menjadi informasi dan peringatan, lalu dipakai untuk menyalakan aerator atau pompa, otomatis maupun manual oleh petambak. Jadi yang kita bangun bukan sekadar alat ukur, melainkan satu rantai lengkap dari data sampai tindakan. Slide berikutnya membedah rantai ini bagian demi bagian.

## 3. arsitektur — Tujuh layer

Ini peta utama paparan. Sistem kami susun dalam tujuh layer, digambarkan seperti bangunan bertingkat. Fondasinya adalah Field, yaitu sensor di kolam. Di atasnya Connectivity: kabel dan bus RS485. Lalu Edge: komputer kecil di lokasi yang membaca semua sensor. Lalu Transport: router 4G yang mengirim data keluar. Empat layer solid ini sudah selesai didesain di Tahap 1. Tiga layer transparan di atasnya adalah Backend di cloud, Application untuk dashboard dan notifikasi, serta Actuation yang menggerakkan aerator dan pompa; ketiganya dibangun di Tahap 2 sampai 5. Pesan utamanya: kami sengaja membangun dari bawah. Aplikasi secanggih apa pun tidak berguna kalau data dari lapangan tidak andal. Karena itu Tahap 1 berfokus memastikan data mengalir dengan benar dan tahan terhadap gangguan.

## 4. sensor — Sembilan sensor per kolam

Kita mulai dari fondasi. Setiap kolam dikelilingi sembilan sensor, dan warnanya mengelompokkan fungsi. Teal untuk kimia air: oksigen terlarut dan suhu, pH, ORP, TAN atau amonium, serta EC dan salinitas. Biru untuk sensor optik: turbidity atau kekeruhan, dan chlorophyll-a untuk memantau plankton. Oranye untuk fisik dan mesin: ketinggian air dan getaran motor aerator. Sensor getaran ini menarik karena yang dipantau bukan air, melainkan kesehatan aerator itu sendiri. Sembilan sensor kali sepuluh kolam menghasilkan 90 node; ditambah dua sensor cuaca di satu tiang bersama, totalnya 92. Semuanya memakai standar industri yang sama, RS485 Modbus RTU, dan tiap node dihitung satu unit-load. Angka unit-load inilah yang nanti menentukan bagaimana jaringan dibagi.

## 5. penempatan — Klaster di tengah kolam

Sensor yang bagus pun bisa memberi data yang menyesatkan kalau salah tempat. Ini tampak atas satu kolam. Enam sensor kualitas air kami kumpulkan di klaster tengah, di kedalaman sekitar 30 sampai 50 sentimeter, sengaja jauh dari aerator dan titik pakan, supaya bacaannya mewakili kondisi kolam secara umum, bukan kondisi lokal di sekitar kincir atau sisa pakan. Turbidity diletakkan dekat inlet, water level di tepi tanggul pada titik terdalam, dan sensor getaran langsung di housing motor aerator. Satu detail penting: TAN sengaja ditaruh berdekatan dengan pH, suhu, dan salinitas, karena amonia beracun, NH3, dihitung dari keempatnya. Kalau diukur di titik berbeda, hasil hitungannya bisa meleset. Semua kabel sensor kemudian berkumpul di satu junction box di tepi kolam, lalu disambung ke jaringan.

## 6. topologi — Empat segmen RS485

Sekarang soal jaringan. RS485 punya batas: satu jalur maksimal 32 unit-load. Kita punya 92 node, jadi tidak mungkin dalam satu jalur. Solusinya, jaringan kami pecah menjadi empat segmen. Gauge di layar menunjukkan pemakaiannya. Segmen A, B, dan C masing-masing melayani tiga kolam: 27 dari 32, masih di bawah batas. Segmen D melayani kolam 10 dan stasiun cuaca, baru 11 dari 32, jadi masih ada ruang untuk ekspansi. Setiap segmen punya repeater dengan isolasi galvanik; artinya, kalau ada gangguan listrik di satu segmen, segmen lain tidak ikut terdampak. Edge aktif membaca keempat segmen secara bergiliran: A, B, C, D. Garis abu-abu putus-putus adalah jalur edge cadangan, yang terhubung ke semua repeater dan siap mengambil alih kapan saja.

## 7. denah — Peta site

Ini gambaran fisiknya di lapangan, tampak atas dan tidak berskala. Sepuluh kolam tersusun dalam dua baris. Di pusatnya ada cabinet IP66 yang berisi kedua edge unit dan UPS; router 4G dan tiang sensor cuaca berada di dekatnya. Dari cabinet, kabel trunk berwarna oranye keluar ke empat repeater, yang diletakkan di titik transisi antar kelompok kolam. Dari repeater, kabel drop berwarna hijau masuk ke junction box tiap kolam. Repeater D sekaligus melayani tiang sensor cuaca. Penempatan cabinet punya tiga syarat: di titik sentral supaya jarak kabel ke semua kolam seimbang, dekat jalur listrik utama, dan tidak tergenang saat kolam meluap. Untuk proteksi, cabinet dan tiang sensor cuaca dilengkapi grounding rod dan arrester, karena lokasi tambak umumnya terbuka.

## 8. edge — Polling tidak berhenti, data tidak hilang

Edge adalah otak di lokasi, dan prinsip desainnya dua: polling tidak boleh berhenti, dan data tidak boleh hilang. Untuk yang pertama, kami pasang dua Raspberry Pi. Satu aktif membaca semua sensor, satu lagi standby. Keduanya saling mengirim sinyal heartbeat, seperti detak jantung di layar ini. Kalau edge aktif tidak merespons, edge cadangan otomatis mengambil alih seluruh segmen, tanpa perlu menunggu teknisi datang. Untuk yang kedua, setiap hasil bacaan disimpan dulu di buffer lokal. Kalau internet putus, data tetap tertampung dan dikirim ulang begitu koneksi pulih, sehingga tidak ada lubang di data historis. Pendukungnya: cabinet IP66 yang tahan air dan debu, mini UPS DC saat listrik padam, serta grounding dan surge arrester. Untuk koneksi keluar, router 4G industri dengan dua SIM dan cadangan WiFi atau Ethernet.

## 9. transport — Dari kabinet ke cloud

Slide ini menunjukkan perjalanan data dari lokasi ke cloud. Jalur atas sudah didesain di Tahap 1: data dari edge masuk buffer, lalu keluar lewat router 4G ke internet menggunakan MQTT atau HTTPS, protokol yang ringan dan lazim dipakai untuk IoT. Jalur bawah adalah backend di cloud yang dibangun di Tahap 2 dan 5. Data diterima MQTT broker, diteruskan ke API service, lalu dihitung field turunannya, terutama NH3 atau amonia beracun, dari TAN, pH, suhu, dan salinitas. Hasilnya disimpan di database time-series, yang memang dirancang untuk data berbasis waktu seperti ini. Di ujungnya, modul AI dan machine learning membaca histori untuk memprediksi tren dan mendeteksi anomali, sehingga masalah bisa diantisipasi lebih awal. Beberapa pilihan teknologi di sini masih terbuka, dan akan saya bahas di bagian akhir.

## 10. alur — Satu siklus polling

Supaya lebih konkret, mari ikuti satu siklus. Siklus berjalan searah jarum jam, setiap satu sampai lima menit. Satu: sistem mengecek apakah edge aktif sehat; kalau tidak, cadangan mengambil alih. Dua: polling Modbus ke 92 node, segmen A sampai D bergiliran. Tiga: data disimpan di buffer lokal; kalau internet putus, data ditahan. Empat: data dikirim ke cloud. Lalu sisi bawah. Lima: broker dan API menghitung NH3 dan menyimpan data. Enam: analisis ambang batas dan pola anomali. Tujuh: kalau normal, data cukup tampil di dashboard; kalau melewati batas, notifikasi dikirim ke petambak. Delapan: modul kontrol menyalakan aerator atau pompa lewat relay, atau petambak mengambil alih secara manual. Setelah itu siklus berulang. Intinya, dari sensor sampai aksi berjalan otomatis, tetapi manusia tetap bisa mengintervensi.

## 11. aplikasi — Petambak melihat, sistem bertindak

Ini bagian yang langsung dirasakan petambak. Tampilan ponsel di kiri adalah ilustrasi konsep, bukan desain final. Skenarionya: grafik oksigen terlarut di kolam tiga turun melewati garis ambang. Sistem mendeteksinya, mengirim alert ke ponsel petambak, dan aerator menyala otomatis. Layer aplikasi punya tiga fungsi. Pertama, dashboard web dan mobile untuk melihat data real-time, histori, dan laporan. Kedua, notifikasi saat ambang batas terlampaui atau anomali terdeteksi. Ketiga, kontrol otomatis yang dipicu oleh alert tersebut. Yang penting, kontrol otomatis selalu bisa di-override petambak dari dashboard, jadi keputusan akhir tetap di tangan manusia. Di layer paling bawah, perintah diteruskan ke relay atau kontaktor yang dilengkapi fuse pengaman untuk menyalakan aerator dan pompa air.

## 12. keputusan — Risiko dan jawabannya

Slide ini merangkum alasan di balik desain, dibaca dari kiri ke kanan: risiko di lapangan, lalu jawabannya. Sembilan puluh dua node melebihi batas satu bus, maka kami pecah menjadi empat segmen. Gangguan bisa menjalar antar segmen, maka repeater diberi isolasi galvanik. Edge bisa mati, maka ada edge cadangan dengan heartbeat. Internet bisa putus, maka ada buffer store-and-forward. Satu jalur uplink bisa gagal, maka router memakai dua SIM plus cadangan WiFi atau Ethernet. Lingkungan tambak basah, listrik bisa padam, dan ada risiko petir, maka ada cabinet IP66, UPS, grounding, dan arrester. Terakhir, perhitungan amonia beracun bisa tidak akurat, maka sensor terkait ditempatkan di satu titik. Jadi setiap komponen yang kami pilih punya alasan yang jelas, bukan sekadar tambahan biaya.

## 13. roadmap — Lima tahap

Pembangunan dibagi lima tahap. Titik yang menyala di kiri adalah posisi kita sekarang: Tahap 1, fondasi site, yaitu sensor, jaringan RS485, edge unit, cabinet, dan uplink 4G, sudah selesai didesain. Tahap 2 membangun backend inti: broker, API, perhitungan NH3, dan database. Tahap 3 membangun aplikasi: dashboard dan notifikasi. Tahap 4 menambahkan kontrol: modul otomatis, manual override, dan relay ke aerator serta pompa. Tahap 5 menambahkan kecerdasan: AI dan machine learning untuk prediksi tren dan deteksi anomali. Urutan ini disengaja. Setiap tahap berdiri di atas tahap sebelumnya, dan setiap tahap sudah memberi manfaat sendiri. Setelah Tahap 3, misalnya, petambak sudah bisa memantau dan menerima peringatan meski kontrol otomatis belum aktif. Jadwal rinci per tahap: [diisi].

## 14. terbuka — Empat keputusan

Sebelum Tahap 2 dimulai, ada empat keputusan yang kami perlukan dari forum ini. Pertama, stack API: FastAPI atau Express. Keduanya matang; pilihannya lebih banyak ditentukan oleh keahlian tim yang akan memelihara sistem. Kedua, database time-series: InfluxDB yang khusus untuk data waktu, atau PostgreSQL yang lebih serbaguna. Ketiga, interval polling final di rentang satu sampai lima menit. Makin rapat, makin cepat deteksi, tetapi beban jaringan dan volume data juga naik. Keempat, dan ini yang paling penting, nilai ambang batas untuk setiap parameter: berapa oksigen minimum, berapa amonia maksimum, dan seterusnya. Angka inilah yang memicu notifikasi dan kontrol otomatis, jadi sebaiknya ditetapkan bersama tim budidaya. Kami siap menyiapkan rekomendasi untuk masing-masing poin.

## 15. penutup — Terima kasih

Sebagai penutup, saya ulang tiga poin utama. Pertama, SmartAqua Pond adalah rantai lengkap: dari sembilan sensor di setiap kolam sampai aerator yang menyala otomatis. Kedua, fondasi lapangannya, yaitu sensor, jaringan, edge, dan uplink, sudah didesain dengan cadangan di setiap titik rawan, sehingga datanya andal. Ketiga, tahap berikutnya membangun lapisan yang mengolah, menampilkan, dan menindaklanjuti data tersebut, dan untuk memulainya kami membutuhkan empat keputusan yang tadi saya sampaikan. Terima kasih atas perhatian Bapak dan Ibu. Saya persilakan untuk pertanyaan, masukan, atau diskusi, terutama terkait keputusan Tahap 2.
