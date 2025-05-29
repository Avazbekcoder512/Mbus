// const api_url = 'http://localhost:8000'
const api_url = 'https://www.atr.uz'

// --- Popup functions ---
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
        <button class="app-popup-btn ${type === "success" ? "success-btn" : "error-btn"}" onclick="closeAppPopup()">Close</button>
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

// --- Page load ticket fetching and rendering ---
document.addEventListener("DOMContentLoaded", async () => {
    const preloader = document.getElementById("preloader");
    const showPreloader = () => preloader && preloader.classList.remove("hidden");
    const hidePreloader = () => preloader && preloader.classList.add("hidden");

    try {
        showPreloader();

        const response = await fetch(`${api_url}/tickets?lang=en`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 500) return window.location.href = '/500/en';

            if (response.status === 401) {
                showPopup("error", data.error || "An error occurred!", 401);
            } else {
                showPopup("error", data.error || "An error occurred!");
            }
            return;
        }

        hidePreloader();
        const container = document.getElementById("ticket-container");
        container.innerHTML = "";

        if (!data.tickets || data.tickets.length === 0) {
            container.innerHTML = "<p class='no-ticket-message'>You have no tickets!</p>";
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
                        <span>Delete</span>
                    </button>
                `;
            } else {
                actionButtonsHTML = `
                    <button class="download-btn"
                            onclick="downloadTicket('${ticketId}', this)">
                            <i class="fa-regular fa-download"></i>
                        Download
                    </button>
                    <button class="cancel-btn"
                            onclick="showCancelModal('${ticketId}')">
                        <i class="fa-solid fa-xmark-large"></i> 
                        Cancel
                    </button>
                `;
            }

            const expiredImage = isExpired
                ? `<img src='/assets/images/expired2.png' alt='expired' draggable="false"/>`
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
                        <h1>Bus Ticket</h1>
                        <p class="status-badge ${ticket.class_status}-status">
                            ${statusIcon}
                            ${ticket.class_status || ""}
                        </p>
                        <img src="${ticket.qrImage}" alt="QRCode" draggable="false"/>
                    </div>
                    ${expiredImage}
                    <div class="ticket-right">
                        <div class="ticket-section">
                            <div class="item"><div class="label">Name:</div><div class="value">${ticket.passenger || "Unknown"}</div></div>
                            <div class="item"><div class="label">Passport:</div><div class="value">${ticket.passport || "Unknown"}</div></div>
                            <div class="item"><div class="label">Phone:</div><div class="value">+${ticket.phoneNumber || "Unknown"}</div></div>
                            <div class="item"><div class="label">Bus Number:</div><div class="value">${ticket.bus_number || "Unknown"}</div></div>
                            <div class="item"><div class="label">From:</div><div class="value">${ticket.from || "Unknown"}</div></div>
                            <div class="item"><div class="label">Seat:</div><div class="value">${ticket.seat_number || "Unknown"}</div></div>
                            <div class="item"><div class="label">To:</div><div class="value">${ticket.to || "Unknown"}</div></div>
                            <div class="item"><div class="label">Ticket Number::</div><div class="value">${ticket.ticketId || "Unknown"}</div></div>
                        </div>
                        <div class="ticket-footer">
                            <div class="date-time">
                                <div>Date: ${departureDate || '---'}</div>
                                <div>Time: ${departureTime || '---'}</div>
                            </div>
                            <div class="price">${ticket.price || '0'} UZS</div>
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
        console.error("Error:", error);
        showPopup("error", error.message || "Unknown error occurred!");
    }
});

// --- Download function ---
async function downloadTicket(ticketId, btn) {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loader"></span>';

    try {
        const res = await fetch(`${api_url}/ticket/${ticketId}/download?lang=en`, {
            method: "GET",
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500/en';
            if (res.status === 401) return showPopup("error", err.error || "Download error!", 401);
            return showPopup("error", err.error || "Download error!");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ticket-${ticketId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Unknown error occurred!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- Delete expired ticket ---
async function deleteExpiredTicket(ticketId) {
    try {
        const res = await fetch(`${api_url}/ticket/${ticketId}/delete?lang=en`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500/en';
            if (res.status === 401) return showPopup("error", err.error || "Delete error!", 401);
            throw new Error(err.error || "Delete error!");
        }
        document.getElementById(`ticket-${ticketId}`)?.remove();
        showPopup("success", "Ticket deleted successfully!");
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Delete error!");
    }
}

// --- Cancel ticket modal and PUT request ---
function showCancelModal(ticketId) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <p>Do you want to cancel this ticket?</p>
        <div class="modal-actions">
          <button id="modal-yes" class="confirm-btn">Yes</button>
          <button id="modal-no" class="cancel-btn">No</button>
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
        const res = await fetch(`${api_url}/ticket/${ticketId}/cancel?lang=en`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!res.ok) {
            const err = await res.json();
            if (res.status === 500) return window.location.href = '/500/en';
            if (res.status === 401) return showPopup("error", err.error || "Cancellation error!", 401);
            throw new Error(err.error || "Cancellation error!");
        }
        document.getElementById(`ticket-${ticketId}`)?.remove();
        showPopup("success", "Ticket cancelled successfully!");
    } catch (e) {
        console.error(e);
        showPopup("error", e.message || "Cancellation error!");
    }
}