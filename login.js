// login.js
async function handleLogin(event) {
  event.preventDefault();
  
  const loader = document.getElementById('loader');
  const alertBox = document.getElementById('alertBox');
  const btnSubmit = document.querySelector('button[type="submit"]');
  
  loader.style.display = 'block';
  alertBox.classList.add('d-none');
  btnSubmit.disabled = true;
  
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  try {
    // API_URL didapatkan dari config.js
    const response = await fetch(`${API_URL}?action=login&username=${user}&password=${pass}`);
    const data = await response.json();

    if (data.success) {
      loader.innerHTML = '<div class="spinner-border text-success spinner-border-sm" role="status"></div><span class="ms-2 small text-success fw-bold">Login berhasil! Membuka Dashboard...</span>';
      sessionStorage.setItem("isLoggedIn", "true"); 
      window.location.href = "admin.html"; 
    } else {
      loader.style.display = 'none';
      btnSubmit.disabled = false;
      alertBox.innerText = 'Username atau password salah!';
      alertBox.classList.remove('d-none');
    }
  } catch (error) {
    loader.style.display = 'none';
    btnSubmit.disabled = false;
    alertBox.innerText = 'Terjadi gangguan ke server: ' + error.message;
    alertBox.classList.remove('d-none');
  }
}
