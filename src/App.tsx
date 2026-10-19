import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, Bell, Bookmark, Check, ChevronDown, Compass,
  Heart, Image as ImageIcon, LayoutGrid, Menu, Moon, Search, Settings2,
  Sparkles, Sun, Upload, UserRound, Video, X
} from "lucide-react";
import { supabase } from "./lib/supabase";

type Pin = { id: number; title: string; creator: string; category: string; image: string; height: number };
const pins: Pin[] = [
  { id: 1, title: "Quiet mornings in Kyoto", creator: "Mina Sato", category: "Photography", image: "photo-1493976040374-85c8e12f0c0e", height: 330 },
  { id: 2, title: "Soft sculptural forms", creator: "Studio Forma", category: "Design", image: "photo-1490312278390-ab64016e0aa9", height: 250 },
  { id: 3, title: "Coastal light", creator: "Noah Ellis", category: "Nature", image: "photo-1473116763249-2faaef81ccda", height: 390 },
  { id: 4, title: "Everyday still life", creator: "Lena Rose", category: "Photography", image: "photo-1494438639946-1ebd1d20bf85", height: 290 },
  { id: 5, title: "Architecture in sand", creator: "Omar N.", category: "Architecture", image: "photo-1511818966892-d7d671e672a2", height: 360 },
  { id: 6, title: "A little color theory", creator: "Color Dept.", category: "Design", image: "photo-1494438639946-1ebd1d20bf85", height: 220 },
  { id: 7, title: "Wild and wonderful", creator: "Ari Green", category: "Nature", image: "photo-1441974231531-c6227db76b6e", height: 310 },
  { id: 8, title: "The art of slow living", creator: "Jules Martin", category: "Lifestyle", image: "photo-1449247709967-d4461a6a6103", height: 270 },
  { id: 9, title: "Lines and shadows", creator: "Theo Park", category: "Architecture", image: "photo-1487958449943-2429e8be8625", height: 350 },
  { id: 10, title: "Bloom study no. 4", creator: "Nia Bloom", category: "Nature", image: "photo-1490750967868-88aa4486c946", height: 280 },
  { id: 11, title: "Objects with meaning", creator: "Atelier 08", category: "Design", image: "photo-1490312278390-ab64016e0aa9", height: 340 },
  { id: 12, title: "Weekend in the hills", creator: "Sam Rivera", category: "Travel", image: "photo-1464822759023-fed622ff2c3b", height: 300 }
];
const categories = ["For you", "Photography", "Design", "Architecture", "Nature", "Lifestyle", "Travel"];
const imageUrl = (id: string) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=850&q=85";

export default function App() {
  const [category, setCategory] = useState("For you");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [liked, setLiked] = useState<number[]>([]);
  const [dark, setDark] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const filtered = useMemo(() => pins.filter(pin =>
    (category === "For you" || pin.category === category) &&
    (pin.title + " " + pin.creator + " " + pin.category).toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  async function signIn() {
    if (!email.trim()) { setAuthMessage("Enter your email address first."); return; }
    if (!supabase) { setAuthMessage("Add your Supabase URL and anon key in .env.local to enable sign-in."); return; }
    setBusy(true); setAuthMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setAuthMessage(error ? error.message : "Check your email for your secure sign-in link.");
    setBusy(false);
  }

  return <div className={dark ? "app dark" : "app"}>
    <aside className={mobileMenu ? "sidebar open" : "sidebar"}>
      <a className="brand" href="#" aria-label="VISTORA home"><span className="brand-mark"><Sparkles size={20}/></span>vistora<span className="brand-dot">.</span></a>
      <button className="mobile-close icon-btn" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X/></button>
      <div className="side-label">DISCOVER</div>
      <nav className="side-nav">
        <button className={category === "For you" ? "nav-item active" : "nav-item"} onClick={() => {setCategory("For you");setMobileMenu(false)}}><Compass size={18}/> For you <span className="nav-pill">New</span></button>
        <button className="nav-item" onClick={() => {setCategory("Photography");setMobileMenu(false)}}><ImageIcon size={18}/> Photography</button>
        <button className="nav-item" onClick={() => {setCategory("Design");setMobileMenu(false)}}><LayoutGrid size={18}/> Design</button>
        <button className="nav-item" onClick={() => {setCategory("Travel");setMobileMenu(false)}}><Video size={18}/> Travel & film</button>
      </nav>
      <div className="side-label collection-label">YOUR SPACE</div>
      <nav className="side-nav">
        <button className="nav-item" onClick={() => setCategory("For you")}><Bookmark size={18}/> Saved ideas <span className="count">{saved.length}</span></button>
        <button className="nav-item" onClick={() => setAuthOpen(true)}><UserRound size={18}/> Your profile</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="pro-card"><span className="pro-icon"><Sparkles size={17}/></span><strong>A space for ideas</strong><p>Collect what inspires you, all in one place.</p><button onClick={() => setAuthOpen(true)}>Get started <ArrowRight size={14}/></button></div>
        <button className="nav-item" onClick={() => setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>} {dark ? "Light appearance" : "Dark appearance"}</button>
        <div className="profile-mini"><div className="avatar">{userEmail ? userEmail[0].toUpperCase() : "V"}</div><div className="profile-copy"><strong>{userEmail ? userEmail.split("@")[0] : "Guest explorer"}</strong><span>{userEmail || "Sign in to sync your ideas"}</span></div><button className="icon-btn" onClick={() => setAuthOpen(true)} aria-label="Account settings"><Settings2 size={17}/></button></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu/></button>
        <div className="searchbox"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ideas, styles, creators..." aria-label="Search ideas"/>{query && <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={15}/></button>}<kbd>⌘ K</kbd></div>
        <div className="top-actions"><button className="icon-btn notification-btn" aria-label="Notifications"><Bell size={19}/><i/></button><button className="upload-btn" onClick={() => setAuthOpen(true)}><Upload size={16}/> Share idea</button><button className="user-btn" onClick={() => setAuthOpen(true)}><span className="avatar small">{userEmail ? userEmail[0].toUpperCase() : "V"}</span><ChevronDown size={14}/></button></div>
      </header>

      <section className="welcome">
        <div><div className="eyebrow"><span/> YOUR DAILY DOSE OF INSPIRATION</div><h1>Find your next <em>big idea.</em></h1><p>A little inspiration can take you somewhere unexpected.</p></div>
        <div className="welcome-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><span>✳</span><small>STAY CURIOUS</small></div>
      </section>

      <section className="category-row" aria-label="Filter by category">
        {categories.map(item => <button key={item} className={category === item ? "category-chip selected" : "category-chip"} onClick={() => setCategory(item)}>{item}</button>)}
        <button className="filter-btn" onClick={() => setCategory("For you")}><Settings2 size={15}/> Reset</button>
      </section>

      <div className="feed-heading"><div><h2>{query ? "Search results" : category === "For you" ? "Made for your mood" : category + " inspiration"}</h2><p>{filtered.length} ideas to explore</p></div><button className="sort-btn">Curated for you <ChevronDown size={15}/></button></div>

      {filtered.length ? <section className="masonry" aria-label="Inspiration feed">
        {filtered.map((pin, index) => <article className="pin-card" key={pin.id}>
          <div className="pin-image" style={{height: pin.height + "px"}}>
            <img src={imageUrl(pin.image)} alt={pin.title} loading={index > 3 ? "lazy" : "eager"}/>
            <div className="image-gradient"/>
            <span className="pin-category">{pin.category}</span>
            <button className="pin-save" onClick={() => setSaved(old => old.includes(pin.id) ? old.filter(id => id !== pin.id) : [...old, pin.id])} aria-label={saved.includes(pin.id) ? "Unsave idea" : "Save idea"}>{saved.includes(pin.id) ? <Check size={17}/> : <Bookmark size={17}/>}</button>
            <button className="pin-download" onClick={() => window.open(imageUrl(pin.image), "_blank", "noopener,noreferrer")} aria-label="Open image"><ArrowDownToLine size={16}/></button>
          </div>
          <div className="pin-meta"><div><h3>{pin.title}</h3><p><span className="creator-avatar">{pin.creator[0]}</span>{pin.creator}</p></div><button className={liked.includes(pin.id) ? "like-btn liked" : "like-btn"} onClick={() => setLiked(old => old.includes(pin.id) ? old.filter(id => id !== pin.id) : [...old, pin.id])} aria-label={liked.includes(pin.id) ? "Unlike idea" : "Like idea"}><Heart size={17} fill={liked.includes(pin.id) ? "currentColor" : "none"}/></button></div>
        </article>)}
      </section> : <div className="empty-state"><Search size={30}/><h3>No ideas found</h3><p>Try another search or category.</p><button className="upload-btn" onClick={() => {setQuery("");setCategory("For you")}}>Clear filters</button></div>}

      <footer className="footer"><span>© 2026 VISTORA</span><span>Made for the endlessly curious <span className="footer-star">✳</span></span><a href="https://supabase.com" target="_blank" rel="noreferrer">Secure auth by Supabase</a></footer>
    </main>

    {authOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => {if(e.target === e.currentTarget) {setAuthOpen(false);setAuthMessage("")}}}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close icon-btn" onClick={() => {setAuthOpen(false);setAuthMessage("")}} aria-label="Close sign in"><X/></button>
        <div className="modal-logo"><Sparkles size={23}/></div><div className="eyebrow centered">YOUR CREATIVE CORNER</div><h2 id="auth-title">{userEmail ? "You're signed in" : "Make room for inspiration."}</h2><p>{userEmail ? "Your account is connected. Saved items in this demo remain in this browser." : "Sign in with a magic link to start building your personal collection."}</p>
        {userEmail ? <button className="upload-btn full" onClick={async () => {await supabase?.auth.signOut();setAuthOpen(false)}}>Sign out</button> : <><label className="field-label" htmlFor="email">Email address</label><input id="email" className="email-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => {if(e.key === "Enter") void signIn()}}/><button className="upload-btn full" onClick={() => void signIn()} disabled={busy}>{busy ? "Sending link…" : "Continue with email"} <ArrowRight size={16}/></button>{authMessage && <p className="auth-message" role="status">{authMessage}</p>}<p className="fine-print">No password needed. Your sign-in link is sent securely by Supabase.</p></>}
      </section>
    </div>}
    <div className="toast-note"><span className="toast-dot"/> Free to explore <span>·</span> No subscription required</div>
  </div>;
}