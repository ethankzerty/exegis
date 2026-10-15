const sectionInfo={archives:['Archives','All published work, in chronological order.'],articles:['Articles','Essays, narratives and long-form writing.'],videos:['Videos','Films, moving images and video essays.'],analysis:['Analysis','Close reading, research and considered arguments.'],opinion:['Opinion','Personal perspectives and reflections.'],art:['Art','Images, experiments and visual work.'],'to-read':['To Read','A collection of books, links and reading notes.']};
const category=new URLSearchParams(location.search).get('section')||'archives';
const current=Object.hasOwn(sectionInfo,category)?category:'archives';
const onSection=location.pathname.endsWith('section.html');
const all=(window.ARCHIVE_ENTRIES||[]).filter(e=>!e.draft).slice().sort((a,b)=>b.date.localeCompare(a.date));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const niceDate=date=>new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
const types={articles:'article',analysis:'analysis',opinion:'opinion',art:'art',videos:'video','to-read':'to-read'};
const entries=onSection&&types[current]?all.filter(e=>e.type===types[current]):all;
const target=document.getElementById('entries');
const link=e=>'post.html?slug='+encodeURIComponent(e.slug);
const art=e=>e.image?`<img src="${esc(e.image)}" alt="${esc(e.imageAlt||e.title)}" loading="lazy">`:`<div class="story-placeholder placeholder-${esc(e.type)}"><span>${esc(e.type.replace('-', ' '))}</span><b>${esc(e.title.slice(0,1))}</b></div>`;
const card=e=>`<article class="story-card"><a class="story-art" href="${link(e)}">${art(e)}</a><div class="story-meta"><span>${esc(e.type.replace('-', ' '))}</span><time datetime="${esc(e.date)}">${niceDate(e.date)}</time></div><h3><a href="${link(e)}">${esc(e.title)}</a></h3><p>${esc(e.summary)}</p><a class="read-link" href="${link(e)}">Read the piece →</a></article>`;
if(onSection){let [heading,description]=sectionInfo[current];document.title=heading+' — The Archive';document.getElementById('section-title').textContent=heading;document.getElementById('section-crumb').textContent=heading.toUpperCase();document.getElementById('section-description').textContent=description;}
else {const lead=all[0];document.getElementById('lead-story').innerHTML=lead?`<article class="lead-story"><a class="lead-art" href="${link(lead)}">${art(lead)}</a><div class="story-meta"><span>${esc(lead.type.replace('-', ' '))} / FEATURED</span><time datetime="${esc(lead.date)}">${niceDate(lead.date)}</time></div><h1><a href="${link(lead)}">${esc(lead.title)}</a></h1><p>${esc(lead.summary)}</p><a class="read-link" href="${link(lead)}">Continue reading →</a></article>`:'<p class="empty">Your first publication will appear here.</p>';}
const visible=onSection?entries:all.slice(1,7);
if(target)target.innerHTML=visible.map(card).join('');
const count=document.getElementById('visible-count');if(count)count.textContent=String(entries.length).padStart(2,'0');
const empty=document.getElementById('empty');if(empty)empty.hidden=visible.length>0;
