function setLang(l){
  document.body.className = 'lang-' + l;
  document.getElementById('btn-ja').classList.toggle('active', l==='ja');
  document.getElementById('btn-en').classList.toggle('active', l==='en');
  document.querySelectorAll('.group-label').forEach(el=>{
    if(el.classList.contains('jp')) el.style.display = (l==='ja') ? '' : 'none';
    if(el.classList.contains('en')) el.style.display = (l==='en') ? '' : 'none';
  });
  document.documentElement.lang = l;
}

function renderCharacters(characters){
  const grids = {};
  characters.forEach(c=>{
    if(!grids[c.grid]){
      grids[c.grid] = document.getElementById('grid-'+c.grid);
    }
    const card = document.createElement('div');
    card.className = 'char-card reveal';
    card.innerHTML = `
      ${ c.img ? `<img class="full-portrait" src="${c.img}" alt="${c.name}" draggable="false">` : '' }
      <div class="role jp">${c.role.jp}</div><div class="role en">${c.role.en}</div>
      <h4>${c.name}</h4>
      <p class="jp">${c.short.jp}</p><p class="en">${c.short.en}</p>
      ${ (c.full.jp || c.full.en) ? `<div class="full">
        <span class="jp">${c.full.jp}</span><span class="en">${c.full.en}</span>
      </div>
      <div class="more jp">＋ 詳細を見る</div><div class="more en">+ Read more</div>` : '' }
    `;
    if(c.full.jp || c.full.en){
      card.addEventListener('click', ()=>{
        card.classList.toggle('open');
        const more = card.querySelectorAll('.more');
        more.forEach(m=>{
          if(m.classList.contains('jp')) m.textContent = card.classList.contains('open') ? '－ 閉じる' : '＋ 詳細を見る';
          if(m.classList.contains('en')) m.textContent = card.classList.contains('open') ? '– Close' : '+ Read more';
        });
      });
    }
    grids[c.grid].appendChild(card);
  });
}

function renderGlossary(glossary){
  const gl = document.getElementById('gloss-list');
  glossary.forEach(g=>{
    const item = document.createElement('div');
    item.className = 'gloss-item reveal';
    item.innerHTML = `<dt><span class="jp">${g.term}</span><span class="en">${g.en_term}</span></dt>
    <dd><span class="jp">${g.jp}</span><span class="en">${g.en}</span></dd>`;
    gl.appendChild(item);
  });
}

function renderColumns(columns){
  const cg = document.getElementById('column-grid');
  columns.forEach(c=>{
    const card = document.createElement('div');
    card.className = 'column-card reveal';
    let inner = `<div class="tag jp">${c.tag.jp}</div><div class="tag en">${c.tag.en}</div>
    <h3><span class="jp">${c.title.jp}</span><span class="en">${c.title.en}</span></h3>`;
    if(c.schedule){
      inner += `<ul class="schedule">` + c.schedule.map(s=>`<li><span class="jp">${s.t.jp}</span><span class="en">${s.t.en}</span><span class="jp">${s.d.jp}</span><span class="en">${s.d.en}</span></li>`).join('') + `</ul>`;
    }
    if(c.list){
      if(c.note && c.note.above){
        inner += `<p class="note jp" style="margin:0 0 10px;">${c.note.jp}</p><p class="note en" style="margin:0 0 10px; display:none;">${c.note.en}</p>`;
      }
      inner += `<ul>` + c.list.map(li=>`<li><span class="jp">${li.jp}</span><span class="en">${li.en}</span></li>`).join('') + `</ul>`;
    }
    if(c.note && !c.note.above){
      inner += `<p class="note jp">${c.note.jp}</p><p class="note en">${c.note.en}</p>`;
    }
    card.innerHTML = inner;
    cg.appendChild(card);
  });
}

function setupReveal(){
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
}

function setupBgmToggle(){
  const bgmToggle = document.getElementById('bgmToggle');
  const bgmAudio = document.getElementById('bgmAudio');
  const bgmLabelJp = document.getElementById('bgmLabelJp');
  const bgmLabelEn = document.getElementById('bgmLabelEn');
  bgmToggle.classList.add('muted');

  if('mediaSession' in navigator){
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Watson Type Beat _Benzo',
      artist: 'HAZBIN MONASTERY',
    });
  }

  bgmToggle.addEventListener('click', ()=>{
    if(bgmAudio.paused){
      bgmAudio.play();
      bgmToggle.classList.remove('muted');
      bgmLabelJp.textContent = 'ON';
      bgmLabelEn.textContent = 'ON';
    } else {
      bgmAudio.pause();
      bgmToggle.classList.add('muted');
      bgmLabelJp.textContent = 'OFF';
      bgmLabelEn.textContent = 'OFF';
    }
  });
}

function setupImageProtection(){
  // Deterrent only — blocks the easy right-click "save image as" path and
  // drag-to-save. Not a real DRM: anyone with dev tools, view-source, or a
  // screenshot can still get the image, so don't rely on this for anything
  // that truly must not be copied.
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.footer-scene')) {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
}

async function init(){
  setupBgmToggle();
  setupImageProtection();

  try {
    const [characters, glossary, columns] = await Promise.all([
      fetch('data/characters.json').then(r=>r.json()),
      fetch('data/glossary.json').then(r=>r.json()),
      fetch('data/columns.json').then(r=>r.json()),
    ]);

    renderCharacters(characters);
    renderGlossary(glossary);
    renderColumns(columns);
  } catch(err){
    console.error('コンテンツデータの読み込みに失敗しました(data/ 以下のJSONを確認してください):', err);
  }

  setLang('en');
  setupReveal();
}

document.addEventListener('DOMContentLoaded', init);
