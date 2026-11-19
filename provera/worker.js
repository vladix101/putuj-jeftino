/*
 * Cloudflare Worker koji na svakih 10 minuta proverava notes sa letovima na Drive-u.
 * Kada se notes promeni (otisak se razlikuje od onog u repou), pokreće GitHub akciju
 * koja osvežava termine, objavljuje sajt i šalje mejl sa cenama.
 * GitHub-ove zakazane akcije često kasne satima ili se preskaču, pa ovo služi kao pouzdan okidač.
 */
const DRIVE_URL = 'https://drive.google.com/uc?export=download&id=1_tQC9yRSKx8RuaNBaBOhz2DxvkecB3fx';
const REPO = 'vladix101/putuj-jeftino';
const GH = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'putuj-jeftino-provera', 'X-GitHub-Api-Version': '2022-11-28' };

async function otisak(buf) {
  const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function proveri(env) {
  const notes = await fetch(DRIVE_URL, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (putuj-jeftino-provera)' } });
  if (!notes.ok) return 'GREŠKA: Drive status ' + notes.status + ' (' + notes.url + ')';
  const buf = await notes.arrayBuffer();
  const tekst = new TextDecoder().decode(buf);
  if (!tekst.includes('NAJJEFTINIJI LETOVI')) return 'GREŠKA: Drive nije vratio notes (' + notes.url + '): ' + tekst.slice(0, 200).replace(/\s+/g, ' ');
  const novi = await otisak(buf);

  const auth = { ...GH, 'Authorization': 'Bearer ' + env.GH_TOKEN };
  const r = await fetch('https://api.github.com/repos/' + REPO + '/contents/_letovi/notes.sha256?ref=main', { headers: { ...auth, 'Accept': 'application/vnd.github.raw' } });
  if (!r.ok) return 'GREŠKA: GitHub (čitanje otiska) status ' + r.status;
  const stari = (await r.text()).trim();
  if (stari === novi) return 'OK: notes nije menjan (otisak ' + novi.slice(0, 12) + ')';

  // Da ne pokrene dva puta dok prethodna akcija još radi
  const aktivne = await fetch('https://api.github.com/repos/' + REPO + '/actions/workflows/deploy.yml/runs?per_page=5', { headers: auth });
  if (aktivne.ok) {
    const j = await aktivne.json();
    if ((j.workflow_runs || []).some(x => x.status !== 'completed')) return 'OK: akcija već radi';
  }
  const d = await fetch('https://api.github.com/repos/' + REPO + '/actions/workflows/deploy.yml/dispatches', {
    method: 'POST', headers: auth, body: JSON.stringify({ ref: 'main' })
  });
  return d.status === 204 ? 'OK: notes je izmenjen, akcija pokrenuta' : 'GREŠKA: pokretanje akcije nije uspelo: ' + d.status + ' ' + (await d.text()).slice(0, 300);
}

export default {
  async scheduled(event, env, ctx) {
    console.log(await proveri(env).catch(e => 'GREŠKA: ' + e.message));
  },
  async fetch(req, env) {
    return new Response(await proveri(env).catch(e => 'GREŠKA: ' + e.message) + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
};
