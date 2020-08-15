'use strict'      

let waiterList;

const renderWaiterList = () => {
    const data = waiterList;
    $personal.innerHTML = '';
    for (let key in data) {
        const $option = document.createElement('option');
        $option.dataset.id = key;
        $option.setAttribute('id', key);
        $option.setAttribute('value', data[key].ID);
        $option.textContent = data[key].Code;
        $personal.appendChild($option);
    };
}

const getWaiterList = () => {
    const login = btoa('Wilde:1024')
    
    fetch('http://localhost:4000/',{
        method: "POST",
        headers: {
            "Content-Type" : "applicaton/json",
            "Login" : login
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log(data, 'dada')
        waiterList = data;        
    })
    // console.log(waiterList)
};

const init = () => {
    getWaiterList();
}

const $personal = document.querySelector('#personal');
$personal.addEventListener('focus', (e) => {
    console.log(e)
    renderWaiterList();
})
$personal.addEventListener('change', (e) => {
    console.log(e.target.tagName)
})


module.exports = {
    getWaiterList: getWaiterList(),
    renderWaiterList: renderWaiterList(),
    init: init(),

}