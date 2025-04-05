let switchCtn = document.querySelector("#switch-cnt");
let switchC1 = document.querySelector("#switch-c1");
let switchC2 = document.querySelector("#switch-c2");
let switchCircle = document.querySelectorAll(".switch__circle");
let switchBtn = document.querySelectorAll(".switch-btn");
let aContainer = document.querySelector("#a-container");
let bContainer = document.querySelector("#b-container");
let allButtons = document.querySelectorAll(".submit");

let getButtons = (e) => e.preventDefault()

let changeForm = (e) => {

    switchCtn.classList.add("is-gx");
    setTimeout(function () {
        switchCtn.classList.remove("is-gx");
    }, 1500)

    switchCtn.classList.toggle("is-txr");
    switchCircle[0].classList.toggle("is-txr");
    switchCircle[1].classList.toggle("is-txr");

    switchC1.classList.toggle("is-hidden");
    switchC2.classList.toggle("is-hidden");
    aContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-z200");
}

let mainF = (e) => {
    for (var i = 0; i < allButtons.length; i++)
        allButtons[i].addEventListener("click", getButtons);
    for (var i = 0; i < switchBtn.length; i++)
        switchBtn[i].addEventListener("click", changeForm)
}

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

document.getElementById('register_button').addEventListener('click', async function (e) {
    e.preventDefault();
    const button = this;
    showLoader(button);

    const inputs = button.closest('form').querySelectorAll('input');
    const data = {
        name: inputs[0].value,
        email: inputs[1].value,
        password: inputs[2].value,
        phoneNumber: inputs[3].value
    };

    try {
        // const response = await fetch('http://localhost:8000/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        const response = await fetch('https://mbus.onrender.com/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.token) {
            localStorage.setItem('token', result.token);
            window.location.href = '/frontend/index.html';
        } else {
            if (result.error && result.error.length > 0) {
                showErrorPopup(result.error[0]);
            } else {
                showErrorPopup(result.error || 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
            }
        }
    } catch (err) {
        showErrorPopup('Tarmoq xatosi: ' + err.message);
    }

    hideLoader(button, "RO'YXATDAN O'TISH");
});

// LOGIN button
document.getElementById('login_buttton').addEventListener('click', async function (e) {
    e.preventDefault();
    const button = this;
    showLoader(button);

    const inputs = button.closest('form').querySelectorAll('input');
    const data = {
        email: inputs[0].value,
        password: inputs[1].value
    };

    try {
        // const response = await fetch('http://localhost:8000/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        const response = await fetch('https://mbus.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.token) {
            localStorage.setItem('token', result.token);
            window.location.href = '/frontend/index.html';
        } else {
            alert(result.message || 'Login muvaffaqiyatsiz');
        }
    } catch (err) {
        alert('Tarmoq xatosi!');
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