// index.js yoki card.js ichida

document.addEventListener("DOMContentLoaded", () => {
  // 1. localStorage'dan qiymatlarni olish
  const ticketCount = parseInt(localStorage.getItem("selectedSeatsCount")) || 0;
  const totalPrice = parseInt(localStorage.getItem("totalPrice")) || 0;
  const ticketPrice = totalPrice / (ticketCount || 1); // yoki localStorage'dan oling
  const order = localStorage.getItem("order");

  // const api_url = "http://localhost:8000"; // to'g'ri yozilishi kerak
  const api_url = "https://www.go.limon.uz"; // to'g'ri yozilishi kerak

  // 2. DOM elementlarga joylash
  document.getElementById("ticket-count").innerText = ticketCount;
  document.getElementById("total-price").innerText =
    totalPrice.toLocaleString() + " so'm";

  // 3. To‘lov uchun zarur parametrlar
  const serviceId = "YOUR_SERVICE_ID"; // o'zgartiring
  const merchantId = "YOUR_MERCHANT_ID"; // o'zgartiring
  const transactionParam = "ORDER_" + Date.now(); // misol uchun unique id
  const returnUrl = encodeURIComponent(
    window.location.origin + "/payment-success"
  );

  // 4. Tugmalarni ajratib olish
  const payButtons = document.querySelectorAll(".pay-buttons");
  const clickBtn = payButtons[0];
  const paymeBtn = payButtons[1];

  // 5. Backend so‘rov yuboruvchi funksiya
  async function registerPayment(provider) {
    const payload = {
      provider,
      ticketCount,
      ticketPrice,
      totalPrice,
      transactionParam,
    };

    try {
      const res = await fetch(`${api_url}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          orderToken: `${order}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(err);
    //   alert("To‘lovni ro‘yxatga olishda xatolik yuz berdi.");
      throw err;
    }
  }

  // 6. “Click” tugmasi hodisasi
  clickBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // try {
    //   // const data = await registerPayment("click");
    //   // Faqat response muvaffaqiyatli bo‘lsa Click.uz ga yo‘naltirish
    //   // const amount = totalPrice;
    //   // const clickUrl =
    //   //   `https://my.click.uz/services/pay?service_id=${serviceId}` +
    //   //   `&merchant_id=${merchantId}` +
    //   //   `&amount=${amount}` +
    //   //   `&transaction_param=${transactionParam}` +
    //   //   `&return_url=${returnUrl}`;
    //   // window.location.href = clickUrl;
    // } catch {
    //   // xato allaqon qayta ishlangan
    // }

    const payload = {
      ticketCount,
      ticketPrice,
      totalPrice,
      transactionParam,
    };


    try {
      const res = await fetch(`${api_url}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          orderToken: `${order}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(err);
    //   alert("To‘lovni ro‘yxatga olishda xatolik yuz berdi.");
      throw err;
    }
  });

  // 7. “Payme” tugmasi hodisasi
  paymeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const data = await registerPayment("payme");
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // alert("To‘lov URL manzili olinganmadi.");
      }
    } catch {
      // xato allaqon qayta ishlangan
    }
  });
});
