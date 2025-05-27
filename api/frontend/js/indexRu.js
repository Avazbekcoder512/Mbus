document?.addEventListener("DOMContentLoaded", () => {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    const dateInput = document.getElementById("departure_date");
    const form = document.getElementById("ticket-search");
    const dataDiv = document.getElementById("Data");
    const loginButton = document.getElementById("login-btn");
    const userNameElement = document.getElementById("user-name");
    const usernameDisplay = document.getElementById("username");
    const userMenu = document.getElementById("user-menu");
    let fpInstance = null;
    const API_BASE = "http://localhost:8000";

    // Помощник: извлекаем сообщение об ошибке из ответа (массив или строка)
    function extractError(err) {
        if (!err) return '';
        return Array.isArray(err) ? err[0] : err;
    }

    document.getElementById('closePopup')?.addEventListener('click', () => {
        document.getElementById('errorPopup').style.display = 'none';
        window.location.href = "/login";
    });

    // Функция обработки ошибок
    function handleError(error) {
        const status = error.status || 0;

        if (status === 401) {
            const popup = document.getElementById('errorPopup');
            const popupMessage = document.getElementById('popupMessage');
            popupMessage.textContent = error.message || "Сначала войдите в систему";
            popup.style.display = 'flex';
        } else if (status === 500) {
            window.location.href = '/500/ru';
        } else {
            window.location.reload();
        }
    }

    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) return decodeURIComponent(value);
        }
        return null;
    }

    function decodeJWT(token) {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (e) {
            console.error("JWT decode error:", e);
            return {};
        }
    }

    // --- Логика отображения входа пользователя ---
    const token = getCookie("token");
    if (token) {
        const { first_Name, last_Name } = decodeJWT(token);
        if (first_Name && last_Name) {
            const initials = (first_Name.charAt(0) + last_Name.charAt(0)).toUpperCase();
            usernameDisplay.textContent = initials;
            userNameElement.style.display = "flex";
            loginButton.style.display = "none";
            userNameElement?.addEventListener("click", e => {
                userMenu.classList.toggle("show");
                e.stopPropagation();
            });
            document?.addEventListener("click", e => {
                if (!userNameElement.contains(e.target) && !userMenu.contains(e.target)) {
                    userMenu.classList.remove("show");
                }
            });
        }
    } else {
        loginButton.style.display = "block";
        userNameElement.style.display = "none";
    }

    document.getElementById("logout")?.addEventListener("click", () => {
        document.cookie = "token=; max-age=0; path=/";
        window.location.href = "/ru";
    });

    document.getElementById("tickets")?.addEventListener("click", () => {
        window.location.href = "/ticket";
    });

    // 1) Загружаем станции в селект "from"
    (async function loadCities() {
        try {
            if (!form) return;
            const res = await fetch(`${API_BASE}/cities?lang=ru`);
            const j = await res.json();
            if (!res.ok) {
                const errorMessage = extractError(j.error) || "Ошибка при получении списка станций";
                const error = new Error(errorMessage);
                error.status = res.status;
                throw error;
            }
            j.cities.forEach(c => {
                fromSelect.append(new Option(c.name, c.name));
            });
        } catch (e) {
            handleError(e);
            console.error(e);
        }
    })();

    // 2) При изменении "from" запрашиваем направления
    fromSelect?.addEventListener("change", async () => {
        toSelect.innerHTML = `<option disabled selected value="">Выберите станцию</option>`;
        dateInput.value = "";
        dateInput.setAttribute("disabled", "disabled");
        dataDiv.innerHTML = "";

        const from = fromSelect.value;
        if (!from) return;

        try {
            const res = await fetch(`${API_BASE}/findroute?from=${encodeURIComponent(from)}&lang=ru`);
            const j = await res.json();
            if (!res.ok) {
                const errorMessage = extractError(j.error) || "Произошла ошибка...";
                const error = new Error(errorMessage);
                error.status = res.status;
                throw error;
            }
            j.to.forEach(dest => toSelect.append(new Option(dest, dest)));
            toSelect.removeAttribute("disabled");
        } catch (e) {
            handleError(e);
            console.error(e);
        }
    });

    // 3) При изменении "to" запрашиваем доступные даты
    toSelect?.addEventListener("change", async () => {
        if (fpInstance) {
            fpInstance.destroy();
            fpInstance = null;
        }
        dateInput.value = "";
        dateInput.setAttribute("disabled", "disabled");
        dateInput.setAttribute("placeholder", "Загрузка…");
        dataDiv.innerHTML = "";

        const from = fromSelect.value;
        const to = toSelect.value;
        try {
            const url = `${API_BASE}/findroute?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&lang=ru`;
            const res = await fetch(url);
            const j = await res.json();
            if (!res.ok) {
                const errorMessage = extractError(j.error) || "Произошла ошибка...";
                const error = new Error(errorMessage);
                error.status = res.status;
                throw error;
            }

            const enabledDates = j.departure_date.map(d => {
                const [yyyy, mm, dd] = d.split("-");
                return `${yyyy}-${mm}-${dd}`;
            });

            dateInput.removeAttribute("disabled");
            dateInput.setAttribute("placeholder", "Выберите дату");
            fpInstance = flatpickr(dateInput, {
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d-m-Y",
                enable: enabledDates,
                disableMobile: true,
            });
        } catch (e) {
            handleError(e);
            console.error(e);
        }
    });

    // 4) При выборе даты очищаем данные
    dateInput?.addEventListener("change", () => {
        dataDiv.innerHTML = "";
    });

    // 5) При отправке формы запрашиваем рейсы
    form?.addEventListener("submit", async e => {
        e.preventDefault();
        dataDiv.innerHTML = "";

        const from = fromSelect.value;
        const to = toSelect.value;
        const departure_date = dateInput.value;

        if (!from || !to || !departure_date) {
            console.error("Пожалуйста, заполните все поля");
            return;
        }

        try {
            const url = `${API_BASE}/findroute?lang=ru`
                + `&from=${encodeURIComponent(from)}`
                + `&to=${encodeURIComponent(to)}`
                + `&departure_date=${encodeURIComponent(departure_date)}`;
            const res = await fetch(url);
            const j = await res.json();
            if (!res.ok) {
                const errorMessage = extractError(j.error) || "Произошла ошибка...";
                const error = new Error(errorMessage);
                error.status = res.status;
                throw error;
            }

            const trips = j.data;
            if (!trips.length) {
                dataDiv.innerHTML = "<p>Рейсы не найдены.</p>";
                return;
            }

            let html = `
          <table class="trip-table">
            <thead>
              <tr>
                <th>Время отправления</th>
                <th>Маршрут</th>
                <th>Места</th>
                <th>Цена</th>
                <th>Модель</th>
              </tr>
            </thead>
            <tbody>
        `;
            trips.forEach(trip => {
                html += `
            <tr onclick="saveTripId('${trip._id}')" style="cursor:pointer">
              <td>${trip.departure_date}<br>${trip.departure_time}</td>
              <td>${trip.route.ru_name}</td>
              <td>${trip.bus?.seats_count ?? '-'}</td>
              <td>${trip.ticket_price ?? '-'} сум</td>
              <td>${trip.bus?.bus_model ?? '-'}</td>
            </tr>
          `;
            });
            html += `</tbody></table>`;
            dataDiv.innerHTML = html;

        } catch (e) {
            handleError(e);
            console.error(e);
        }
    });
});

// Делаем глобальной функцию для сохранения рейса
function saveTripId(id) {
    localStorage.setItem("selectedTripId", id);
    window.location.href = "/trip/ru";
}