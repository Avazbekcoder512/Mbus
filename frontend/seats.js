// selectedPrices global scope'da bo'lishi kerak, chunki boshqa joylarda ham ishlatiladi
const selectedPrices = new Map(); // seatId => price
let routeFrom = "";
let routeTo = "";
let departureDate = "";
let departureTime = "";
let price = "";

document.addEventListener("DOMContentLoaded", async () => {
  const preloader = document.getElementById("preloader");
  const token = localStorage.getItem('token');

  function showPreloader() {
    if (preloader) preloader.classList.remove("hidden");
  }

  function hidePreloader() {
    if (preloader) preloader.classList.add("hidden");
  }

  const tripId = localStorage.getItem("selectedTripId");
  if (!tripId) {
    console.error("Reys ID topilmadi!");
    return;
  }

  function showTokenExpiredPopup(message) {
    const popup = document.getElementById("token-expired-popup");
    const messageEl = popup.querySelector("p");
    messageEl.textContent = message;
    popup.classList.remove("hidden");
    localStorage.removeItem('token');
  }

  document.getElementById("close-popup-btn").addEventListener("click", () => {
    const popup = document.getElementById("token-expired-popup");
    popup.classList.add("hidden");
  });


  try {
    showPreloader();
    const response = await fetch(`http://localhost:8000/trip/${tripId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const tripData = await response.json();

    if (response.status === 401) {
      const errorMessage = tripData.error
      showTokenExpiredPopup(errorMessage);
      return;
    }

    hidePreloader();

    routeFrom = tripData.trip.route.from;
    routeTo = tripData.trip.route.to;
    departureDate = tripData.trip.departure_date;
    departureTime = tripData.trip.departure_time;
    price = tripData.trip.ticket_price;

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

    const seats = tripData.trip.seats || [];
    let freeSeats = 0;
    let bookedSeats = 0;

    seats.forEach(seat => {
      if (seat.status === "bo'sh") freeSeats++;
      else if (seat.status === "band") bookedSeats++;
    });

    document.getElementById("free-seats").textContent = freeSeats;
    document.getElementById("booked-seats").textContent = bookedSeats;

    const seatsData = tripData.trip.seats;
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
              const seatNumber = seatObj ? seatObj.seatNumber : value;
              // const seatPrice = seatObj?.price || 0;

              if (td.classList.contains("selected")) {
                selectedPrices.set(selectedId, seatNumber);
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
    formContainer.innerHTML = ""; // oldingi formalarni tozalaymiz

    if (selectedPrices.size === 0) {
      formContainer.style.display = "none";
      return;
    }

    formContainer.style.display = "block";

    selectedPrices.forEach((seatNumber, seatId) => {
      const form = document.createElement("form");
      form.classList.add("ticket-passenger-form");
      form.innerHTML = `
        <div class="form-header">O‘rindiq raqami: ${seatNumber}</div>
        <div class="form-row">
          <div class="input-group">
            <label for="fullName_${seatNumber}">To‘liq ism:</label>
            <input type="text" id="fullName_${seatId}" name="fullName_${seatId}" placeholder="To‘liq ism" required>
          </div>
          <div class="input-group">
            <label for="birthDate_${seatId}">Tug‘ilgan sana:</label>
            <input type="date" id="birthDate_${seatId}" name="birthDate_${seatId}" required>
          </div>
          <div class="input-group">
            <label for="passport_${seatId}">Pasport raqam:</label>
            <input type="text" id="passport_${seatId}" name="passport_${seatId}" placeholder="Pasport raqam" required>
          </div>
          <div class="input-group">
            <label for="phone_${seatId}">Telefon raqam:</label>
            <input type="text" id="phone_${seatId}" name="phone_${seatId}" placeholder="Telefon raqam" required>
          </div>
        </div>
      `;
      formContainer.appendChild(form);
    });

    // Pastki tugmalar
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("form-buttons");
    btnContainer.innerHTML = `
      <button type="button" id="back-btn"><i class="fa-solid fa-arrow-left"></i> Ortga qaytish</button>
      <button type="submit" id="continue-btn">Davom etish  <i class="fa-solid fa-arrow-right"></i></button>
    `;
    formContainer.appendChild(btnContainer);

    // Tugmalarga event qo‘shish
    document.getElementById("back-btn").addEventListener("click", () => {
      window.location = 'index.html'
      selectedPrices.clear();
      document.querySelectorAll(".seat.selected").forEach(el => el.classList.remove("selected"));
    });

    document.getElementById("continue-btn").addEventListener("click", async () => {
      // Har bir "ticket-passenger-form" ni tanlab olamiz
      const forms = document.querySelectorAll(".ticket-passenger-form");
      let passengers = [];

      forms.forEach(form => {
        const formData = new FormData(form);
        // Input elementlar id'si formatida: fullName_{seatId}
        // Birinchi input elementidan seatId ni aniqlaymiz:
        const fullNameInput = form.querySelector('input[id^="fullName_"]');
        if (!fullNameInput) return; // xavfsizlik uchun

        const seatId = fullNameInput.id.split("_")[1];
        const seatNumber = form.querySelector('.form-header')?.textContent.replace("O‘rindiq raqami: ", "").trim();
        const fullName = formData.get(`fullName_${seatId}`);
        const birthDate = formData.get(`birthDate_${seatId}`);
        const passport = formData.get(`passport_${seatId}`);
        const phone = formData.get(`phone_${seatId}`);

        passengers.push({ seatId, seatNumber, fullName, birthDate, passport, phone });
      });

      // Agar hech qanday forma tanlanmagan bo'lsa, form ko‘rsatilmaydi.
      if (passengers.length === 0) {
        alert("Iltimos, avval o‘rindiq tanlang!");
        return;
      }

      // Serverga yuboriladigan umumiy payload
      const payload = {
        passengers: passengers,
        from: routeFrom,
        to: routeTo,
        departure_date: departureDate,
        departure_time: departureTime
      };

      console.log(payload);
      

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/ticket-pending', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (response.ok) {
          // Ma'lumotlar muvaffaqiyatli yuborilganda, boshqa sahifaga yo'naltirish
          window.location.href = 'card.html';
        } else {
          alert(result.message || 'Xatolik yuz berdi!');
        }
      } catch (err) {
        console.error('Xatolik:', err);
        alert('Server bilan aloqa o‘rnatilmadi');
      }
    });
  }
});