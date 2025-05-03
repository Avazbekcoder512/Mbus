// ../js/index.js

document.addEventListener("DOMContentLoaded", () => {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    const dateInput = document.getElementById("departure_date");
    const form = document.getElementById("ticket-search");
    const dataDiv = document.getElementById("Data");
    const errorPopup = document.getElementById("error-popup");
    const errorMessage = document.getElementById("error-message");
    // const preloader = document.getElementById("preloader");
    let fpInstance = null;

    const API_BASE = "http://localhost:8000";  // yoki https://mbus.onrender.com

    // Yordamchi: preloader
    // const showPreloader = () => preloader?.classList.remove("hidden");
    // const hidePreloader = () => preloader?.classList.add("hidden");

    // Yordamchi: xatoni ko‘rsatish
    function showError(msg) {
        errorMessage.textContent = msg;
        errorPopup.style.display = "flex";
    }
    document.querySelector("#error-popup button")
        .addEventListener("click", () => errorPopup.style.display = "none");

    // 1) “from” select’ga bekatlarni yuklaymiz
    (async function loadCities() {
        try {
            // showPreloader();
            const res = await fetch(`${API_BASE}/cities`);
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Bekatlar ro‘yxatini olishda xato");
            j.cities.forEach(c => {
                const opt = new Option(c.name, c.name);
                fromSelect.append(opt);
            });
        } catch (e) {
            console.error(e);
            showError(e.message);
        } finally {
            // hidePreloader();
        }
    })();

    // 2) “from” o‘zgarganda → to’larni so‘raymiz
    fromSelect.addEventListener("change", async () => {
        toSelect.innerHTML = `<option disabled selected value="">Bekatni tanlang</option>`;
        dateInput.value = "";
        dateInput.setAttribute("disabled", "disabled");
        dataDiv.innerHTML = "";

        const from = fromSelect.value;
        if (!from) return;

        try {
            // showPreloader();
            const res = await fetch(`${API_BASE}/findroute?from=${encodeURIComponent(from)}`);
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Yo‘nalish topilmadi");
            j.to.forEach(dest => toSelect.append(new Option(dest, dest)));
            toSelect.removeAttribute("disabled");
        } catch (e) {
            console.error(e);
            showError(e.message);
        } finally {
            // hidePreloader();
        }
    });

    // 3) “to” o‘zgarganda → sanalarni so‘raymiz
    toSelect.addEventListener("change", async () => {
        // 1) Oldingi flatpickr bo‘lsa, oʻchiramiz
        if (fpInstance) {
            fpInstance.destroy();
            fpInstance = null;
        }

        // 2) inputni disable va placeholder ga qaytarish
        dateInput.value = "";
        dateInput.setAttribute("disabled", "disabled");
        dateInput.setAttribute("placeholder", "Yuklanmoqda…");
        dataDiv.innerHTML = "";

        // 3) fetch qilish
        const from = fromSelect.value;
        const to = toSelect.value;
        try {
            // preloader.classList.remove("hidden");
            const url = `${API_BASE}/findroute?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
            const res = await fetch(url);
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Sanalar topilmadi");

            // 4) responddagi dd-mm-yyyy ni iso (yyyy-mm-dd) ga aylantiramiz
            const enabledDates = j.departure_date.map(d => {
                const [yyyy, mm, dd] = d.split("-");
                return `${yyyy}-${mm}-${dd}`;
            });

            // 5) inputni aktiv qilib, flatpickr o‘rnatamiz
            dateInput.removeAttribute("disabled");
            dateInput.setAttribute("placeholder", "Kunni tanlang");

            fpInstance = flatpickr(dateInput, {
                dateFormat: "Y-m-d",    // value va UI uchun ISO
                altInput: true,         // altInput orqali DD-MM-YYYY ham ko‘rsatish mumkin
                altFormat: "d-m-Y",     // altInput turi
                enable: enabledDates,   // faqat shu sanalar tanlanadi
                disableMobile: true,    // mobil brauzer native datepicker’ini o‘chiradi
            });

        } catch (e) {
            console.error(e);
            alert(e.message);
        } finally {
            // preloader.classList.add("hidden");
        }
    });

    // 4) Sana tanlanganida → form’ni aktif qilamiz
    dateInput.addEventListener("change", () => {
        dataDiv.innerHTML = "";
    });

    // 5) Form yuborilganda → trips so‘rovini yuboramiz
    form.addEventListener("submit", async e => {
        e.preventDefault();
        dataDiv.innerHTML = "";

        const from = fromSelect.value;
        const to = toSelect.value;
        const departure_date = dateInput.value;  // bu "2025-05-04" singari YYYY-MM-DD

        if (!from || !to || !departure_date) {
            showError("Iltimos, barcha maydonlarni to‘ldiring");
            return;
        }

        try {
            // showPreloader();
            const url = `${API_BASE}/findroute`
                + `?from=${encodeURIComponent(from)}`
                + `&to=${encodeURIComponent(to)}`
                + `&departure_date=${encodeURIComponent(departure_date)}`;  // ISO-format yuboriladi
            const res = await fetch(url);
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || "Reys topilmadi");

            const trips = j.data;
            if (!trips.length) {
                dataDiv.innerHTML = "<p>Reyslar topilmadi.</p>";
                return;
            }

            // Jadvalni hosil qilamiz
            let html = `
          <table class="trip-table">
            <thead>
              <tr>
                <th>Ketish vaqti</th>
                <th>Yo‘nalish</th>
                <th>O‘rinlar</th>
                <th>Narx</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
        `;
            trips.forEach(trip => {
                html += `
            <tr onclick="saveTripId('${trip._id}')" style="cursor:pointer">
              <td>${trip.departure_date}<br>${trip.departure_time}</td>
              <td>${trip.route.from} → ${trip.route.to}</td>
              <td>${trip.bus?.seats_count ?? '-'}</td>
              <td>${trip.ticket_price ?? '-'} so‘m</td>
              <td>${trip.bus?.bus_model ?? '-'}</td>
            </tr>
          `;
            });
            html += `</tbody></table>`;
            dataDiv.innerHTML = html;

        } catch (e) {
            console.error(e);
            showError(e.message);
        } finally {
            // hidePreloader();
        }
    });
});

// Global funksiyani ochiq qilamiz
function saveTripId(id) {
    localStorage.setItem("selectedTripId", id);
    window.location.href = "/trip";
}
