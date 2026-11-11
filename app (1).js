(function(){
"use strict";
var KEY="ccms.complaints",CATS=["Hostel","Library","Classroom & Infrastructure","Canteen","Transport","Academic","Other"],STAT=["Pending","In Progress","Resolved"];
var user=null,view="",C=[];
try{C=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){C=null}
if(!Array.isArray(C))C=[
{id:"CMP-1001",by:"Aarav",title:"Wi-Fi not working in Hostel Block B",cat:"Hostel",pri:"High",desc:"No internet since Monday on floors 2 and 3.",status:"In Progress",resp:"Network team has been informed.",date:"2026-11-05"},
{id:"CMP-1002",by:"Meena",title:"Library AC is not cooling",cat:"Library",pri:"Medium",desc:"Reading hall gets very hot in the afternoon.",status:"Pending",resp:"",date:"2026-11-08"},
{id:"CMP-1003",by:"Aarav",title:"Broken benches in Classroom 204",cat:"Classroom & Infrastructure",pri:"Low",desc:"Three benches have loose legs.",status:"Resolved",resp:"Benches repaired on 9 Nov.",date:"2026-11-02"}];
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(C))}catch(e){}}
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove("on")},2000)}
function mine(){return user.role==="admin"?C:C.filter(function(c){return c.by.toLowerCase()===user.name.toLowerCase()})}
function cnt(a,s){return a.filter(function(c){return c.status===s}).length}

$("loginForm").onsubmit=function(e){
  e.preventDefault();var r=$("role").value,u=$("uid").value.trim(),p=$("pw").value;
  if(r==="admin"&&!(u.toLowerCase()==="admin"&&p==="admin123"))return $("lerr").textContent="Wrong admin ID or password.";
  if(r==="student"&&p!=="student123")return $("lerr").textContent="Wrong password. Use student123 for the demo.";
  user={role:r,name:u};$("lerr").textContent="";$("login").classList.add("hide");$("app").classList.remove("hide");
  $("who").textContent=u+" ("+r+")";
  var tabs=r==="admin"?[["dash","Dashboard"],["list","All complaints"]]:[["dash","Dashboard"],["new","New complaint"],["list","My complaints"]];
  $("nav").innerHTML=tabs.map(function(t){return '<button data-v="'+t[0]+'">'+t[1]+'</button>'}).join("");
  go("dash");
};
$("logout").onclick=function(){user=null;$("app").classList.add("hide");$("login").classList.remove("hide");$("loginForm").reset()};
$("nav").onclick=function(e){var b=e.target.closest("button");if(b)go(b.dataset.v)};

function go(v){
  view=v;["dash","new","list"].forEach(function(n){$("v-"+n).classList.toggle("hide",n!==v)});
  document.querySelectorAll("#nav button").forEach(function(b){b.classList.toggle("on",b.dataset.v===v)});
  if(v==="dash")dash();if(v==="list")list();if(v==="new")document.querySelectorAll(".err").forEach(function(x){x.textContent=""});
}
function dash(){
  var a=mine(),by={};a.forEach(function(c){by[c.cat]=(by[c.cat]||0)+1});
  var ks=Object.keys(by).sort(function(x,y){return by[y]-by[x]}),mx=ks.length?by[ks[0]]:1;
  $("v-dash").innerHTML='<h2>Dashboard</h2><p class="mu">'+(user.role==="admin"?"All complaints across the college.":"Your complaints at a glance.")+'</p><div class="stats"><div class="st main"><b>'+a.length+'</b>Total complaints</div><div class="st"><b>'+cnt(a,"Pending")+'</b>Pending</div><div class="st"><b>'+cnt(a,"In Progress")+'</b>In progress</div><div class="st"><b>'+cnt(a,"Resolved")+'</b>Resolved</div></div><div class="card"><h3 style="margin-top:0">By category</h3><div class="bars">'+(ks.length?ks.map(function(k){return '<div class="bar"><span>'+esc(k)+'</span><div class="tr"><div class="fl" style="width:'+by[k]/mx*100+'%"></div></div><b>'+by[k]+'</b></div>'}).join(""):'<div class="empty">No complaints yet.</div>')+'</div></div>';
}
$("cForm").onsubmit=function(e){
  e.preventDefault();var f=e.target,v={title:f.title.value.trim(),cat:f.cat.value,pri:f.pri.value,desc:f.desc.value.trim()},bad=false;
  document.querySelectorAll("#cForm .err").forEach(function(x){x.textContent=""});
  function er(k,m){document.querySelector('[data-e="'+k+'"]').textContent=m;bad=true}
  if(!v.title)er("title","Enter a short title.");if(!v.cat)er("cat","Select a category.");if(v.desc.length<10)er("desc","Describe the problem in at least 10 characters.");
  if(bad)return;
  var n=1000+C.length+1+Math.floor(Math.random()*9);
  v.id="CMP-"+n;v.by=user.name;v.status="Pending";v.resp="";v.date=new Date().toISOString().slice(0,10);
  C.unshift(v);save();f.reset();toast("Complaint "+v.id+" submitted");go("list");
};
function fillCats(){var s=$("fc");if(s.options.length<2)CATS.forEach(function(c){var o=document.createElement("option");o.textContent=c;s.appendChild(o)})}
function list(){
  fillCats();var adm=user.role==="admin";
  $("lt").textContent=adm?"All complaints":"My complaints";$("ls").textContent=adm?"Review, respond and update status.":"Track the status of what you submitted.";
  var q=$("q").value.trim().toLowerCase(),fs=$("fs").value,fc=$("fc").value;
  var r=mine().filter(function(c){return(!q||c.title.toLowerCase().indexOf(q)>-1||c.id.toLowerCase().indexOf(q)>-1)&&(!fs||c.status===fs)&&(!fc||c.cat===fc)});
  $("rows").innerHTML=r.length?r.map(function(c){
    return '<article class="cp"><h3>'+esc(c.title)+'</h3><div class="meta"><span>'+c.id+'</span><span>'+esc(c.cat)+'</span><span class="pill s-'+c.status+'">'+c.status+'</span><span class="pill p-'+c.pri+'">'+c.pri+' priority</span><span>'+c.date+(adm?' · by '+esc(c.by):'')+'</span></div><div>'+esc(c.desc)+'</div>'+(c.resp?'<div class="resp"><b>Response:</b> '+esc(c.resp)+'</div>':'')+(adm?'<div class="acts"><button class="btn sm" data-u="'+c.id+'">Update</button><button class="btn ghost sm" data-d="'+c.id+'">Delete</button></div>':'')+'</article>';
  }).join(""):'<div class="empty">No complaints found. '+(adm?'Try clearing the filters.':'Select New complaint to report an issue.')+'</div>';
}
["q","fs","fc"].forEach(function(i){$(i).oninput=$(i).onchange=list});
$("rows").onclick=function(e){
  var b=e.target.closest("button");if(!b)return;
  if(b.dataset.u){var c=C.filter(function(x){return x.id===b.dataset.u})[0];
    $("dlg").innerHTML='<h3>Update '+c.id+'</h3><label>Status<select id="us">'+STAT.map(function(s){return '<option'+(s===c.status?' selected':'')+'>'+s+'</option>'}).join("")+'</select></label><label>Response to student<textarea id="ur" rows="4">'+esc(c.resp)+'</textarea></label><div class="row"><button class="btn ghost" id="uc">Cancel</button><button class="btn" id="usv">Save update</button></div>';
    $("dlg").showModal();$("uc").onclick=function(){$("dlg").close()};
    $("usv").onclick=function(){c.status=$("us").value;c.resp=$("ur").value.trim();save();$("dlg").close();list();toast("Complaint updated")};}
  if(b.dataset.d){var id=b.dataset.d;
    $("dlg").innerHTML='<h3>Delete '+id+'?</h3><p>This removes the complaint permanently.</p><div class="row"><button class="btn ghost" id="dc">Keep complaint</button><button class="btn" id="dy" style="background:var(--dg);border-color:var(--dg)">Delete complaint</button></div>';
    $("dlg").showModal();$("dc").onclick=function(){$("dlg").close()};
    $("dy").onclick=function(){C=C.filter(function(x){return x.id!==id});save();$("dlg").close();list();toast("Complaint deleted")};}
};
})();
