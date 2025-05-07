function showPopup(type, message, errorCode) {
    const popupContainer = document.getElementById("app-popup-container");
    popupContainer.innerHTML = ''; // Avvalgi popupni tozalash

    const popup = document.createElement("div");
    const popupClass = type === "success" ? "app-popup-success" : "app-popup-error";

    // Data atributlarini qo'shamiz
    popup.setAttribute("data-popup-type", type);
    if (errorCode) {
        popup.setAttribute("data-error-code", errorCode);
    }

    popup.className = `app-popup ${popupClass}`;
    // Popup tarkibini ikonka, xabar va tugma qilib bo‘lamiz, 
    // tugma va ikonka uchun alohida klasslar qo'shiladi.
    popup.innerHTML = `
        <div class="popup-icon">
            ${type === "success" ? `<i class="fa-solid fa-circle-check success-icon"></i>` : `<i class="fa-solid fa-circle-xmark error-icon"></i>`}
        </div>
        <div class="popup-message">${message}</div>
        <button class="app-popup-btn ${type === "success" ? 'success-btn' : 'error-btn'}" onclick="closeAppPopup()">Yopish</button>
    `;

    popupContainer.appendChild(popup);
}

function closeAppPopup() {
    const popup = document.querySelector("#app-popup-container .app-popup");
    if (popup) {
        const popupType = popup.getAttribute("data-popup-type");
        const errorCode = popup.getAttribute("data-error-code");

        if (popupType === "success") {
            // Success bo'lsa sahifani yangilaydi
            location.reload();
        } else if (popupType === "error" && errorCode === "401") {
            // 401 xatolikda login sahifaga yo'naltiradi
            window.location.href = "login.html";
        } else {
            // Boshqa xatoliklarda faqat popupni yopadi
            document.getElementById("app-popup-container").innerHTML = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payment-form');
    const modal = document.getElementById('code-modal');
    const verifyBtn = document.getElementById('verify-code-btn');
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const order = localStorage.getItem('order');

    // Token yoki order mavjud bo'lmasa index.htmlga yo'naltirish
    // if (!order) {
    //     window.location.href = "";
    //     return;
    // }

    const ticketCount = localStorage.getItem('selectedSeatsCount') || 2;
    const ticketPrice = localStorage.getItem('ticketPrice') || 200000;
    const totalPrice = localStorage.getItem('totalPrice') || ticketCount * ticketPrice;

    document.getElementById('ticket-count').innerText = ticketCount;
    document.getElementById('ticket-price').innerText = `${Number(ticketPrice).toLocaleString()} so'm`;
    document.getElementById('total-price').innerText = `${Number(totalPrice).toLocaleString()} so'm`;

    // Formatlash: Karta raqami
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = '';
        for (let i = 0; i < value.length; i += 4) {
            formatted += value.substr(i, 4) + ' ';
        }
        e.target.value = formatted.trim();
    });

    // Formatlash: Amal muddati
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (value.length >= 3) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
    });

    // ✅ Form yuborilganda
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cardNumber = cardNumberInput.value;
        const expiryDate = expiryInput.value;

        const payButton = document.getElementById('pay-button');
        payButton.classList.add('loading'); // ✅ Loader chiqadi

        // Agar maydonlar bo'sh bo'lsa, alert o'rniga popup ko'rsatamiz
        if (!cardNumber || !expiryDate) {
            showPopup('error', "Barcha maydonlarni to'ldiring!");
            payButton.classList.remove('loading'); // ❌ Loaderni olib tashlash
            return;
        }

        const [monthStr, yearStr] = expiryDate.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt('20' + yearStr, 10);

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Amal qilish muddati noto'g'ri bo'lsa popup ko'rsatamiz
        if (
            isNaN(month) || isNaN(year) ||
            month < 1 || month > 12 ||
            year < currentYear ||
            (year === currentYear && month < currentMonth)
        ) {
            showPopup('error', "Amal qilish muddati noto‘g‘ri.");
            payButton.classList.remove('loading'); // ❌ Loaderni olib tashlash
            return;
        }

        try {
            // const response = await fetch('https://mbus.onrender.com/seat-booking', {
            const response = await fetch('http://localhost:8000/seat-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bank_card: cardNumber,
                    expiryDate: expiryDate
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Muvaffaqiyatli javobda popup va SMS yuborilgan xabarini ko'rsatamiz
                showPopup('success', data.message || "SMS yuborildi!");
                // SMS kodini kiritish modalini ochamiz
                modal.style.display = 'flex';

            } else if (response.status === 429) {
                window.location.href = '/'
            } else if (response.status === 500) {
                window.location.href = '/500'
            } else {
                // Xatolik yuz berganda, error popup ko'rsatamiz
                showPopup('error', data.error || "Xatolik yuz berdi!");
            }



        } catch (error) {
            console.error('Xatolik:', error);
            showPopup('error', "Server bilan bog'lanishda xatolik yuz berdi!");
        } finally {
            payButton.classList.remove('loading'); // ✅ Har holda loaderni olib tashlash
        }
    });

    const loader = verifyBtn.querySelector('.loader');
    const btnText = verifyBtn.querySelector('.btn-text');

    verifyBtn.addEventListener('click', async () => {
        const code = Number(document.getElementById('verification-code').value);

        // Agar kod 6 xonali bo'lmasa popup orqali xabar beramiz
        if (!Number.isInteger(code) || String(code).length !== 6) {
            showPopup('error', "Iltimos, 6 xonali raqamli kod kiriting.");
            return;
        }

        verifyBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';

        try {
            // const response = await fetch('https://mbus.onrender.com/confirm', {
            const response = await fetch('http://localhost:8000/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    orderToken: `${order}`
                },
                body: JSON.stringify({ verificationCode: code })
            });

            const data = await response.json();

            if (response.ok) {
                showPopup('success', "Kod qabul qilindi! To‘lov yakunlandi.");
                modal.style.display = 'none';
            } else if (response.status === 429) {
                window.location.href = '/'
            } else if (response.status === 500) {
                window.location.href = '/500'
            } else {
                showPopup('error', "Kod  :).");
            }
        } catch (error) {
            console.error('Xatolik yuz berdi:', error);
            showPopup('error', "Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.");
        } finally {
            verifyBtn.disabled = false;
            btnText.style.display = 'inline';
            loader.style.display = 'none';
        }
    });
});
