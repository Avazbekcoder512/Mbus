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

        data.tickets.forEach(ticket => {
            const ticketHTML = `
            <div class="ticket">
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
                            <div>Sana: ${ticket.departure_date || '---'}</div>
                            <div>Vaqt: ${ticket.departure_time || '---'}</div>
                        </div>
                        <div class="price">${ticket.price || '0'} so'm</div>
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