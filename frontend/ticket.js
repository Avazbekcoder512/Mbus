function showPopup(type, message, errorCode) {
    const popupContainer = document.getElementById("app-popup-container");
    popupContainer.innerHTML = ''; // Avvalgi popupni tozalash

    const popup = document.createElement("div");
    const popupClass = type === "success" ? "app-popup-success" : "app-popup-error";

    // Data atributlarini qo'shamiz
    popup.setAttribute("data-popup-type", type);
    if (errorCode) {
        popup.setAttribute("data-error-code", errorCode);
    }

    popup.className = `app-popup ${popupClass}`;
    // Popup tarkibini ikonka, xabar va tugma qilib bo‘lamiz, 
    // tugma va ikonka uchun alohida klasslar qo'shiladi.
    popup.innerHTML = `
        <div class="popup-icon">
            ${type === "success" ? `<i class="fa-solid fa-circle-check success-icon"></i>` : `<i class="fa-solid fa-circle-xmark error-icon"></i>`}
        </div>
        <div class="popup-message">${message}</div>
        <button class="app-popup-btn ${type === "success" ? 'success-btn' : 'error-btn'}" onclick="closeAppPopup()">Yopish</button>
    `;

    popupContainer.appendChild(popup);
}

function closeAppPopup() {
    const popup = document.querySelector("#app-popup-container .app-popup");
    if (popup) {
        const popupType = popup.getAttribute("data-popup-type");
        const errorCode = popup.getAttribute("data-error-code");

        if (popupType === "success") {
            // Success bo'lsa sahifani yangilaydi
            location.reload();
        } else if (popupType === "error" && errorCode === "401") {
            // 401 xatolikda login sahifaga yo'naltiradi
            window.location.href = "login.html";
        } else {
            // Boshqa xatoliklarda faqat popupni yopadi
            document.getElementById("app-popup-container").innerHTML = '';
        }
    }
}



document.addEventListener("DOMContentLoaded", async () => {
    const preloader = document.getElementById("preloader");

    function showPreloader() {
        if (preloader) preloader.classList.remove("hidden");
    }

    function hidePreloader() {
        if (preloader) preloader.classList.add("hidden");
    }

    try {
        const token = localStorage.getItem("token");

        showPreloader()
        const response = await fetch("http://localhost:8000/tickets", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 500) {
                window.location.href = '500.html'
            }
            if (response.status === 401) {
                showPopup("error", data.error || "Xatolik yuz berdi!", 401);
            } else {
                showPopup("error", data.error || "Xatolik yuz berdi!");
            }
            return;
        }

        hidePreloader()

        const container = document.getElementById("ticket-container");

        // Agar ticketlar ro'yxati bo'sh bo'lsa
        if (!data.tickets || data.tickets.length === 0) {
            container.innerHTML = "<p class='no-ticket-message'>Sizda chipta mavjud emas!</p>";
        } else {
            const oneDayInMs = 86400000; // 1 kun = 86400000 ms

            data.tickets.forEach(ticket => {
                const ticketId = ticket._id;
                const departureDate = ticket.departure_date || "";
                const departureTime = ticket.departure_time || "";
                const ticketDateTime = new Date(`${departureDate} ${departureTime}`);
                const now = new Date();
                // Chipta muddati chipta vaqtiga 1 kun qo'shilgandan keyin o'tgan bo'lsa expired deb hisoblanadi
                const isExpired = (ticketDateTime.getTime() + oneDayInMs) < now.getTime();

                // Agar chipta muddati o'tgan bo'lsa, faqat o'chirish tugmasi ko'rsatiladi,
                // aks holda, ham yuklab olish, ham o'chirish tugmalari ko'rsatiladi.
                const downloadButtonHTML = isExpired
                    ? ""
                    : `<button class="download-btn" onclick="downloadTicket('${ticketId}')">Yuklab olish</button>`;

                // deleteTicket funksiyasiga chipta muddati haqida ma'lumot (isExpired) uzatamiz.
                const deleteButtonHTML = `<button class="delete-btn" onclick="deleteTicket('${ticketId}', ${isExpired})">O'chirish</button>`;

                // Ticket HTML blokiga noyob id qo'shamiz
                const ticketHTML = `
                <div id="ticket-${ticketId}" class="ticket ${isExpired ? "expired" : ""}">
                    <div class="ticket-left">
                        <h1>Avtobus Chiptasi</h1>
                        <p>Avtobus raqami: ${ticket.bus_number || "Noma'lum"}</p>
                    </div>
                    <img src='./assets/images/expired.png' alt='expired'/>
                    <div class="ticket-right">
                        <div class="ticket-section">
                            <div class="item">
                                <div class="label">Ism:</div>
                                <div class="value">${ticket.passenger || "Noma'lum"}</div>
                            </div>
                            <div class="item">
                                <div class="label">Tug‘ilgan sana:</div>
                                <div class="value">${ticket.birthday || "Noma'lum"}</div>
                            </div>
                            <div class="item">
                                <div class="label">Pasport raqami:</div>
                                <div class="value">${ticket.passport || "Noma'lum"}</div>
                            </div>
                            <div class="item">
                                <div class="label">Telefon raqami:</div>
                                <div class="value">${ticket.phoneNumber || "Noma'lum"}</div>
                            </div>
                            <div class="item">
                                <div class="label">Qayerdan:</div>
                                <div class="value">${ticket.from || "Noma'lum"}</div>
                            </div>
                            <div class="item">
                                <div class="label">O‘rindiq raqami:</div>
                                <div class="value">${ticket.seat_number || "Noma'lum"}</div>
                            </div>
                            <div class="item">
                                <div class="label">Qayerga:</div>
                                <div class="value">${ticket.to || "Noma'lum"}</div>
                            </div>
                        </div>
                        <div class="ticket-footer">
                            <div class="date-time">
                                <div>Sana: ${departureDate || '---'}</div>
                                <div>Vaqt: ${departureTime || '---'}</div>
                            </div>
                            <div class="price">${ticket.price || '0'} so'm</div>
                        </div>
                        <div class="ticket-actions">
                            ${downloadButtonHTML}
                            ${deleteButtonHTML}
                        </div>
                    </div>
                </div>
                `;
                container.innerHTML += ticketHTML;
            });
        }
    } catch (error) {
        console.error("Xatolik:", error.message);
        showPopup("error", error.message);
    }
});

// Yuklab olish funksiyasi (backendga so'rov yuborish bilan)
async function downloadTicket(ticketId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token topilmadi. Iltimos, qayta kiring.");
            return;
        }

        // PDF faylni yuklab olish uchun backendga so'rov
        const response = await fetch(`http://localhost:8000/ticket/${ticketId}/download`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 500) {
                window.location.href = '500.html'
            }
            if (response.status === 401) {
                showPopup("error", errorData.error || "Yuklab olishda xatolik!", 401);
            } else {
                showPopup("error", errorData.error || "Yuklab olishda xatolik!");
            }
            return;
        }

        // Blob ma'lumotni qayta ishlash
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Yuklab olishni boshlash
        const a = document.createElement("a");
        a.href = url;
        a.download = `chipta-${ticketId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Xatolik:", error.message);
        showPopup("error", error.message);
    }
}

// O'chirish funksiyasi (backendga so'rov yuborish bilan)
async function deleteTicket(ticketId, isExpired) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token topilmadi. Iltimos, qayta kiring.");
            return;
        }

        // Agar chipta muddati o'tgan bo'lsa darhol o'chirish
        if (isExpired) {
            await performDelete(ticketId, token);
            showPopup("success", "Chipta muvaffaqiyatli o'chirildi!");
        } else {
            showConfirmationModal(ticketId, token);
        }

    } catch (error) {
        console.error("Xatolik:", error.message);
        showPopup("error", error.message);
    }
}

// Backendga DELETE so'rovini yuboruvchi yordamchi funksiya
async function performDelete(ticketId, token) {
    const response = await fetch(`http://localhost:8000/ticket/${ticketId}/delete`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 500) {
            window.location.href = '500.html'
        }
        if (response.status === 401) {
            showPopup("error", errorData.error || "Oʻchirishda xatolik!", 401);
        } else {
            showPopup("error", errorData.error || "Oʻchirishda xatolik!");
        }
        throw new Error(errorData.error || "Oʻchirishda xatolik!");
    }

    // Elementni DOMdan o'chirish
    const ticketElement = document.getElementById(`ticket-${ticketId}`);
    if (ticketElement) ticketElement.remove();
}

function showConfirmationModal(ticketId, token) {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");
    modal.innerHTML = `
      <div class="modal">
        <p>Chiptani o'chirishni xohlaysizmi?</p>
        <div class="modal-actions">
          <button id="modal-confirm" class="confirm-btn">Ha</button>
          <button id="modal-cancel" class="cancel-btn">Yo'q</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bekor qilish tugmasi
    document.getElementById("modal-cancel").addEventListener("click", () => {
        document.body.removeChild(modal);
    });

    // Tasdiqlash tugmasi
    document.getElementById("modal-confirm").addEventListener("click", async () => {
        try {
            await performDelete(ticketId, token);
            document.body.removeChild(modal);
            showPopup("success", "Chipta muvaffaqiyatli o'chirildi!");
        } catch (error) {
            document.body.removeChild(modal);
            showPopup("error", error.message);
        }
    });
}
