// selectedPrices global scope'da bo'lishi kerak, chunki boshqa joylarda ham ishlatiladi
const selectedPrices = new Map(); // seatId => price

document.addEventListener("DOMContentLoaded", async () => {
  const preloader = document.getElementById("preloader");
  const token = localStorage.getItem('token');

  function showPreloader() {
    if (preloader) preloader.classList.remove("hidden");
  }

  function hidePreloader() {
    if (preloader) preloader.classList.add("hidden");
  }

  const busId = localStorage.getItem("selectedBusId");
  if (!busId) {
    console.error("Avtobus ID topilmadi!");
    return;
  }

  try {
    showPreloader();
    const response = await fetch(`http://localhost:8000/bus/${busId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const busData = await response.json();
    hidePreloader();

    const routeFrom = busData.bus.trip.route.from;
    const routeTo = busData.bus.trip.route.to;
    const departureDate = busData.bus.trip.departure_date;
    const departureTime = busData.bus.trip.departure_time;
    const price = busData.bus.trip.ticket_price;

    function formatDate(dateStr) {
      const parts = dateStr.split("-");
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    const formattedDate = formatDate(departureDate);
    const tripTitleEl = document.getElementById("trip-title");
    if (tripTitleEl) {
      tripTitleEl.innerHTML = `${routeFrom} - ${routeTo} <span class="date">${formattedDate} ${departureTime}</span>`;
    }

    const tripPriceEl = document.getElementById("ticket-price");
    if (tripPriceEl) {
      tripPriceEl.innerHTML = `<span class="price">Chipta narxi: ${price} so'm</span>`;
    }

    const seats = busData.bus.seats || [];
    let freeSeats = 0;
    let bookedSeats = 0;

    seats.forEach(seat => {
      if (seat.status === "bo'sh") freeSeats++;
      else if (seat.status === "band") bookedSeats++;
    });

    document.getElementById("free-seats").textContent = freeSeats;
    document.getElementById("booked-seats").textContent = bookedSeats;

    const seatsData = busData.bus.seats;
    const occupiedSeats = new Set(
      seatsData.filter(seat => seat.status === "band").map(seat => seat.seatNumber)
    );

    const seatLayout = [
      [47, 43, 39, 35, 31, 27, 25, 21, 17, 13, 9, 5, 1, "driver"],
      [48, 44, 40, 36, 32, 28, 26, 22, 18, 14, 10, 6, 2],
      [49, "", "", "", "", "", "", "", "", "", "", "", ""],
      [50, 45, 41, 37, 33, 29, "", 23, 19, 15, 11, 7, 3],
      [51, 46, 42, 38, 34, 30, "", 24, 20, 16, 12, 8, 4]
    ];

    const seatingTable = document.getElementById("seating-table");
    seatingTable.innerHTML = "";

    seatLayout.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(value => {
        const td = document.createElement("td");

        if (value === "driver") {
          td.classList.add("driver");
          td.innerHTML = `<i class="fa-solid fa-steering-wheel"></i>`;
        } else if (value === "") {
          td.classList.add("empty");
        } else {
          td.classList.add("seat");
          td.textContent = value;

          const seatObj = seatsData.find(seat => seat.seatNumber === value);
          if (seatObj) {
            td.dataset.id = seatObj._id;
            td.dataset.seatNumber = seatObj.seatNumber;
          }

          if (occupiedSeats.has(value)) {
            td.classList.add("occupied");
          }

          td.addEventListener("click", () => {
            if (!td.classList.contains("occupied")) {
              td.classList.toggle("selected");

              const selectedId = td.dataset.id;
              const seatObj = seatsData.find(seat => seat._id === selectedId || seat.seatNumber == value);
              const seatPrice = seatObj?.price || 0;

              if (td.classList.contains("selected")) {
                selectedPrices.set(selectedId, seatPrice);
              } else {
                selectedPrices.delete(selectedId);
              }

              updateTotalPrice();
              showTicketForm();
            }
          });
        }

        tr.appendChild(td);
      });
      seatingTable.appendChild(tr);
    });

  } catch (error) {
    console.error("Ma'lumotlarni yuklashda xatolik:", error);
  }

  // umumiy narxni hisoblaydigan funksiya
  function updateTotalPrice() {
    let total = 0;
    for (let price of selectedPrices.values()) {
      total += Number(price);
    }
  }

  function showTicketForm() {
    const formContainer = document.getElementById("ticket-form-container");
    let totalPrice = 0;
    selectedPrices.forEach(price => totalPrice += price);

    if (selectedPrices.size === 0) {
      formContainer.style.display = "none";
      return;
    }

    formContainer.innerHTML = `
      <form id="ticket-form">
        <h3>Chipta narxi: ${totalPrice} so'm</h3>
        <input type="text" name="priceInput" placeholder="Chipta narxini kiriting" required>
        <input type="text" name="cardNumber" placeholder="Karta raqami" required>
        <button type="submit">To'lash</button>
      </form>
    `;

    formContainer.style.display = "block";

    // 🎯 FORMGA listener YANGILAB QO'YILDI:
    document.getElementById("ticket-form").addEventListener("submit", submitTicketForm);
  }
});

// FORMNI YUBORISH FUNKSIYASI
async function submitTicketForm(e) {
  e.preventDefault();
  const data = new FormData(e.target);
  const card = data.get("cardNumber");
  const priceInput = data.get("priceInput");

  const selectedSeatIds = Array.from(selectedPrices.keys());

  const payload = {
    seats: selectedSeatIds,
    cardNumber: card,
    totalPrice: priceInput,
  };

  try {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:8000/tickets/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      showSMSVerificationForm(result.ticketId);
    } else {
      alert(result.message || 'Xatolik yuz berdi!');
    }

  } catch (err) {
    console.error('Xatolik:', err);
    alert('Server bilan aloqa o‘rnatilmadi');
  }
}

function showSMSVerificationForm(ticketId) {
  const formContainer = document.getElementById("ticket-form-container");

  formContainer.innerHTML = `
    <form id="sms-verification-form">
      <h3>SMS orqali yuborilgan kodni kiriting:</h3>
      <input type="text" name="smsCode" placeholder="SMS kod" required>
      <button type="submit">Tasdiqlash</button>
    </form>
  `;

  document.getElementById("sms-verification-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const smsCode = data.get("smsCode");

    try {
      const token = localStorage.getItem('token');

      const verifyResponse = await fetch(`http://localhost:8000/tickets/verify/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: smsCode })
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResponse.ok) {
        alert("Chipta muvaffaqiyatli tasdiqlandi!");
        window.location.href = '/my-tickets.html';
      } else {
        alert(verifyResult.message || "Kod noto‘g‘ri yoki eskirgan.");
      }
    } catch (err) {
      console.error('Tasdiqlash xatoligi:', err);
      alert("Server bilan aloqa o‘rnatilmadi");
    }
  });
}
