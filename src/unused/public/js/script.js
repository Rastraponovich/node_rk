'use strict'      
const URL = 'http://10.3.0.242:4000'
const $personal = document.querySelector('#personal');
const $message = document.querySelector('#message');
const $submitButton = document.querySelector('#submit__button');
const $statusText = document.querySelector('#statusText');

let waiterList;

const getWaiterList = () => {
    fetch(`${URL}/getWaiters`)
    .then(res => res.json())
    .then(data => {
        waiterList = data;        
    });
};

const renderWaiterList = () => {
    const data = waiterList;
    $personal.innerHTML = '';

    if (data) {
        for (let key in data) {
            const $option = document.createElement('option');
            $option.dataset.id = key;
            $option.setAttribute('id', key);
            $option.setAttribute('value', data[key].ID);
            $option.classList.add('select__option');
            $option.innerHTML = `<span class="select__item">(${data[key].Code})</span><span class="select__item">${data[key].Name}</span>`;
            $personal.appendChild($option);
        };
    };
};


$personal.addEventListener('focus', (e) => {
    renderWaiterList();
});

$personal.addEventListener('click', (e) => {
    renderWaiterList();
});

$submitButton.addEventListener('click', (e) => {
    const message = $message.value;
    const personal = $personal.value;
    const result = { message, personal }

    fetch(`${URL}/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(result)
    })
    .then(res => res.json())
    .then(data => {

        $statusText.innerHTML = '';

        if(!data.error) {
            $statusText.classList.toggle('success');
            $statusText.textContent = 'Сообщение отправлено';
            setTimeout(() => {
                if( statusText.classList.contains('success')) {
                    $statusText.classList.toggle('success');
                }
                }, 3000);
        } else {
            $statusText.classList.toggle('error');
            $statusText.textContent = 'Ошибка';
            setTimeout(() => {
                if( statusText.classList.contains('error')) {
                    $statusText.classList.toggle('error');
                }
                }, 3000);
        }
    })
    event.preventDefault();
});

const init = () => {
    getWaiterList();
}

init();
