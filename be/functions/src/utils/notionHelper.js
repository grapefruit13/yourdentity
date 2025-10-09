const getNotionToken = () => process.env.NOTION_API_KEY;
const getNotionVersion = () => process.env.NOTION_VERSION;

const buildNotionHeaders = (token) => ({
  "Authorization": `Bearer ${token}`,
  "Notion-Version": getNotionVersion(),
  "Content-Type": "application/json",
});

const buildNotionHeadersFromEnv = () => buildNotionHeaders(getNotionToken());

const toKstIso = (iso) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return null;
  return new Date(ms + 9 * 60 * 60 * 1000).toISOString().replace("Z", "+09:00");
};

const nowKstIso = () => {
  const now = new Date();
  return toKstIso(now.toISOString());
};

module.exports = {
  buildNotionHeaders,
  buildNotionHeadersFromEnv,
  getNotionToken,
  getNotionVersion,
  toKstIso,
  nowKstIso,
};


