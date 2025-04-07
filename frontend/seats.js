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
    showPreloader()
    const response = await fetch(`http://localhost:8000/bus/${busId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // const response = await fetch(`https://mbus.onrender.com/bus/${busId}`, {
    //   method: "GET",
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // });
    const busData = await response.json();

    hidePreloader()

    const routeFrom = busData.bus.trip.route.from;
    const routeTo = busData.bus.trip.route.to;
    const routeName = busData.bus.trip.route.name;

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
    let selectedSeats = 0;

    seats.forEach(seat => {
      if (seat.status === "bo'sh") {
        freeSeats++;
      } else if (seat.status === "band") {
        bookedSeats++;
      } else if (seat.status === "selected") {
        selectedSeats++;
      }
    });

    document.getElementById("free-seats").textContent = freeSeats;
    document.getElementById("booked-seats").textContent = bookedSeats;

    const seatsData = busData.bus.seats;
    const occupiedSeats = new Set(
      seatsData.filter(seat => seat.status === "band").map(seat => seat.seetNumber)
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

          const seatObj = seatsData.find(seat => seat.seetNumber === value);
          if (seatObj) {
            td.dataset.id = seatObj._id;
            td.dataset.seetNumber = seatObj.seetNumber;
          }

          if (occupiedSeats.has(value)) {
            td.classList.add("occupied");
          }

          td.addEventListener("click", () => {
            if (!td.classList.contains("occupied")) {
              td.classList.toggle("selected");

              const selectedId = td.dataset.id;
              const selectedSeatNumber = td.dataset.seetNumber;
              const seatObj = seatsData.find(seat => seat._id === selectedId || seat.seetNumber === value);
              const seatPrice = seatObj?.price || 0;

              // Agar seat tanlangan bo'lsa, narxni qo'shish
              if (td.classList.contains("selected")) {
                selectedPrices.set(selectedId, seatPrice);
              } else {
                selectedPrices.delete(selectedId);
              }

              updateTotalPrice(); // Umumiy narxni yangilash
              showTicketForm(); // Ticket formni yangilash
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

  const selectedPrices = new Map(); // seatId => price

  function updateTotalPrice() {
    let total = 0;
    for (let price of selectedPrices.values()) {
      total += Number(price);
    }
  }

  // showTicketForm funksiyasi
  function showTicketForm() {
    const formContainer = document.getElementById("ticket-form-container");

    // Umumiy narxni hisoblash
    let totalPrice = 0;
    selectedPrices.forEach(price => {
      totalPrice += price;
    });

    // Agar hech qanday o'rindiq tanlanmagan bo'lsa, formani yashirish
    if (selectedPrices.size === 0) {
      formContainer.style.display = "none";  // Formani yashirish
      return; // Hech qanday tanlangan o'rindiq yo'q, funksiyani tugatish
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

    document.getElementById("ticket-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const card = data.get("cardNumber");
      const priceInput = data.get("priceInput"); // Foydalanuvchi kiritgan narx

      console.log("Yuborilmoqda:", { card, priceInput });
    });
  }
});
