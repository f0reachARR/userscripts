/* crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/*exported CRC32 */
var CRC32;
(function (factory) {
  /*jshint ignore:start */
  /*eslint-disable */
  if (typeof DO_NOT_EXPORT_CRC === 'undefined') {
    if ('object' === typeof exports) {
      factory(exports);
    } else if ('function' === typeof define && define.amd) {
      define(function () {
        var module = {};
        factory(module);
        return module;
      });
    } else {
      factory((CRC32 = {}));
    }
  } else {
    factory((CRC32 = {}));
  }
  /*eslint-enable */
  /*jshint ignore:end */
})(function (CRC32) {
  CRC32.version = '1.2.0';
  /* see perf/crc32table.js */
  /*global Int32Array */
  function signed_crc_table() {
    var c = 0,
      table = new Array(256);

    for (var n = 0; n != 256; ++n) {
      c = n;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      c = c & 1 ? -306674912 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }

    return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
  }

  var T = signed_crc_table();
  function crc32_bstr(bstr, seed) {
    var C = seed ^ -1,
      L = bstr.length - 1;
    for (var i = 0; i < L; ) {
      C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xff];
      C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xff];
    }
    if (i === L) C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i)) & 0xff];
    return C ^ -1;
  }

  function crc32_buf(buf, seed) {
    if (buf.length > 10000) return crc32_buf_8(buf, seed);
    var C = seed ^ -1,
      L = buf.length - 3;
    for (var i = 0; i < L; ) {
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
    }
    while (i < L + 3) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
    return C ^ -1;
  }

  function crc32_buf_8(buf, seed) {
    var C = seed ^ -1,
      L = buf.length - 7;
    for (var i = 0; i < L; ) {
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
      C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
    }
    while (i < L + 7) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xff];
    return C ^ -1;
  }

  function crc32_str(str, seed) {
    var C = seed ^ -1;
    for (var i = 0, L = str.length, c, d; i < L; ) {
      c = str.charCodeAt(i++);
      if (c < 0x80) {
        C = (C >>> 8) ^ T[(C ^ c) & 0xff];
      } else if (c < 0x800) {
        C = (C >>> 8) ^ T[(C ^ (192 | ((c >> 6) & 31))) & 0xff];
        C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xff];
      } else if (c >= 0xd800 && c < 0xe000) {
        c = (c & 1023) + 64;
        d = str.charCodeAt(i++) & 1023;
        C = (C >>> 8) ^ T[(C ^ (240 | ((c >> 8) & 7))) & 0xff];
        C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 2) & 63))) & 0xff];
        C =
          (C >>> 8) ^ T[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xff];
        C = (C >>> 8) ^ T[(C ^ (128 | (d & 63))) & 0xff];
      } else {
        C = (C >>> 8) ^ T[(C ^ (224 | ((c >> 12) & 15))) & 0xff];
        C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 6) & 63))) & 0xff];
        C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xff];
      }
    }
    return C ^ -1;
  }
  CRC32.table = T;
  // $FlowIgnore
  CRC32.bstr = crc32_bstr;
  // $FlowIgnore
  CRC32.buf = crc32_buf;
  // $FlowIgnore
  CRC32.str = crc32_str;
});

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
