let switchCtn = document.querySelector("#switch-cnt");
let switchC1 = document.querySelector("#switch-c1");
let switchC2 = document.querySelector("#switch-c2");
let switchCircle = document.querySelectorAll(".switch__circle");
let switchBtn = document.querySelectorAll(".switch-btn");
let aContainer = document.querySelector("#a-container");
let bContainer = document.querySelector("#b-container");
let allButtons = document.querySelectorAll(".submit");

let getButtons = e => e.preventDefault();

// const modal = document.querySelector('.modal')
// const button = document.querySelector('#cancel-verify-btn')

// button.addEventListener('click', (e) => {
//     modal.classList.add('hidden')
// })

let changeForm = e => {
    switchCtn.classList.add("is-gx");
    setTimeout(() => switchCtn.classList.remove("is-gx"), 1500);

    switchCtn.classList.toggle("is-txr");
    switchCircle[0].classList.toggle("is-txr");
    switchCircle[1].classList.toggle("is-txr");
    switchC1.classList.toggle("is-hidden");
    switchC2.classList.toggle("is-hidden");
    aContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-z200");
};

let mainF = e => {
    allButtons.forEach(btn => btn.addEventListener("click", getButtons));
    switchBtn.forEach(btn => btn.addEventListener("click", changeForm));

    // Sahifa yuklanganda login old tomonda bo‘lsin:
    switchCtn.classList.add("is-txr");
    switchCircle.forEach(c => c.classList.add("is-txr"));
    switchC1.classList.add("is-hidden");
    switchC2.classList.remove("is-hidden");
    aContainer.classList.add("is-txl");
    bContainer.classList.add("is-txl", "is-z200");
};

window.addEventListener("load", mainF);


function createLoader() {
    const loader = document.createElement('span');
    loader.classList.add('loader');
    return loader;
}

function showLoader(button) {
    button.disabled = true;
    button.textContent = 'Yuborilmoqda...';
    const loader = createLoader();
    button.appendChild(loader);
}

function hideLoader(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
}

function showErrorPopup(message) {
    const popup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    popup.style.display = 'flex';
}

function closeErrorPopup() {
    const popup = document.getElementById('error-popup');
    popup.style.display = 'none';
}

function showSuccessPopup(message) {
    const popup = document.getElementById('success-popup');
    const msg = document.getElementById('success-message');
    msg.textContent = message || "Amal muvaffaqiyatli bajarildi!";
    popup.style.display = 'flex';
}

function closeSuccessPopup() {
    document.getElementById('success-popup').style.display = 'none';
    location.reload(); // Sahifani yangilash
}

// ————— ro'yxatdan o'tish tugmasi —————
document.getElementById('register_button').addEventListener('click', async function (e) {
    e.preventDefault();
    const btn = this;
    const originalText = btn.textContent;
    showLoader(btn);

    // forma ma'lumotlari
    const inputs = btn.closest('form').querySelectorAll('input');
    const data = {
        first_Name: inputs[0].value,
        last_Name: inputs[1].value,
        phoneNumber: inputs[2].value,
        password: inputs[3].value
    };

    try {
        const res = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (!res.ok) {
            // xatolikni modal yoki popup orqali ko'rsatish
            showErrorPopup(Array.isArray(json.error) ? json.error[0] : (json.error || 'Roʻyxatdan oʻtishda xatolik'));
            hideLoader(btn, originalText);
            return;
        }

        // agar register muvaffaqiyatli bo'lsa, backend dan userId yoki token kelsin
        const { _id } = json.user;
        // userId ni globalga yoki closure ga olamiz
        localStorage.setItem('userId', _id)
        window.__pendingUserId = _id;

        // modalni ochish
        document.getElementById('verification-modal').classList.remove('hidden');
    } catch (err) {
        showErrorPopup('Tarmoq xatosi: ' + err.message);
    }
    hideLoader(btn, originalText);
});

// ————— modal "Bekor qilish" tugmasi —————
document.getElementById('cancel-verify-btn').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('verification-modal').classList.add('hidden');
});

// ————— modal "Tasdiqlash" tugmasi —————
document.getElementById('verify-code-btn').addEventListener('click', async function (e) {
    e.preventDefault();
    const btn = this;
    const originalText = btn.textContent;
    showLoader(btn);

    const register_code = document.getElementById('verification-code-input').value.trim();
    if (!/^\d{6}$/.test(register_code)) {
        showErrorPopup('Iltimos, 6 xonali kodni toʻgʻri kiriting.');
        hideLoader(btn, originalText);
        return;
    }

    try {
        const res = await fetch('http://localhost:8000/confirmregistration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: window.__pendingUserId,
                register_code
            })
        });
        const json = await res.json();

        if (!res.ok) {
            showErrorPopup(json.error || 'Kod tasdiqlanmadi');
            hideLoader(btn, originalText);
            return;
        }

        // hamma narsa OK — boshqa sahifaga yo'naltiramiz
        window.location.href = '/';
    } catch (err) {
        showErrorPopup('Tarmoq xatosi: ' + err.message);
    }
    hideLoader(btn, originalText);
});


// LOGIN button
document.getElementById('login_buttton').addEventListener('click', async function (e) {
    e.preventDefault();
    const button = this;
    showLoader(button);

    const inputs = button.closest('form').querySelectorAll('input');
    const data = {
        phoneNumber: inputs[0].value,
        password: inputs[1].value
    };

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        // const response = await fetch('https://mbus.onrender.com/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('userId', result.user._id)
            window.location.href = '/';
        } else {
            if (response.status === 500) {
                window.location.href = '/500'
            }
            if (result.error && typeof result.error === 'string') {
                showErrorPopup(result.error);
            } else if (result.error && Array.isArray(result.error) && result.error.length > 0) {
                showErrorPopup(result.error[0]);
            } else {
                showErrorPopup('Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
            }
        }

    } catch (err) {
        showErrorPopup('Tarmoq xatosi: ' + err.message);
    }

    hideLoader(button, 'KIRISH');
});

document.querySelectorAll('.toggle-password').forEach(function (eyeIcon) {
    eyeIcon.addEventListener('click', function () {
        const input = document.querySelector(this.getAttribute('toggle'));
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash'); // Yashirish uchun
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye'); // Ko‘rsatish uchun
        }
    });
});

// Sahifa yuklanganda login formaning asl HTML tarkibini saqlab olamiz
const originalLoginFormHtml = document.getElementById('b-form').innerHTML;

// "Parolingiz esdan chiqdimi?" havolasiga bosilganda telefon raqam kiritish formasi ko'rsatiladi
document.getElementById('b-form').addEventListener('click', function (e) {
    if (e.target && e.target.id === 'forgot-password-link') {
        e.preventDefault();
        // Forgot password jarayoni
        const form = document.getElementById('b-form');

        // Telefon raqam uchun input, SMS so‘rov tugmasi va orqaga qaytish tugmasini qo'shamiz
        form.innerHTML = `
        <h2 class="form_title title">Parolni Tiklash</h2>
        <input class="form__input" type="tel" name="phoneNumber" placeholder="Telefon raqam" required>
        <button type="submit" id="send_phone_button" class="form__button button submit">SMS kod uchun so‘rov yuborish</button>
        <button type="button" id="back_button" class="form__button button submit">Orqaga qaytish</button>
    `;

        // "Orqaga qaytish" tugmasi: asl login formaga qaytarish
        document.getElementById('back_button').addEventListener('click', function (e) {
            e.preventDefault();
            form.innerHTML = originalLoginFormHtml;
            // Login formasi va uning tugmalari uchun event listenerlarni qayta o'rnatish zarur bo'lishi mumkin
            // Masalan:
            // loginEventListeners(); 
            // Agar siz allaqachon event listenerlarni window load hodisasida o'rnatgan bo'lsangiz, qayta chaqirishga ehtiyoj qolmasligi mumkin.
        });

        // Telefon raqamni yuborish tugmasi uchun event listener
        document.getElementById('send_phone_button').addEventListener('click', async function (e) {
            e.preventDefault();
            const button = this;
            showLoader(button);

            const phone = form.querySelector("input[name='phoneNumber']").value;
            if (!phone) {
                showErrorPopup("Iltimos, telefon raqamingizni kiriting.");
                hideLoader(button, "SMS kod uchun so‘rov yuborish");
                return;
            }

            try {
                // const response = await fetch('https://mbus.onrender.com/send-code', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ phoneNumber: phone })
                // });
                // const result = await response.json();

                const response = await fetch('http://localhost:8000/send-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phone })
                });
                const result = await response.json();

                if (response.ok) {
                    // Telefon raqam yuborilgach, yangi parol va SMS kodini kiritish uchun inputlar bilan formani yangilaymiz
                    form.innerHTML = `
                    <h2 class="form_title title">Yangi Parolni Tiklash</h2>
                    <input class="form__input" type="password" name="password" placeholder="Yangi Parol" required>
                    <input class="form__input" type="text" name="smsCode" placeholder="SMS kodi" required>
                    <button type="submit" id="reset_button" class="form__button button submit">Tasdiqlash</button>
                    <button type="button" id="back_button_reset" class="form__button button submit">Orqaga qaytish</button>
                `;

                    // "Orqaga qaytish" tugmasi: telefon raqam bosqichiga qaytish
                    document.getElementById('back_button_reset').addEventListener('click', function (e) {
                        e.preventDefault();
                        // Telefon raqam bosqichiga qaytamiz
                        form.innerHTML = `
                        <h2 class="form_title title">Parolni Tiklash</h2>
                        <input class="form__input" type="tel" name="phoneNumber" placeholder="Telefon raqam" required>
                        <button type="submit" id="send_phone_button" class="form__button button submit">SMS kod uchun so‘rov yuborish</button>
                        <button type="button" id="back_button" class="form__button button submit">Orqaga qaytish</button>
                    `;
                        // Qayta event listenerlarni o'rnatamiz
                        // (Bu yerda funksiya qayta takrorlanishi mumkin yoki alohida funksiya sifatida ajratish mumkin)
                    });

                    // Yangi parolni tiklash tugmasiga event listener
                    document.getElementById('reset_button').addEventListener('click', async function (e) {
                        e.preventDefault();
                        const resetButton = this;
                        showLoader(resetButton);

                        const password = form.querySelector("input[name='password']").value;
                        const smsCode = form.querySelector("input[name='smsCode']").value;

                        try {
                            // const responseReset = await fetch('https://mbus.onrender.com/reset-password', {
                            //     method: 'POST',
                            //     headers: { 'Content-Type': 'application/json' },
                            //     body: JSON.stringify({ phoneNumber: phone, password, smsCode })
                            // });
                            // const resultReset = await responseReset.json();
                            const responseReset = await fetch('http://localhost:8000/reset-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phoneNumber: phone, password, smsCode })
                            });
                            const resultReset = await responseReset.json();

                            if (responseReset.ok) {
                                showSuccessPopup(resultReset.message);
                            } else {
                                if (response.status === 500) {
                                    window.location.href = '/500'
                                }
                                if (resultReset.error) {
                                    showErrorPopup(typeof resultReset.error === 'string' ? resultReset.error : resultReset.error[0]);
                                } else {
                                    showErrorPopup('Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
                                }
                            }
                        } catch (err) {
                            showErrorPopup('Tarmoq xatosi: ' + err.message);
                        }

                        hideLoader(resetButton, 'Tasdiqlash');
                    });
                } else {
                    if (result.error) {
                        showErrorPopup(typeof result.error === 'string' ? result.error : result.error[0]);
                    } else {
                        showErrorPopup('Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
                    }
                }
            } catch (err) {
                showErrorPopup('Tarmoq xatosi: ' + err.message);
            }

            hideLoader(button, "SMS kod uchun so‘rov yuborish");
        });
    }
});