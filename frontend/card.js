document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.getElementById('pay-button');
    const modal = document.getElementById('code-modal');
    const verifyBtn = document.getElementById('verify-code-btn');
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const token = localStorage.getItem('token')

    const ticketCount = localStorage.getItem('selectedSeatsCount') || 2;
    const ticketPrice = localStorage.getItem('ticketPrice') || 200000;
    const totalPrice = localStorage.getItem('totalPrice');

    document.getElementById('ticket-count').innerHTML = ticketCount;
    document.getElementById('ticket-price').innerHTML = `${Number(ticketPrice).toLocaleString()} so'm`;
    document.getElementById('total-price').innerHTML = `${Number(totalPrice).toLocaleString()} so'm`;

    // Karta raqami formatlash
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = '';
        for (let i = 0; i < value.length; i += 4) {
            formatted += value.substr(i, 4) + ' ';
        }
        e.target.value = formatted.trim();
    });

    // Expiry date formatlash (MM/YY)
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (value.length >= 3) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
    });

    // To‘lov tugmasi bosilganda
    payButton.addEventListener('click', async () => {
        const cardNumber = cardNumberInput.value;
        const expiryDate = expiryInput.value;

        if (!cardNumber || !expiryDate) {
            alert("Barcha maydonlarni to'ldiring!");
            return;
        }

        // Expiry date format va validatsiyasi
        const [monthStr, yearStr] = expiryDate.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt('20' + yearStr, 10); // '25' -> 2025

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        if (
            isNaN(month) || isNaN(year) ||
            month < 1 || month > 12 ||
            year < currentYear ||
            (year === currentYear && month < currentMonth)
        ) {
            alert("Amal qilish muddati noto‘g‘ri. To‘g‘ri formatda kiriting (MM/YY) va amal qiladigan sana bo‘lsin.");
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
                    expiry_date: expiryDate
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
        }
    });

    // Kodni tekshirish tugmasi
    verifyBtn.addEventListener('click', async () => {
        const code = Number(document.getElementById('verification-code').value);
    
        if (!Number.isInteger(code) || String(code).length !== 6) {
            alert("Iltimos, 6 xonali raqamli kod kiriting.");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8000/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
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
        }
    });    

});