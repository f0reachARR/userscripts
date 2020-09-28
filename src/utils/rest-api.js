import { stringify } from 'querystring';

const TOKEN_CACHE_KEY = 'moodle_token';

const getRestApiToken = async () => {
  // eslint-disable-next-line no-undef
  const sessKey = M.cfg.sesskey;
  if (!sessKey) throw new Error('no session key');

  const response = await fetch(
    `https://moodle.cis.kit.ac.jp/user/managetoken.php?sesskey=${sessKey}`,
    {
      credentials: 'include',
    },
  );

  const responseHtml = await response.text();
  const dom = new DOMParser();
  const parsed = dom.parseFromString(responseHtml, 'text/html');

  for (const row of parsed
    .querySelectorAll('.webservicestokenui tr')
    .values()) {
    const title = row.querySelector('td:nth-child(2)')?.textContent;
    const token = row.querySelector('td:nth-child(1)')?.textContent;

    if (title?.includes('Moodle mobile web service') && token) {
      localStorage.setItem(TOKEN_CACHE_KEY, token);
      return token;
    }
  }

  throw new Error('No token');
};

export const getToken = async () => {
  return localStorage.getItem(TOKEN_CACHE_KEY) ?? (await getRestApiToken());
};

export const callApi = async (funcName, params = {}) => {
  const token = await getToken();
  const qs = stringify({
    wstoken: token,
    moodlewsrestformat: 'json',
    wsfunction: funcName,
    ...params,
  });

  const response = await fetch(
    `https://moodle.cis.kit.ac.jp/webservice/rest/server.php?${qs}`,
    {
      credentials: 'include',
    },
  );

  return await response.json();
};
