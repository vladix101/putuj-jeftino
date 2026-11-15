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
  const notes = await fetch(DRIVE_URL, { redirect: 'follow' });
  if (!notes.ok) return 'Drive status ' + notes.status;
  const buf = await notes.arrayBuffer();
  if (!new TextDecoder().decode(buf).includes('NAJJEFTINIJI LETOVI')) return 'Fajl ne liči na notes';
  const novi = await otisak(buf);

  const auth = { ...GH, 'Authorization': 'Bearer ' + env.GH_TOKEN };
  const r = await fetch('https://api.github.com/repos/' + REPO + '/contents/_letovi/notes.sha256?ref=main', { headers: { ...auth, 'Accept': 'application/vnd.github.raw' } });
  if (!r.ok) return 'GitHub status ' + r.status;
  const stari = (await r.text()).trim();
  if (stari === novi) return 'Notes nije menjan';

  // Da ne pokrene dva puta dok prethodna akcija još radi
  const aktivne = await fetch('https://api.github.com/repos/' + REPO + '/actions/workflows/deploy.yml/runs?per_page=5', { headers: auth });
  if (aktivne.ok) {
    const j = await aktivne.json();
    if ((j.workflow_runs || []).some(x => x.status !== 'completed')) return 'Akcija već radi';
  }
  const d = await fetch('https://api.github.com/repos/' + REPO + '/actions/workflows/deploy.yml/dispatches', {
    method: 'POST', headers: auth, body: JSON.stringify({ ref: 'main' })
  });
  return d.status === 204 ? 'Notes je izmenjen, akcija pokrenuta' : 'Pokretanje nije uspelo: ' + d.status + ' ' + (await d.text());
}

export default {
  async scheduled(event, env, ctx) {
    console.log(await proveri(env));
  },
  async fetch(req, env) {
    return new Response(await proveri(env) + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
};
