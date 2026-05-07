const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const LANG_COLORS = {
  JavaScript:'#f1e05a', TypeScript:'#3178c6', Python:'#3572A5', Java:'#b07219',
  'C++':'#f34b7d', C:'#555555', 'C#':'#178600', PHP:'#4F5D95', Ruby:'#701516',
  Go:'#00ADD8', Rust:'#dea584', Swift:'#F05138', Kotlin:'#A97BFF', Dart:'#00B4AB',
  HTML:'#e34c26', CSS:'#563d7c', SCSS:'#c6538c', Shell:'#89e051', Vue:'#41b883',
  Svelte:'#ff3e00', Lua:'#000080', R:'#198CE7',
};

const getLangColor = l => LANG_COLORS[l] || '#8b949e';
const fk = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function shell(w, h, body, themeName = 'dark', verticalSkew = false) {
  const isDark = themeName !== 'light';
  const bg = isDark ? '#050505' : '#ffffff';
  const text = isDark ? '#ffffff' : '#000000';
  const border = isDark ? '#1a1a1a' : '#f0f0f0';
  const dotColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&amp;display=swap');
    text { font-family: 'Bricolage Grotesque', sans-serif; fill: ${text}; }
    .val { font-size: 34px; font-weight: 800; letter-spacing: -0.05em; }
    .label { font-size: 11px; font-weight: 600; opacity: 0.4; letter-spacing: 0.1em; text-transform: uppercase; }
    .skew { font-size: 10px; font-weight: 600; fill: ${text}; opacity: 0.15; }
    
    @keyframes countPop { 
      0% { opacity: 0; transform: scale(0.8) translateY(10px); } 
      70% { transform: scale(1.05) translateY(-2px); }
      100% { opacity: 1; transform: scale(1) translateY(0); } 
    }
    @keyframes drawPath { from { stroke-dasharray: 0, 3000; } to { stroke-dasharray: 3000, 0; } }
    @keyframes revealDonut { from { stroke-dasharray: 0, 314.16; } to { stroke-dasharray: 314.16, 0; } }
    
    .count-anim { animation: countPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; transform-origin: center; }
    .path-anim { stroke-dasharray: 3000; stroke-dashoffset: 3000; animation: drawPath 2.5s ease-in-out forwards; }
    .donut-mask-anim { stroke-dasharray: 0, 314.16; animation: revealDonut 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards; }
  </style>
  <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="1" fill="${dotColor}" />
  </pattern>
</defs>
<rect width="${w}" height="${h}" rx="24" fill="${bg}"/>
<rect width="${w}" height="${h}" rx="24" fill="url(#dots)"/>
<rect width="${w-2}" height="${h-2}" x="1" y="1" rx="23" fill="none" stroke="${border}" stroke-width="1.5"/>

<g>
  ${body}
</g>

${verticalSkew ? `
<text x="${w - 20}" y="${h / 2}" text-anchor="middle" class="skew" transform="rotate(-90 ${w - 20} ${h / 2})">by skew.</text>
` : `
<text x="${w - 30}" y="${h - 20}" text-anchor="end" class="skew">by skew.</text>
`}
</svg>`;
}

function statsCard(user, repos, theme) {
  const W = 480, H = 160;
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  
  const forkIcon = `<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.251 2.251 0 0 1-2.25 2.25h-1.5v1.505a2.25 2.25 0 1 1-1.5 0V7.5h-1.5A2.251 2.251 0 0 1 3.5 5.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75 0a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm-3 10.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" fill-rule="evenodd" />`;

  const items = [
    { label:'Repos', val: user.public_repos },
    { label:'Stars', val: totalStars },
    { label:'Forks', val: totalForks, icon: forkIcon },
    { label:'Followers', val: user.followers },
  ];

  const cells = items.map((it, i) => {
    const x = W / 8 + (i * W / 4);
    const y = H / 2 + 5; // Moved slightly up from +10
    return `<g class="count-anim" style="animation-delay: ${i * 0.1}s">
              ${it.icon ? `<svg x="${x - 7}" y="${y - 45}" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.4">${it.icon}</svg>` : ''}
              <text x="${x}" y="${y}" text-anchor="middle" class="val" style="font-size: 28px;">${fk(it.val)}</text>
              <text x="${x}" y="${y + 22}" text-anchor="middle" class="label">${it.label}</text>
            </g>`;
  }).join('');
  return shell(W, H, cells, theme);
}

function langsCard(langs, theme) {
  const realTotal = langs.reduce((s, l) => s + l.bytes, 0);
  const top = langs.filter(l => (l.bytes / realTotal) * 100 >= 1.5); // Filter < 1.5%
  
  const cols = Math.ceil(top.length / 5);
  const W = 180 + cols * 180;
  const H = 180;
  const R = 50, C = 2 * Math.PI * R;
  const centerY = H / 2;
  const bgCircle = `<circle cx="100" cy="${centerY}" r="${R}" fill="none" stroke="currentColor" stroke-width="16" opacity="0.05" />`;
  
  let currentOffset = 0;
  const slices = top.slice(0, 10).map((l, i) => {
    const pct = l.bytes / realTotal;
    const dashArray = `${pct * C} ${C}`;
    const dashOffset = -currentOffset;
    currentOffset += pct * C;
    return `<circle cx="100" cy="${centerY}" r="${R}" fill="none" stroke="${getLangColor(l.name)}" stroke-width="16" 
            stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" transform="rotate(-90 100 ${centerY})" />`;
  }).join('');

  const legend = top.map((l, i) => {
    const col = Math.floor(i / 5);
    const row = i % 5;
    const x = 210 + col * 180;
    const y = (centerY - (5 * 22 / 2)) + row * 22 + 9;
    return `<g class="count-anim" style="animation-delay: ${i * 0.05}s">
              <circle cx="${x}" cy="${y - 4}" r="5" fill="${getLangColor(l.name)}"/>
              <text x="${x + 15}" y="${y}" style="font-size: 12px; font-weight: 700;">${esc(l.name)}</text>
              <text x="${x + 150}" y="${y}" text-anchor="end" class="label" style="opacity: 0.3;">${((l.bytes / realTotal) * 100).toFixed(1)}%</text>
            </g>`;
  }).join('');

  const mask = `<mask id="donutMask"><circle cx="100" cy="${centerY}" r="${R}" fill="none" stroke="white" stroke-width="20" class="donut-mask-anim" transform="rotate(-90 100 ${centerY})" /></mask>`;
  return shell(W, H, `${bgCircle}<g mask="url(#donutMask)">${slices}</g>${legend}`, theme).replace('</defs>', `${mask}</defs>`);
}

function graphCard(repos, theme, w = 903) {
  const W = w, H = 200;
  const isDark = theme !== 'light';
  const color = isDark ? '#ffffff' : '#000000';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const counts = new Array(12).fill(0);
  repos.forEach(r => {
    const d = new Date(r.pushed_at);
    if (now - d < 365 * 24 * 60 * 60 * 1000) {
      const mIdx = (d.getMonth() - (now.getMonth() - 11) + 12) % 12;
      counts[mIdx] += 1;
    }
  });
  const data = counts.map((c, i) => {
    const m = (now.getMonth() - (11 - i) + 12) % 12;
    return { month: months[m], count: c + 1 };
  });
  const max = Math.max(...data.map(d => d.count), 5);
  const roundedMax = Math.ceil(max / 5) * 5;
  const bottomY = H - 40;
  const topY = 40;
  let path = `M 80,${bottomY - (data[0].count / roundedMax) * (bottomY - topY)}`;
  data.forEach((d, i) => {
    if (i === 0) return;
    const x = 80 + i * (W - 140) / 11;
    const y = bottomY - (d.count / roundedMax) * (bottomY - topY);
    const prevX = 80 + (i-1) * (W - 140) / 11;
    const prevY = bottomY - (data[i-1].count / roundedMax) * (bottomY - topY);
    const cp1x = prevX + (x - prevX) / 2;
    path += ` C ${cp1x},${prevY} ${cp1x},${y} ${x},${y}`;
  });
  const xLabels = data.map((d, i) => {
    const x = 80 + i * (W - 140) / 11;
    return `<text x="${x}" y="${H - 15}" text-anchor="middle" class="label" style="opacity: 0.2">${d.month}</text>`;
  }).join('');
  const yLabels = [0, Math.floor(roundedMax / 2), roundedMax].map(val => {
    const y = bottomY - (val / roundedMax) * (bottomY - topY);
    return `<text x="60" y="${y + 4}" text-anchor="end" class="label" style="opacity: 0.2">${val}</text>`;
  }).join('');
  const body = `
    ${yLabels}
    <path d="${path}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" class="path-anim" style="opacity: 0.8" />
    <path d="${path} L ${W-60},${bottomY} L 80,${bottomY} Z" fill="${color}" opacity="0.03" />
    ${xLabels}
  `;
  return shell(W, H, body, theme, true);
}

async function ghFetch(path) {
  const res = await fetch(`https://api.github.com/${path}`, { headers: { Accept: 'application/vnd.github.v3+json' } });
  return res.json();
}

async function getData(username) {
  const [user, allRepos] = await Promise.all([ghFetch(`users/${username}`), ghFetch(`users/${username}/repos?per_page=100&sort=updated`)]);
  const repos = Array.isArray(allRepos) ? allRepos.filter(r => !r.fork) : [];
  const langMap = {};
  for (const r of repos) { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + (r.size || 1); }
  const langs = Object.entries(langMap).map(([name, bytes]) => ({ name, bytes })).sort((a, b) => b.bytes - a.bytes);
  return { user, repos, langs };
}

function sendSVG(res, svg) { res.setHeader('Content-Type', 'image/svg+xml'); res.send(svg); }

app.get('/api/stats', async (req, res) => {
  const { user, repos } = await getData(req.query.username);
  sendSVG(res, statsCard(user, repos, req.query.theme));
});

app.get('/api/top-langs', async (req, res) => {
  const { langs } = await getData(req.query.username);
  sendSVG(res, langsCard(langs, req.query.theme));
});

app.get('/api/graph', async (req, res) => {
  const { repos, langs } = await getData(req.query.username);
  const realTotal = langs.reduce((s, l) => s + l.bytes, 0);
  const filteredLangs = langs.filter(l => (l.bytes / realTotal) * 100 >= 1.5);
  const cols = Math.ceil(filteredLangs.length / 5);
  const langW = 180 + cols * 180;
  const totalW = 480 + 3 + langW;
  sendSVG(res, graphCard(repos, req.query.theme, totalW));
});

module.exports = app;
