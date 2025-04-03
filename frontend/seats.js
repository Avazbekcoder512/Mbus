document.addEventListener("DOMContentLoaded", async () => {
    // Bunda busId localStorage'dan olinmoqda:
    const busId = localStorage.getItem("selectedBusId"); // Tanlangan avtobus ID'si
  
    if (!busId) {
      console.error("Avtobus ID topilmadi!");
      return;
    }
  
    try {
      // Backenddan ma'lumot olish
      const response = await fetch(`http://localhost:8000/bus/${busId}`);
      const busData = await response.json();
  
      console.log("Avtobus ma'lumotlari:", busData);
  
      // O‘rinlar haqida ma'lumot
      const seats = busData.bus.seats; 
      // Band o‘rindiqlar ro‘yxati (Set qilib oldik)
      const occupiedSeats = new Set(
        seats
          .filter(seat => seat.status === "band")
          .map(seat => seat.seetNumber) // e'tibor bering: real property 'seetNumber' yoki 'seatNumber' bo'lishi mumkin
      );
  
      // HTML konteyner
      const seatsContainer = document.querySelector(".seats-grid");
      seatsContainer.innerHTML = ""; // Tozalash
  
      /*
        Rasmga yaqin tartibdagi massiv:
        - "" => bo‘sh joy (yo‘lak)  
        - "driver" => haydovchi joyi
        - Raqam => o‘rindiq
      */
      const seatLayout = [
        // 1-qator
        [49, 45, 41, 37, 33, 29, 25, 21, 17, 13, 9, 5, 1, "", "", "driver"],
        // 2-qator
        [50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2, "", "", ""],
        // 3-qator
        [51, "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        // 4-qator
        [48, 44, 40, 36, 32, 28, "", "", "", "", 24, 20, 16, 12, 8, 3],
        // 5-qator
        [47, 43, 39, 35, 31, 27, "", "", "", "", 23, 19, 15, 11, 7, 4],
      ];
  
      // seatLayout bo‘ylab yurib, har bir katakka tegishli element yaratish
      seatLayout.forEach(row => {
        row.forEach(value => {
          const seatDiv = document.createElement("div");
  
          // 1) Agar 'driver' bo'lsa
          if (value === "driver") {
            seatDiv.classList.add("driver");
            // Masalan, matn yoki ikonka
            seatDiv.innerHTML = `<i class="fa-solid fa-steering-wheel"></i>`;
          }
          // 2) Agar bo'sh string ("") bo'lsa
          else if (value === "") {
            seatDiv.classList.add("empty");
          }
          // 3) Aks holda demak bu - seat raqami
          else {
            seatDiv.classList.add("seat");
  
            // Band o'rindiqmi yoki yo'qmi?
            if (occupiedSeats.has(value)) {
              seatDiv.classList.add("occupied");
            }
  
            // Raqamni ko'rsatish
            seatDiv.textContent = value;
  
            // Bosilganda tanlash funksiyasi
            seatDiv.addEventListener("click", () => {
              // Band bo'lmagan bo'lsa, tanlanadigan / bekor qilinadigan qilamiz
              if (!seatDiv.classList.contains("occupied")) {
                seatDiv.classList.toggle("selected");
              }
            });
          }
  
          seatsContainer.appendChild(seatDiv);
        });
      });
  
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    }
  });
  