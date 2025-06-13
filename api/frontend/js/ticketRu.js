// const api_url = 'http://localhost:8000'
const api_url = 'https://www.go.limon.uz'

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
        <button class="app-popup-btn ${type === "success" ? "success-btn" : "error-btn"}" onclick="closeAppPopup()">Закрыть</button>
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

        const response = await fetch(`${api_url}/tickets?lang=ru`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 500) return window.location.href = '/500/ru';

            if (response.status === 401) {
                showPopup("error", data.error || "Произошла ошибка!", 401);
            } else {
                showPopup("error", data.error || "Произошла ошибка!");
            }
            return;
        }

        hidePreloader();
        const container = document.getElementById("ticket-container");
        container.innerHTML = "";

        if (!data.tickets || data.tickets.length === 0) {
            container.innerHTML = "<p class='no-ticket-message'>У вас нет билетов!</p>";
            return;
        }

        const oneDayInMs = 86400000;
        data.tickets.forEach(ticket => {
            const ticketId = ticket._id;
            const departureDate = ticket.departure_date || "";
            const departureTime = ticket.departure_time || "";
            const arrivalDate = ticket.arrival_date || "";
            const arrivalTime = ticket.arrival_time || "";
            const ticketDateTime = new Date(`${arrivalDate} ${arrivalTime}`);
            const now = new Date();
            const isExpired = (ticketDateTime.getTime() + oneDayInMs) < now.getTime();

            let actionButtonsHTML;
            if (isExpired) {
                actionButtonsHTML = `
                    <button class="delete-btn"
                    onclick="deleteExpiredTicket('${ticketId}')">
                    <i class="fa-solid fa-trash-xmark"></i>
                        <span>Удалить</span>
                    </button>
                `;
            } else {
                actionButtonsHTML = `
                    <button class="download-btn"
                            onclick="downloadTicket('${ticketId}', this)">
                            <i class="fa-regular fa-download"></i>
                        Скачать
                    </button>
                    <button class="cancel-btn"
                            onclick="showCancelModal('${ticketId}')">
                        <i class="fa-solid fa-xmark-large"></i> 
                        Отменить
                    </button>
                `;
            }

            const expiredImage = isExpired
                ? `<img src='/assets/images/expired3.png' alt='expired' draggable="false"/>`
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

            const ticketHTML = `
                <div id="ticket-${ticketId}" class="ticket ${isExpired ? "expired" : ""}">
                    <div class="ticket-left">
                        <h1>Автобусный Билет</h1>
                        <p class="status-badge ${ticket.class_status}-status">
                            ${statusIcon}
                            ${ticket.class_status || ""}
                        </p>
                        <img src="${ticket.qrImage}" alt="QRCode" draggable="false"/>
                    </div>
                    ${expiredImage}
                    <div class="ticket-right">
                        <div class="ticket-section">
                            <div class="item"><div class="label">Имя:</div><div class="value">${ticket.passenger || "Неизвестно"}</div></div>
                            <div class="item"><div class="label">Паспорт:</div><div class="value">${ticket.passport || "Неизвестно"}</div></div>
                            <div class="item"><div class="label">Телефон:</div><div class="value">+${ticket.phoneNumber || "Неизвестно"}</div></div>
                            <div class="item"><div class="label">Номер автобуса:</div><div class="value">${ticket.bus_number || "Неизвестно"}</div></div>
                            <div class="item"><div class="label">Откуда:</div><div class="value">${ticket.from || "Неизвестно"}</div></div>
                            <div class="item"><div class="label">Место:</div><div class="value">${ticket.seat_number || "Неизвестно"}</div></div>
                            <div class="item"><div class="label">Куда:</div><div class="value">${ticket.to || "Неизвестно"}</div></div>
                            <div class="item"><div class="label">Номер билета:</div><div class="value">${ticket.ticketId || "Неизвестно"}</div></div>
                        </div>
                        <div class="ticket-footer">
                            <div class="date-time">
                                <div>Дата: ${departureDate || '---'}</div>
                                <div>Время: ${departureTime || '---'}</div>
                            </div>
                            <div class="price">${ticket.price || '0'} сум</div>
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
        console.error("Ошибка:", error);
        showPopup("error", error.message || "Произошла неизвестная ошибка!");
    }
});

// --- Download funksiyasi ---
async function downloadTicket(ticketId, btn) {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loader"></span>';

    try {
        const res = await fetch(`${api_url}/ticket/${ticketId}/download?lang=ru`, {
            method: "GET",
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500/ru';
            if (res.status === 401) return showPopup("error", err.error || "Ошибка загрузки!", 401);
            return showPopup("error", err.error || "Ошибка загрузки!");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `билет-${ticketId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Произошла неизвестная ошибка!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- Expired bo'lgan chiptani o'chirish ---
async function deleteExpiredTicket(ticketId) {
    try {
        const res = await fetch(`${api_url}/ticket/${ticketId}/delete?lang=ru`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500/ru';
            if (res.status === 401) return showPopup("error", err.error || "Ошибка удаления!", 401);
            throw new Error(err.error || "Ошибка удаления!");
        }
        document.getElementById(`ticket-${ticketId}`)?.remove();
        showPopup("success", "Билет успешно удален!");
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Ошибка удаления!");
    }
}

// --- Bekor qilish modal va PUT so‘rovi ---
function showCancelModal(ticketId) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <p>Вы уверены что хотите отменить билет?</p>
        <div class="modal-actions">
          <button id="modal-yes" class="confirm-btn">Да</button>
          <button id="modal-no" class="cancel-btn">Нет</button>
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
        const res = await fetch(`${api_url}/ticket/${ticketId}/cancel?lang=ru`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500/ru';
            if (res.status === 401) return showPopup("error", err.error || "Ошибка отмены!", 401);
            throw new Error(err.error || "Ошибка отмены!");
        }
        document.getElementById(`ticket-${ticketId}`)?.remove();
        showPopup("success", "Билет успешно отменен!");
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Ошибка отмены!");
    }
}