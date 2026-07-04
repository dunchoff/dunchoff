'use strict';

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
const activeEffectsText = document.getElementById('active-effects-text');
const downloadEffects = document.getElementById('download-effects');
const connectEffectsFileButton = document.getElementById('connect-effects-file');
const effectsFileStatus = document.getElementById('effects-file-status');
const cellTemplate = document.createElement('div');
const controlDelete = document.createElement('a');
const cellControlsTemplate = document.createElement('div');

let effectsFileHandle = null;

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
    updateActiveEffectsText();
    syncEffectsFile();
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
            selectCell(false);
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
        typeCell.className = 'type ' + (item.type === 'Образ' ? 'type-fun' : 'type-game');
        descCell.textContent = item.desc || 'Опис не заданий.';
        descCell.className = 'desc';

        row.append(iconCell, nameCell, typeCell, descCell);
        tableBody.appendChild(row);
    });
}

function getActiveEffectsText() {
    const activeItems = cells
        .map((cell, index) => ({ index, item: cell.item }))
        .filter(entry => entry.item && entry.item.title && entry.item.title !== items[0].title);

    if (!activeItems.length) {
        return 'Активних ефектів немає.';
    }

    return activeItems
        .map(entry => `${entry.item.title} - ${getShortDescription(entry.item)}`)
        .join('\n');
}

function getShortDescription(item) {
    return (item.desc || 'Опис не заданий.')
        .split('\n')[0]
        .trim();
}

function updateActiveEffectsText() {
    if (!activeEffectsText || !downloadEffects) {
        return;
    }

    const text = getActiveEffectsText();
    activeEffectsText.value = text;

    if (downloadEffects.dataset.url) {
        URL.revokeObjectURL(downloadEffects.dataset.url);
    }

    const blob = new Blob([text + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadEffects.href = url;
    downloadEffects.dataset.url = url;
}

function setEffectsFileStatus(text, state = '') {
    if (!effectsFileStatus) {
        return;
    }

    effectsFileStatus.textContent = text;
    effectsFileStatus.dataset.state = state;
}

function isFileAccessSupported() {
    return 'showSaveFilePicker' in window && 'indexedDB' in window;
}

function openEffectsDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('vladovorot-classic-effects', 1);

        request.onupgradeneeded = () => {
            request.result.createObjectStore('handles');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveEffectsFileHandle(handle) {
    const db = await openEffectsDb();

    await new Promise((resolve, reject) => {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(handle, 'effects-txt');
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });

    db.close();
}

async function loadEffectsFileHandle() {
    const db = await openEffectsDb();
    const handle = await new Promise((resolve, reject) => {
        const tx = db.transaction('handles', 'readonly');
        const request = tx.objectStore('handles').get('effects-txt');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });

    db.close();
    return handle;
}

async function verifyPermission(handle, requestWrite = false) {
    const options = { mode: 'readwrite' };

    if ((await handle.queryPermission(options)) === 'granted') {
        return true;
    }

    if (requestWrite && (await handle.requestPermission(options)) === 'granted') {
        return true;
    }

    return false;
}

async function writeEffectsFile(handle) {
    const writable = await handle.createWritable();
    await writable.write(getActiveEffectsText() + '\n');
    await writable.close();
}

async function syncEffectsFile() {
    if (!effectsFileHandle) {
        return;
    }

    try {
        if (!(await verifyPermission(effectsFileHandle))) {
            setEffectsFileStatus('TXT підключено, але браузер чекає дозвіл на запис.', 'warning');
            return;
        }

        await writeEffectsFile(effectsFileHandle);
        setEffectsFileStatus('TXT оновлено автоматично.', 'ok');
    } catch (error) {
        console.error('Не вдалося оновити TXT файл', error);
        setEffectsFileStatus('Не вдалося оновити TXT файл.', 'error');
    }
}

async function connectEffectsFile() {
    if (!isFileAccessSupported()) {
        setEffectsFileStatus('Браузер не підтримує прямий запис у TXT. Використай Chrome/Edge або кнопку завантаження.', 'error');
        return;
    }

    try {
        effectsFileHandle = await window.showSaveFilePicker({
            suggestedName: 'vladovorot-classic-effects.txt',
            types: [{
                description: 'Text file',
                accept: { 'text/plain': ['.txt'] },
            }],
        });

        if (!(await verifyPermission(effectsFileHandle, true))) {
            setEffectsFileStatus('Немає дозволу на запис у TXT.', 'error');
            return;
        }

        await saveEffectsFileHandle(effectsFileHandle);
        await writeEffectsFile(effectsFileHandle);
        setEffectsFileStatus('TXT підключено й оновлено.', 'ok');
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Не вдалося підключити TXT файл', error);
            setEffectsFileStatus('Не вдалося підключити TXT файл.', 'error');
        }
    }
}

async function restoreEffectsFileConnection() {
    if (!isFileAccessSupported()) {
        setEffectsFileStatus('Прямий запис у TXT недоступний у цьому браузері.', 'error');
        return;
    }

    try {
        effectsFileHandle = await loadEffectsFileHandle();

        if (!effectsFileHandle) {
            setEffectsFileStatus('TXT файл не підключено.', '');
            return;
        }

        if (await verifyPermission(effectsFileHandle)) {
            await syncEffectsFile();
        } else {
            setEffectsFileStatus('TXT знайдено. Натисни “Підключити TXT”, щоб знову дозволити запис.', 'warning');
        }
    } catch (error) {
        console.error('Не вдалося відновити TXT файл', error);
        setEffectsFileStatus('Не вдалося відновити підключений TXT.', 'error');
    }
}

connectEffectsFileButton?.addEventListener('click', connectEffectsFile);

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
updateActiveEffectsText();
restoreEffectsFileConnection();
