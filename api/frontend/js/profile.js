// profile.js

// Popup funksiyalari
function showError(message) {
  const popup = document.getElementById('error-popup');
  document.getElementById('error-message').textContent = message;
  popup.classList.add('visible');
}
function closeErrorPopup() {
  document.getElementById('error-popup').classList.remove('visible');
}

let originalData = {};
let originalAvatar = '';
let defaultAvatar = '';

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    showError('Foydalanuvchi ID topilmadi.');
    return;
  }

  // Elementlar
  const avatar = document.getElementById('avatar');
  const imgInput = document.getElementById('pic-upload');
  const imgEditBtn = document.getElementById('img-edit-btn');
  const imgSaveBtn = document.getElementById('img-save-btn');
  const imgCancelBtn = document.getElementById('img-cancel-btn');
  const imgActions = document.getElementById('img-action-buttons');
  const displayName = document.getElementById('display-name');
  const inputs = document.querySelectorAll('.field input');
  const errors = {
    'first-name': document.getElementById('error-first-name'),
    'last-name': document.getElementById('error-last-name'),
    'phone': document.getElementById('error-phone'),
    'passport': document.getElementById('error-passport'),
    'card-number': document.getElementById('error-card-number'),
    'card-expiry': document.getElementById('error-card-expiry'),
  };
  const editBtn = document.getElementById('edit-btn');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  // Default avatar saqlash va tarmoq xatolarida fallback
  defaultAvatar = avatar.src;
  originalAvatar = defaultAvatar;
  avatar.onerror = () => { avatar.src = defaultAvatar; };

  // Foydalanuvchi ma'lumotini yuklash
  async function loadUser() {
    try {
      const res = await fetch(`http://localhost:8000/profile/${userId}`);
      if (!res.ok) throw new Error('Maʼlumot olinmadi');
      const { user } = await res.json();
      originalData = { ...user };

      // Agar backend avatarUrl bermasa yoki bo'sh bo'lsa, defaultAvatar ishlatiladi
      originalAvatar = user.image || defaultAvatar;

      // DOM ga o'rnatish
      avatar.src = originalAvatar;
      displayName.textContent = `${user.first_Name || ''} ${user.last_Name || ''}`;
      document.getElementById('first-name').value = user.first_Name || '';
      document.getElementById('last-name').value = user.last_Name || '';
      document.getElementById('phone').value = user.phoneNumber || '';
      document.getElementById('passport').value = user.passport || '';
      document.getElementById('card-number').value = user.bank_card || '';
      document.getElementById('card-expiry').value = user.expiryDate || '';
    } catch (err) {
      console.error(err);
      showError(err.message);
    }
  }
  loadUser();

  // Rasmni yangilash (upload flow)
  imgEditBtn.addEventListener('click', () => imgInput.click());
  imgInput.addEventListener('change', () => {
    const file = imgInput.files[0];
    if (!file) return;
    avatar.src = URL.createObjectURL(file);
    imgEditBtn.classList.add('hidden');
    imgActions.classList.remove('hidden');
  });
  imgCancelBtn.addEventListener('click', () => {
    avatar.src = originalAvatar;
    imgInput.value = '';
    imgActions.classList.add('hidden');
    imgEditBtn.classList.remove('hidden');
  });
  imgSaveBtn.addEventListener('click', async () => {
    const file = imgInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch(`http://localhost:8000/profile/${userId}/avatar`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Rasm saqlanmadi');
      const data = await res.json();
      // Serverdan kelgan URL bo'sh bo'lsa yoki xato bo'lsa defaultAvatar ishlatiladi
      originalAvatar = data.avatarUrl || defaultAvatar;
      avatar.src = originalAvatar;
      imgActions.classList.add('hidden');
      imgEditBtn.classList.remove('hidden');
      imgInput.value = '';
    } catch (err) {
      console.error(err);
      showError(err.message);
    }
  });

  // Maʼlumotlarni tahrirlash flow
  editBtn.addEventListener('click', () => {
    inputs.forEach(i => i.disabled = false);
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
  });
  cancelBtn.addEventListener('click', () => {
    inputs.forEach(i => {
      i.disabled = true;
      const key = i.id.replace('-', '');
      i.value = originalData[key] || originalData[i.id] || '';
      i.classList.remove('input-error');
      errors[i.id].classList.add('hidden');
    });
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
  });
  saveBtn.addEventListener('click', async () => {
    let valid = true;
    inputs.forEach(i => {
      if (!i.value.trim()) {
        valid = false;
        i.classList.add('input-error');
        errors[i.id].classList.remove('hidden');
      } else {
        i.classList.remove('input-error');
        errors[i.id].classList.add('hidden');
      }
    });
    if (!valid) return;

    const payload = {
      first_Name: document.getElementById('first-name').value.trim(),
      last_Name: document.getElementById('last-name').value.trim(),
      phoneNumber: document.getElementById('phone').value.trim(),
      passport: document.getElementById('passport').value.trim(),
      bank_card: document.getElementById('card-number').value.trim(),
      expiryDate: document.getElementById('card-expiry').value.trim()
    };
    try {
      const res = await fetch(`http://localhost:8000/profile/${userId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Saqlashda xatolik');
      originalData = { ...payload };
      displayName.textContent = `${payload.first_Name} ${payload.last_Name}`;
      inputs.forEach(i => i.disabled = true);
      editBtn.classList.remove('hidden');
      saveBtn.classList.add('hidden');
      cancelBtn.classList.add('hidden');
    } catch (err) {
      console.error(err);
      showError(err.message);
    }
  });

  // Popup close handlers
  document.getElementById('error-close').onclick = closeErrorPopup;
  document.getElementById('popup_button').onclick = closeErrorPopup;
});

// Input formatting
// Telefon
document.getElementById('phone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '');
  if (!v) return this.value = '';
  v = v.startsWith('998') ? v.slice(3) : v;
  let out = '+(998) ';
  out += v.slice(0, 2);
  if (v.length > 2) out += ' ' + v.slice(2, 5);
  if (v.length > 5) out += ' ' + v.slice(5, 7);
  if (v.length > 7) out += ' ' + v.slice(7, 9);
  this.value = out;
});

// Karta raqami
document.getElementById('card-number').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 16);
  this.value = v.replace(/(.{4})/g, '$1 ').trim();
});

// Karta amal qilish muddati
document.getElementById('card-expiry').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  this.value = v;
});

// Passport №
document.getElementById('passport').addEventListener('input', function () {
  let v = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
  v = v.replace(/^([A-Z]{2})(\d{0,7}).*/, '$1$2');
  this.value = v;
});
