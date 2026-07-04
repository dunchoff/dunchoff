/*
 * Based on https://github.com/shtrih/open-hpg-2-inventory/tree/gh-pages/wheel
 * Local data/images/videos are from this folder.
 */

const wheelItems = (window.WHEEL_ITEMS || []).map(item => ({
    title: item.name || item.title || '',
    desc: item.desc || item.description || '',
    img: item.img || item.image || 'default.png',
    type: item.type || getChallengeType(item.name || item.title || ''),
}));

const penaltyChallengeTitles = [
    'Murloc Cosplay',
    'Chicken Board',
    'ASMR Mode',
    'Karaoke Turn',
    'Pickle Mode',
    'Shout Mode',
    'Wrong Hand',
    'Slow Motion',
    'Roleplay',
    'One Emote Rule',
];

const dataSets = {
    fortune: wheelItems.map(item => item.title),
    penalty: penaltyChallengeTitles.filter(title => wheelItems.some(item => item.title === title)),
};

const itemByTitle = new Map(wheelItems.map(item => [item.title, item]));

let currentDataSet = 'fortune',
    editedDataSets = {};

const editDialog = document.getElementById('dialog-edit'),
    editButton = document.getElementById('btn-edit'),
    editConfirmButton = editDialog.getElementsByClassName('apply')[0],
    editOptions = editDialog.getElementsByClassName('options')[0],
    editPresets = editDialog.getElementsByClassName('presets')[0],
    optionClick = function (option, checked) {
        editedDataSets[currentDataSet][option] = checked;
    },
    generateOptions = function (dataObject) {
        let options = '';
        for (let i in dataObject) {
            options += '<label><input type="checkbox" onchange="optionClick('
                + JSON.stringify(i).replace(/"/g, '&quot;')
                + ', this.checked)" '
                + (dataObject[i] ? 'checked' : '')
                + ' />'
                + escapeHtml(i)
                + '</label><br />';
        }

        return options;
    },
    resetEditedDataSet = function () {
        editedDataSets[currentDataSet] = Object.fromEntries(dataSets[currentDataSet].map(v => v).sort().map(v => [v, true]));
    },
    editedDataToArray = function () {
        let result = [];

        for (let [key, value] of Object.entries(editedDataSets[currentDataSet])) {
            if (value) {
                result.push(key);
            }
        }

        return result;
    };

window.optionClick = optionClick;

fillImageGrid(dataSets[currentDataSet]);

editButton.addEventListener('click', function () {
    editDialog.style.display = 'block';
    p5Instance.mouseDragEnable(false);

    editPresets.innerHTML = '';
    editOptions.innerHTML = generateOptions(editedDataSets[currentDataSet]);
});

editConfirmButton.addEventListener('click', function () {
    editDialog.style.display = 'none';
    p5Instance.mouseDragEnable();
    const selectedData = editedDataToArray();
    p5Instance.setData(selectedData);
    fillImageGrid(selectedData);
});

function getImageURI(title) {
    const item = itemByTitle.get(title);
    return item ? 'images/' + item.img : 'images/default.png';
}

const p5Instance = new p5(wheelSketch);

const image = document.querySelector('#item-image img');
const itemType = document.getElementById('item-type');
const itemTitle = document.getElementById('item-title');
const itemDesc = document.getElementById('item-desc');
p5Instance.onSelectItem = function(data, selectedKey) {
    const title = data[selectedKey] || data[0];
    const item = itemByTitle.get(title);

    image.src = getImageURI(title);
    image.title = (item && item.desc) || title || '';
    itemType.textContent = (item && item.type) || 'Ігровий';
    itemTitle.textContent = title || getCurrentWheelLabel();
    itemDesc.textContent = (item && item.desc) || 'Опис для цього пункту не заданий.';
};

const customDialog = document.getElementById('custom-list'),
    customTextarea = customDialog.getElementsByTagName('textarea')[0],
    customButton = customDialog.getElementsByTagName('button')[0];

customButton.addEventListener('click', function () {
    customDialog.style.display = 'none';
    p5Instance.setData(customTextarea.value.split('\n'));
    p5Instance.mouseDragEnable();
});

let radios = document.querySelectorAll('[name="list"]');
for(let i = 0; i < radios.length; i++) {
    radios[i].addEventListener('click', function () {
        currentDataSet = this.value;

        customDialog.style.display = 'none';
        p5Instance.mouseDragEnable();

        if (!editedDataSets[currentDataSet]) {
            resetEditedDataSet();
        }

        const selectedData = editedDataToArray();
        p5Instance.setData(selectedData);
        fillImageGrid(selectedData);
        editButton.removeAttribute('disabled');
    });

    if (radios[i].hasAttribute('checked')) {
        radios[i].dispatchEvent(new Event('click'));
    }
}

function fillImageGrid(titles) {
    const grid = document.getElementById('image-grid');
    const visibleItems = (titles || dataSets[currentDataSet])
        .map(title => itemByTitle.get(title))
        .filter(Boolean);
    const sourceItems = visibleItems.length ? visibleItems : wheelItems;
    const repeatedItems = [];

    while (repeatedItems.length < 180) {
        repeatedItems.push(...sourceItems);
    }

    grid.innerHTML = shuffleArray(repeatedItems.slice(0, 180)).map(item => (
        '<li class="image-grid-item-container"><img class="image-grid-item" src="images/'
        + item.img
        + '" alt="" loading="lazy"></li>'
    )).join('');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
    }[char]));
}

function getCurrentWheelLabel() {
    return currentDataSet === 'penalty' ? 'Штрафне колесо' : 'Колесо Фортуни';
}

function getChallengeType(title) {
    const funChallenges = new Set([
        'One Emote Rule',
        'ASMR Mode',
        'Chicken Board',
        'Karaoke Turn',
        'Shout Mode',
        'Murloc Cosplay',
        'Wrong Hand',
        'Stand Up Gamer',
        'Slow Motion',
        'Roleplay',
        'Pickle Mode',
        'Chat Control',
    ]);

    return funChallenges.has(title) ? 'Фановий' : 'Ігровий';
}

const mobileControlsToggle = document.getElementById('mobile-controls-toggle');

if (mobileControlsToggle) {
    mobileControlsToggle.addEventListener('click', function () {
        const isOpen = document.body.classList.toggle('controls-open');
        mobileControlsToggle.setAttribute('aria-expanded', String(isOpen));
    });
}
