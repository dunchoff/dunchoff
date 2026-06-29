'use strict';

const loginForm = document.getElementById('login-form');
const loginNameInput = document.getElementById('login-name');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const authKey = 'vladovorot-effects-auth';

function unlockEffectsPage() {
    document.body.classList.remove('locked');
}

if (sessionStorage.getItem(authKey) === '1') {
    unlockEffectsPage();
}

if (loginForm && loginNameInput && loginPasswordInput && loginError) {
    loginNameInput.focus();

    loginForm.addEventListener('submit', event => {
        event.preventDefault();

        if (loginNameInput.value === 'dunchoff' && loginPasswordInput.value === 'vladovorot7890') {
            sessionStorage.setItem(authKey, '1');
            loginError.textContent = '';
            unlockEffectsPage();
            return;
        }

        loginError.textContent = 'Неправильний логін або пароль';
        loginPasswordInput.select();
    });
}

const items = [
    {
        img: '../images/default.png',
        title: 'Порожня комірка',
        type: 'Порожньо',
        desc: 'Комірка без активної категорії.',
    },
    ...(window.WHEEL_ITEMS || []).map(item => ({
        img: '../images/' + item.img,
        title: item.name || item.title || '',
        type: item.type || 'Ігровий',
        desc: item.desc || '',
    })),
];

let cells = [];
let cellsMargin = -14;
let selectedCellKey = false;

const inventory = document.querySelector('.inventory');
const selector = document.querySelector('.selector');
const selectorList = selector.querySelector('ul');
const addCellButton = document.querySelector('.add-cell');
const marginInput = document.getElementById('cell-left-margin');
const tableBody = document.getElementById('effects-table-body');
const cellTemplate = document.createElement('div');
const controlDelete = document.createElement('a');
const cellControlsTemplate = document.createElement('div');

cellTemplate.className = 'cell-wrap';
cellTemplate.innerHTML = '<div class="cell"><img alt=""></div>';

controlDelete.textContent = '×';
controlDelete.title = 'Очистити комірку';
controlDelete.className = 'remove';
controlDelete.href = '#';

cellControlsTemplate.className = 'controls';
cellControlsTemplate.appendChild(controlDelete);

function getStorageKeySuffix() {
    return location.search.substring(1, 20);
}

function saveState() {
    localStorage.setItem('effects-' + getStorageKeySuffix(), JSON.stringify({
        cells,
        cellsMargin,
    }));
}

function loadState() {
    let data = null;

    try {
        data = JSON.parse(localStorage.getItem('effects-' + getStorageKeySuffix()));
    } catch (error) {
        console.error('Не вдалося завантажити ефекти', error);
    }

    if (!data || !Array.isArray(data.cells)) {
        data = {
            cellsMargin: -14,
            cells: [{}],
        };
    }

    cells = data.cells;
    cellsMargin = data.cellsMargin;
}

function setCellMargin(number) {
    cellsMargin = number;
    document.documentElement.style.setProperty('--cell-margin-left', number + 'px');
}

function selectCell(key) {
    selectedCellKey = key;

    inventory.querySelectorAll('.cell').forEach(cell => cell.classList.remove('active'));

    if (typeof key === 'number') {
        inventory.querySelectorAll('.cell')[key]?.classList.add('active');
    }
}

function cellUpdateDOM(key) {
    const cellData = cells[key] || {};
    const item = cellData.item || items[0];
    const cell = inventory.querySelectorAll('.cell')[key];

    if (!cell) {
        return;
    }

    const img = cell.querySelector('img');
    img.src = item.img;
    img.title = item.title + (item.desc ? '\n' + item.desc : '');
    img.alt = item.title;
    cell.dataset.type = item.type;
}

function addCell(triggerClick = false) {
    const newCell = cellTemplate.cloneNode(true);
    inventory.appendChild(newCell);

    newCell.addEventListener('click', cellOnClick);
    newCell.addEventListener('mouseenter', cellOnHover);
    newCell.addEventListener('mouseleave', () => {
        newCell.querySelector('.controls')?.remove();
    });

    const index = inventory.querySelectorAll('.cell-wrap').length - 1;
    cellUpdateDOM(index);

    if (triggerClick) {
        newCell.click();
    }
}

function cellOnClick() {
    const currentIndex = Array.from(inventory.querySelectorAll('.cell-wrap')).indexOf(this);

    if (selector.style.display === 'block') {
        if (selectedCellKey === currentIndex) {
            selector.style.display = 'none';
            selectCell(false);
        } else {
            selectCell(currentIndex);
        }
    } else {
        selector.style.display = 'block';
        selectCell(currentIndex);
    }
}

function addCellOnClick() {
    cells.push({});
    addCell(true);
    saveState();
}

function cellOnHover() {
    if (!this.querySelector('.controls')) {
        const controls = cellControlsTemplate.cloneNode(true);
        controls.querySelector('.remove').addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            const cellWrap = event.target.closest('.cell-wrap');
            const index = Array.from(inventory.querySelectorAll('.cell-wrap')).indexOf(cellWrap);
            cells.splice(index, 1);
            cellWrap.remove();
            saveState();
        });
        this.querySelector('.cell').appendChild(controls);
    }
}

function selectorOnClick() {
    const itemKey = Number(this.dataset.key);

    cells[selectedCellKey] = {
        item: items[itemKey],
    };

    cellUpdateDOM(selectedCellKey);
    saveState();
    selectCell(false);
    selector.style.display = 'none';
}

function createCells(cellsArray) {
    for (let i = 0; i < cellsArray.length; i++) {
        addCell();
    }
}

function createSelector(listItems) {
    selectorList.innerHTML = '';

    listItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.dataset.key = index;
        li.title = item.title + (item.desc ? '\n' + item.desc : '');
        li.addEventListener('click', selectorOnClick);

        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.title;
        li.appendChild(img);

        selectorList.appendChild(li);
    });
}

function renderEffectsTable() {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = '';

    items.slice(1).forEach(item => {
        const row = document.createElement('tr');
        const iconCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const typeCell = document.createElement('td');
        const descCell = document.createElement('td');
        const img = document.createElement('img');

        img.src = item.img;
        img.alt = item.title;
        iconCell.appendChild(img);

        nameCell.textContent = item.title;
        typeCell.textContent = item.type;
        typeCell.className = 'type ' + (item.type === 'Фановий' ? 'type-fun' : 'type-game');
        descCell.textContent = item.desc || 'Опис не заданий.';
        descCell.className = 'desc';

        row.append(iconCell, nameCell, typeCell, descCell);
        tableBody.appendChild(row);
    });
}

addCellButton.addEventListener('click', addCellOnClick);

marginInput.addEventListener('change', function () {
    setCellMargin(this.value);
    saveState();
});

loadState();
setCellMargin(cellsMargin);
marginInput.value = cellsMargin;
createCells(cells);
createSelector(items);
renderEffectsTable();
