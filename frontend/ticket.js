document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Token topilmadi. Iltimos, qayta kiring.");
            return;
        }

        const response = await fetch("http://localhost:8000/tickets", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Xatolik yuz berdi!");
        }

        const container = document.getElementById("ticket-container");
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
            
            // Ticket HTML blokiga noyob id qo'shamiz (masalan, ticket-123)
            const ticketHTML = `
            <div id="ticket-${ticket.id}" class="ticket ${isExpired ? "expired" : ""}">
                <div class="ticket-left">
                    <h1>Avtobus Chiptasi</h1>
                    <p>Avtobus raqami: ${ticket.bus_number || "Noma'lum"}</p>
                </div>
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

    } catch (error) {
        console.error("Xatolik:", error.message);
        alert("Chiptalarni olishda muammo yuz berdi.");
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
            throw new Error(errorData.error || "Yuklab olishda xatolik!");
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
        alert(error.message);
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
            
        // Aks holda modal orqali tasdiqlash
        } else {
            showConfirmationModal(ticketId, token); // tokenni modalga uzatamiz
        }

    } catch (error) {
        console.error("Xatolik:", error.message);
        alert(error.message);
    }
}

// Backendga DELETE so'rovini yuboruvchi yordamchi funksiya
async function performDelete(ticketId, token) {
    const response = await fetch(`http://localhost:8000/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Oʻchirishda xatolik!");
    }

    // Elementni DOMdan o'chirish
    const ticketElement = document.getElementById(`ticket-${ticketId}`);
    if (ticketElement) ticketElement.remove();
}

// Modalni ko'rsatish va backendga so'rovni boshqarish
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
            await performDelete(ticketId, token); // tokenni ishlatamiz
            document.body.removeChild(modal);
        } catch (error) {
            document.body.removeChild(modal);
            alert(error.message); // Xatolikni foydalanuvchiga ko'rsatish
        }
    });
}