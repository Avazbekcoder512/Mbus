const selectedPrices = new Map();
let routeFrom = "";
let routeTo = "";
let route = "";
let departureDate = "";
let departureTime = "";
let arrivalDate = "";
let arrivalTime = "";

// const api_url = 'http://localhost:8000'
const api_url = 'https://www.go.limon.uz'

function showErrorPopup(message, redirectUrl = null) {
    const popup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    const errorButtons = document.getElementById('error-buttons');

    errorMessage.textContent = message;
    errorButtons.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => {
        popup.classList.remove('visible');
        if (redirectUrl) window.location.href = redirectUrl;
    };

    errorButtons.appendChild(closeBtn);
    popup.classList.add('visible');
}

document.addEventListener("DOMContentLoaded", async () => {
    const preloader = document.getElementById("preloader");
    const userId = localStorage.getItem('userId');

    let userData = {};
    if (userId) {
        try {
            const userRes = await fetch(`${api_url}/profile/${userId}?lang=en`);
            if (userRes.ok) {
                userData = await userRes.json();
            }
        } catch (err) {
            console.error("Foydalanuvchi ma’lumotini olishda xato:", err);
        }
    }

    function showPreloader() {
        if (preloader) preloader.classList.remove("visible");
    }

    function hidePreloader() {
        if (preloader) preloader.classList.add("visible");
    }

    const tripId = localStorage.getItem("selectedTripId");
    if (!tripId) {
        console.error("Reys ID topilmadi!");
        return;
    }

    try {
        showPreloader();
        const response = await fetch(`${api_url}/trip/${tripId}?lang=en`, {
            method: "GET"
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401 || errorData.error === "Login failed. Please sign in!") {
                showErrorPopup(errorData.error, '/login/en');
                return;
            } else if (response.status === 500) {
                window.location.href = '/500/en';
                return;
            } else {
                showErrorPopup(errorData.error || 'An error occurred!', '/en');
                return;
            }
        }
        const tripData = await response.json();

        if (response.status === 401) {
            window.location.href = "/login/en";
            return;
        } else if (response.status === 500) {
            window.location.href = '/500/en';
        }

        routeFrom = tripData.trip.route.from;
        routeTo = tripData.trip.route.to;
        route = tripData.trip.route.en_name;
        departureDate = tripData.trip.departure_date;
        departureTime = tripData.trip.departure_time;
        arrivalDate = tripData.trip.arrival_date;
        arrivalTime = tripData.trip.arrival_time;

        function formatDate(dateStr) {
            const parts = dateStr.split("-");
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }

        const formattedDate = formatDate(departureDate);
        const tripTitleEl = document.getElementById("trip-title");
        if (tripTitleEl) {
            tripTitleEl.innerHTML = `${routeFrom} - ${routeTo} <span class="date">${formattedDate} ${departureTime}</span>`;
        }

        // if (tripTitleEl) {
        //   tripTitleEl.innerHTML = `${route}<span class="date">${formattedDate} ${departureTime}</span>`;
        // }
        const seats = tripData.trip.seats || [];
        let freeSeats = 0;
        let bookedSeats = 0;

        seats.forEach(seat => {
            if (seat.status === "empty") freeSeats++;
            else if (seat.status === "busy") bookedSeats++;
        });

        document.getElementById("free-seats").textContent = freeSeats;
        document.getElementById("booked-seats").textContent = bookedSeats;

        const seatLayout = [
            [47, 43, 39, 35, 31, 27, 25, 21, 17, 13, 9, 5, 1, "driver"],
            [48, 44, 40, 36, 32, 28, 26, 22, 18, 14, 10, 6, 2],
            [49, "", "", "", "", "", "", "", "", "", "", "", ""],
            [50, 45, 41, 37, 33, 29, "", 23, 19, 15, 11, 7, 3],
            [51, 46, 42, 38, 34, 30, "", 24, 20, 16, 12, 8, 4]
        ];

        const seatingTable = document.getElementById("seating-table");
        seatingTable.innerHTML = "";

        const legendEl = document.getElementById("seat-legend");
        legendEl.innerHTML = "";

        const priceByClass = { vip: 0, premium: 0, economy: 0 };
        seats.forEach(s => {
            const cls = (s.class || "economy").toLowerCase();
            if (!priceByClass[cls] && s.price) priceByClass[cls] = s.price;
        });
        ["vip", "premium", "economy"].forEach(cls => {
            const div = document.createElement("div");
            div.classList.add("legend-item");
            div.innerHTML = `
        <div class="legend-color ${cls}-seat"></div>
        <span>${cls.charAt(0).toUpperCase() + cls.slice(1)} — ${priceByClass[cls]} so'm</span>
      `;
            legendEl.appendChild(div);
        });

        seatLayout.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(value => {
                const td = document.createElement("td");

                if (value === "driver") {
                    td.classList.add("driver");
                    td.innerHTML = `<i class="fa-solid fa-steering-wheel"></i>`;
                } else if (value === "") {
                    td.classList.add("empty");
                } else {
                    td.classList.add("seat");
                    const seatObj = seats.find(s => s.seatNumber === value);
                    if (!seatObj) return;

                    td.dataset.id = seatObj._id;
                    const cls = (seatObj.class || "economy").toLowerCase();
                    td.classList.add(`${cls}-seat`);
                    td.textContent = value;

                    if (seatObj.status === "busy") {
                        td.classList.add("occupied");
                        const gender = seatObj.passenger_gender;
                        let iconHtml = "";
                        if (gender === "female") {
                            iconHtml = `<img src="../assets/images/female.png" alt="Female" class="seat-icon" />`;
                        } else if (gender === "male") {
                            iconHtml = `<img src="../assets/images/male.png" alt="Male" class="seat-icon" />`;
                        }
                        td.innerHTML = iconHtml;
                        td.style.cursor = "not-allowed";
                    } else {
                        td.addEventListener("click", () => {
                            td.classList.toggle("selected");
                            const selectedId = td.dataset.id;

                            if (td.classList.contains("selected")) {
                                selectedPrices.set(selectedId, {
                                    seatNumber: value,
                                    price: seatObj.price || priceByClass[cls]
                                });
                            } else {
                                selectedPrices.delete(selectedId);
                            }

                            updateTotalPrice();
                            showTicketForm();
                        });
                    }
                }
                tr.appendChild(td);
            });
            seatingTable.appendChild(tr);
        });

    } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
        hidePreloader();
    }

    function updateTotalPrice() {
        let totalPrice = 0;
        selectedPrices.forEach(seatData => {
            totalPrice += Number(seatData.price);
        });
        localStorage.setItem("totalPrice", totalPrice.toString());
    }

    function formatPhoneNumber(value) {
        let digits = value.replace(/\D/g, '');
        if (digits.startsWith("998")) digits = digits.slice(3);
        digits = digits.slice(0, 9);
        const parts = [
            digits.slice(0, 2),
            digits.slice(2, 5),
            digits.slice(5, 7),
            digits.slice(7, 9)
        ].filter(Boolean);
        return "+998" + (parts.length > 0 ? ` (${parts[0]})` : "") + " " + parts.slice(1).join("-");
    }

    function formatPassportNumber(value) {
        return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 9);
    }

    function showTicketForm() {
        const formContainer = document.getElementById("ticket-form-container");
        formContainer.innerHTML = "";

        if (selectedPrices.size === 0) {
            formContainer.style.display = "none";
            return;
        }

        formContainer.style.display = "block";

        selectedPrices.forEach((seatData, seatId) => {
            const form = document.createElement("form");
            form.classList.add("ticket-passenger-form");
            form.innerHTML = `
                <div class="form-header">
                    <div>
                        Seat Number: ${seatData.seatNumber}
                        <button class="close-form-btn">×</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="input-group">
                        <label for="fullName_${seatId}">Full Name:</label>
                        <input
                        type="text"
                        id="fullName_${seatId}"
                        name="fullName_${seatId}"
                        placeholder="Full Name"
                        required
                        value="${(userData.user?.first_Name || '') + (userData.user?.last_Name ? ' ' + userData.user.last_Name : '')}"
                        >
                    </div>
                    <div class="input-group">
                        <label for="gender_${seatId}">Gender:</label>
                        <select
                            id="gender_${seatId}"
                            name="gender_${seatId}"
                            required
                            >
                            <option value="" disabled selected>Select gender</option>
                            <option value="male" ${userData.user?.gender === 'male' ? 'selected' : ''}>Male</option>
                            <option value="female" ${userData.user?.gender === 'female' ? 'selected' : ''}>Female</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="passport_${seatId}">Passport Number:</label>
                        <input
                        type="text"
                        id="passport_${seatId}"
                        name="passport_${seatId}"
                        placeholder="AA1234567"
                        required
                        value="${userData.user?.passport || ''}"
                        >
                    </div>
                    <div class="input-group">
                        <label for="phone_${seatId}">Phone Number:</label>
                        <input
                        type="text"
                        id="phone_${seatId}"
                        name="phone_${seatId}"
                        placeholder="+998 (XX) XXX-XX-XX"
                        required
                        value="${userData.user?.phoneNumber ? formatPhoneNumber(userData.user.phoneNumber) : ''}"
                        >
                    </div>
                </div>
                `;

            const closeBtn = form.querySelector(".close-form-btn");
            closeBtn.addEventListener("click", (e) => {
                e.preventDefault();
                form.remove();
                selectedPrices.delete(seatId);
                const seatElement = document.querySelector(`td[data-id="${seatId}"]`);
                if (seatElement) {
                    seatElement.classList.remove("selected");
                }
                updateTotalPrice();
                if (selectedPrices.size === 0) {
                    formContainer.style.display = "none";
                }
            });
            formContainer.appendChild(form);

            const phoneInput = form.querySelector(`#phone_${seatId}`);
            phoneInput?.addEventListener("input", function (e) {
                const pos = e.target.selectionStart;
                e.target.value = formatPhoneNumber(e.target.value);
                e.target.setSelectionRange(pos, pos);
            });

            const passportInput = form.querySelector(`#passport_${seatId}`);
            passportInput?.addEventListener("input", function (e) {
                const pos = e.target.selectionStart;
                e.target.value = formatPassportNumber(e.target.value);
                e.target.setSelectionRange(pos, pos);
            });
        });

        const btnContainer = document.createElement("div");
        btnContainer.classList.add("form-buttons");
        btnContainer.innerHTML = `
            <button type="button" id="back-btn">
                <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <button type="submit" id="continue-btn">
                <span class="btn-text">Continue</span>
                <i class="fa-solid fa-arrow-right"></i>
                <i class="fa-solid fa-spinner-third fa-spin" id="loader" style="display: none;"></i>
            </button>
            `;
        formContainer.appendChild(btnContainer);

        document.getElementById("back-btn").addEventListener("click", () => {
            window.location.href = "/";
            selectedPrices.clear();
            document.querySelectorAll(".seat.selected").forEach(el => el.classList.remove("selected"));
        });

        document.getElementById("continue-btn").addEventListener("click", async (e) => {
            const continueBtn = e.target.closest("#continue-btn");
            const loader = continueBtn.querySelector("#loader");
            const btnText = continueBtn.querySelector(".btn-text");

            const forms = document.querySelectorAll(".ticket-passenger-form");
            let isValid = true;
            forms.forEach(form => {
                if (!form.checkValidity()) {
                    form.reportValidity();
                    isValid = false;
                }
            });
            if (!isValid) return;

            continueBtn.disabled = true;
            loader.style.display = "inline-block";
            btnText.textContent = "Sending";

            const passengers = [];
            selectedPrices.forEach((seatData, seatId) => {
                const form = document.querySelector(`#ticket-form-container form input[id="fullName_${seatId}"]`)?.closest("form");
                if (!form) return;

                const fullName = form.querySelector(`#fullName_${seatId}`)?.value;
                const gender = form.querySelector(`#gender_${seatId}`)?.value;
                const passport = form.querySelector(`#passport_${seatId}`)?.value;
                const phone = form.querySelector(`#phone_${seatId}`)?.value;

                passengers.push({
                    seatId,
                    seatNumber: seatData.seatNumber,
                    fullName,
                    gender,
                    passport,
                    phoneNumber: phone.replace(/\D/g, '')
                });
            });

            try {
                const response = await fetch(`${api_url}/ticket-pending?lang=en`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        passengers,
                        from: routeFrom,
                        to: routeTo,
                        departure_date: departureDate,
                        departure_time: departureTime,
                        arrival_date: arrivalDate,
                        arrival_time: arrivalTime
                    })
                });

                const result = await response.json();

                if (response.ok && result.order) {
                    localStorage.setItem('order', result.order);
                    showVerificationModal();
                } else {
                    if (result.error === "User data is incomplete! Please fill in all required information!") {
                        showErrorPopup(result.error, '/profile/en');
                    } else if (response.status === 401) {
                        showErrorPopup(result.error, '/login/en');
                    } else if (response.status === 500) {
                        window.location.href = '/500/en';
                    } else {
                        showErrorPopup(result.error || 'An error occurred!');
                    }
                }
            } catch (err) {
                console.error("Xatolik:", err);
                showErrorPopup('Could not connect to the server!', '/');
            } finally {
                continueBtn.disabled = false;
                loader.style.display = "none";
                btnText.textContent = "Continue";
            }
        });
    }

    document.getElementById('submit-verification').addEventListener('click', handleVerification);
    document.getElementById('verification-code').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleVerification();
    });

    function showVerificationModal() {
        const modal = document.getElementById('verification-modal');
        modal.classList.add('visible');
    }

    function hideVerificationModal() {
        const modal = document.getElementById('verification-modal');
        modal.classList.remove('visible');
    }

    async function handleVerification() {
        const code = document.getElementById('verification-code').value;
        if (!code || code.length !== 6) {
            showErrorPopup('Please enter the 6-digit code!');
            return;
        }

        const order = localStorage.getItem('order');
        if (!order) {
            showErrorPopup('Order not found!');
            return;
        }

        try {
            const response = await fetch(`${api_url}/confirm?lang=en`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    orderToken: `${order}`
                },
                body: JSON.stringify({ verificationCode: Number(code) })
            });

            if (response.status === 401) {
                showErrorPopup(response.data.error, '/login/en');
                return;
            }

            if (response.status === 500) {
                window.location.href = '/500/en';
                return;
            }

            const result = await response.json();

            if (response.ok) {
                showErrorPopup(result.message, '/ticket/en', true);
            } else {
                showErrorPopup(result.error || 'An error occurred!');
            }
        } catch (err) {
            console.error('Tasdiqlashda xatolik:', err);
            showErrorPopup('Could not connect to the server!');
        } finally {
            hideVerificationModal();
        }
    }
});