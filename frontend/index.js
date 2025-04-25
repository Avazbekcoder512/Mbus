document.addEventListener("DOMContentLoaded", async () => {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    const dataDiv = document.getElementById("Data");
    const form = document.getElementById("ticket-search");


    const loginButton = document.getElementById("login-btn");
    const userNameElement = document.getElementById("user-name");
    const usernameDisplay = document.getElementById("username");
    const userMenu = document.getElementById("user-menu");

    const preloader = document.getElementById("preloader");

    const closeBtn = document.querySelector("#error-popup button");
    closeBtn?.addEventListener("click", closeErrorPopup);

    function showPreloader() {
        if (preloader) preloader.classList.remove("hidden");
    }

    function hidePreloader() {
        if (preloader) preloader.classList.add("hidden");
    }

    function showErrorPopup(message) {
        const popup = document.getElementById('error-popup');
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        popup.style.display = 'flex';
    }

    function closeErrorPopup() {
        const popup = document.getElementById('error-popup');
        if (popup) {
            popup.style.display = 'none';
        } else {
            console.error("Error popup element topilmadi!");
        }
    }

    const token = localStorage.getItem("token");

    if (token) {
        const decodedToken = decodeJWT(token);
        const userName = decodedToken.name;

        usernameDisplay.textContent = userName;
        userNameElement.style.display = "inline-flex";

        loginButton.style.display = "none";
        userNameElement.style.display = "block";

        userNameElement.addEventListener("click", (event) => {
            userMenu.classList.toggle("show");
            event.stopPropagation();
        });
    } else {
        loginButton.style.display = "block";
        userNameElement.style.display = "none";
    }

    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }

    const ticketsButton = document.getElementById("tickets");
    if (ticketsButton) {
        ticketsButton.addEventListener("click", () => {
            window.location.href = "tickets.html";
        });
    }

    document.addEventListener("click", (event) => {
        if (!userNameElement.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.remove("show");
        }
    });

    function decodeJWT(token) {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        return JSON.parse(decodedPayload);
    }

    // Sanani avtomatik ravishda minimal qilib qo'yish
    let today = new Date();
    let minDate = today.toISOString().split("T")[0];
    document.getElementById("departure_date").setAttribute("min", minDate);

    // Backenddan bekatlar ro‘yxatini olish va select option'ga qo‘shish
    try {
        showPreloader()
        // const response = await fetch("http://localhost:8000/cities");
        const response = await fetch("https://mbus.onrender.com/cities");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Bekatlar ro'yxatini olishda xatolik");
        }

        if (response.status === 500) {
            window.location.href = '500.html'
        }

        hidePreloader()

        const cities = data.cities;

        if (Array.isArray(cities)) {
            cities.forEach(city => {
                const optionFrom = document.createElement("option");
                optionFrom.value = city.name;
                optionFrom.textContent = city.name;
                fromSelect?.appendChild(optionFrom);

                const optionTo = document.createElement("option");
                optionTo.value = city.name;
                optionTo.textContent = city.name;
                toSelect?.appendChild(optionTo);
            });
        } else {
            showErrorPopup("Bekatlar ro'yxati noto‘g‘ri formatda.");
        }
    } catch (error) {
        console.log(error);
        showErrorPopup(error.message || "Bekatlar ro'yxatini olishda xatolik yuz berdi.");
    } finally {
        hidePreloader();
    }

    // Formni yuborish va natijalarni chiqarish
    form?.addEventListener('submit', function (event) {
        event.preventDefault();

        const from = fromSelect.value;
        const to = toSelect.value;
        const departure_date = document.getElementById('departure_date').value;

        const queryString = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&departure_date=${encodeURIComponent(departure_date)}`;
        // const url = `http://localhost:8000/findroute?${queryString}`;
        const url = `https://mbus.onrender.com/findroute?${queryString}`;

        showPreloader();

        fetch(url)
            .then(response => {
                console.log(response);
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error);
                    });
                }
                if (response.status === 500) {
                    window.location.href = '500.html'
                }
                return response.json();
            })
            .then(responseData => {
                const trips = responseData.data.trips;

                let info = `
                    <table class="trip-table">
                        <thead>
                            <tr>
                                <th>Ketish vaqti</th>
                                <th>Reys nomi</th>
                                <th>Umumiy o‘rinlar</th>
                                <th>Chipta narxi</th>
                                <th>Avtobus modeli</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                trips.forEach(trip => {
                    info += `
                         <tr onclick="saveTripId('${trip._id}')" style="cursor: pointer;">
                            <td>${trip.departure_date}<br>${trip.departure_time}</td>
                            <td>${responseData.data.name}</td>
                            <td>${trip.bus.seats_count}</td>,
                            <td>${trip.ticket_price} so'm</td>
                            <td>${trip.bus.bus_model}</td>
                        </tr>
                    `;
                });


                info += `</tbody></table>`;
                dataDiv.innerHTML = info;
            })
            .catch(error => {
                console.log(error);
                showErrorPopup(error.message || "Ma'lumotni olishda xatolik yuz berdi.");
            })
            .finally(() => {
                hidePreloader();
            });
    });
});

function saveTripId(tripId) {
    localStorage.setItem("selectedTripId", tripId);
    window.location.href = "seats.html";
}
