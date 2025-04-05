document.addEventListener("DOMContentLoaded", async () => {
  const busId = localStorage.getItem("selectedBusId");
  if (!busId) {
    console.error("Avtobus ID topilmadi!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/bus/${busId}`);
    const busData = await response.json();
    console.log("Avtobus ma'lumotlari:", busData);

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
