import { useEffect, useMemo, useState } from "react";
import { Bookmark, Compass, Heart, Home, ImagePlus, Search, Settings2, Sun, Moon, Monitor, Download, Bell, UserRound, Plus, X, LogIn, LogOut } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type MediaItem = { id: string; title: string; creator: string; category: string; image: string; height: number; };
const demoMedia: MediaItem[] = [
  { id:"1", title:"Birds in Flight", creator:"Theo Nakamura", category:"Nature", image:"https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=85", height:290 },
  { id:"2", title:"Oak and Linen", creator:"Kwame Boateng", category:"Nature", image:"https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85", height:430 },
  { id:"3", title:"Boardroom Glass", creator:"Lucas van der Merwe", category:"Architecture", image:"https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85", height:360 },
  { id:"4", title:"Coastal Quiet", creator:"Amara Okoye", category:"Travel", image:"https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85", height:260 },
  { id:"5", title:"Prototype Bench", creator:"Theo Nakamura", category:"Architecture", image:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85", height:340 },
  { id:"6", title:"Wildflower Meadow", creator:"Amara Okoye", category:"Nature", image:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85", height:390 },
  { id:"7", title:"Modern African House", creator:"Mekdes Bekele", category:"Architecture", image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85", height:310 },
  { id:"8", title:"Mountain Light", creator:"Lucas van der Merwe", category:"Travel", image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85", height:420 },
];

type Theme = "light" | "dark" | "system";
export default function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("vistora-theme") as Theme) || "system");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(localStorage.getItem("vistora-saved") || "[]"));
  const [liked, setLiked] = useState<string[]>([]);
  const [page, setPage] = useState("Home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("vistora-theme", theme);
    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [theme]);
  useEffect(() => { localStorage.setItem("vistora-saved", JSON.stringify(saved)); }, [saved]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSessionEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSessionEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const filtered = useMemo(() => demoMedia.filter(item =>
    (category === "All" || item.category === category) &&
    (page !== "Saved" || saved.includes(item.id)) &&
    (item.title + " " + item.creator + " " + item.category).toLowerCase().includes(query.toLowerCase())
  ), [category, page, query, saved]);

  async function signIn() {
    if (!supabase) { setNotice("Add Supabase URL and publishable key to .env.local first."); return; }
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    setNotice(error ? error.message : "Magic link sent. Check your email.");
  }
  async function signOut() { if (supabase) await supabase.auth.signOut(); setNotice("Signed out."); }
  function toggleSave(id: string) { setSaved(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]); }
  function download(item: MediaItem) {
    const link = document.createElement("a"); link.href = item.image; link.target = "_blank"; link.rel = "noreferrer"; link.download = item.title.toLowerCase().replaceAll(" ", "-") + ".jpg"; link.click();
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => { setPage("Home"); setSettingsOpen(false); }} aria-label="VISTORA home"><span className="brand-v">V</span><span>VISTORA</span></button>
      <div className="top-actions">
        <button className="icon-btn add-btn" aria-label="Create" onClick={() => setNotice("Media upload is coming with Supabase Storage integration.")}><Plus /></button>
        <button className="icon-btn" aria-label="Change theme" onClick={() => setTheme(t => t === "light" ? "dark" : t === "dark" ? "system" : "light")}>{theme === "dark" ? <Moon/> : theme === "system" ? <Monitor/> : <Sun/>}</button>
        <button className="icon-btn" aria-label="Notifications" onClick={() => setNotice("You're all caught up.")}><Bell /></button>
        <button className="avatar" aria-label="Account" onClick={() => setAuthOpen(v => !v)}>{sessionEmail?.slice(0,1).toUpperCase() || "S"}</button>
      </div>
    </header>
    <div className="layout">
      <aside className="sidebar">
        <p className="side-tag">DISCOVER</p>
        {["Home","Explore","Photos","Videos","Trending"].map((name,i)=><button key={name} className={page===name?"side-link active":"side-link"} onClick={()=>{setPage(name);setSettingsOpen(false)}}>{[<Home/>,<Compass/>,<ImagePlus/>,<ImagePlus/>,<Heart/>][i]}<span>{name}</span></button>)}
        <p className="side-tag">YOUR SPACE</p>
        <button className={page==="Saved"?"side-link active":"side-link"} onClick={()=>{setPage("Saved");setSettingsOpen(false)}}><Bookmark/><span>Saved</span><span className="count">{saved.length}</span></button>
        <button className={settingsOpen?"side-link active":"side-link"} onClick={()=>setSettingsOpen(v=>!v)}><Settings2/><span>Settings</span></button>
        <div className="sidebar-foot"><span className="brand-v">V</span><p>Discover. Save. Create.</p><small>Visual inspiration, everywhere.</small></div>
      </aside>
      <main className="main-content">
        {settingsOpen ? <section className="settings-view">
          <p className="eyebrow">PREFERENCES</p><h1>Settings</h1><p className="muted">Make VISTORA feel like yours.</p>
          <div className="setting-card"><div><strong>Theme</strong><p>Choose how VISTORA looks.</p></div><div className="segmented">{(["light","dark","system"] as Theme[]).map(t=><button key={t} className={theme===t?"selected":""} onClick={()=>setTheme(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div></div>
          <div className="setting-card"><div><strong>Account</strong><p>{sessionEmail || "Sign in to sync your profile and saved items."}</p></div><button className="outline-btn" onClick={()=>sessionEmail?void signOut():setAuthOpen(true)}>{sessionEmail?<><LogOut size={16}/> Sign out</>:<><LogIn size={16}/> Sign in</>}</button></div>
          <div className="setting-card"><div><strong>Privacy foundation</strong><p>Private collections will be enforced by database Row Level Security, not by UI state.</p></div><span className="status-pill">SERVER-SIDE</span></div>
          <div className="setting-card"><div><strong>Backend status</strong><p>{isSupabaseConfigured ? "Supabase environment variables detected." : "Not configured yet. Copy .env.example to .env.local and add your Supabase project URL and publishable key."}</p></div><span className={isSupabaseConfigured?"status-pill":"status-pill warning"}>{isSupabaseConfigured?"CONFIGURED":"SETUP NEEDED"}</span></div>
          <button className="outline-btn" onClick={()=>{if(confirm("Clear local saved items and theme preference?")){localStorage.removeItem("vistora-saved");localStorage.removeItem("vistora-theme");setSaved([]);setTheme("system");setNotice("Local preferences cleared.")}}}>Clear local data</button>
        </section> : <>
          <section className="hero">
            <div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div>
            <p className="eyebrow">A WORLD OF INSPIRATION</p>
            <h1>Welcome back, Surafel.</h1>
            <p className="hero-copy">Your next idea is closer than you think.<br/>Discover. Save. Create.</p>
            <form className="searchbar" onSubmit={e=>{e.preventDefault();setPage("Explore")}}><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search photos, videos, ideas..." aria-label="Search photos, videos, ideas"/>{query&&<button type="button" className="clear-search" onClick={()=>setQuery("")}><X size={18}/></button>}<button className="search-submit" type="submit"><Search/></button></form>
            <div className="suggestions">{["classic car drive","modern african house","quiet landscapes"].map(s=><button key={s} onClick={()=>setQuery(s)}>{s}</button>)}</div>
          </section>
          <section className="feed-heading"><div><p className="eyebrow">{page==="Saved"?"YOUR COLLECTION":"CURATED FOR YOU"}</p><h2>{page==="Saved"?"Saved inspiration":"Explore the visual world"}</h2></div><div className="saved-summary"><Bookmark/><div><small>SAVED</small><strong>{saved.length}</strong><small>Across 5 collections</small></div></div></section>
          <nav className="categories" aria-label="Categories">{["All","Nature","Travel","Architecture"].map(c=><button key={c} className={category===c?"category active":"category"} onClick={()=>setCategory(c)}>{c}</button>)}</nav>
          <section className="masonry" aria-label="Visual discovery feed">{filtered.map(item=><article className="media-card" key={item.id}><div className="media-image" style={{height:item.height}}><img src={item.image} alt={item.title} loading="lazy"/><div className="card-actions"><button aria-label={saved.includes(item.id)?"Remove saved item":"Save item"} className={saved.includes(item.id)?"round-action active": "round-action"} onClick={()=>toggleSave(item.id)}><Bookmark size={18} fill={saved.includes(item.id)?"currentColor":"none"}/></button><button aria-label="Like item" className={liked.includes(item.id)?"round-action liked":"round-action"} onClick={()=>setLiked(old=>old.includes(item.id)?old.filter(x=>x!==item.id):[...old,item.id])}><Heart size={18} fill={liked.includes(item.id)?"currentColor":"none"}/></button><button aria-label="Download image" className="round-action" onClick={()=>download(item)}><Download size={18}/></button></div><span className="media-type">PHOTO</span></div><div className="media-meta"><h3>{item.title}</h3><p><span className="author-avatar">{item.creator.split(" ").map(x=>x[0]).slice(0,2).join("")}</span><span>{item.creator}</span><span className="dot">·</span><span>Photo</span></p></div></article>)}</section>
          {filtered.length===0&&<div className="empty-state"><Search/><h3>No inspiration found</h3><p>Try another search or category.</p><button className="outline-btn" onClick={()=>{setQuery("");setCategory("All");setPage("Home")}}>Reset discovery</button></div>}
        </>}
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Main navigation">{[["Home",Home],["Explore",Compass],["Create",Plus],["Saved",Bookmark],["Profile",UserRound]].map(([name,Icon]:any)=><button key={name} className={page===name?"mobile-item active":name==="Create"?"mobile-item create-item":"mobile-item"} onClick={()=>{if(name==="Create"){setNotice("Upload support will be connected to Supabase Storage next.");return}if(name==="Profile"){setAuthOpen(true);return}setPage(name);setSettingsOpen(false)}}><Icon/><span>{name}</span></button>)}</nav>
    {authOpen&&<div className="modal-backdrop" onClick={()=>setAuthOpen(false)}><section className="auth-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAuthOpen(false)}><X/></button><span className="brand-v">V</span><h2>{sessionEmail?"Your VISTORA account":"Welcome to VISTORA"}</h2><p>{sessionEmail||"Enter your email and we'll send you a secure sign-in link."}</p>{!sessionEmail&&<form onSubmit={e=>{e.preventDefault();void signIn()}}><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><button className="primary-btn" disabled={busy}>{busy?"Sending…":"Send magic link"}</button></form>}{sessionEmail&&<button className="primary-btn" onClick={()=>void signOut()}>Sign out</button>}<small>{isSupabaseConfigured?"Secure sign-in powered by Supabase Auth.":"Demo mode: configure Supabase to enable authentication."}</small></section></div>}
    {notice&&<div className="toast" role="status">{notice}<button onClick={()=>setNotice("")}><X size={16}/></button></div>}
    <footer className="site-footer">VISTORA © {new Date().getFullYear()} <span>Discover. Save. Create.</span></footer>
  </div>;
}