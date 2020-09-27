const COURSE_LABEL_STORAGE_KEY = 'course_labels';
function getCourseLabelMap() {
  const labelsStr = localStorage.getItem(COURSE_LABEL_STORAGE_KEY);
  if (labelsStr === null || labelsStr === undefined) {
    return {};
  }

  try {
    return JSON.parse(labelsStr);
  } catch (e) {
    console.error(e);
    return {};
  }
}

function setCourseLabel(courseId, text) {
  const labels = getCourseLabelMap();
  if (text.length > 0) {
    labels[courseId] = text;
  } else if (typeof labels[courseId] === 'string') {
    delete labels[courseId];
  }
  localStorage.setItem(COURSE_LABEL_STORAGE_KEY, JSON.stringify(labels));
}

function settingsOnDashboard() {
  if (!location.href.endsWith('/my/')) return;

  const labels = getCourseLabelMap();
  const courseListElem = document.querySelector('.content .course_list');
  if (!courseListElem) return;

  for (const title of courseListElem
    .querySelectorAll('.course_title h2')
    .values()) {
    const link = title.querySelector('a');
    if (!link) continue;

    const linkHref = link.getAttribute('href');
    const courseId = linkHref.match(/\?id=(\d+)/)[1];
    if (!courseId) continue;

    let input = title.querySelector('input.labeler');
    if (!input) {
      title.appendChild(document.createElement('br'));
      input = document.createElement('input');
      input.className = 'labeler';
      input.placeholder = 'ラベル';
      input.type = 'text';
      title.appendChild(input);
      input.addEventListener('change', () => {
        setCourseLabel(courseId, input.value);
        settingsOnDashboard();
      });
    }

    input.value = labels[courseId] || '';
  }
}

function showLabelOnSidebarCourse() {
  const cssTag = document.createElement('style');
  cssTag.appendChild(document.createTextNode(''));
  document.head.appendChild(cssTag);

  const labels = getCourseLabelMap();
  for (const course of Object.keys(labels)) {
    // マイコース ツリー, マイコース リスト
    cssTag.sheet.insertRule(
      `p.tree_item[data-node-type="20"][data-node-key="${course}"]::after,
        .block_course_list a[href*="/course/view.php?id=${course}"]::after {
          margin-left: .3em;
          content: "${labels[course]}";
          border: .3px solid #333;
          padding: 0 .2em;
          border-radius: .2em;
          text-decoration: none;
        }`,
    );

    if (location.href.includes(`/course/view.php?id=${course}`)) {
      // コースページタイトル
      cssTag.sheet.insertRule(
        `.page-header-headings h1::after {
            margin-left: .3em;
            content: "${labels[course]}";
            border: .3px solid #333;
            padding: 0 .2em;
            border-radius: .2em;
          }`,
      );
    }
  }
}

settingsOnDashboard();
showLabelOnSidebarCourse();
