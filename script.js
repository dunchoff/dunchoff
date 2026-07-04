const modal = document.querySelector('#details-modal');
const modalTitle = document.querySelector('#modal-title');
const modalText = document.querySelector('.modal-empty');
const modalImage = document.querySelector('.modal-event-image');
const modalLink = document.querySelector('.modal-go-link');
const eventGrid = document.querySelector('.event-grid');

const SUPABASE_URL = 'https://ghrcqivsjcoggoqugkqd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AiKDSajkULgsPSod0etN5w_1kMcyeDE';
const EVENTS_TABLE = 'site_events';

const eventDescriptions = {
  "Двоє, не рахуючи dunchoff'a": "«Двоє, не рахуючи dunchoff'a» — тематичний мініівент, присвячений двом культовим пригодницьким серіям:\n\nIndiana Jones and the Great Circle\nUNCHARTED™: Legacy of Thieves Collection\n\nПопереду — загублені храми, стародавні артефакти, небезпечні пастки, погоні, перестрілки, головоломки та багато моментів, коли один неправильний крок може перевернути всю експедицію.\n\nГотуйся до великої пригоди. Скарби самі себе не знайдуть.",
  'Традиційний марафон по Resident Evil': 'Поринаємо в історію однієї з найвідоміших серій у жанрі survival horror! Разом пройдемо повний шлях франшизи: переглянемо всі фільми та анімаційні стрічки, а також зіграємо в основні ігри серії — від класичних частин до сучасних ремейків і найновіших релізів. На нас чекають Раккун-Сіті, віруси, біозброя, знайомі герої та багато напружених моментів. Це буде довга подорож світом Resident Evil — від самого початку й до фіналу.',
  'Vladovorot': 'Інтерактивний стрімерський івент, у якому кожна гра перетворюється на нове випробування. Перед початком кожної катки активується Колесо Фортуни, яке визначає випадкові челенджі. Вони можуть змінювати стиль гри, обмежувати можливості стрімера або створювати кумедні ситуації для глядачів.\n\nОсобливість івенту полягає в тому, що всі випробування виконуються в соло-форматі. Стрімер самостійно контролює виконання правил і приймає рішення у спірних ситуаціях, без участі організаторів чи модераторів.',
  'VLADOVOROT CLASSIC': 'VLADOVOROT CLASSIC — інтерактивний стрімерський івент для класичного режиму Hearthstone, де кожна гра проходить за новими правилами. Перед початком кожної партії активується Колесо Фортуни, яке визначає випадкові челенджі. Вони змінюють стиль гри, обмежують окремі механіки, впливають на прийняття рішень або додають розважальні завдання для стрімера.\n\nОсобливість VLADOVOROT CLASSIC — поєднання класичного Hearthstone з непередбачуваними правилами. Кожен матч стає унікальним випробуванням, де перемога залежить не лише від колоди, а й від уміння адаптуватися до нових умов. Усі челенджі виконуються в соло-форматі, а стрімер самостійно контролює дотримання правил і приймає рішення у спірних ситуаціях.',
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
      modalLink.href = card.dataset.link || '#';
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

loadSupabaseEvents();

async function loadSupabaseEvents() {
  if (!eventGrid) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${EVENTS_TABLE}?is_active=eq.true&select=title,summary,description,image_url,link_url,sort_order&order=sort_order.asc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) return;

    const events = await response.json();
    if (!Array.isArray(events) || events.length === 0) return;

    eventGrid.innerHTML = events.map(renderEventCard).join('');
    bindDynamicEventDetails();
  } catch (error) {
    console.warn('Supabase events load failed', error);
  }
}

function bindDynamicEventDetails() {
  document.querySelectorAll('[data-open-details]').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.event-card');
      modalTitle.textContent = card.dataset.event;
      modalText.textContent = card.dataset.description || eventDescriptions[card.dataset.event] || 'Event details will be added later.';

      const cardImage = card.querySelector('img');
      if (cardImage && modalImage) {
        modalImage.src = cardImage.src;
        modalImage.alt = card.dataset.event;
      }
      if (modalLink) {
        modalLink.href = card.dataset.link || '#';
      }

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });
}

function renderEventCard(event) {
  const title = event.title || 'Event';
  const summary = event.summary || '';
  const description = event.description || summary;
  const imageUrl = event.image_url || 'assets/images/events/dunchland.png';
  const linkUrl = event.link_url || '#';

  return `
    <article class="event-card" data-event="${escapeHtml(title)}" data-description="${escapeHtml(description)}" data-link="${escapeHtml(linkUrl)}">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" />
      <div class="event-content">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(summary)}</p>
        <div class="event-card-actions">
          <button class="event-menu-button" type="button" data-open-details aria-label="Details ${escapeHtml(title)}">...</button>
          <a class="event-link-button" href="${escapeHtml(linkUrl)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(title)}">
            <img src="assets/icons/external-link.svg" alt="" />
          </a>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}
