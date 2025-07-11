// Конфиг
const config = {
    API_URL: 'https://api.exchangerate-api.com/v4/latest/',
    CURRENCIES: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'RUB', 'UAH'],
    DEFAULT_FROM: 'USD',
    DEFAULT_TO: 'RUB'
};

// Инициализация приложения
function initCurrencyConverter() {
    // Кэш для хранения курсов валют
    let exchangeRates = {};
    let lastUpdated = null;

    // DOM элементы
    const elements = {
        amount: document.getElementById('amount'),
        fromCurrency: document.getElementById('from-currency'),
        toCurrency: document.getElementById('to-currency'),
        result: document.getElementById('result'),
        rateInfo: document.getElementById('rate-info'),
        lastUpdated: document.getElementById('last-updated'),
        swapBtn: document.getElementById('swap-btn'),
        convertBtn: document.getElementById('convert-btn')
    };

    function init() {
        populateCurrencies();
        setDefaultCurrencies();
        loadExchangeRates();
        setupEventListeners();
    }

    function populateCurrencies() {
        config.CURRENCIES.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            elements.fromCurrency.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = currency;
            elements.toCurrency.appendChild(option2);
        });
    }

    function setDefaultCurrencies() {
        elements.fromCurrency.value = config.DEFAULT_FROM;
        elements.toCurrency.value = config.DEFAULT_TO;
    }

    function loadExchangeRates() {
        const fromCurrency = elements.fromCurrency.value;
        
        fetch(`${config.API_URL}${fromCurrency}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                exchangeRates = data.rates;
                lastUpdated = new Date(data.date);
                updateUI();
            })
            .catch(error => {
                console.error('Error fetching exchange rates:', error);
                showError('Ошибка загрузки курсов. Пожалуйста, попробуйте позже.');
            });
    }

    // Конвертация валют
    function convertCurrency() {
        const amount = parseFloat(elements.amount.value);
        const fromCurrency = elements.fromCurrency.value;
        const toCurrency = elements.toCurrency.value;

        if (isNaN(amount) || amount < 0) {
            elements.result.textContent = 'Введите корректную сумму';
            return;
        }

        if (fromCurrency === toCurrency) {
            elements.result.textContent = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
            return;
        }

        if (!exchangeRates[toCurrency]) {
            showError('Курс для выбранной валюты не доступен');
            return;
        }

        const rate = exchangeRates[toCurrency];
        const convertedAmount = (amount * rate).toFixed(2);
        elements.result.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
        animateResult();
    }

    function swapCurrencies() {
        const temp = elements.fromCurrency.value;
        elements.fromCurrency.value = elements.toCurrency.value;
        elements.toCurrency.value = temp;
        loadExchangeRates();
        animateSwapButton();
    }

    function updateUI() {
        const fromCurrency = elements.fromCurrency.value;
        const toCurrency = elements.toCurrency.value;
        
        if (fromCurrency === toCurrency) {
            elements.rateInfo.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
            elements.result.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
            elements.lastUpdated.textContent = '';
            return;
        }

        if (exchangeRates[toCurrency]) {
            const rate = exchangeRates[toCurrency];
            elements.rateInfo.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
            elements.lastUpdated.textContent = `Обновлено: ${lastUpdated.toLocaleString()}`;
            convertCurrency();
        }
    }

    function setupEventListeners() {
        elements.amount.addEventListener('input', convertCurrency);
        elements.fromCurrency.addEventListener('change', loadExchangeRates);
        elements.toCurrency.addEventListener('change', updateUI);
        elements.swapBtn.addEventListener('click', swapCurrencies);
        elements.convertBtn.addEventListener('click', convertCurrency);
    }

    function animateResult() {
        elements.result.style.transform = 'scale(1.05)';
        setTimeout(() => {
            elements.result.style.transform = 'scale(1)';
        }, 200);
    }

    function animateSwapButton() {
        elements.swapBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            elements.swapBtn.style.transform = 'rotate(0)';
        }, 300);
    }

    function showError(message) {
        elements.rateInfo.textContent = message;
        elements.rateInfo.style.color = '#e74c3c';
        setTimeout(() => {
            elements.rateInfo.style.color = '';
        }, 3000);
    }

    init();
}

document.addEventListener('DOMContentLoaded', initCurrencyConverter);
