/* STONEFORGE — Book a Consultation (consultation room). Own code.
   Reference kit-room pattern: sticky stage with the initials composited on the
   model photo, form column with section rows, sticky summary with the consultation fee. */
(function(){
"use strict";
const SERVICES=["High-Rise Construction","Concrete Works","Glass & Steel Facades","Interiors & Fit-Out","Villa Construction","Tower Renovation","Office Build-Outs","Retail Shells","Warehouse Construction","Heritage Restoration","Landscape Structures","Pool Construction","Structural Audits","Design & Blueprint","Turnkey Projects","Site Surveys","Drone Progress Films"];
let service=SERVICES[0], place="Forge Yard — Whitefield", frameColor="#1558C9";
const $=id=>document.getElementById(id);
const chips=$("serviceChips");
SERVICES.forEach((s,i)=>{
  const b=document.createElement("button"); b.type="button"; b.textContent=s; if(i===0)b.classList.add("on");
  b.addEventListener("click",()=>{ service=s; chips.querySelectorAll("button").forEach(x=>x.classList.remove("on")); b.classList.add("on"); sync(); });
  chips.appendChild(b);
});
const placeChips=$("placeChips");
placeChips.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
  place=b.textContent; placeChips.querySelectorAll("button").forEach(x=>x.classList.remove("on")); b.classList.add("on"); sync();
}));
document.querySelectorAll("#swatches button").forEach(b=>b.addEventListener("click",()=>{
  frameColor=b.dataset.color; $("vColor").textContent=b.dataset.name;
  document.querySelectorAll("#swatches button").forEach(x=>x.classList.remove("on")); b.classList.add("on"); draw();
}));
function initialsOf(name){
  const parts=(name||"").trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return "X";
  if(parts.length===1) return parts[0][0].toUpperCase();
  return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
}
const can=$("kitCanvas"), ctx=can.getContext("2d");
function draw(){
  const W=can.width, H=can.height; if(!W||!H) return;
  ctx.clearRect(0,0,W,H);
  /* initials drawn INTO the photo, vertical — same composite as the homepage tool */
  const names=$("kNames").value||$("kName").value||"";
  const ini=initialsOf(names||"Your Names");
  const x=W*0.88, y=H*0.66, fs=Math.round(H*0.085);
  ctx.save(); ctx.translate(x,y); ctx.rotate(-Math.PI/2);
  ctx.font="900 "+fs+"px 'FK Screamer', Impact, sans-serif";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.shadowColor="rgba(0,0,0,.45)"; ctx.shadowBlur=10;
  ctx.fillStyle="#FFFFFF"; ctx.fillText(ini,0,0);
  ctx.font=(fs*0.34)+"px 'Caveat', cursive"; ctx.fillStyle=frameColor;
  ctx.fillText("cast by STONEFORGE",0,fs*0.78);
  ctx.restore();
}
function fitKit(){
  const st=can.parentElement, w=st.clientWidth, h=st.clientHeight;
  if(w&&h&&(can.width!==w||can.height!==h)){ can.width=w; can.height=h; }
  draw();
}
window.addEventListener("resize",fitKit);
function sync(){
  $("stageSvc").textContent=service;
  $("vService").textContent=service.replace(/ Construction$/,"");
  $("vPlace").textContent=place;
  $("sumLine").textContent=service+" — consultation fee";
  const names=$("kNames").value||$("kName").value||"";
  const ini=initialsOf(names||"Your Names");
  const prev=$("iniPreview");
  prev.textContent=ini;
  prev.classList.toggle("live", !!names.trim());
  draw();
}
["kName","kNames","kDate"].forEach(id=>$(id).addEventListener("input",sync));
function message(){
  const addons=[...document.querySelectorAll(".addon:checked")].map(x=>x.value);
  const lines=["Hello STONEFORGE, I would like to book a site consultation.",
    "Service: "+service,
    "Name: "+($("kName").value||"—"),
    "Name for the foundation stone: "+($("kNames").value||"—"),
    "Phone: "+($("kPhone").value||"—"),
    "Email: "+($("kEmail").value||"—"),
    "Preferred date: "+($("kDate").value||"To be discussed"),
    "Place: "+place,
    "Add-ons: "+(addons.length?addons.join(", "):"None"),
    "Notes: "+($("kNotes").value||"—"),
    "I understand the consultation fee is ₹5,000, adjusted against my project."];
  return lines.join("\n");
}
$("sendWa").addEventListener("click",()=>{ window.open("https://wa.me/918047122650?text="+encodeURIComponent(message()),"_blank"); });
$("sendMail").addEventListener("click",()=>{ location.href="mailto:hello@stoneforgebuilds.com?subject="+encodeURIComponent("Consultation booking — "+service)+"&body="+encodeURIComponent(message()); });
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitKit);
fitKit();
sync();
})();
