const produkAwal = [
  {
    nama: "Kaos Hitam Saekano",
    harga: 75000,
    deskripsi: "Kaos berbahan cotton combed 30s, nyaman dipakai.",
    ukuran: "S, M, L, XL",
    image: "MEGUMI_KATO-removebg-preview.png",
    rating: 4.7,
    terjual: 123
  },
  {
    nama: "Kaos Putih Bleach",
    harga: 85000,
    deskripsi: "Kaos eksklusif karakter anime Bleach.",
    ukuran: "All size",
    image: "MEGUMI_KATO__3_-removebg-preview.png",
    rating: 4.9,
    terjual: 89
  },
  {
    nama: "Kaos Hitam Bleach",
    harga: 60000,
    deskripsi: "Kaos karakter anime Bleach warna hitam.",
    ukuran: "M, L, XL",
    image: "MEGUMI_KATO__2_-removebg-preview.png",
    rating: 4.3,
    terjual: 57
  },
  {
    nama: "Kaos Desain Custom",
    harga: 100000,
    deskripsi: "Request desain anime favoritmu!",
    ukuran: "S - XXL",
    image: "saar-removebg-preview.png",
    rating: 4.8,
    terjual: 201
  }
];


// Gabungkan produk admin (jika ada)
const produkAdmin = JSON.parse(localStorage.getItem("adminProduk")) || [];
const allProduk = [...produkAwal, ...produkAdmin];

localStorage.setItem("allProduk", JSON.stringify(allProduk));

const cart = JSON.parse(localStorage.getItem('cart')) || [];

const hargaProduk = {
  "Kaos Hitam Saekano": 75000,
  "Kaos Putih Bleach": 85000,
  "Kaos Hitam Bleach": 60000,
  "Kaos Desain Custom": 100000,
};

function updateCartDisplay() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");

  const totalQty = cart.reduce((total, item) => total + item.qty, 0);
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "Belum ada item.";
    return;
  }
  cartItemsDiv.innerHTML = cart.map((item, index) => {
    const gambar = item.image || "images/default-image.png";
    const hargaSatuan = hargaProduk[item.nama] || 0;
    const subtotal = hargaSatuan * item.qty;

    return `
    <div class="cart-item">
      <div class="cart-item-left">
        <img src="${gambar}" alt="${item.nama}" class="cart-item-img">
        <div class="cart-item-info">
          <strong>${item.nama}</strong>
          <p>Rp ${hargaSatuan.toLocaleString("id-ID")} x ${item.qty} = <b>Rp ${subtotal.toLocaleString("id-ID")}</b></p>
        </div>
      </div>
      <div class="cart-item-actions">
        <button onclick="ubahQty(${index}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="ubahQty(${index}, 1)">+</button>
        <input type="checkbox" class="hapus-checkbox" data-index="${index}" />
      </div>
    </div>
  `;
  }).join("");

  localStorage.setItem('cart', JSON.stringify(cart));
}

function hapusProdukDipilih() {
  const checkboxes = document.querySelectorAll(".hapus-checkbox:checked");
  if (checkboxes.length === 0) {
    tampilkanNotifikasi("⚠️ Pilih produk yang ingin dihapus.");
    return;
  }

  const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
  indices.sort((a, b) => b - a).forEach(index => {
    cart.splice(index, 1);
  });

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

function hapusItem(index) {
  cart.splice(index, 1);
  updateCartDisplay();
}

function kosongkanKeranjang() {
  cart.length = 0;
  updateCartDisplay();
}

function checkout() {
  const userLogin = JSON.parse(localStorage.getItem("userLogin") || "null");
  if (!userLogin) {
    tampilkanPopupLoginDulu();
    return;
  }

  const checkboxes = document.querySelectorAll(".hapus-checkbox:checked");
  if (checkboxes.length === 0) {
    tampilkanNotifikasi("⚠️ Silakan centang produk yang ingin di-checkout.");
    return;
  }

  const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
  const produkCheckout = indices.map(i => cart[i]).filter(item => item && item.qty > 0);

  if (produkCheckout.length === 0) {
    tampilkanNotifikasi("❌ Tidak dapat melanjutkan checkout. Produk yang dipilih memiliki jumlah 0.");
    return;
  }

  // ✅ Simpan produk yang dipilih untuk dikirim ke halaman pembayaran
  localStorage.setItem("checkoutItems", JSON.stringify(produkCheckout));

  // Hapus dari keranjang (karena produk akan masuk ke proses pembayaran)
  // Perhatian: Ini adalah bagian yang perlu diperbaiki jika ingin item tetap di keranjang
  // sampai pembayaran selesai. Untuk saat ini, kita biarkan saja karena ini hanyalah
  // perpindahan data ke 'checkoutItems'. Penghapusan dari keranjang yang sesungguhnya
  // akan terjadi di pembayaran.html setelah transaksi sukses.
  // indices.sort((a, b) => b - a).forEach(index => {
  //   cart.splice(index, 1);
  // });
  // localStorage.setItem("cart", JSON.stringify(cart));

  // ✅ Tampilkan alert (opsional, bisa dihapus jika ingin langsung redirect)
  let pesan = "✅ Berhasil, lanjutkan ke pembayaran.\n";
  produkCheckout.forEach(item => {
    pesan += `• ${item.nama} (${item.qty} pcs)\n`;
  });
  alert(pesan);

  // ✅ Voucher: hanya catat jumlah checkout, bukan kurangi voucher dulu
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  if (email) {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutCount") || "{}");
    const count = checkoutData[email] || 0;
    checkoutData[email] = count + 1;
    localStorage.setItem("checkoutCount", JSON.stringify(checkoutData));
  }

  updateCartDisplay();
  toggleCart();

  // ✅ Redirect user ke halaman pembayaran
  window.location.href = "pembayaran.html";
}


function toggleCart() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  const isVisible = modal.classList.contains("show");

  if (isVisible) {
    modal.classList.remove("show");
    overlay.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
      overlay.style.display = "none";
    }, 300);
  } else {
    modal.style.display = "block";
    overlay.style.display = "block";
    setTimeout(() => {
      modal.classList.add("show");
      overlay.classList.add("show");
    }, 10);
  }
}

function cariProduk(keywordInput) {
  const keyword = keywordInput.toLowerCase();
  const semuaProduk = JSON.parse(localStorage.getItem("allProduk")) || [];

  const hasil = semuaProduk.filter(p => p.nama.toLowerCase().includes(keyword));
  renderProduk(hasil);
}

function tampilkanNotifikasi(pesan) {
  const modal = document.getElementById("notifikasiModal");
  const pesanEl = document.getElementById("notifikasiPesan");
  pesanEl.textContent = pesan;
  modal.style.display = "block";
  modal.classList.remove("notif-hide");
  modal.classList.add("notif-show");
}

function tutupNotifikasi() {
  const modal = document.getElementById("notifikasiModal");
  modal.classList.remove("notif-show");
  modal.classList.add("notif-hide");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

function ubahQty(index, perubahan) {
  const newQty = cart[index].qty + perubahan;
  cart[index].qty = Math.max(0, newQty);
  updateCartDisplay();
}

function tampilkanLaporanPenjualan() {
  const laporan = JSON.parse(localStorage.getItem("laporanPenjualan")) || [];
  const container = document.getElementById("laporanContainer");
  container.innerHTML = "<h2 style='color:white;'>📊 Laporan Penjualan</h2>";

  if (laporan.length === 0) {
    container.innerHTML += "<p style='color:white;'>Belum ada transaksi.</p>";
    return;
  }

  let total = 0;
  const tabel = document.createElement("table");
  tabel.style = "width:100%; border-collapse:collapse; background:white; color:black; margin-top:10px;";

  tabel.innerHTML = `
    <thead style="background:#f97316; color:white;">
      <tr>
        <th style="padding:10px;">Produk</th>
        <th>Qty</th>
        <th>Total</th>
        <th>Tanggal</th>
      </tr>
    </thead>
    <tbody>
  `;

  laporan.forEach(item => {
    total += item.subtotal; // Perhatikan, ini harusnya subtotal, bukan total.
    tabel.innerHTML += `
      <tr style="text-align:center;">
        <td style="padding:8px;">${item.nama}</td>
        <td>${item.jumlah}</td>
        <td>Rp ${item.subtotal.toLocaleString("id-ID")}</td>
        <td>${item.tanggal}</td>
      </tr>
    `;
  });

  tabel.innerHTML += `
    </tbody>
    <tfoot>
      <tr style="font-weight:bold; background:#fef3c7;">
        <td colspan="2" style="padding:10px;">Total Keuntungan</td>
        <td colspan="2">Rp ${total.toLocaleString("id-ID")}</td>
      </tr>
    </tfoot>
  `;

  container.appendChild(tabel);
}


function tampilkanPanelUser() {
  const produkAdmin = JSON.parse(localStorage.getItem("adminProduk")) || [];
  const produkContainer = document.getElementById("produkContainer");
  const favoritList = JSON.parse(localStorage.getItem("favoritList")) || [];

  const produkDefault = [
    {
      nama: "Kaos Hitam Saekano",
      harga: 75000,
      image: "MEGUMI_KATO-removebg-preview.png",
      rating: 4.7,
      terjual: 123,
      deskripsi: "Kaos berbahan cotton combed 30s, nyaman dipakai, cocok untuk penggemar anime Saekano. Ukuran tersedia: S, M, L, XL."
    },
    {
      nama: "Kaos Putih Bleach",
      harga: 85000,
      image: "10.png",
      rating: 4.9,
      terjual: 89,
      deskripsi: "Kaos eksklusif dengan karakter anime Bleach. Bahan adem dan lembut. Tersedia ukuran all size."
    },
    {
      nama: "Kaos Hitam Bleach",
      harga: 60000,
      image: "MEGUMI_KATO__2_-removebg-preview.png",
      rating: 4.3,
      terjual: 57,
      deskripsi: "Kaos karakter anime Bleach warna hitam, cocok dipakai harian. Size: M, L, XL."
    },
    {
      nama: "Kaos Desain Custom",
      harga: 100000,
      image: "saar-removebg-preview.png",
      rating: 4.8,
      terjual: 201,
      deskripsi: "Bisa request desain anime favoritmu! Cetak sablon premium, bahan lembut dan tidak panas. Size lengkap."
    }
  ];

  const semuaProduk = [...produkDefault, ...produkAdmin];
  produkContainer.innerHTML = "";
  // Beri nilai default untuk produk admin jika belum ada
  semuaProduk.forEach(p => {
    if (p.rating === undefined) {
      p.rating = (Math.random() * (5 - 4.2) + 4.2).toFixed(1); // Antara 4.2 - 5.0
    }
    if (p.terjual === undefined) {
      p.terjual = Math.floor(Math.random() * 200) + 1; // Antara 1 - 200
    }

  });

  semuaProduk.forEach(item => {
    const isFavorit = favoritList.includes(item.nama);

    let imgSrc = "images/default-image.png";
    if (item.image && typeof item.image === "string") {
      if (item.image.startsWith("data:image")) {
        imgSrc = item.image;
      } else if (item.image.startsWith("images/")) {
        imgSrc = item.image;
      } else {
        imgSrc = "images/" + item.image;
      }
    }

    const produkHTML = document.createElement("div");
    produkHTML.className = "produk";
    produkHTML.dataset.nama = item.nama;

    produkHTML.innerHTML = `
  <a href="produk.html?produk=${encodeURIComponent(item.nama)}" style="text-decoration:none; color:inherit;">
    <img src="${imgSrc}" alt="${item.nama}"
         onerror="this.onerror=null;this.src='images/default-image.png';"
         style="width:100%;height:240px;object-fit:cover;border-radius:8px;">

    <h3 style="font-size:14px; font-weight:500; margin:6px 0;">${item.nama}</h3>

    <p style="font-size:15px; color:#f97316; font-weight:bold; margin:2px 0;">
      Rp ${parseInt(item.harga).toLocaleString("id-ID")}
    </p>

    <p style="font-size:13px; color:#000000; margin-bottom:4px;">
      ⭐ ${item.rating || '4.5'} | Terjual ${item.terjual || 100}
    </p>
  </a>
`;



    produkContainer.appendChild(produkHTML);
  });

  localStorage.setItem("allProduk", JSON.stringify(semuaProduk));

}

function tambahProdukBaru() {
  const nama = prompt("Masukkan nama produk:");
  const hargaInput = prompt("Masukkan harga:");
  const deskripsi = prompt("Masukkan deskripsi:");
  const ukuran = prompt("Masukkan ukuran (pisahkan dengan koma):");
  const image = prompt("Masukkan nama file gambar:");

  if (!nama || !hargaInput || !deskripsi || !ukuran || !image) {
    alert("❌ Semua data wajib diisi!");
    return;
  }

  const harga = parseInt(hargaInput);
  const produkBaru = { nama, harga, deskripsi, ukuran, image };

  const adminProduk = JSON.parse(localStorage.getItem("adminProduk") || "[]");
  adminProduk.push(produkBaru);
  localStorage.setItem("adminProduk", JSON.stringify(adminProduk));

  alert("✅ Produk berhasil ditambahkan!");
  location.reload();
}


function renderAdminProduk() {
  const produk = JSON.parse(localStorage.getItem("adminProduk")) || [];
  const list = document.getElementById("adminProdukList");
  list.innerHTML = "";

  if (produk.length === 0) {
    list.innerHTML = "<p style='color:white;'>Belum ada produk ditambahkan.</p>";
    return;
  }

  produk.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "admin-produk-card";

    card.innerHTML = `
      <div class="admin-produk-gambar">
        <img src="images/${item.image}" alt="${item.nama}"
             onerror="this.src='images/default-image.png'">
      </div>
      <div class="admin-produk-info">
        <h3>${item.nama}</h3>
        <p><strong>Harga:</strong> Rp ${parseInt(item.harga).toLocaleString("id-ID")}</p>
        <p><strong>Ukuran:</strong> ${item.ukuran}</p>
        <p class="deskripsi">${item.deskripsi}</p>

        <div class="admin-produk-aksi">
          <button onclick="editProdukAdmin(${index})">Edit</button>
          <button onclick="hapusProdukAdmin(${index})" class="hapus">Hapus</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}



function hapusProdukAdmin(index) {
  const produk = JSON.parse(localStorage.getItem("adminProduk")) || [];
  produk.splice(index, 1);
  localStorage.setItem("adminProduk", JSON.stringify(produk));
  renderAdminProduk();
}


function renderAdminProduk() {
  const produk = JSON.parse(localStorage.getItem("adminProduk")) || [];
  const list = document.getElementById("adminProdukList");
  list.innerHTML = "";

  if (produk.length === 0) {
    list.innerHTML = "<p style='color:white;'>Belum ada produk.</p>";
    return;
  }

  produk.forEach((item, index) => {
    const card = document.createElement("div");
    card.style = "background:#fff;padding:15px;margin-bottom:10px;border-radius:8px;";
    card.innerHTML = `
        <img src="images/${item.image}" alt="${item.nama}" style="max-width:100px;" onerror="this.src='default-image.png'">
        <h3>${item.nama}</h3>
        <p>Rp ${item.harga}</p>
        <button onclick="hapusProdukAdmin(${index})" style="background:#dc2626;color:#fff;padding:6px 12px;border:none;border-radius:4px;">Hapus</button>
      `;
    list.appendChild(card);
  });
}

function hapusProdukAdmin(index) {
  const produk = JSON.parse(localStorage.getItem("adminProduk")) || [];
  produk.splice(index, 1);
  localStorage.setItem("adminProduk", JSON.stringify(produk));
  renderAdminProduk();
}
function tampilkanDetailProduk(nama, harga, deskripsi, gambar) {
  document.getElementById("detailNama").textContent = nama;
  document.getElementById("detailHarga").textContent = harga;
  document.getElementById("detailDeskripsi").textContent = deskripsi;
  document.getElementById("detailGambar").src = gambar;

  document.getElementById("detailModal").style.display = "block";
  document.getElementById("modalOverlay").style.display = "block";
}

function tutupDetailProduk() {
  document.getElementById("detailModal").style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
}

function logout() {
  localStorage.removeItem("user");
  window.location.reload();
}

console.log("Login Info:", localStorage.getItem("user"));



const userWrapper = document.getElementById("userWrapper");
const userMenu = document.getElementById("userMenu");

let hoverTimeout;

userWrapper.addEventListener("mouseenter", () => {
  clearTimeout(hoverTimeout);
  userMenu.style.opacity = "1";
  userMenu.style.pointerEvents = "auto";
  userMenu.style.transform = "translateY(0)";
});

userWrapper.addEventListener("mouseleave", () => {
  hoverTimeout = setTimeout(() => {
    userMenu.style.opacity = "0";
    userMenu.style.pointerEvents = "none";
    userMenu.style.transform = "translateY(8px)";
  }, 200); // delay agar tidak langsung hilang
});

function updateCartDisplay() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const totalHargaEl = document.getElementById("totalHarga");
  const checkAll = document.getElementById("checkAll");

  const totalQty = cart.reduce((total, item) => total + item.qty, 0);
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "Belum ada item.";
    if (totalHargaEl) totalHargaEl.textContent = "Total: Rp 0";
    checkAll.checked = false;
    checkAll.disabled = true;
    return;
  }

  let totalHarga = 0;

  cartItemsDiv.innerHTML = cart.map((item, index) => {
    const gambar = getGambarProduk(item.nama); // ambil path gambar berdasarkan nama
    const hargaSatuan = hargaProduk[item.nama] || 0;
    const subtotal = hargaSatuan * item.qty;

    return `
    <div class="cart-item">
      <div class="cart-item-left">
        <img src="${gambar}" alt="${item.nama}" class="cart-item-img">
        <div class="cart-item-info">
          <strong>${item.nama}</strong>
          <p>Rp ${hargaSatuan.toLocaleString("id-ID")} x ${item.qty} = <b>Rp ${subtotal.toLocaleString("id-ID")}</b></p>
        </div>
      </div>
      <div class="cart-item-actions">
        <button onclick="ubahQty(${index}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="ubahQty(${index}, 1)">+</button>
        <input type="checkbox" class="hapus-checkbox" data-index="${index}" />
      </div>
    </div>
  `;
  }).join("");
  function getGambarProduk(namaProduk) {
    const produk = {
      "Kaos Hitam Saekano": "MEGUMI_KATO-removebg-preview.png",
      "Kaos Putih Bleach": "MEGUMI_KATO__3_-removebg-preview.png",
      "Kaos Hitam Bleach": "MEGUMI_KATO__2_-removebg-preview.png",
      "Kaos Desain Custom": "saar-removebg-preview.png"
    };
    return produk[namaProduk] || "default-image.png";
  }


  totalHargaEl.textContent = "Rp " + totalHarga.toLocaleString("id-ID");

  // 🔁 Rebind checkbox logic setiap update
  const checkboxes = document.querySelectorAll(".hapus-checkbox");

  // Aktifkan tombol "Pilih Semua" kembali
  checkAll.disabled = false;

  // SET kondisi checkAll = true jika semua tercentang
  checkAll.checked = [...checkboxes].length > 0 && [...checkboxes].every(cb => cb.checked);

  // Hapus event listener sebelumnya dengan clone
  const newCheckAll = checkAll.cloneNode(true);
  checkAll.parentNode.replaceChild(newCheckAll, checkAll);

  // Tambahkan event baru
  newCheckAll.addEventListener("change", function () {
    const semua = newCheckAll.checked;
    document.querySelectorAll(".hapus-checkbox").forEach(cb => cb.checked = semua);
  });
}

function toggleFavorit(event, el) {
  event.stopPropagation();
  const card = el.closest(".produk");
  const namaProduk = card ? card.dataset.nama : el.dataset.nama;
  let favoritList = JSON.parse(localStorage.getItem("favoritList")) || [];

  const icon = el.querySelector(".heart-icon");

  if (favoritList.includes(namaProduk)) {
    favoritList = favoritList.filter(n => n !== namaProduk);
    el.classList.remove("active");
    if (icon) icon.textContent = "♡";
  } else {
    favoritList.push(namaProduk);
    el.classList.add("active");
    if (icon) icon.textContent = "❤️";
  }

  localStorage.setItem("favoritList", JSON.stringify(favoritList));
}


function togglePanelProfil() {
  const panel = document.getElementById("panelProfil");
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Guest", email: "" };

  // Set nama & email saat panel muncul
  document.getElementById("editNama").value = user.name || "Guest";
  document.getElementById("tampilEmailUser").textContent = user.email || "Belum ada email";

  // Tampilkan atau sembunyikan panel
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}


function simpanNamaBaru() {
  const inputNama = document.getElementById("editNama").value.trim();
  if (inputNama === "") {
    alert("Nama tidak boleh kosong.");
    return;
  }

  let user = JSON.parse(localStorage.getItem("user")) || {};
  user.name = inputNama;
  localStorage.setItem("user", JSON.stringify(user));

  document.getElementById("userName").textContent = inputNama;
  document.getElementById("panelProfil").style.display = "none";

  tampilkanNotifikasi("✅ Nama berhasil diperbarui!");
}

const akunAdmin = {
  email: "admintokoku@gmail.com",
  password: "admin123",
  name: "admin toko"
};

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email dan password wajib diisi.");
    return;
  }

  if (email === akunAdmin.email && password === akunAdmin.password) {
    const adminUser = {
      name: akunAdmin.name,
      email: akunAdmin.email,
      role: "admin"
    };
    localStorage.setItem("user", JSON.stringify(adminUser));
    alert("Login sebagai ADMIN berhasil!");
    window.location.href = "admin.html"; // atau halaman utama kamu
    return;
  }

  // Kalau bukan admin, login biasa
  const nama = email.split("@")[0];
  const user = {
    name: nama,
    email: email,
    role: "user"
  };
  localStorage.setItem("user", JSON.stringify(user));
  alert("Login sebagai USER berhasil!");
  window.location.href = "index.html";
}

// Perbaiki data kosong
if (!localStorage.getItem("adminProduk")) {
  localStorage.setItem("adminProduk", JSON.stringify([]));
}

window.onload = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  console.log("Role:", role);

  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");
  const uploadPhoto = document.getElementById("uploadPhoto");

  // Tampilkan nama dan foto profil
  if (userName) userName.textContent = user?.name || user?.username || "Guest";
  if (userAvatar && user?.photo) userAvatar.src = user.photo;

  // Klik avatar untuk upload
  if (userAvatar && uploadPhoto) {
    userAvatar.addEventListener("click", () => uploadPhoto.click());

    uploadPhoto.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        const base64Image = event.target.result;
        userAvatar.src = base64Image;

        let userData = JSON.parse(localStorage.getItem("user")) || {};
        userData.photo = base64Image;
        localStorage.setItem("user", JSON.stringify(userData));
      };
      reader.readAsDataURL(file);
    });
  }

  // Tampilkan tampilan user untuk semua role
  tampilkanPanelUser(); // ✅ ini saja cukup sekarang
  tampilkanFavoritProduk();
  updateCartCount();
  updateCartDisplay();

  // Search bar atas
  const inputNav = document.getElementById("searchInputNav");
  if (inputNav) {
    inputNav.addEventListener("input", () => {
      cariProduk(inputNav.value);
    });
    inputNav.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // agar tidak reload halaman
        cariProduk(inputNav.value);
      }
    });

    document.addEventListener("click", (e) => {
      if (!inputNav.contains(e.target)) inputNav.blur();
    });
  }

  const userLogin = JSON.parse(localStorage.getItem("user") || "null");
  if (!userLogin) {
    const checkoutBtn = document.querySelector(".checkout-btn");
    const keranjangBtn = document.getElementById("btnKeranjang");
    const beliLangsungBtn = document.getElementById("btnBeliLangsung");

    if (checkoutBtn) checkoutBtn.disabled = true;
    if (keranjangBtn) keranjangBtn.disabled = true;
    if (beliLangsungBtn) beliLangsungBtn.disabled = true;
  }

  // Floating search
  const toggleBtn = document.getElementById("toggleSearch");
  const searchBox = document.getElementById("floatingSearch");
  const searchInput = document.getElementById("floatingSearchInput");

  if (toggleBtn && searchBox && searchInput) {
    toggleBtn.addEventListener("click", () => {
      searchBox.classList.toggle("show");
      if (searchBox.classList.contains("show")) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });

    document.addEventListener("click", (e) => {
      if (!searchBox.contains(e.target) && e.target !== toggleBtn) {
        searchBox.classList.remove("show");
      }
    });
  }

  // Icon favorit
  const favoritList = JSON.parse(localStorage.getItem("favoritList")) || [];
  document.querySelectorAll(".produk").forEach(card => {
    const nama = card.dataset.nama;
    const icon = card.querySelector(".produk-favorit");

    if (icon) {
      if (favoritList.includes(nama)) {
        icon.classList.add("active");
        icon.textContent = "❤️";
      } else {
        icon.textContent = "♡";
      }
    }
  });
};

function tambahKeKeranjang(nama, harga, gambar, ukuran, jumlah) {
  cekLoginSebelumAksi(() => {
    let keranjang = JSON.parse(localStorage.getItem("keranjang") || "[]");

    const itemLama = keranjang.find(p => p.nama === nama && p.ukuran === ukuran);
    if (itemLama) {
      itemLama.jumlah += jumlah;
    } else {
      keranjang.push({ nama, harga, gambar, ukuran, jumlah });
    }

    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    updateCartCount();
    tampilkanNotifikasi("Produk berhasil ditambahkan ke keranjang");
  });
}


function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((total, item) => total + item.qty, 0);
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = totalQty;
}
function tampilkanPopup(pesan, warna = '#10b981') {
  const popup = document.getElementById("popupAlert");
  popup.textContent = pesan;
  popup.style.background = warna;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}

function beliProduk(namaProduk) {
  const semuaProduk = JSON.parse(localStorage.getItem("allProduk")) || [];
  const produk = semuaProduk.find(p => p.nama === namaProduk);
  const gambar = produk?.image?.startsWith("data:image") || produk?.image?.startsWith("images/")
    ? produk.image
    : "images/" + (produk?.image || "default-image.png");

  const itemIndex = cart.findIndex(item => item.nama === namaProduk);
  if (itemIndex > -1) {
    cart[itemIndex].qty += 1;
  } else {
    cart.push({
      nama: namaProduk,
      qty: 1,
      image: gambar, // ✅ penting agar nanti bisa dipakai saat checkout
      ukuran: "-"     // bisa diganti kalau user pilih ukuran
    });
    // ✅ tambahkan gambar
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "keranjang.html";
}


// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
  const notifikasiModal = document.getElementById('notifikasiModal');
  const notifikasiPesan = document.getElementById('notifikasiPesan');
  notifikasiPesan.innerText = message;
  notifikasiModal.style.display = 'block';

  // Menambahkan animasi opacity untuk efek fade-in
  setTimeout(() => {
    notifikasiModal.style.opacity = 1;
  }, 100);

  // Menutup notifikasi setelah beberapa detik
  setTimeout(() => {
    notifikasiModal.style.opacity = 0;
    setTimeout(() => {
      notifikasiModal.style.display = 'none';
    }, 500);
  }, 3000);
}



function beliLangsung(namaProduk) {
  const semuaProduk = JSON.parse(localStorage.getItem("allProduk") || "[]");
  const produk = semuaProduk.find(p => p.nama === namaProduk);

  if (!produk) {
    tampilkanPopup("❌ Produk tidak ditemukan.", "#dc2626");
    return;
  }

  tampilkanPopup("✅ Pembayaran berhasil untuk 1x " + produk.nama, "#10b981");
}

let detailSementara = {};

function tampilkanPopupProduk(nama, harga, deskripsi, gambar) {
  detailSementara = { nama, harga, deskripsi, gambar };

  document.getElementById("popupNama").textContent = nama;
  document.getElementById("popupHarga").textContent = "Rp " + parseInt(harga).toLocaleString("id-ID");
  document.getElementById("popupDeskripsi").textContent = deskripsi;
  document.getElementById("popupGambar").src = gambar;
  document.getElementById("ukuranSelect").value = "";

  document.getElementById("popupProdukDetail").style.display = "flex";
}

function tutupPopupProduk() {
  document.getElementById("popupProdukDetail").style.display = "none";
}

function tambahDariPopup() {
  const ukuran = document.getElementById("ukuranSelect").value;
  if (!ukuran) {
    alert("❗ Silakan pilih ukuran.");
    return;
  }

  const keranjang = JSON.parse(localStorage.getItem("keranjang") || "[]");
  keranjang.push({ nama: detailSementara.nama, qty: 1, ukuran });
  localStorage.setItem("keranjang", JSON.stringify(keranjang));

  alert("✅ Ditambahkan ke keranjang.");
  tutupPopupProduk();
}
document.addEventListener("DOMContentLoaded", () => {
  const loginLogoutItem = document.getElementById("loginLogoutItem");
  const userNameDisplay = document.getElementById("userName");
  const user = JSON.parse(localStorage.getItem("user"));

  // Tampilkan nama atau guest
  if (user && user.name) {
    userNameDisplay.textContent = user.name;
    loginLogoutItem.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
  } else {
    userNameDisplay.textContent = "Guest";
    loginLogoutItem.innerHTML = `<a href="form login.html">Login</a>`;
  }
});

// Fungsi logout
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("checkoutItems");
  localStorage.removeItem("cart");
  window.location.reload();
}

function tampilkanFavoritProduk() {
  const favoritContainer = document.getElementById("favoritContainer");
  const favoritList = JSON.parse(localStorage.getItem("favoritList") || "[]");
  const semuaProduk = JSON.parse(localStorage.getItem("allProduk") || "[]");

  favoritContainer.innerHTML = "";

  if (favoritList.length === 0) {
    favoritContainer.innerHTML = "<p style='color:white;'>Belum ada produk favorit.</p>";
    return;
  }

  favoritList.forEach(nama => {
    const produk = semuaProduk.find(p => p.nama === nama);
    if (!produk) return;

    const imgSrc = produk.image?.startsWith("data:image") || produk.image?.startsWith("images/")
      ? produk.image
      : "images/" + produk.image;

    const div = document.createElement("div");
    div.className = "produk";
    div.innerHTML = `
      <a href="produk.html?produk=${encodeURIComponent(produk.nama)}" style="text-decoration:none; color:inherit;">
        <img src="${imgSrc}" alt="${produk.nama}">
        <h3>${produk.nama}</h3>
        <p>Rp ${parseInt(produk.harga).toLocaleString("id-ID")}</p>
      </a>
    `;
    favoritContainer.appendChild(div);
  });
}
function simpanProfilUser() {
  const nama = document.getElementById("editNama").value;
  const email = document.getElementById("tampilEmailUser").textContent;
  const alamat = prompt("Masukkan alamat Anda:");
  const telp = prompt("Masukkan no telepon:");

  const user = {
    name: nama,
    email: email,
    address: alamat,
    phone: telp
  };

  localStorage.setItem("user", JSON.stringify(user));
  alert("✅ Data profil berhasil disimpan!");
}


// Fungsi popup login
// Pop-up tengah untuk user belum login
function tampilkanPopupLoginDulu() {
  if (document.getElementById("popup-login")) return;

  const popup = document.createElement("div");
  popup.id = "popup-login";
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "#fff";
  popup.style.color = "#1f2937";
  popup.style.padding = "24px 32px";
  popup.style.borderRadius = "12px";
  popup.style.boxShadow = "0 8px 30px rgba(0,0,0,0.4)";
  popup.style.zIndex = "99999";
  popup.style.textAlign = "center";
  popup.innerHTML = `
    <h3 style="margin-bottom: 12px;">Login Diperlukan</h3>
    <p style="margin-bottom: 20px;">Silakan login terlebih dahulu untuk melanjutkan.</p>
    <button onclick="document.getElementById('popup-login').remove()" style="padding:10px 20px; background:#f97316; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Tutup</button>
  `;
  document.body.appendChild(popup);
}

function toggleBantuan() {
  const modal = document.getElementById("bantuanModal");
  const isVisible = modal.style.opacity === "1";

  if (isVisible) {
    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";
    modal.style.transform = "translateY(30px)";
  } else {
    modal.style.opacity = "1";
    modal.style.pointerEvents = "auto";
    modal.style.transform = "translateY(0)";
  }
}

// Auto close popup jika klik di luar modal
document.addEventListener("click", function (e) {
  const modal = document.getElementById("bantuanModal");
  const tombol = document.getElementById("bantuanBtn");
  if (!modal.contains(e.target) && !tombol.contains(e.target)) {
    setTimeout(() => {
      modal.style.opacity = "0";
      modal.style.pointerEvents = "none";
      modal.style.transform = "translateY(30px)";
    }, 200);
  }
});
function tutupBantuan() {
  document.getElementById("bantuanModal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", function () {
  const semuaProduk = JSON.parse(localStorage.getItem("allProduk")) || [];
  renderProduk(semuaProduk);
});

function renderProduk(listProduk) {
  const container = document.getElementById("produkContainer");
  container.innerHTML = "";

  if (listProduk.length === 0) {
    container.innerHTML = "<p style='margin:20px;'>Belum ada produk tersedia.</p>";
    return;
  }

  listProduk.forEach(p => {
    const div = document.createElement("div");
    div.className = "produk";
    div.dataset.nama = p.nama;

    let imgSrc = p.image || "images/default-image.png";
    if (!imgSrc.startsWith("data:image") && !imgSrc.includes("/")) {
      imgSrc = "images/" + imgSrc;
    }

    const rating = p.rating || "4.5";
    const terjual = p.terjual || 0;

    div.innerHTML = `
      <img src="${imgSrc}" alt="${p.nama}" onclick="window.location.href='produk.html?produk=${encodeURIComponent(p.nama)}'">
      <h3>${p.nama}</h3>
      <p>Rp ${parseInt(p.harga).toLocaleString("id-ID")}</p>
      <p style="font-size:13px; color:#000;">⭐ ${rating} | Terjual ${terjual}</p>
    `;
    container.appendChild(div);
  });
}

document.getElementById("searchInputNav").addEventListener("input", function () {
  cariProduk(this.value);
});

function tampilkanPesanan() {
  const semuaPesanan = JSON.parse(localStorage.getItem("semuaPesanan") || "[]");
  const filter = document.getElementById("filterMetode").value;
  const list = document.getElementById("daftarPesanan");

  let data = semuaPesanan;
  if (filter) {
    data = semuaPesanan.filter(p => p.metodePembayaran === filter);
  }

  if (data.length === 0) {
    list.innerHTML = "<p style='color:white;'>Tidak ada pesanan.</p>";
    return;
  }

  let html = `
    <table style="width:100%; border-collapse:collapse; background:white; color:black;">
      <thead style="background:#4f46e5; color:white;">
        <tr>
          <th style="padding:8px;">Nama</th>
          <th>Email</th>
          <th>Metode</th>
          <th>Total</th>
          <th>Tanggal</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(p => {
    html += `
      <tr style="text-align:center;">
        <td style="padding:6px;">${p.user}</td>
        <td>${p.email}</td>
        <td>${p.metodePembayaran}</td>
        <td>Rp ${p.total.toLocaleString("id-ID")}</td>
        <td>${p.tanggal}</td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  list.innerHTML = html;
}