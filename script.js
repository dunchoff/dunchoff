const modal = document.querySelector('#details-modal');
const modalTitle = document.querySelector('#modal-title');
const modalText = document.querySelector('.modal-empty');
const modalImage = document.querySelector('.modal-event-image');
const modalLink = document.querySelector('.modal-go-link');

const eventDescriptions = {
  'Традиційний марафон по Resident Evil': 'Поринаємо в історію однієї з найвідоміших серій у жанрі survival horror! Разом пройдемо повний шлях франшизи: переглянемо всі фільми та анімаційні стрічки, а також зіграємо в основні ігри серії — від класичних частин до сучасних ремейків і найновіших релізів. На нас чекають Раккун-Сіті, віруси, біозброя, знайомі герої та багато напружених моментів. Це буде довга подорож світом Resident Evil — від самого початку й до фіналу.',
  'Vladovorot': 'Інтерактивний стрімерський івент, у якому кожна гра перетворюється на нове випробування. Перед початком кожної катки активується Колесо Фортуни, яке визначає випадкові челенджі. Вони можуть змінювати стиль гри, обмежувати можливості стрімера або створювати кумедні ситуації для глядачів.\n\nОсобливість івенту полягає в тому, що всі випробування виконуються в соло-форматі. Стрімер самостійно контролює виконання правил і приймає рішення у спірних ситуаціях, без участі організаторів чи модераторів.',
  'DunchLand': 'DunchLand — це авторський інтерактивний проєкт для стрімів, який поєднує настільну гру, випадкові події та активну участь глядачів. Кожен стрім перетворюється на нову пригоду, де рішення, удача та взаємодія з чатом впливають на розвиток подій. Учасники проходять через різноманітні випробування, отримують бонуси й штрафи, відкривають нові механіки та створюють унікальну історію разом зі стрімером. DunchLand — це місце, де кожен стрім стає грою.',
  '#ДунІЛДО': 'ДунІЛДО (Дунчоффська Інтерактивна Ліга Досягнень та Отваги) — це серія інтерактивних стрім-івентів, де кожна гра перетворюється на унікальний виклик. Бінго, картки, випадкові події, додаткові правила та активна участь глядачів роблять кожне проходження непередбачуваним і незабутнім.',
};

document.querySelectorAll('[data-open-details]').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.event-card');
    modalTitle.textContent = card.dataset.event;
    modalText.textContent = eventDescriptions[card.dataset.event] || 'Повний опис події буде додано пізніше.';
    const cardImage = card.querySelector('img');
    if (cardImage && modalImage) {
      modalImage.src = cardImage.src;
      modalImage.alt = card.dataset.event;
    }
    if (modalLink) {
      modalLink.href = card.dataset.link || 'https://www.twitch.tv/dunchoff';
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  });
});

document.querySelectorAll('[data-close-details]').forEach((button) => {
  button.addEventListener('click', () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }
});

const eventGrid = document.querySelector('.event-grid');

document.querySelectorAll('[data-slide]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!eventGrid) return;

    const firstCard = eventGrid.querySelector('.event-card');
    const gap = Number.parseFloat(getComputedStyle(eventGrid).columnGap) || 0;
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : eventGrid.clientWidth / 3.5;
    const direction = button.dataset.slide === 'next' ? 1 : -1;

    eventGrid.scrollBy({
      left: step * direction,
      behavior: 'smooth',
    });
  });
});
