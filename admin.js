// admin.js
document.addEventListener("DOMContentLoaded", function() {
  if (!sessionStorage.getItem("isLoggedIn")) {
    window.location.href = "index.html";
    return;
  }
  loadDashboardStats();
});

async function loadDashboardStats() {
  const loader = document.getElementById('loaderOverlay');
  try {
    const response = await fetch(`${API_URL}?action=getStats`);
    const data = await response.json();
    document.getElementById('statTotal').innerText = data.total;
  } catch (error) {
    document.getElementById('statTotal').innerText = "Error";
  } finally {
    loader.style.display = 'none';
  }
}

function showPage(pageId) {
  document.getElementById('pageDashboard').style.display = pageId === 'dashboard' ? 'block' : 'none';
  document.getElementById('pageDataSengketa').style.display = pageId === 'data' ? 'block' : 'none';
  
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => link.classList.remove('active'));
  event.currentTarget.classList.add('active');

  if (pageId === 'data') loadDataSengketa();
}

async function loadDataSengketa() {
  const loader = document.getElementById('loaderOverlay');
  loader.style.display = 'flex';
  
  try {
    const response = await fetch(`${API_URL}?action=getTableData`);
    const data = await response.json();
    
    let html = '';
    data.forEach((row, index) => {
      let rowIndex = index + 2; 
      html += `
        <tr>
          <td><input type="text" id="no_${rowIndex}" class="form-control form-control-sm text-center fw-bold" value="${row}"></td>
          <td><input type="text" id="tgl_${rowIndex}" class="form-control form-control-sm text-center" value="${row}"></td>
          <td><textarea id="ph_${rowIndex}" class="form-control form-control-sm" rows="1">${row}</textarea></td>
          <td><input type="text" id="jn_${rowIndex}" class="form-control form-control-sm" value="${row}"></td>
          <td><input type="text" id="st_${rowIndex}" class="form-control form-control-sm" value="${row}"></td>
          <td class="text-center">
            <button onclick="updateRow(${rowIndex})" class="btn btn-success btn-sm"><i class="fa fa-save"></i></button>
          </td>
        </tr>`;
    });
    document.getElementById('adminTableBody').innerHTML = html;
  } catch (err) {
    alert("Gagal memuat data: " + err.message);
  } finally {
    loader.style.display = 'none';
  }
}

async function updateRow(index) {
  const loader = document.getElementById('loaderOverlay');
  loader.style.display = 'flex';
  
  const rowData = [
    document.getElementById('no_' + index).value,
    document.getElementById('tgl_' + index).value,
    document.getElementById('jn_' + index).value,
    document.getElementById('ph_' + index).value,
    document.getElementById('st_' + index).value
  ];
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateRow', index: index, rowData: rowData })
    });
    await response.json();
    alert("Data baris " + index + " diperbarui!");
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    loader.style.display = 'none';
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('perkaraForm');
  const btnSubmit = document.getElementById('btnSubmit');
  const loader = document.getElementById('loaderOverlay');

  const dataKirim = {
    nomor: form.nomor.value,
    tanggal: form.tanggal.value,
    pihak: form.pihak.value,
    jenis: form.jenis.value,
    status: form.status.value
  };

  btnSubmit.disabled = true;
  loader.style.display = 'flex';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'processForm', payload: dataKirim })
    });
    const res = await response.json();
    
    document.getElementById('message').innerHTML = `<div class="alert alert-success fw-bold"><i class="fa fa-check-circle me-2"></i> ${res.message || res}</div>`;
    if (res.total !== undefined) document.getElementById('statTotal').innerText = res.total;
    form.reset();
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    loader.style.display = 'none';
    btnSubmit.disabled = false;
  }
}
