document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.getElementById('pay-button');
    const modal = document.getElementById('code-modal');
    const verifyBtn = document.getElementById('verify-code-btn');

    payButton.addEventListener('click', async () => {
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry').value;

        if (!cardNumber || !expiryDate) {
            alert("Barcha maydonlarni to'ldiring!");
            return;
        }

        // Expiry date format va validatsiyasi
        const [monthStr, yearStr] = expiryDate.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt('20' + yearStr, 10); // '25' -> 2025

        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 0-based
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
            const response = await fetch('/seat-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bank_card: cardNumber,
                    expiry_date: expiryDate // bodyga qo‘shildi
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

    verifyBtn.addEventListener('click', () => {
        const code = document.getElementById('verification-code').value;
        if (code.length === 6) {
            alert("Kod qabul qilindi! To‘lov yakunlandi.");
            modal.style.display = 'none';
        } else {
            alert("Iltimos, 6 xonali kod kiriting.");
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');

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
});