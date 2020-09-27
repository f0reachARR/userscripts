const CRC32 = require('crc-32');

function uniq(array) {
  const uniquedArray = [];
  for (const elem of array) {
    if (!uniquedArray.includes(elem)) uniquedArray.push(elem);
  }
  return uniquedArray;
}

function getTopicListToggleState(classId) {
  const state = localStorage.getItem(`toggle_topic_${classId}`);
  if (!state) return [];

  return (
    state
      .split(',')
      .filter((n) => n.length > 0)
      .map((n) => Number(n)) || []
  );
}

function updateTopicListToggleState(classId, sectionId, open) {
  const state = getTopicListToggleState(classId);
  const newState = uniq(
    [...state, sectionId].filter((id) => id !== sectionId || open),
  );
  localStorage.setItem(`toggle_topic_${classId}`, newState.join(','));
}

function checkTopicContentHash(classId, sectionId, ...text) {
  const hash = `${CRC32.str(text.join('&'))}`;
  const key = `hash_topic_${classId}_${sectionId}`;

  const equals = localStorage.getItem(key) === hash;
  localStorage.setItem(`hash_topic_${classId}_${sectionId}`, hash);

  return equals;
}

function toggleTopicList() {
  const topics = document.querySelector('.topics');
  if (!topics || topics.classList.contains('expand-topics')) return;
  topics.classList.add('expand-topics');

  const classId = location.search.match(/id=(\d+)/) ? Number(RegExp.$1) : -1;

  const sections = topics.querySelectorAll('li.section.main');
  const openedIndexes = getTopicListToggleState(classId);

  sections.forEach((section, index) => {
    section.style.paddingBottom = 0;

    section.querySelectorAll('div.left.side').forEach((elem) => elem.remove());
    section.querySelectorAll('div.right.side').forEach((elem) => elem.remove());

    const content = section.querySelector('.content');

    const sectionName = content.querySelector('.sectionname > span');
    if (!sectionName) return;

    const summary = document.createElement('summary');
    const newSectionName = document.createElement('b');
    newSectionName.append(sectionName.textContent);
    summary.append(newSectionName);
    sectionName.remove();

    const details = document.createElement('details');
    details.appendChild(summary);
    details.appendChild(content.cloneNode(true));

    if (
      (!content.querySelector('.summary') ||
        content.querySelector('.summary').childNodes.length === 0) &&
      (!content.querySelector('.section') ||
        content.querySelector('.section').childNodes.length === 0)
    ) {
      summary.style.color = '#aaa';
    }

    const contents = [];
    if (content.querySelector('.summary')) {
      contents.push(content.querySelector('.summary').textContent);
    }
    if (content.querySelector('.section')) {
      contents.push(content.querySelector('.section').textContent);
    }

    const equal = checkTopicContentHash(classId, index, ...contents);

    if (!equal) {
      summary.style.textDecoration = 'underline';
    }

    if (openedIndexes.includes(index)) {
      details.open = true;
    }

    details.addEventListener('toggle', () => {
      updateTopicListToggleState(classId, index, details.open);
    });

    content.replaceWith(details);
  });
}

if (location.href.match(/\/course\/view\.php/)) {
  toggleTopicList();
}
