const api_url = 'http://localhost:8000'
// const api_url = 'https://www.atr.uz'

// Popup funksiyalari
function showError(message) {
  const popup = document.getElementById('error-popup');
  // 1) success klassini olib tashlaymiz
  popup.classList.remove('success');
  // 2) ikonkani exclamation-ga qaytaramiz
  const iconEl = popup.querySelector('.popup-content i');
  iconEl.className = 'fa-solid fa-triangle-exclamation';
  iconEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--error');
  // 3) sarlavha rangini ham qaytaramiz
  const titleEl = popup.querySelector('h3');
  titleEl.textContent = 'Xatolik';
  titleEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--error');
  // 4) xabar matni
  document.getElementById('error-message').textContent = message;
  delete popup.dataset.reload;
  popup.classList.add('visible');
}

function showSuccess(message) {
  const popup = document.getElementById('error-popup');
  // 1) error klassini olib tashlab, success klassini qo‘shamiz (CSS-da .success ishlaydi)
  popup.classList.remove('error');
  popup.classList.add('success');
  // 2) ikonkani check-ga o‘zgartiramiz
  const iconEl = popup.querySelector('.popup-content i');
  iconEl.className = 'fa-solid fa-circle-check';
  iconEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--success');
  // 3) sarlavha matni va rangini o‘zgartiramiz
  const titleEl = popup.querySelector('h3');
  titleEl.textContent = 'Muvaffaqiyat';
  titleEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--success');
  // 4) xabar
  document.getElementById('error-message').textContent = message;
  popup.dataset.reload = 'true';
  popup.classList.add('visible');
}

function closeErrorPopup() {
  const popup = document.getElementById('error-popup');
  popup.classList.remove('visible');
  if (popup.dataset.reload === 'true') {
    delete popup.dataset.reload;
    location.reload();
  }
}

let originalData = {};
let originalAvatar = '';
let hasCustomImage = false;
const defaultAvatar = '../assets/images/avatar.avif';

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.log('Foydalanuvchi ID topilmadi.');
    return;
  }

  // Elementlar
  const avatar = document.getElementById('avatar');
  const imgInput = document.getElementById('pic-upload');
  const imgEditBtn = document.getElementById('img-edit-btn');
  const imgSaveBtn = document.getElementById('img-save-btn');
  const imgCancelBtn = document.getElementById('img-cancel-btn');
  const imgDeleteExistingBtn = document.getElementById('img-delete-existing-btn');
  const imgActions = document.getElementById('img-action-buttons');
  const displayName = document.getElementById('display-name');
  const inputs = document.querySelectorAll('.field input, .field select');
  const errors = {
    'first-name': document.getElementById('error-first-name'),
    'last-name': document.getElementById('error-last-name'),
    'phone': document.getElementById('error-phone'),
    'passport': document.getElementById('error-passport'),
    'card-number': document.getElementById('error-card-number'),
    'card-expiry': document.getElementById('error-card-expiry'),
    'gender': document.getElementById('error-gender')
  };
  const editBtn = document.getElementById('edit-btn');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  const fieldMap = {
    'first-name': 'first_Name',
    'last-name': 'last_Name',
    'phone': 'phoneNumber',
    'passport': 'passport',
    'card-number': 'bank_card',
    'card-expiry': 'expiryDate',
    'gender': 'gender'
  };

  // Default avatar o'rnatish
  avatar.src = defaultAvatar;
  originalAvatar = defaultAvatar;
  avatar.onerror = () => {
    avatar.onerror = null;
    avatar.src = defaultAvatar;
  };

  // Foydalanuvchi ma'lumotini yuklash
  async function loadUser() {
    try {
      const res = await fetch(`${api_url}/profile/${userId}?lang=uz`);
      if (!res.ok) throw new Error('Maʼlumot olinmadi');
      const { user } = await res.json();
      originalData = { ...user };
      hasCustomImage = Boolean(user.image);
      originalAvatar = user.image || defaultAvatar;

      avatar.src = originalAvatar;
      displayName.textContent = `${user.first_Name || ''} ${user.last_Name || ''}`;
      Object.keys(fieldMap).forEach(id => {
        document.getElementById(id).value = user[fieldMap[id]] || '';
        document.getElementById('gender').value = user.gender || '';
      });

      // Faqat backendda image bo'lsa o'chirish tugmasini ko'rsat
      if (hasCustomImage) {
        imgDeleteExistingBtn.classList.remove('hidden');
      } else {
        imgDeleteExistingBtn.classList.add('hidden');
      }
    } catch (err) {
      console.error(err);
      showError(err.message);
    }
  }
  loadUser();

  // Loader funksiyasi
  function withLoader(button, fn) {
    return async function (...args) {
      const originalHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        await fn.apply(this, args);
      } catch (e) {
        console.error(e);
      } finally {
        button.innerHTML = originalHtml;
        button.disabled = false;
      }
    };
  }

  // Rasmni yangilash
  imgEditBtn.addEventListener('click', () => imgInput.click());

  imgInput.addEventListener('change', () => {
    const file = imgInput.files[0];
    if (!file) return;
    avatar.src = URL.createObjectURL(file);
    imgEditBtn.classList.add('hidden');
    imgActions.classList.remove('hidden');
    imgDeleteExistingBtn.classList.add('hidden');
  });

  // Bekor qilish (rasm uchun)
  imgCancelBtn.addEventListener('click', () => {
    avatar.src = originalAvatar;
    imgInput.value = '';
    imgActions.classList.add('hidden');
    imgEditBtn.classList.remove('hidden');
    if (hasCustomImage) imgDeleteExistingBtn.classList.remove('hidden');
  });

  // Saqlash (rasm uchun)
  imgSaveBtn.addEventListener('click', withLoader(imgSaveBtn, async () => {
    const file = imgInput.files[0];
    if (!file) return showError('Rasm tanlanmadi');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${api_url}/profile/${userId}/avatar?lang=uz`, { method: 'PUT', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Rasm saqlanmadi');
    hasCustomImage = Boolean(data.avatarUrl);
    originalAvatar = data.avatarUrl || defaultAvatar;
    avatar.src = originalAvatar;
    imgActions.classList.add('hidden');
    imgEditBtn.classList.remove('hidden');
    imgInput.value = '';
    if (hasCustomImage) imgDeleteExistingBtn.classList.remove('hidden');
    showSuccess(data.message || 'Rasm muvaffaqiyatli saqlandi');
  }));

  // Rasmni o‘chirish (backenddan)
  imgDeleteExistingBtn.addEventListener('click', withLoader(imgDeleteExistingBtn, async () => {
    const res = await fetch(`${api_url}/profile/${userId}/avatar?lang=uz`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Rasm o‘chirilmadi');
    hasCustomImage = false;
    originalAvatar = defaultAvatar;
    avatar.src = defaultAvatar;
    imgDeleteExistingBtn.classList.add('hidden');
    showSuccess(data.message || 'Rasm muvaffaqiyatli o‘chirildi');
  }));

  // Ma’lumotlarni tahrirlash
  editBtn.addEventListener('click', () => {
    inputs.forEach(i => i.disabled = false);
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
  });

  // Bekor qilish (ma’lumotlar)
  cancelBtn.addEventListener('click', () => {
    inputs.forEach(i => {
      i.disabled = true;
      i.value = originalData[fieldMap[i.id]] || '';
      i.classList.remove('input-error');
      errors[i.id].classList.add('hidden');
    });
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
  });

  // Saqlash (ma’lumotlar)
  saveBtn.addEventListener('click', withLoader(saveBtn, async () => {
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
      expiryDate: document.getElementById('card-expiry').value.trim(),
      gender: document.getElementById('gender').value      // ← include gender
    };
    const res = await fetch(`${api_url}/profile/${userId}/update?lang=uz`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    if (!res.ok || (res.status !== 200 && res.status !== 201)) {
      showError(data.error|| data.message);
    } else {
      originalData = { ...payload };
      displayName.textContent = `${payload.first_Name} ${payload.last_Name}`;
      inputs.forEach(i => i.disabled = true);
      editBtn.classList.remove('hidden');
      saveBtn.classList.add('hidden');
      cancelBtn.classList.add('hidden');
      showSuccess(data.message || 'Ma\'lumotlar muvaffaqiyatli saqlandi');
    }

  }));

  // Popup close handlers
  document.getElementById('error-close').onclick = closeErrorPopup;
  document.getElementById('popup_button').onclick = closeErrorPopup;
});

// Input formatting (telefon, karta, passport)
document.getElementById('phone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, ''); if (!v) return this.value = '';
  v = v.startsWith('998') ? v.slice(3) : v;
  let out = '+(998) ' + v.slice(0, 2);
  if (v.length > 2) out += ' ' + v.slice(2, 5);
  if (v.length > 5) out += ' ' + v.slice(5, 7);
  if (v.length > 7) out += ' ' + v.slice(7, 9);
  this.value = out;
});

document.getElementById('card-number').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 16);
  this.value = v.replace(/(.{4})/g, '$1 ').trim();
});

document.getElementById('card-expiry').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  this.value = v;
});

document.getElementById('passport').addEventListener('input', function () {
  let v = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
  v = v.replace(/^([A-Z]{2})(\d{0,7}).*/, '$1$2');
  this.value = v;
});
