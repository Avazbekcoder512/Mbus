const form = document.getElementById('ticket-search')

let today = new Date();

let minDate = today.toISOString().split("T")[0];

document.getElementById("departure_date").setAttribute("min", minDate);

form.addEventListener('submit', function (event) {
    event.preventDefault()

    const from = document.getElementById('from').value
    const to = document.getElementById('to').value
    const departure_date = document.getElementById('departure_date').value

    const queryString = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&departure_date=${encodeURIComponent(departure_date)}`

    const url = `http://localhost:8000/findroute?${queryString}`

    fetch(url)
        .then(response => response.json())
        .then(responseData => {
            console.log('Javob:', responseData);

            const dataDiv = document.getElementById('Data')

            const info = `
            <p><strong>Qayerdan</strong> ${responseData.data.from}</p>
            <p><strong>Qayerga</strong> ${responseData.data.to}</p>
            <p><strong>Qachon</strong> ${responseData.trips}</p>
        `
            dataDiv.innerHTML = info
        })
        .catch(error => {
            console.log('Xatoli:', error);
        })
})