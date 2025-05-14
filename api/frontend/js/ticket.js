// --- Popup funksiyalari ---
function showPopup(type, message, errorCode) {
    const popupContainer = document.getElementById("app-popup-container");
    popupContainer.innerHTML = '';

    const popup = document.createElement("div");
    const popupClass = type === "success" ? "app-popup-success" : "app-popup-error";

    popup.setAttribute("data-popup-type", type);
    if (errorCode) popup.setAttribute("data-error-code", errorCode);

    popup.className = `app-popup ${popupClass}`;
    popup.innerHTML = `
        <div class="popup-icon">
            ${type === "success"
            ? `<i class="fa-solid fa-circle-check success-icon"></i>`
            : `<i class="fa-solid fa-circle-xmark error-icon"></i>`}
        </div>
        <div class="popup-message">${message}</div>
        <button class="app-popup-btn ${type === "success" ? "success-btn" : "error-btn"}" onclick="closeAppPopup()">Yopish</button>
    `;
    popupContainer.appendChild(popup);
}

function closeAppPopup() {
    const popup = document.querySelector("#app-popup-container .app-popup");
    if (!popup) return;

    const popupType = popup.getAttribute("data-popup-type");
    const errorCode = popup.getAttribute("data-error-code");

    if (popupType === "success") {
        location.reload();
    } else if (popupType === "error" && errorCode === "401") {
        window.location.href = "login.html";
    } else {
        document.getElementById("app-popup-container").innerHTML = '';
    }
}

// --- Sahifa yuklanayotganda ticketlarni olish va render qilish ---
document.addEventListener("DOMContentLoaded", async () => {
    const preloader = document.getElementById("preloader");
    const showPreloader = () => preloader && preloader.classList.remove("hidden");
    const hidePreloader = () => preloader && preloader.classList.add("hidden");

    try {
        showPreloader();

        // const response = await fetch("https://mbus.onrender.com/tickets", {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //     }
        // });
        // const data = await response.json();
        const response = await fetch("http://localhost:8000/tickets", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await response.json();


        if (!response.ok) {
            if (response.status === 500) return window.location.href = '/500';

            if (response.status === 401) {
                showPopup("error", data.error || "Xatolik yuz berdi!", 401);
            } else {
                showPopup("error", data.error || "Xatolik yuz berdi!");
            }
            return;
        }

        hidePreloader();
        const container = document.getElementById("ticket-container");
        container.innerHTML = "";

        if (!data.tickets || data.tickets.length === 0) {
            container.innerHTML = "<p class='no-ticket-message'>Sizda chipta mavjud emas!</p>";
            return;
        }

        const oneDayInMs = 86400000;
        data.tickets.forEach(ticket => {
            const ticketId = ticket._id;
            const departureDate = ticket.departure_date || "";
            const departureTime = ticket.departure_time || "";
            const ticketDateTime = new Date(`${departureDate} ${departureTime}`);
            const now = new Date();
            const isExpired = (ticketDateTime.getTime() + oneDayInMs) < now.getTime();

            // Tugmalarni tayyorlaymiz
            let actionButtonsHTML;
            if (isExpired) {
                actionButtonsHTML = `
                    <button class="delete-btn"
                    onclick="deleteExpiredTicket('${ticketId}')">
                    <i class="fa-solid fa-trash-xmark"></i>
                        <span>O‘chirish</span>
                    </button>
                `;
            } else {
                // ticket render qilinayotgan joyda
                actionButtonsHTML = `
                    <button class="download-btn"
                            onclick="downloadTicket('${ticketId}', this)">
                            <i class="fa-regular fa-download"></i>
                        Yuklab olish
                    </button>
                    <button class="cancel-btn"
                            onclick="showCancelModal('${ticketId}')">
                        <i class="fa-solid fa-xmark-large"></i> 
                        Bekor qilish
                    </button>
                `;

            }

            const expiredImage = isExpired
                ? `<img src='./assets/images/expired.png' alt='expired' draggable="false"/>`
                : "";

            let statusIcon = '';
            switch (ticket.class_status) {
                case 'vip':
                    statusIcon = '<i class="fa-solid fa-gem"></i>';
                    break;
                case 'premium':
                    statusIcon = '<i class="fa-solid fa-star"></i>';
                    break;
                case 'economy':
                    statusIcon = '<i class="fa-solid fa-ticket-simple"></i>';
                    break;
                default:
                    statusIcon = '';
            }

            // Yakuniy HTML
            const ticketHTML = `
                <div id="ticket-${ticketId}" class="ticket ${isExpired ? "expired" : ""}">
                    <div class="ticket-left">
                        <h1>Avtobus Chiptasi</h1>
                        <p class="status-badge ${ticket.class_status}-status">
                            ${statusIcon}
                            ${ticket.class_status || ""}
                        </p>
                        <p>Avtobus raqami: ${ticket.bus_number || "Noma'lum"}</p>
                        <img src="${ticket.qrImage}" alt="QRCode" draggable="false"/>
                    </div>
                    ${expiredImage}
                    <div class="ticket-right">
                        <div class="ticket-section">
                            <div class="item"><div class="label">Ism:</div><div class="value">${ticket.passenger || "Noma'lum"}</div></div>
                            <div class="item"><div class="label">Tug‘ilgan sana:</div><div class="value">${ticket.birthday || "Noma'lum"}</div></div>
                            <div class="item"><div class="label">Pasport raqami:</div><div class="value">${ticket.passport || "Noma'lum"}</div></div>
                            <div class="item"><div class="label">Telefon raqami:</div><div class="value">${ticket.phoneNumber || "Noma'lum"}</div></div>
                            <div class="item"><div class="label">Qayerdan:</div><div class="value">${ticket.from || "Noma'lum"}</div></div>
                            <div class="item"><div class="label">O‘rindiq raqami:</div><div class="value">${ticket.seat_number || "Noma'lum"}</div></div>
                            <div class="item"><div class="label">Qayerga:</div><div class="value">${ticket.to || "Noma'lum"}</div></div>
                            <div class="item"><div class="label">O‘rindiq statusi:</div><div class="value">${ticket.class_status || "Noma'lum"}</div></div>
                        </div>
                        <div class="ticket-footer">
                            <div class="date-time">
                                <div>Sana: ${departureDate || '---'}</div>
                                <div>Vaqt: ${departureTime || '---'}</div>
                            </div>
                            <div class="price">${ticket.price || '0'} so'm</div>
                        </div>
                        <div class="ticket-actions">
                            ${actionButtonsHTML}
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += ticketHTML;
        });

    } catch (error) {
        console.error("Xatolik:", error);
        showPopup("error", error.message || "Noma'lum xatolik yuz berdi!");
    }
});

// --- Download funksiyasi ---
async function downloadTicket(ticketId, btn) {

    btn.disabled = true;
    // originalText saqlaymiz, keyin qaytarish uchun
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loader"></span>';

    try {
        // const res = await fetch(`https://mbus.onrender.com/ticket/${ticketId}/download`, {
        //     method: "GET",
        // });
        const res = await fetch(`http://localhost:8000/ticket/${ticketId}/download`, {
            method: "GET",
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500';
            if (res.status === 401) return showPopup("error", err.error || "Yuklab olishda xatolik!", 401);
            return showPopup("error", err.error || "Yuklab olishda xatolik!");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chipta-${ticketId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Noma'lum xatolik yuz berdi!");
    } finally {
        // tugmani qayta yoqib, matnini tiklaymiz
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- Expired bo'lgan chiptani o'chirish ---
async function deleteExpiredTicket(ticketId) {

    try {
        // const res = await fetch(`https://mbus.onrender.com/ticket/${ticketId}/delete`, {
        //     method: "DELETE",
        // });
        const res = await fetch(`http://localhost:8000/ticket/${ticketId}/delete`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500';
            if (res.status === 401) return showPopup("error", err.error || "O‘chirishda xatolik!", 401);
            throw new Error(err.error || "O‘chirishda xatolik!");
        }
        document.getElementById(`ticket-${ticketId}`)?.remove();
        showPopup("success", "Chipta muvaffaqiyatli o‘chirildi!");
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "O‘chirishda xatolik!");
    }
}

// --- Non‑expired uchun “Bekor qilish” modal va PUT so‘rovi ---
function showCancelModal(ticketId) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <p>Chiptani bekor qilishni xohlaysizmi?</p>
        <div class="modal-actions">
          <button id="modal-yes" class="confirm-btn">Ha</button>
          <button id="modal-no" class="cancel-btn">Yo‘q</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("modal-no").onclick = () => document.body.removeChild(modal);
    document.getElementById("modal-yes").onclick = async () => {
        document.body.removeChild(modal);
        await cancelTicketPut(ticketId);
    };
}

async function cancelTicketPut(ticketId) {
    try {
        // const res = await fetch(`https://mbus.onrender.com/ticket/${ticketId}/cancel`, {
        //     method: "PUT",
        //     headers: {
        //         "Content-Type": "application/json",
        //     }
        // });
        const res = await fetch(`http://localhost:8000/ticket/${ticketId}/cancel`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500';
            if (res.status === 401) return showPopup("error", err.error || "Bekor qilishda xatolik!", 401);
            throw new Error(err.error || "Bekor qilishda xatolik!");
        }
        document.getElementById(`ticket-${ticketId}`)?.remove();
        showPopup("success", "Chipta muvaffaqiyatli bekor qilindi!");
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Bekor qilishda xatolik!");
    }
}
