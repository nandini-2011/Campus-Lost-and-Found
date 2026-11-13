import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://127.0.0.1:5000/api";
function App() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("All");
  const [form, setForm] = useState({ title:"", kind:"Lost", description:"", location:"", contact:"" });
  const [message, setMessage] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kind !== "All") params.set("kind", kind);
    try {
      const res = await fetch(API + "/items?" + params);
      setItems(await res.json());
    } catch { setMessage("Cannot reach the backend. Start the Flask server first."); }
  }
  useEffect(() => { load(); }, [q, kind]);

  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setMessage("");
    const res = await fetch(API + "/items", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) { setForm({ title:"", kind:"Lost", description:"", location:"", contact:"" }); load(); }
  }
  async function resolve(id) {
    const res = await fetch(API + "/items/" + id + "/resolve", { method:"PATCH" });
    const data = await res.json(); setMessage(data.message || data.error); load();
  }

  return <main className="wrap">
    <header><div className="mark">🔎</div><div><p className="eyebrow">YOUR CAMPUS COMMUNITY</p><h1>Campus Lost <span>&</span> Found</h1><p className="sub">Lost something? Found something? Help it find its way home.</p></div></header>
    <section className="hero"><h2>One campus. A little more connected.</h2><p>Report missing belongings or help someone reclaim what they lost.</p></section>
    <section className="layout">
      <form className="panel" onSubmit={submit}><h2>Post a report</h2>
        <label>Item name<input name="title" value={form.title} onChange={update} required placeholder="e.g. Blue water bottle"/></label>
        <label>Report type<select name="kind" value={form.kind} onChange={update}><option>Lost</option><option>Found</option></select></label>
        <label>Description<textarea name="description" value={form.description} onChange={update} required placeholder="Describe the item..."/></label>
        <label>Location<input name="location" value={form.location} onChange={update} required placeholder="Where was it lost/found?"/></label>
        <label>Contact details<input name="contact" value={form.contact} onChange={update} required placeholder="Email or phone"/></label>
        <button>Submit report</button>
      </form>
      <section className="panel listings"><div className="listhead"><div><h2>Recent reports</h2><p className="muted">Browse what's missing or has been found.</p></div><span className="count">{items.length} open</span></div>
        <input aria-label="Search reports" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search item or location..."/>
        <div className="filters">{["All","Lost","Found"].map(x=><button type="button" className={kind===x?"active":""} onClick={()=>setKind(x)} key={x}>{x}</button>)}</div>
        {items.length===0 ? <p className="empty">No reports found. Be the first to post one!</p> : <div className="cards">{items.map(item=><article className="item" key={item.id}><div className="itemtop"><span className={"tag "+item.kind.toLowerCase()}>{item.kind}</span><small>#{item.id}</small></div><h3>{item.title}</h3><p>{item.description}</p><p className="muted">📍 {item.location}</p><p className="contact">Contact: {item.contact}</p><button className="resolve" onClick={()=>resolve(item.id)}>Mark resolved</button></article>)}</div>}
      </section>
    </section>
    {message && <p className="message">{message}</p>}
    <footer>Campus Lost & Found · Built to bring lost belongings back to their owners.</footer>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
