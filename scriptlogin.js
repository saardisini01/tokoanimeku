const login = document.querySelector(".login");
const create = document.querySelector(".create");
const forgot = document.querySelector(".forgot");
const backToLogin = document.querySelector(".backToLogin");

const signupForm = document.querySelector(".signup");
const signinForm = document.querySelector(".signin");
const forgotForm = document.querySelector(".forgotpass");

function showForm(formName) {
  const forms = [signupForm, signinForm, forgotForm];
  let hasActive = false;

  forms.forEach((form) => {
    if (form.classList.contains("active")) {
      hasActive = true;
      form.classList.add("fade-out");
      setTimeout(() => {
        form.classList.remove("active", "fade-out");
        activateForm(formName);
      }, 500);
    } else {
      form.classList.remove("active");
    }
  });

  if (!hasActive) {
    activateForm(formName);
  }
}

function activateForm(formName) {
  matchMessage.style.display = "none";
  const form =
    formName === "signin" ? signinForm :
      formName === "signup" ? signupForm :
        forgotForm;

  form.classList.add("active", "fade-in");

  setTimeout(() => {
    form.classList.remove("fade-in");
  }, 500);
}

function resetPasswordFields() {
  document.querySelectorAll(".toggle-password").forEach((eyeIcon) => {
    const input = eyeIcon.parentElement.querySelector("input");
    input.type = "password";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  });
}

login.addEventListener("click", (e) => {
  e.preventDefault();
  showForm("signin");
  resetPasswordFields();
});

create.addEventListener("click", (e) => {
  e.preventDefault();
  showForm("signup");
  resetPasswordFields();
});

forgot.addEventListener("click", (e) => {
  e.preventDefault();
  showForm("forgot");
  resetPasswordFields();
});

backToLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showForm("signin");
  resetPasswordFields();
});

document.querySelectorAll(".toggle-password").forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    const input = eyeIcon.parentElement.querySelector("input");
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    eyeIcon.classList.toggle("fa-eye", !isVisible);
    eyeIcon.classList.toggle("fa-eye-slash", isVisible);
  });
});

document.querySelector(".signup").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const address = document.getElementById("reg-address").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;

  if (username.length < 3) return showPopup("Username minimal 3 karakter.", "error");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) return showPopup("Format email tidak valid!", "error");

  if (!/^[0-9]{10,15}$/.test(phone)) return showPopup("Nomor telepon harus 10-15 digit angka.", "error");

  if (password.length < 6) return showPopup("Password minimal 6 karakter", "error");

  if (password !== confirm) return showPopup("Password tidak cocok!", "error");

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(u => u.username === username)) return showPopup("Username sudah digunakan.", "error");

  if (users.some(u => u.email === email)) return showPopup("Email sudah terdaftar.", "error");

  const newUser = { username, email, phone, address, password, role: "user" };
  localStorage.setItem("users", JSON.stringify([...users, newUser]));

  showPopup("Registrasi berhasil! Silakan login.", "success");
  this.reset();
  showForm("signin");
  resetPasswordFields();
});

document.querySelector(".signin").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const foundUser = users.find(u => u.username === username && u.password === password);

  if (!foundUser) return showPopup("Username atau password salah!", "error");
  
  const oldData = JSON.parse(localStorage.getItem("user") || "{}");
  foundUser.photo = oldData.photo || foundUser.photo;
  foundUser.address = oldData.address || foundUser.address;

  foundUser.name = foundUser.username;

  localStorage.setItem("user", JSON.stringify(foundUser));
  localStorage.setItem("role", foundUser.role);

  document.querySelector(".container").classList.add("fade-out");
  setTimeout(() => {
    if (foundUser.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  }, 600);

});

document.querySelector(".forgotpass").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("forgot-email").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) return showPopup("Format email tidak valid!", "error");

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email);

  if (!user) return showPopup("Email tidak ditemukan! Silakan periksa kembali.", "error");

  showPopup("Link reset password telah dikirim ke email Anda.", "success");
  this.reset();
  showForm("signup");
  resetPasswordFields();
});

const passwordInput = document.getElementById("reg-password");
const confirmInput = document.getElementById("reg-confirm");
const matchMessage = document.getElementById("match-message");

function checkPasswordMatch() {
  if (confirmInput.value && passwordInput.value !== confirmInput.value) {
    matchMessage.style.display = "block";
  } else {
    matchMessage.style.display = "none";
  }
}

confirmInput.addEventListener("input", checkPasswordMatch);
passwordInput.addEventListener("input", checkPasswordMatch);

window.addEventListener("DOMContentLoaded", () => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const adminExists = users.some(u => u.username === "admin" && u.role === "admin");

  if (!adminExists) {
    users.push({
      username: "admin",
      email: "admin@admin.com",
      phone: "0000000000",
      address: "Admin Center",
      password: "admin123",
      role: "admin"
    });

    localStorage.setItem("users", JSON.stringify(users));
    console.log("✅ Akun admin berhasil dibuat.");
  }

  const hash = window.location.hash;
  if (hash === "#signup") {
    showForm("signup");
  } else {
    showForm("signin");
  }
});


function showPopup(message, type = "success") {
  const popup = document.getElementById("popup");
  const messageEl = document.getElementById("popup-message");

  messageEl.textContent = message;

  if (type === "success") {
    popup.style.backgroundColor = "#10b981";
  } else if (type === "error") {
    popup.style.backgroundColor = "#ef4444";
  } else {
    popup.style.backgroundColor = "#6b7280";
  }

  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}