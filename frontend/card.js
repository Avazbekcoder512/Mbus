document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.getElementById('pay-button');
    const modal = document.getElementById('code-modal');
    const verifyBtn = document.getElementById('verify-code-btn');
  
    // Button bosilsa
    payButton.addEventListener('click', () => {
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry').value;

        if (!cardNumber || !expiryDate) {
            alert("Barcha maydonlarni to'ldiring!");
            return;
        }

        // Modalni ko'rsatish
        modal.style.display = 'flex';  // Modalni ko'rsatish

        // Bu yerda to'lovni amalga oshirish uchun kerakli kodni qo'shishingiz mumkin
    });

    // Modalni tasdiqlash kodini kiritganda yopish
    verifyBtn.addEventListener('click', () => {
        const code = document.getElementById('verification-code').value;
        if (code.length === 4) {
            alert("Kod qabul qilindi! To‘lov yakunlandi.");
            modal.style.display = 'none';  // Modalni yopish
        } else {
            alert("Iltimos, 4 xonali kod kiriting.");
        }
    });
});
