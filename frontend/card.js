document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payment-form');
    const modal = document.getElementById('code-modal');
    const verifyBtn = document.getElementById('verify-code-btn');
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const token = localStorage.getItem('token');
    const order = localStorage.getItem('order')

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

        if (!cardNumber || !expiryDate) {
            alert("Barcha maydonlarni to'ldiring!");
            payButton.classList.remove('loading'); // ❌ Loaderni olib tashlash
            return;
        }

        const [monthStr, yearStr] = expiryDate.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt('20' + yearStr, 10);

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        if (
            isNaN(month) || isNaN(year) ||
            month < 1 || month > 12 ||
            year < currentYear ||
            (year === currentYear && month < currentMonth)
        ) {
            alert("Amal qilish muddati noto‘g‘ri.");
            payButton.classList.remove('loading'); // ❌ Loaderni olib tashlash
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/seat-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    bank_card: cardNumber,
                    expiryDate: expiryDate
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "SMS yuborildi!");
                modal.style.display = 'flex';
            } else {
                alert(data.error || "Xatolik yuz berdi!");
            }

        } catch (error) {
            console.error('Xatolik:', error);
            alert("Server bilan bog'lanishda xatolik yuz berdi!");
        } finally {
            payButton.classList.remove('loading'); // ✅ Har holda loaderni olib tashlash
        }
    });


    const loader = verifyBtn.querySelector('.loader');
    const btnText = verifyBtn.querySelector('.btn-text');
    
    verifyBtn.addEventListener('click', async () => {
        const code = Number(document.getElementById('verification-code').value);
    
        if (!Number.isInteger(code) || String(code).length !== 6) {
            alert("Iltimos, 6 xonali raqamli kod kiriting.");
            return;
        }
    
        verifyBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';
    
        try {
            const response = await fetch('http://localhost:8000/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    orderToken: `${order}`
                },
                body: JSON.stringify({ verificationCode: code })
            });
    
            const data = await response.json();
    
            if (data.success) {
                alert("Kod qabul qilindi! To‘lov yakunlandi.");
                modal.style.display = 'none';
            } else {
                alert("Kod noto‘g‘ri.");
            }
        } catch (error) {
            console.error('Xatolik yuz berdi:', error);
            alert("Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.");
        } finally {
            verifyBtn.disabled = false;
            btnText.style.display = 'inline';
            loader.style.display = 'none';
        }
    });
    

});
