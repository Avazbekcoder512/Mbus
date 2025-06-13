// index.js yoki card.js ichida

document.addEventListener("DOMContentLoaded", () => {
  // 1. localStorage'dan qiymatlarni olish
  const ticketCount = parseInt(localStorage.getItem("selectedSeatsCount")) || 0;
  const totalPrice = parseInt(localStorage.getItem("totalPrice")) || 0;
  const order = localStorage.getItem("order");
  const orderIds = JSON.parse(localStorage.getItem("selectedSeatIds") || "[]");

  // 2. API URL
  // const apiUrl = "http://localhost:8000";
  const apiUrl = "https://www.go.limon.uz";

  // 3. DOM elementlarga qiymatlarni joylash
  document.getElementById("ticket-count").innerText = ticketCount;
  document.getElementById("total-price").innerText = totalPrice.toLocaleString() + " so'm";

  // 4. To‘lov tugmalari
  const [clickBtn, paymeBtn] = document.querySelectorAll(".pay-buttons");

  // 5. Click tugmasi hodisasi
  clickBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const payload = { ticketCount, orderIds, order, totalPrice };

    try {
      const res = await fetch(`${apiUrl}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          orderToken: order,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      // Responsdan kelgan URLni o'qish va boshqa sahifaga yo'naltirish
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Redirect URL olinmadi");
      }
    } catch (err) {
      console.error("To‘lovni ro‘yxatga olishda xatolik:", err);
    }
  });

  // 6. Payme tugmasi hodisasi
  paymeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const data = await registerPayment("payme");
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      console.error("Payme to‘lovida xatolik:", err);
    }
  });
});
