document.addEventListener("DOMContentLoaded", async () => {
    const busId = localStorage.getItem("selectedBusId"); // ID'ni olish


    if (busId) {
        try {
            const response = await fetch(`http://localhost:8000/bus/${busId}`);
            const busData = await response.json();

            console.log("Trip ma'lumotlari:", busData);

            // document.getElementById("trip-info").innerHTML = `
            //     <h2>Reys: ${tripData.name}</h2>
            //     <p>Ketish vaqti: ${tripData.departure_date} - ${tripData.departure_time}</p>
            //     <p>Avtobus: ${tripData.bus.bus_model}</p>
            //     <p>Umumiy o‘rinlar: ${tripData.bus.seats_count}</p>
            //     <p>Chipta narxi: ${tripData.ticket_price} so'm</p>
            // `;
        } catch (error) {
            console.error("Trip ma'lumotlarini yuklashda xatolik:", error);
        }
    } else {
        console.error("ID topilmadi!");
    }
});
