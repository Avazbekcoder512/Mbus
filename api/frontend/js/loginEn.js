let switchCtn = document.querySelector("#switch-cnt");
let switchC1 = document.querySelector("#switch-c1");
let switchC2 = document.querySelector("#switch-c2");
let switchCircle = document.querySelectorAll(".switch__circle");
let switchBtn = document.querySelectorAll(".switch-btn");
let aContainer = document.querySelector("#a-container");
let bContainer = document.querySelector("#b-container");
let allButtons = document.querySelectorAll(".submit");
// const api_url = 'http://localhost:8000'
const api_url = 'https://www.atr.uz'

let getButtons = e => e.preventDefault();

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
    aContainer.classList.toggle("is-hidden");
    bContainer.classList.toggle("is-hidden");
};

let mainF = () => {
    allButtons.forEach(btn => btn.addEventListener("click", getButtons));
    switchBtn.forEach(btn => btn.addEventListener("click", changeForm));

    // Sahifa yuklanganda login old tomonda bo‘lsin:
    switchCtn.classList.add("is-txr");
    switchCircle.forEach(c => c.classList.add("is-txr"));
    switchC1.classList.add("is-hidden");
    switchC2.classList.remove("is-hidden");
    aContainer.classList.add("is-txl", "is-hidden");
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
    button.textContent = 'Sending...';
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
    msg.textContent = message || "Operation completed successfully!";
    popup.style.display = 'flex';
}

function closeSuccessPopup() {
    document.getElementById('success-popup').style.display = 'none';
    location.reload();
}

// ————— Register button —————
document.getElementById('register_button').addEventListener('click', async function (e) {
    e.preventDefault();
    const btn = this;
    const originalText = btn.textContent;
    showLoader(btn);

    const inputs = btn.closest('form').querySelectorAll('input');
    const data = {
        first_Name: inputs[0].value,
        last_Name: inputs[1].value,
        phoneNumber: inputs[2].value,
        password: inputs[3].value
    };

    try {
        const res = await fetch(`${api_url}/register?lang=en`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (!res.ok) {
            showErrorPopup(Array.isArray(json.error) ? json.error[0] : (json.error || 'Registration failed'));
            hideLoader(btn, originalText);
            return;
        }

        if (res.status === 429) {
            window.location.href = '/429/en';
        }

        const { _id } = json.user;
        localStorage.setItem('userId', _id);
        window.__pendingUserId = _id;

        document.getElementById('verification-modal').classList.remove('hidden');
    } catch (err) {
        showErrorPopup('Network error: ' + err.message);
    }
    hideLoader(btn, originalText);
});

// ————— Cancel button in modal —————
document.getElementById('cancel-verify-btn').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('verification-modal').classList.add('hidden');
});

// ————— Confirm button in modal —————
document.getElementById('verify-code-btn').addEventListener('click', async function (e) {
    e.preventDefault();
    const btn = this;
    const originalText = btn.textContent;
    showLoader(btn);

    const register_code = document.getElementById('verification-code-input').value.trim();
    if (!/^\d{6}$/.test(register_code)) {
        showErrorPopup('Please enter a valid 6-digit code.');
        hideLoader(btn, originalText);
        return;
    }

    try {
        const res = await fetch(`${api_url}/confirmregistration?lang=en`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: window.__pendingUserId,
                register_code
            })
        });
        const json = await res.json();

        if (!res.ok) {
            showErrorPopup(json.error || 'Code confirmation failed');
            hideLoader(btn, originalText);
            return;
        }

        if (res.status === 429) {
            window.location.href = '/429/en';
        }

        window.location.href = '/en';
    } catch (err) {
        showErrorPopup('Network error: ' + err.message);
    }
    hideLoader(btn, originalText);
});

// Login button
document.getElementById('login_buttton').addEventListener('click', async function (e) {
    e.preventDefault();
    const button = this;
    const originalText = button.textContent;
    showLoader(button);

    const inputs = button.closest('form').querySelectorAll('input');
    const data = {
        phoneNumber: inputs[0].value,
        password: inputs[1].value
    };

    try {
        const response = await fetch(`${api_url}/login?lang=en`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('userId', result.user._id);
            window.location.href = '/en';
        } else {
            if (response.status === 500) {
                window.location.href = '/500/en';
            } else if (response.status === 429) {
                window.location.href = '/429/en';
            } else if (result.error && typeof result.error === 'string') {
                showErrorPopup(result.error);
            } else if (result.error && Array.isArray(result.error) && result.error.length > 0) {
                showErrorPopup(result.error[0]);
            } else {
                showErrorPopup('An error occurred. Please try again.');
            }
        }
    } catch (err) {
        showErrorPopup('Network error: ' + err.message);
    }

    hideLoader(button, originalText);
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(function (eyeIcon) {
    eyeIcon.addEventListener('click', function () {
        const input = document.querySelector(this.getAttribute('toggle'));
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// Save original login form HTML
const originalLoginFormHtml = document.getElementById('b-form').innerHTML;

// Handle "Forgot your password?"
document.getElementById('b-form').addEventListener('click', function (e) {
    if (e.target && e.target.id === 'forgot-password-link') {
        e.preventDefault();
        const form = document.getElementById('b-form');

        form.innerHTML = `
        <h2 class="form_title title">Password Recovery</h2>
        <input class="form__input" type="tel" name="phoneNumber" placeholder="Phone Number" required>
        <button type="submit" id="send_phone_button" class="form__button button submit">Request SMS Code</button>
        <button type="button" id="back_button" class="form__button button submit">Back</button>
    `;

        document.getElementById('back_button').addEventListener('click', function (e) {
            e.preventDefault();
            form.innerHTML = originalLoginFormHtml;
        });

        document.getElementById('send_phone_button').addEventListener('click', async function (e) {
            e.preventDefault();
            const button = this;
            showLoader(button);

            const phone = form.querySelector("input[name='phoneNumber']").value;
            if (!phone) {
                showErrorPopup("Please enter your phone number.");
                hideLoader(button, "Request SMS Code");
                return;
            }

            try {
                const response = await fetch(`${api_url}/send-code?lang=en`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phone })
                });
                const result = await response.json();

                if (response.ok) {
                    form.innerHTML = `
                    <h2 class="form_title title">Reset New Password</h2>
                    <input class="form__input" type="password" name="password" placeholder="New Password" required>
                    <input class="form__input" type="text" name="smsCode" placeholder="SMS Code" required>
                    <button type="submit" id="reset_button" class="form__button button submit">Confirm</button>
                    <button type="button" id="back_button_reset" class="form__button button submit">Back</button>
                `;

                    document.getElementById('back_button_reset').addEventListener('click', function (e) {
                        e.preventDefault();
                        form.innerHTML = `
                        <h2 class="form_title title">Password Recovery</h2>
                        <input class="form__input" type="tel" name="phoneNumber" placeholder="Phone Number" required>
                        <button type="submit" id="send_phone_button" class="form__button button submit">Request SMS Code</button>
                        <button type="button" id="back_button" class="form__button button submit">Back</button>
                    `;
                    });

                    document.getElementById('reset_button').addEventListener('click', async function (e) {
                        e.preventDefault();
                        const resetButton = this;
                        showLoader(resetButton);

                        const password = form.querySelector("input[name='password']").value;
                        const smsCode = form.querySelector("input[name='smsCode']").value;

                        try {
                            const responseReset = await fetch(`${api_url}/reset-password?lang=en`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phoneNumber: phone, password, smsCode })
                            });
                            const resultReset = await responseReset.json();

                            if (responseReset.ok) {
                                showSuccessPopup(resultReset.message);
                            } else {
                                if (responseReset.status === 500) {
                                    window.location.href = '/500/en';
                                } else if (responseReset.status === 429) {
                                    window.location.href = '/429/en';
                                } else if (resultReset.error) {
                                    showErrorPopup(typeof resultReset.error === 'string' ? resultReset.error : resultReset.error[0]);
                                } else {
                                    showErrorPopup('An error occurred. Please try again.');
                                }
                            }
                        } catch (err) {
                            showErrorPopup('Network error: ' + err.message);
                        }

                        hideLoader(resetButton, 'Confirm');
                    });
                } else {
                    if (result.error) {
                        showErrorPopup(typeof result.error === 'string' ? result.error : result.error[0]);
                    } else {
                        showErrorPopup('An error occurred. Please try again.');
                    }
                }
            } catch (err) {
                showErrorPopup('Network error: ' + err.message);
            }

            hideLoader(button, "Request SMS Code");
        });
    }
});
