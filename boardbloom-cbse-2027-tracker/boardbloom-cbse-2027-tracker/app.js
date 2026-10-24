const SUBJECTS = {
  Physics: {
    short:"PHY", cls:"physics", color:"#e8edff", chapters:[
      "Electric Charges and Fields","Electrostatic Potential and Capacitance","Current Electricity",
      "Moving Charges and Magnetism","Magnetism and Matter","Electromagnetic Induction",
      "Alternating Current","Electromagnetic Waves","Ray Optics and Optical Instruments",
      "Wave Optics","Dual Nature of Radiation and Matter","Atoms","Nuclei","Semiconductor Electronics"
    ]
  },
  Chemistry: {
    short:"CHEM", cls:"chemistry", color:"#fff0e5", chapters:[
      "Solutions","Electrochemistry","Chemical Kinetics","The d- and f-Block Elements",
      "Coordination Compounds","Haloalkanes and Haloarenes","Alcohols, Phenols and Ethers",
      "Aldehydes, Ketones and Carboxylic Acids","Amines","Biomolecules"
    ]
  },
  Mathematics: {
    short:"MATH", cls:"mathematics", color:"#e5f7ef", chapters:[
      "Relations and Functions","Inverse Trigonometric Functions","Matrices","Determinants",
      "Continuity and Differentiability","Applications of Derivatives","Integrals",
      "Applications of Integrals","Differential Equations","Vector Algebra",
      "Three-Dimensional Geometry","Linear Programming","Probability"
    ]
  },
  Biology: {
    short:"BIO", cls:"biology", color:"#f8e9f4", chapters:[
      "Sexual Reproduction in Flowering Plants","Human Reproduction","Reproductive Health",
      "Principles of Inheritance and Variation","Molecular Basis of Inheritance","Evolution",
      "Human Health and Diseases","Microbes in Human Welfare","Biotechnology: Principles and Processes",
      "Biotechnology and its Applications","Organisms and Populations","Ecosystem",
      "Biodiversity and its Conservation"
    ]
  }
};
const STATUSES = ["Not Started","Learning","Practising PYQs","Completed"];
const STORAGE_KEY = "boardbloom-cbse-2027-v1";
const todayISO = () => new Date().toLocaleDateString("en-CA");
const escapeHTML = (s="") => String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const defaultState = () => ({chapters:{},tests:[],revisions:[],sessions:[]});
let state = loadState();
let currentSubject = "All";
let toastTimer;
function loadState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch{return defaultState()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
function chapterKey(subject,chapter){return `${subject}::${chapter}`}
function getChapter(subject,chapter){return state.chapters[chapterKey(subject,chapter)]||{status:"Not Started",done:false}}
function allChapters(){return Object.entries(SUBJECTS).flatMap(([subject,data])=>data.chapters.map(chapter=>({subject,chapter,...getChapter(subject,chapter)})))}
function completedCount(subject){return allChapters().filter(c=>(!subject||c.subject===subject)&&c.status==="Completed").length}
function totalCount(subject){return subject?SUBJECTS[subject].chapters.length:allChapters().length}
function percent(subject){return Math.round(completedCount(subject)/totalCount(subject)*100)}
function showToast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300)}
function formatDate(iso){if(!iso)return "No date";const d=new Date(`${iso}T12:00:00`);return d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
function shortDate(iso){if(!iso)return "—";return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined,{day:"numeric",month:"short"})}
function subjectIcon(subject){return ({Physics:"Φ",Chemistry:"⚗",Mathematics:"∑",Biology:"❀"})[subject]||"✦"}
function statusClass(status){return "status-"+status.toLowerCase().replaceAll(" ","-")}
function renderAll(){renderSidebar();renderOverview();renderChapters();renderTests();renderPlanner();renderStudyLog();updatePlannerChapters()}
function renderSidebar(){const p=percent();document.getElementById("side-progress").style.width=p+"%";document.getElementById("side-progress-label").textContent=`${p}% syllabus complete`}
function renderOverview(){
 const total=totalCount(),done=completedCount();document.getElementById("overall-percent").textContent=Math.round(done/total*100);
 document.getElementById("overall-bar").style.width=(done/total*100)+"%";document.getElementById("chapters-count").textContent=`${done} of ${total} chapters completed`;
 const hours=state.sessions.reduce((s,x)=>s+Number(x.hours||0),0);document.getElementById("total-hours").textContent=hours.toLocaleString(undefined,{maximumFractionDigits:1});
 document.getElementById("latest-score").textContent=state.tests.length?Math.round(Number(state.tests[state.tests.length-1].score)/Number(state.tests[state.tests.length-1].max)*100):"—";
 document.getElementById("latest-score-unit").textContent=state.tests.length?"%":"";document.getElementById("mock-subtitle").textContent=state.tests.length?`${state.tests[state.tests.length-1].subject} · ${formatDate(state.tests[state.tests.length-1].date)}`:"Your first mock is waiting";
 document.getElementById("subject-cards").innerHTML=Object.entries(SUBJECTS).map(([subject,data])=>`<article class="subject-card"><div class="subject-top"><span class="subject-icon ${data.cls}">${subjectIcon(subject)}</span><span class="subject-percent">${percent(subject)}%</span></div><h3>${subject==="Mathematics"?"Mathematics":subject}</h3><p>${completedCount(subject)} of ${data.chapters.length} chapters completed</p><div class="progress-track"><span style="width:${percent(subject)}%;background:${({Physics:"#687bda",Chemistry:"#e1a06d",Mathematics:"#5bb896",Biology:"#c16da8"})[subject]}"></span></div><div class="subject-footer"><span>${data.chapters.length-completedCount(subject)} chapters to go</span><button data-subject-go="${subject}">Open →</button></div></article>`).join("");
 document.querySelectorAll("[data-subject-go]").forEach(b=>b.onclick=()=>{currentSubject=b.dataset.subject;document.querySelectorAll(".subject-tab").forEach(x=>x.classList.toggle("active",x.dataset.subject===currentSubject));goView("chapters")});
 const upcoming=state.revisions.filter(r=>!r.done).sort((a,b)=>a.date.localeCompare(b.date))[0];const next=document.getElementById("up-next");
 next.innerHTML=upcoming?`<div class="up-next-item"><div class="up-next-date"><div>${new Date(`${upcoming.date}T12:00:00`).toLocaleDateString(undefined,{month:"short"}).toUpperCase()}</div><strong>${new Date(`${upcoming.date}T12:00:00`).getDate()}</strong></div><div class="up-next-info"><strong>${escapeHTML(upcoming.chapter)}</strong><small>${escapeHTML(upcoming.subject)} · ${escapeHTML(upcoming.focus)} · ${formatDate(upcoming.date)}</small></div></div>`:`<div class="empty-state">Add a chapter revision date in your planner to see it here.</div>`;
}
function renderChapters(){
 const query=(document.getElementById("chapter-search")?.value||"").toLowerCase().trim();
 const list=document.getElementById("chapter-list");const subjects=currentSubject==="All"?Object.keys(SUBJECTS):[currentSubject];
 const filtered=subjects.map(subject=>({subject,chapters:SUBJECTS[subject].chapters.filter(c=>c.toLowerCase().includes(query)).map(chapter=>({chapter,...getChapter(subject,chapter)}))})).filter(x=>x.chapters.length);
 const visible=filtered.reduce((n,g)=>n+g.chapters.length,0),done=filtered.reduce((n,g)=>n+g.chapters.filter(c=>c.status==="Completed").length,0);
 document.getElementById("chapter-summary").innerHTML=`<div class="summary-chip"><strong>${visible}</strong> chapters shown</div><div class="summary-chip"><strong>${done}</strong> completed</div><div class="summary-chip"><strong>${visible-done}</strong> still in progress</div>`;
 list.innerHTML=filtered.length?filtered.map(g=>{const d=SUBJECTS[g.subject];return `<section class="subject-group"><div class="group-heading"><span class="subject-icon ${d.cls}">${subjectIcon(g.subject)}</span><div><h3>${g.subject}</h3><small>${g.chapters.filter(c=>c.status==="Completed").length} / ${d.chapters.length} completed overall</small></div><span class="group-count">${g.chapters.length} chapters shown</span></div>${g.chapters.map(c=>`<div class="chapter-row"><div class="chapter-name"><input class="chapter-check" type="checkbox" aria-label="Mark ${escapeHTML(c.chapter)} completed" data-complete="${escapeHTML(g.subject)}" data-chapter="${escapeHTML(c.chapter)}" ${c.status==="Completed"?"checked":""}><div><strong>${escapeHTML(c.chapter)}</strong><small>${escapeHTML(g.subject)}</small></div></div><select class="status-select" aria-label="Status for ${escapeHTML(c.chapter)}" data-status="${escapeHTML(g.subject)}" data-chapter="${escapeHTML(c.chapter)}">${STATUSES.map(s=>`<option ${c.status===s?"selected":""}>${s}</option>`).join("")}</select><div class="chapter-status"><span class="status-pill ${statusClass(c.status)}">${c.status}</span></div></div>`).join("")}</section>`}).join(""):`<div class="panel empty-state">No chapters match that search. Try another keyword.</div>`;
 list.querySelectorAll("[data-complete]").forEach(el=>el.addEventListener("change",()=>{const key=chapterKey(el.dataset.complete,el.dataset.chapter);state.chapters[key]={...getChapter(el.dataset.complete,el.dataset.chapter),done:el.checked,status:el.checked?"Completed":"Learning"};saveState();showToast(el.checked?"Chapter marked completed ✨":"Chapter moved back to learning")}));
 list.querySelectorAll("[data-status]").forEach(el=>el.addEventListener("change",()=>{const key=chapterKey(el.dataset.status,el.dataset.chapter);state.chapters[key]={...getChapter(el.dataset.status,el.dataset.chapter),status:el.value,done:el.value==="Completed"};saveState();showToast("Chapter progress updated")}));
}
function renderTests(){
 const tests=state.tests;document.getElementById("test-count").textContent=`${tests.length} ${tests.length===1?"test":"tests"}`;
 const tbody=document.getElementById("test-history");tbody.innerHTML=tests.length?[...tests].reverse().map(t=>`<tr><td>${escapeHTML(t.name)}</td><td>${escapeHTML(t.subject)}</td><td>${formatDate(t.date)}</td><td class="score-cell">${t.score}/${t.max} (${Math.round(t.score/t.max*100)}%)</td><td>${escapeHTML(t.notes||"—")}</td><td><button class="delete-btn" data-delete-test="${t.id}" aria-label="Delete test">×</button></td></tr>`).join(""):`<tr><td colspan="6" class="empty-table">No tests logged yet. Your first result will appear here.</td></tr>`;
 tbody.querySelectorAll("[data-delete-test]").forEach(b=>b.onclick=()=>{state.tests=state.tests.filter(t=>t.id!==b.dataset.deleteTest);saveState();showToast("Test removed")});
 const visual=document.getElementById("score-visual");if(!tests.length){visual.innerHTML='<div class="empty-state">Log your first test to start a trend.</div>';return}
 const recent=tests.slice(-8);visual.innerHTML=recent.map(t=>{const pct=Math.round(t.score/t.max*100);return `<div class="score-bar-wrap"><div class="score-bar ${pct>=90?"goal-met":""}" style="height:${Math.max(3,pct)}%"><span>${pct}%</span></div><small title="${escapeHTML(t.name)}">${escapeHTML(t.subject.slice(0,4))}</small></div>`}).join("");
}
function updatePlannerChapters(){const subject=document.getElementById("planner-subject")?.value||"Physics";const select=document.getElementById("planner-chapter");if(!select)return;const old=select.value;select.innerHTML=SUBJECTS[subject].chapters.map(c=>`<option>${escapeHTML(c)}</option>`).join("");if(SUBJECTS[subject].chapters.includes(old))select.value=old}
function renderPlanner(){
 const list=document.getElementById("revision-list");const items=[...state.revisions].sort((a,b)=>a.date.localeCompare(b.date));if(!items.length){list.innerHTML='<div class="empty-state">No revisions planned yet. Add one on the left to get started.</div>';return}
 list.innerHTML=items.map(r=>{const d=new Date(`${r.date}T12:00:00`),overdue=!r.done&&r.date<todayISO();return `<div class="revision-item ${r.done?"done":""} ${overdue?"overdue":""}"><input class="revision-check" type="checkbox" data-revision-done="${r.id}" ${r.done?"checked":""} aria-label="Complete revision"><div class="revision-date"><div>${d.toLocaleDateString(undefined,{month:"short"}).toUpperCase()}</div><strong>${d.getDate()}</strong></div><div class="revision-detail"><div class="revision-title">${escapeHTML(r.chapter)}</div><div class="revision-meta">${escapeHTML(r.subject)} · ${overdue?"Overdue":r.done?"Completed":formatDate(r.date)}</div></div><span class="revision-focus">${escapeHTML(r.focus)}</span><button class="delete-btn" data-delete-revision="${r.id}" aria-label="Delete revision">×</button></div>`}).join("");
 list.querySelectorAll("[data-revision-done]").forEach(el=>el.onchange=()=>{const r=state.revisions.find(x=>x.id===el.dataset.revisionDone);if(r)r.done=el.checked;saveState()});
 list.querySelectorAll("[data-delete-revision]").forEach(el=>el.onclick=()=>{state.revisions=state.revisions.filter(r=>r.id!==el.dataset.deleteRevision);saveState();showToast("Revision removed")});
}
function renderStudyLog(){
 const sessions=state.sessions;const hours=sessions.reduce((s,x)=>s+Number(x.hours||0),0);document.getElementById("study-total-big").textContent=hours.toLocaleString(undefined,{maximumFractionDigits:1});document.getElementById("session-count").textContent=`${sessions.length} ${sessions.length===1?"session":"sessions"}`;
 document.getElementById("study-history").innerHTML=sessions.length?[...sessions].reverse().map(s=>`<div class="study-session"><span class="session-dot"></span><div class="session-content"><div class="session-title">${escapeHTML(s.subject)}</div><div class="session-meta">${formatDate(s.date)} · Focus ${s.focus}/10</div>${s.notes?`<div class="session-notes">${escapeHTML(s.notes)}</div>`:""}</div><div class="session-hours">${Number(s.hours).toLocaleString()}h</div><button class="delete-btn" data-delete-session="${s.id}" aria-label="Delete study session">×</button></div>`).join(""):'<div class="empty-state">Your first study session will show up here. Make the effort visible.</div>';
 document.querySelectorAll("[data-delete-session]").forEach(b=>b.onclick=()=>{state.sessions=state.sessions.filter(s=>s.id!==b.dataset.deleteSession);saveState();showToast("Study session removed")});
 const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=d.toLocaleDateString("en-CA");days.push({iso,label:d.toLocaleDateString(undefined,{weekday:"short"}).slice(0,2),hours:sessions.filter(s=>s.date===iso).reduce((sum,s)=>sum+Number(s.hours),0)})}
 const max=Math.max(1,...days.map(d=>d.hours));document.getElementById("weekly-bars").innerHTML=days.map(d=>`<div class="week-bar-wrap"><div class="week-bar ${d.iso===todayISO()?"today":""}" style="height:${Math.max(3,d.hours/max*100)}%"><span>${d.hours?d.hours.toLocaleString(undefined,{maximumFractionDigits:1})+"h":""}</span></div><small>${d.label}</small></div>`).join("");
}
function goView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));document.getElementById("page-name").textContent=({overview:"Overview",chapters:"Chapter tracker",tests:"Mock tests",planner:"Revision planner",studylog:"Study log"})[name]||"Overview";document.getElementById("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.addEventListener("click",()=>goView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>goView(b.dataset.go)));
document.getElementById("mobile-menu").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.getElementById("chapter-subject-tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{currentSubject=b.dataset.subject;document.querySelectorAll(".subject-tab").forEach(x=>x.classList.toggle("active",x===b));renderChapters()});
document.getElementById("chapter-search").addEventListener("input",renderChapters);
document.getElementById("planner-subject").addEventListener("change",updatePlannerChapters);
document.getElementById("test-form").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target),score=Number(f.get("score")),max=Number(f.get("max"));if(score>max){showToast("Marks obtained cannot exceed maximum marks.");return}state.tests.push({id:crypto.randomUUID(),name:f.get("name").trim(),subject:f.get("subject"),date:f.get("date"),score,max,notes:f.get("notes").trim()});saveState();e.target.reset();e.target.elements.date.value=todayISO();e.target.elements.max.value="70";showToast("Test result saved. Keep going!")});
document.getElementById("planner-form").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target);state.revisions.push({id:crypto.randomUUID(),subject:f.get("subject"),chapter:f.get("chapter"),date:f.get("date"),focus:f.get("focus"),done:false});saveState();showToast("Revision added to your planner ✨")});
document.getElementById("study-form").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target);state.sessions.push({id:crypto.randomUUID(),date:f.get("date"),subject:f.get("subject"),hours:Number(f.get("hours")),focus:Number(f.get("focus")),notes:f.get("notes").trim()});saveState();e.target.reset();e.target.elements.date.value=todayISO();e.target.elements.focus.value="7";showToast("Study session saved. Proud of you!")});
document.getElementById("export-btn").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="boardbloom-backup.json";a.click();URL.revokeObjectURL(url);showToast("Backup exported")};
document.getElementById("import-btn").onclick=()=>document.getElementById("import-file").click();
document.getElementById("import-file").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!parsed||typeof parsed!=="object"||!parsed.chapters||!Array.isArray(parsed.tests)||!Array.isArray(parsed.revisions)||!Array.isArray(parsed.sessions))throw new Error("Invalid backup");if(!confirm("Import this backup and replace the current tracker data? Export a backup first if needed."))return;state={...defaultState(),...parsed};saveState();showToast("Backup imported")}catch{showToast("Could not import. Please choose a valid BoardBloom backup.")}e.target.value=""});
document.getElementById("test-form").elements.date.value=todayISO();document.getElementById("study-form").elements.date.value=todayISO();document.getElementById("planner-form").elements.date.value=todayISO();
renderAll();
