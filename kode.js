// File: Code.gs

// Masukkan URL Google Sheets Anda di dalam tanda kutip di bawah ini
var SHEET_URL = "https://docs.google.com/spreadsheets/d/130j1M7AsnRDDGywEJ9gI19kIN19YG149iGoR3OHsJRY/edit";

function doGet(e) {
  var page = e.parameter.p || 'index';
  
  try {
    // Sistem akan mencoba membuka file sesuai nama yang diminta (misal: 'index')
    return HtmlService.createTemplateFromFile(page)
      .evaluate()
      .setTitle('SIS-KIA')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch(error) {
    // JIKA GAGAL karena huruf kecil, sistem akan otomatis mencoba versi Huruf Besar
    // 'index' otomatis diubah menjadi 'Index'
    var namaFileHurufBesar = page.charAt(0).toUpperCase() + page.slice(1);
    
    return HtmlService.createTemplateFromFile(namaFileHurufBesar)
      .evaluate()
      .setTitle('SIS-KIA')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// Helper untuk memanggil database dengan aman
function getDB() {
  var ss = SpreadsheetApp.openByUrl(SHEET_URL);
  return ss.getSheetByName('DataPerkara');
}

// Fungsi mengambil data untuk tabel utama
function getTableData(searchQuery) {
  var sheet = getDB(); // Pastikan ini menggunakan getDB(), BUKAN SpreadsheetApp.getActiveSpreadsheet()
  var data = sheet.getDataRange().getDisplayValues(); // Gunakan getDisplayValues agar membaca format teks dengan aman
  
  if (data.length <= 1) {
    return []; // Jika hanya ada header, langsung kembalikan array kosong
  }
  
  var header = data.shift(); // Buang baris pertama (Header)
  
  // Hapus baris yang benar-benar kosong (jika ada sel yang di-merge atau diformat tapi isinya kosong)
  data = data.filter(row => row.join('').trim() !== '');
  
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase().trim();
    return data.filter(row => {
      return row.some(cell => cell.toString().toLowerCase().includes(searchQuery));
    });
  }
  return data;
}

// Fungsi menyimpan data dari Admin sekaligus menghitung statistik
function processForm(formData) {
  var sheet = getDB();
  
  // Cek apakah database kosong. Jika ya, buatkan Header di Baris 1 otomatis
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["No. Registrasi", "Tanggal", "Jenis Sengketa", "Para Pihak", "Status"]);
  }
  
  // Menambahkan data baru dari form
  sheet.appendRow([
    formData.nomor,
    formData.tanggal,
    formData.jenis,
    formData.pihak,
    formData.status
  ]);
  
  // Langsung hitung total data terbaru agar tidak perlu kerja 2 kali
  var totalData = sheet.getLastRow() - 1;
  
  // Kembalikan pesan sukses dan angka total secara bersamaan
  return { 
    message: "Data sengketa berhasil ditambahkan!", 
    total: totalData 
  };
}

// Fungsi Verifikasi Login Sederhana
function verifyLogin(username, password) {
  if (username === 'admin' && password === 'siskia2026') {
    return true;
  }
  return false;
}

// Fungsi Mengambil Statistik Dashboard
function getDashboardStats() {
  var sheet = getDB();
  var lastRow = sheet.getLastRow();
  var totalData = lastRow > 1 ? lastRow - 1 : 0;
  return { total: totalData };
}

function updateSheetRow(rowIndex, rowData) {
  try {
    var sheet = getDB(); // Mengambil koneksi ke database Anda
    
    /** 
     * getRange(baris, kolom, jumlah_baris, jumlah_kolom)
     * Kita memilih baris yang dituju (rowIndex), mulai dari kolom 1 (A),
     * sebanyak 1 baris, dan meluas hingga 5 kolom (A sampai E).
     */
    sheet.getRange(rowIndex, 1, 1, 5).setValues([rowData]);
    
    return "Berhasil Update"; // Memberitahu browser bahwa data sudah tersimpan
  } catch (e) {
    // Jika ada error (misal: spreadsheet terkunci), kirim pesan error ke browser
    throw new Error("Gagal memperbarui database: " + e.message);
  }
}
