// selectedPrices global scope'da bo'lishi kerak, chunki boshqa joylarda ham ishlatiladi
const selectedPrices = new Map(); // seatId => { seatNumber, price }
let routeFrom = "";
let routeTo = "";
let departureDate = "";
let departureTime = "";

document.addEventListener("DOMContentLoaded", async () => {
  const preloader = document.getElementById("preloader");
  const userId = localStorage.getItem('userId');

  let userData = {};
  if (userId) {
    try {
      const userRes = await fetch(`http://localhost:8000/profile/${userId}`);
      if (userRes.ok) {
        userData = await userRes.json();
      }
    } catch (err) {
      console.error("Foydalanuvchi ma’lumotini olishda xato:", err);
    }
  }

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
    localStorage.removeItem("token");
  }

  document.getElementById("close-popup-btn").addEventListener("click", () => {
    const popup = document.getElementById("token-expired-popup");
    popup.classList.add("hidden");
    window.location.href = "/";
  });

  const errorPopup = document.getElementById("error-popup");
  const errorMessage = document.getElementById("error-message");
  const closeErrorBtn = document.getElementById("close-error-btn");

  function showErrorPopup(msg) {
    errorMessage.textContent = msg;
    errorPopup.classList.remove("hidden");
  }

  closeErrorBtn.addEventListener("click", () => {
    errorPopup.classList.add("hidden");
    window.location.href = '/';
  });

  try {
    showPreloader();
    const response = await fetch(`http://localhost:8000/trip/${tripId}`, {
      method: "GET"
    });
    const tripData = await response.json();

    if (response.status === 429) {
      showErrorPopup(result.error);
    } else if (response.status === 401) {
      showTokenExpiredPopup(tripData.error);
      return;
    } else if (response.status === 500) {
      window.location.href = '/500';
    }

    routeFrom = tripData.trip.route.from;
    routeTo = tripData.trip.route.to;
    departureDate = tripData.trip.departure_date;
    departureTime = tripData.trip.departure_time;

    function formatDate(dateStr) {
      const parts = dateStr.split("-");
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    const formattedDate = formatDate(departureDate);
    const tripTitleEl = document.getElementById("trip-title");
    if (tripTitleEl) {
      tripTitleEl.innerHTML = `${routeFrom} - ${routeTo} <span class="date">${formattedDate} ${departureTime}</span>`;
    }

    const seats = tripData.trip.seats || [];
    let freeSeats = 0;
    let bookedSeats = 0;

    seats.forEach(seat => {
      if (seat.status === "empty") freeSeats++;
      else if (seat.status === "busy") bookedSeats++;
    });

    document.getElementById("free-seats").textContent = freeSeats;
    document.getElementById("booked-seats").textContent = bookedSeats;

    const seatLayout = [
      [47, 43, 39, 35, 31, 27, 25, 21, 17, 13, 9, 5, 1, "driver"],
      [48, 44, 40, 36, 32, 28, 26, 22, 18, 14, 10, 6, 2],
      [49, "", "", "", "", "", "", "", "", "", "", "", ""],
      [50, 45, 41, 37, 33, 29, "", 23, 19, 15, 11, 7, 3],
      [51, 46, 42, 38, 34, 30, "", 24, 20, 16, 12, 8, 4]
    ];

    const seatingTable = document.getElementById("seating-table");
    seatingTable.innerHTML = "";

    const legendEl = document.getElementById("seat-legend");
    legendEl.innerHTML = "";

    const priceByClass = { vip: 0, premium: 0, economy: 0 };
    seats.forEach(s => {
      const cls = (s.class || "economy").toLowerCase();
      if (!priceByClass[cls] && s.price) priceByClass[cls] = s.price;
    });
    ["vip", "premium", "economy"].forEach(cls => {
      const div = document.createElement("div");
      div.classList.add("legend-item");
      div.innerHTML = `
        <div class="legend-color ${cls}-seat"></div>
        <span>${cls.charAt(0).toUpperCase() + cls.slice(1)} — ${priceByClass[cls]} so'm</span>
      `;
      legendEl.appendChild(div);
    });

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
          const seatObj = seats.find(s => s.seatNumber === value);
          if (!seatObj) return;

          // Har bir o'rindiq uchun unique ID
          td.dataset.id = seatObj._id; // <-- MUHIM O'ZGARISH

          const cls = (seatObj.class || "economy").toLowerCase();
          td.classList.add(`${cls}-seat`);
          td.textContent = value;

          if (seatObj.status === "busy") {
            td.classList.add("occupied");
            const gender = seatObj.passenger_gender;
            let iconHtml = "";
            if (gender === "female") {
              iconHtml = `<img src="../assets/images/female.png" alt="Ayol" class="seat-icon" />`;
            } else if (gender === "male") {
              iconHtml = `<img src="../assets/images/male.png" alt="Erkak" class="seat-icon" />`;
            }
            td.innerHTML = iconHtml;
            td.style.cursor = "not-allowed";
          } else {
            td.addEventListener("click", () => {
              td.classList.toggle("selected");
              const selectedId = td.dataset.id;
              
              if (td.classList.contains("selected")) {
                selectedPrices.set(selectedId, {
                  seatNumber: value,
                  price: seatObj.price || priceByClass[cls] // Klassga qarab narx
                });
              } else {
                selectedPrices.delete(selectedId);
              }
              
              updateTotalPrice();
              showTicketForm();
            });
          }
        }
        tr.appendChild(td);
      });
      seatingTable.appendChild(tr);
    });

  } catch (error) {
    console.error("Ma'lumotlarni yuklashda xatolik:", error);
  } finally {
    hidePreloader();
  }

  function updateTotalPrice() {
    let totalPrice = 0;
    selectedPrices.forEach(seatData => {
      totalPrice += Number(seatData.price);
    });
    localStorage.setItem("totalPrice", totalPrice.toString());
  }

  function formatPhoneNumber(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith("998")) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 5),
      digits.slice(5, 7),
      digits.slice(7, 9)
    ].filter(Boolean);
    return "+998" + (parts.length > 0 ? ` (${parts[0]})` : "") + " " + parts.slice(1).join("-");
  }

  function formatPassportNumber(value) {
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 9);
  }

  function showTicketForm() {
    const formContainer = document.getElementById("ticket-form-container");
    formContainer.innerHTML = "";
    
    if (selectedPrices.size === 0) {
      formContainer.style.display = "none";
      return;
    }
    
    formContainer.style.display = "block";

    selectedPrices.forEach((seatData, seatId) => {
      const form = document.createElement("form");
      form.classList.add("ticket-passenger-form");
      form.innerHTML = `
        <div class="form-header">O‘rindiq raqami: ${seatData.seatNumber}</div>
        <div class="form-row">
          <div class="input-group">
            <label for="fullName_${seatId}">To‘liq ism:</label>
            <input
              type="text"
              id="fullName_${seatId}"
              name="fullName_${seatId}"
              placeholder="To‘liq ism"
              required
              value="${(userData.user?.first_Name || '') + (userData.user?.last_Name ? ' ' + userData.user.last_Name : '')}"
            >
          </div>
          <div class="input-group">
            <label for="gender_${seatId}">Jins:</label>
            <select
              id="gender_${seatId}"
              name="gender_${seatId}"
              required
            >
              <option value="" disabled selected>Jinsni tanlang</option>
              <option value="male" ${userData.user?.gender === 'male' ? 'selected' : ''}>Erkak</option>
              <option value="female" ${userData.user?.gender === 'female' ? 'selected' : ''}>Ayol</option>
            </select>
          </div>
          <div class="input-group">
            <label for="passport_${seatId}">Pasport raqam:</label>
            <input
              type="text"
              id="passport_${seatId}"
              name="passport_${seatId}"
              placeholder="AA1234567"
              required
              value="${userData.user?.passport || ''}"
            >
          </div>
          <div class="input-group">
            <label for="phone_${seatId}">Telefon raqam:</label>
            <input
              type="text"
              id="phone_${seatId}"
              name="phone_${seatId}"
              placeholder="+998 (XX) XXX-XX-XX"
              required
              value="${userData.user?.phoneNumber ? formatPhoneNumber(userData.user.phoneNumber) : ''}"
            >
          </div>
        </div>
      `;
      formContainer.appendChild(form);

      // Telefon raqam formati
      const phoneInput = form.querySelector(`#phone_${seatId}`);
      phoneInput?.addEventListener("input", function(e) {
        const pos = e.target.selectionStart;
        e.target.value = formatPhoneNumber(e.target.value);
        e.target.setSelectionRange(pos, pos);
      });

      // Pasport formati
      const passportInput = form.querySelector(`#passport_${seatId}`);
      passportInput?.addEventListener("input", function(e) {
        const pos = e.target.selectionStart;
        e.target.value = formatPassportNumber(e.target.value);
        e.target.setSelectionRange(pos, pos);
      });
    });

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("form-buttons");
    btnContainer.innerHTML = `
      <button type="button" id="back-btn"><i class="fa-solid fa-arrow-left"></i> Ortga qaytish</button>
      <button type="submit" id="continue-btn">
        <span class="btn-text">Davom etish</span>
        <i class="fa-solid fa-arrow-right"></i>
        <i class="fa-solid fa-spinner-third fa-spin" id="loader" style="display: none;"></i>
      </button>
    `;
    formContainer.appendChild(btnContainer);

    document.getElementById("back-btn").addEventListener("click", () => {
      window.location.href = "/";
      selectedPrices.clear();
      document.querySelectorAll(".seat.selected").forEach(el => el.classList.remove("selected"));
    });

    document.getElementById("continue-btn").addEventListener("click", async (e) => {
      const continueBtn = e.target.closest("#continue-btn");
      const loader = continueBtn.querySelector("#loader");
      const btnText = continueBtn.querySelector(".btn-text");
      
      // Validatsiya
      const forms = document.querySelectorAll(".ticket-passenger-form");
      let isValid = true;
      forms.forEach(form => {
        if (!form.checkValidity()) {
          form.reportValidity();
          isValid = false;
        }
      });
      if (!isValid) return;

      continueBtn.disabled = true;
      loader.style.display = "inline-block";
      btnText.textContent = "Yuborilmoqda";

      const passengers = [];
      selectedPrices.forEach((seatData, seatId) => {
        const form = document.querySelector(`#ticket-form-container form input[id="fullName_${seatId}"]`)?.closest("form");
        if (!form) return;

        const fullName = form.querySelector(`#fullName_${seatId}`)?.value;
        const gender = form.querySelector(`#gender_${seatId}`)?.value;
        const passport = form.querySelector(`#passport_${seatId}`)?.value;
        const phone = form.querySelector(`#phone_${seatId}`)?.value;

        passengers.push({
          seatId,
          seatNumber: seatData.seatNumber,
          fullName,
          gender,
          passport,
          phoneNumber: phone.replace(/\D/g, '')
        });
      });

      try {
        const response = await fetch("http://localhost:8000/ticket-pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passengers,
            from: routeFrom,
            to: routeTo,
            departure_date: departureDate,
            departure_time: departureTime
          })
        });

        const result = await response.json();
        
        if (response.ok && result.order) {
          localStorage.setItem('order', result.order);
          window.location.href = "/card";
        } else if (response.status === 429) {
          showErrorPopup(result.error);
        } else if (response.status === 500) {
          window.location.href = '/500';
        } else {
          alert(result.message || "Xatolik yuz berdi!");
        }
      } catch (err) {
        console.error("Xatolik:", err);
        alert("Server bilan aloqa o‘rnatilmadi");
      } finally {
        continueBtn.disabled = false;
        loader.style.display = "none";
        btnText.textContent = "Davom etish";
      }
    });
  }
});