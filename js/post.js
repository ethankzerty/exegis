const slug=new URLSearchParams(location.search).get('slug');
const entry=(window.ARCHIVE_ENTRIES||[]).find(x=>x.slug===slug&&!x.draft);
const target=document.getElementById('post');
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!entry){target.innerHTML='<h1>Entry not found.</h1><p>Return to the index and choose another entry.</p>';}
else {
  document.title=entry.title+' — The Archive';
  const image=entry.image?`<img class="post-image" src="${escapeHTML(entry.image)}" alt="${escapeHTML(entry.imageAlt||entry.title)}">`:'';
  let video='';
  if(entry.videoUrl){
    try {
      const u=new URL(entry.videoUrl);let id='';
      if(u.hostname==='youtu.be'||u.hostname==='www.youtu.be')id=u.pathname.slice(1);
      if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v')||'';
      if(/^[\w-]{11}$/.test(id))video=`<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${id}" loading="lazy" allowfullscreen title="${escapeHTML(entry.title)}"></iframe></div>`;
    }catch{}
  }
  target.innerHTML=`<p class="post-meta">${escapeHTML(entry.type)} · ${escapeHTML(entry.date)}</p><h1>${escapeHTML(entry.title)}</h1><p class="post-lead">${escapeHTML(entry.summary)}</p>${image}${video}<div class="post-body">${entry.body||''}</div>`;
}
