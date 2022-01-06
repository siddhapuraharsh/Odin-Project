const body = document.body;
const searchInput = document.querySelector('.search-box__input');
const searchIcon = document.querySelector('.search-box__icon');
const weatherIcon = document.querySelector('.main__img');
const overlay = document.querySelector('.start-overlay');
const mainSection = document.querySelector('.main');

const city = document.querySelector('.location__city');
const country = document.querySelector('.location__country');

const info = document.querySelectorAll('.info-box > p');
const [infoDate, infoMain, infoTemp, infoDesc] = info;

const params = document.querySelectorAll('.parameter__data');
const [infoWind, infoHum] = params;

const lastSearchesBox = document.querySelector('.last-searches');
const lastSearchesList = document.querySelector('.last-searches__list');

const lastSearchesArr = [];

async function getData(location) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=eb0308ac37205e4215288756bee1d255`;
        const response = await fetch(url, {mode: 'cors'});
        const data = await response.json();
        const processedData = processData(data);
        displayData(processedData);
        updateStorage(processedData);
        renderLastSearches();
        resetInput(searchInput);
    } catch (error) {
        console.error('Fetching error ->', error);
    }
}

function processData(data) {
    const object = {
        city: data.name,
        country: data.sys.country,
        date: data.dt,
        temp: data.main.temp,
        weather: data.weather[0],
        wind: data.wind.speed,
        humidity: data.main.humidity,
    };
    object.weather.id = (data.weather[0].main === 'Clear' ? 9 : parseInt((data.weather[0].id).toString().split('')[0]));
    return object;
}

function updateStorage(weatherData) {
    if (lastSearchesArr.length < 5) {
        lastSearchesArr.unshift(weatherData);
    } else {
        lastSearchesArr.unshift(weatherData);
        lastSearchesArr.splice(-1, 1);
    }
    localStorage.setItem('lastSearches', JSON.stringify(lastSearchesArr));
}

function renderLastSearches() {
    lastSearchesBox.style.display = 'block';
    lastSearchesList.innerHTML = '';
    lastSearchesArr.forEach((item, index) => {
        const search = document.createElement('li');
        search.setAttribute('data-index', index);
        search.setAttribute('class', 'last-searches__list-item');
        search.innerHTML = `${item.city}<span class="last-searches__list-item--country">, ${item.country}</span>`;
        lastSearchesList.appendChild(search);
    });
}
 
function resetInput(input) {
    input.value = '';
    input.blur();
}

function changeUI(gradient, iconSrc) {
    body.style.background = gradient;
    weatherIcon.src = iconSrc;
}

function displayData(weatherData) {
    console.log('displayDataObject: ', weatherData);

    switch (weatherData.weather.id) {
        // Clear
        case 9:
            changeUI('linear-gradient(230.01deg, #FEE140 -2.24%, #FA709A 160.22%)', './imgs/clear_icon.svg');
            break;
        // Clouds
        case 8:
            changeUI('linear-gradient(225.89deg, #28E2CE -2.1%, #26ADA0 143.49%)', './imgs/clouds_icon.svg');
            break;
        // Atmosphere
        case 7:
            changeUI('linear-gradient(215.75deg, #97D9E1 9.92%, #D9AFD9 98.51%)', './imgs/atmo_icon.svg');
            break;
        // Snow
        case 6:
            changeUI('linear-gradient(215.75deg, #EEF1F5 9.92%, #E6E9F0 85.13%)', './imgs/snow_icon.svg');
            break;
        // Rain
        case 5:
        // Drizzle
        case 3:
            changeUI('linear-gradient(224.56deg, #48C6EF -2.05%, #6F86D6 127.4%)', './imgs/rain_icon.svg');
            break;
        // Thunderstorm
        case 2:
            changeUI('linear-gradient(215.75deg, #BAC8E0 9.93%, #6A85B6 98.51%)', './imgs/storm_icon.svg');
            break;
    }

    const days = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    infoDate.textContent = `${days[currentDate.getDay() - 1]}, ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;

    city.textContent = weatherData.city;
    country.textContent = weatherData.country;
    infoMain.textContent = weatherData.weather.main;
    infoTemp.textContent = `${Math.round(weatherData.temp)} °C`;
    infoDesc.textContent = (weatherData.weather.description).charAt(0).toUpperCase() + (weatherData.weather.description).slice(1);
    infoWind.textContent = `${Math.round(weatherData.wind)} km/h`;
    infoHum.textContent = `${weatherData.humidity}%`;

    overlay.style.display = 'none';
    mainSection.style.display = 'flex';
}

function inputSubmit(e) {
    e.preventDefault();
    getData(searchInput.value);
}

lastSearchesListObserver = new MutationObserver(() => {
    const lastSearchesItems = document.querySelectorAll('.last-searches__list-item');

    lastSearchesItems.forEach(item => item.addEventListener('click', () => {
        getData(item.textContent);
    }));
});

lastSearchesListObserver.observe(lastSearchesList, { childList: true });

searchIcon.addEventListener('click', inputSubmit);
searchInput.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
        inputSubmit(e);
    }
});