import { useEffect, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, Bell, Bookmark, Check, ChevronDown, Compass,
  Heart, Image as ImageIcon, LayoutGrid, Menu, Moon, Search, Settings2,
  Sparkles, Sun, Upload, UserRound, Video, X, Expand, Eye, EyeOff, KeyRound
} from "lucide-react";
import { supabase } from "./lib/supabase";

type Pin = { id: number; title: string; creator: string; category: string; image: string; height: number };
type MediaItem = { id: string; type: "images" | "videos"; title: string; tags: string[]; image: string; thumbnail: string; full: string; video: string; user: string; width: number; height: number; likes: number; views: number; pageUrl: string };
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
const imageUrl = (id: string) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=1600&q=90";

export default function App() {
  const [category, setCategory] = useState("For you");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem("pixora:saved") || "[]"); } catch { return []; } });
  const [liked, setLiked] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem("pixora:liked") || "[]"); } catch { return []; } });
  const [dark, setDark] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Pin | null>(null);
  const [mediaType, setMediaType] = useState<"images" | "videos">("images");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaPage, setMediaPage] = useState(1);
  const [hasMoreMedia, setHasMoreMedia] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);
  const [savedMediaIds, setSavedMediaIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("pixora:saved-media") || "[]"); } catch { return []; } });

  useEffect(() => {
    localStorage.setItem("pixora:saved", JSON.stringify(saved));
  }, [saved]);
  useEffect(() => {
    localStorage.setItem("pixora:liked", JSON.stringify(liked));
  }, [liked]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setViewer(null); setAuthOpen(false); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".searchbox input")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const base = category === "Saved ideas" ? pins.filter(pin => saved.includes(pin.id)) : pins;
    return base.filter(pin =>
      (category === "For you" || category === "Saved ideas" || pin.category === category) &&
      (pin.title + " " + pin.creator + " " + pin.category).toLowerCase().includes(query.toLowerCase())
    );
  }, [category, query, saved]);

  async function toggleSavedMedia(item: MediaItem) {
    const wasSaved = savedMediaIds.includes(item.id);
    setSavedMediaIds(old => wasSaved ? old.filter(id => id !== item.id) : [...old, item.id]);
    if (!supabase || !userEmail) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (wasSaved) {
      const { error } = await supabase.from("pixora_saved_media").delete().eq("owner_id", user.id).eq("external_id", item.id).eq("media_type", item.type === "videos" ? "video" : "image");
      if (error) setAuthMessage("Saved on this device, but cloud removal failed.");
    } else {
      const { error } = await supabase.from("pixora_saved_media").upsert({
        owner_id: user.id, provider: "pixabay", external_id: item.id,
        media_type: item.type === "videos" ? "video" : "image",
        title: item.title, media_url: item.full || item.image,
        thumbnail_url: item.thumbnail || item.image, page_url: item.pageUrl
      }, { onConflict: "owner_id,provider,external_id,media_type" });
      if (error) setAuthMessage("Saved on this device, but cloud sync failed.");
    }
  }
  function openMedia(item: MediaItem) {
    setSelectedMedia(item);
    window.history.pushState({ pixoraMedia: true }, "", "?media=" + encodeURIComponent(item.id) + "&type=" + item.type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeMedia() {
    setSelectedMedia(null);
    if (new URLSearchParams(window.location.search).has("media")) window.history.back();
  }
  function openAuth(mode: "login" | "signup" | "reset" = "login") {
    setAuthMode(mode); setAuthMessage(""); setPassword(""); setAuthOpen(true);
  }
  async function submitAuth() {
    if (!email.trim()) { setAuthMessage("Please enter your email address."); return; }
    if (authMode !== "reset" && password.length < 6) { setAuthMessage("Password must be at least 6 characters."); return; }
    if (!supabase) { setAuthMessage("Authentication is not configured yet. Add the Supabase project URL and anon key to Vercel environment variables."); return; }
    setBusy(true); setAuthMessage("");
    try {
      if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        setAuthMessage(error ? error.message : "If this email has an account, a password reset link is on its way.");
      } else if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        setAuthMessage(error ? error.message : "Account created. Check your email to confirm your address before signing in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setAuthMessage(error ? error.message : "You're signed in.");
        if (!error) setTimeout(() => setAuthOpen(false), 500);
      }
    } catch { setAuthMessage("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  if (selectedMedia) return <div className={dark ? "app dark media-detail-app" : "app media-detail-app"}>
    <header className="detail-topbar"><a className="brand pixora-brand" href="/" onClick={e => {e.preventDefault();closeMedia()}}><span className="brand-mark"><Sparkles size={19}/></span><span className="brand-word">Pixora</span></a><button className="viewer-action detail-back" onClick={closeMedia}><ArrowRight size={16} className="back-arrow"/> Back to explore</button></header>
    <main className="detail-page">
      <section className="detail-hero">
        <div className="detail-media">{selectedMedia.type === "videos" ? <video controls autoPlay playsInline poster={selectedMedia.image}><source src={selectedMedia.video || selectedMedia.full} type="video/mp4"/>Your browser does not support video playback.</video> : <img src={selectedMedia.full || selectedMedia.image} alt={selectedMedia.title}/>}</div>
        <div className="detail-info"><div className="eyebrow"><span/> PIXORA DISCOVERY</div><h1>{selectedMedia.title || "Visual inspiration"}</h1><p>Shared by {selectedMedia.user} · {selectedMedia.width && selectedMedia.height ? selectedMedia.width + " × " + selectedMedia.height : "High quality media"}</p><div className="detail-tags">{selectedMedia.tags.slice(0,8).map(tag => <span key={tag}>{tag}</span>)}</div><div className="detail-buttons"><button className="upload-btn" onClick={() => void toggleSavedMedia(selectedMedia)}>{savedMediaIds.includes(selectedMedia.id) ? <Check size={16}/> : <Bookmark size={16}/>} {savedMediaIds.includes(selectedMedia.id) ? "Saved" : "Save to ideas"}</button>{selectedMedia.type === "images" && <a className="viewer-action" href={selectedMedia.full} target="_blank" rel="noreferrer"><ArrowDownToLine size={16}/> Open original</a>}{selectedMedia.pageUrl && <a className="viewer-action" href={selectedMedia.pageUrl} target="_blank" rel="noreferrer">Creator page <ArrowRight size={15}/></a>}</div></div>
      </section>
      <section className="related-section"><div className="feed-heading"><div><h2>More to inspire you</h2><p>Keep exploring similar {selectedMedia.type === "videos" ? "videos" : "images"}</p></div><button className="sort-btn" onClick={() => { closeMedia(); setQuery(selectedMedia.tags[0] || selectedMedia.title.split(" ")[0]); }}>Explore this style <ArrowRight size={15}/></button></div>
        <div className="masonry detail-masonry">{mediaItems.filter(item => item.id !== selectedMedia.id).map(item => <article className="pin-card" key={item.type + item.id}><div className="pin-image"><img src={item.thumbnail || item.image} alt={item.title} loading="lazy" onClick={() => openMedia(item)}/><span className="pin-category">{item.type === "videos" ? "Video" : "Photo"}</span><button className="pin-save" onClick={() => void toggleSavedMedia(item)} aria-label="Save media">{savedMediaIds.includes(item.id) ? <Check size={17}/> : <Bookmark size={17}/>}</button></div><div className="pin-meta"><div><h3>{item.title}</h3><p>{item.user}</p></div></div></article>)}</div>
      </section>
    </main>
  </div>;

  return <div className={dark ? "app dark" : "app"}>
    <aside className={mobileMenu ? "sidebar open" : "sidebar"}>
      <a className="brand pixora-brand" href="#" aria-label="Pixora home"><span className="brand-mark"><Sparkles size={19}/></span><span className="brand-word">Pixora</span></a>
      <button className="mobile-close icon-btn" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X/></button>
      <div className="side-label">DISCOVER</div>
      <nav className="side-nav">
        <button className={category === "For you" ? "nav-item active" : "nav-item"} onClick={() => {setCategory("For you");setMobileMenu(false)}}><Compass size={18}/> For you <span className="nav-pill">New</span></button>
        <button className={category === "Photography" ? "nav-item active" : "nav-item"} onClick={() => {setCategory("Photography");setMobileMenu(false)}}><ImageIcon size={18}/> Photography</button>
        <button className={category === "Design" ? "nav-item active" : "nav-item"} onClick={() => {setCategory("Design");setMobileMenu(false)}}><LayoutGrid size={18}/> Design</button>
        <button className={category === "Travel" ? "nav-item active" : "nav-item"} onClick={() => {setCategory("Travel");setMobileMenu(false)}}><Video size={18}/> Travel & film</button>
      </nav>
      <div className="side-label collection-label">YOUR SPACE</div>
      <nav className="side-nav">
        <button className={category === "Saved ideas" ? "nav-item active" : "nav-item"} onClick={() => setCategory("Saved ideas")}><Bookmark size={18}/> Saved ideas <span className="count">{saved.length}</span></button>
        <button className="nav-item" onClick={() => openAuth()}><UserRound size={18}/> Your profile</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="pro-card"><span className="pro-icon"><Sparkles size={17}/></span><strong>A space for ideas</strong><p>Collect what inspires you, all in one place.</p><button onClick={() => openAuth("signup")}>Get started <ArrowRight size={14}/></button></div>
        <button className="nav-item" onClick={() => setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>} {dark ? "Light appearance" : "Dark appearance"}</button>
        <div className="profile-mini"><div className="avatar">{userEmail ? userEmail[0].toUpperCase() : "P"}</div><div className="profile-copy"><strong>{userEmail ? userEmail.split("@")[0] : "Guest explorer"}</strong><span>{userEmail || "Sign in to sync your ideas"}</span></div><button className="icon-btn" onClick={() => openAuth()} aria-label="Account settings"><Settings2 size={17}/></button></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu/></button>
        <div className="searchbox"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ideas, styles, creators..." aria-label="Search ideas"/>{query && <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={15}/></button>}<kbd>⌘ K</kbd></div>
        <div className="top-actions"><button className="icon-btn notification-btn" aria-label="Notifications"><Bell size={19}/><i/></button><button className="upload-btn" onClick={() => openAuth("signup")}><Upload size={16}/> Share idea</button><button className="user-btn" onClick={() => openAuth()}><span className="avatar small">{userEmail ? userEmail[0].toUpperCase() : "P"}</span><ChevronDown size={14}/></button></div>
      </header>

      <section className="welcome">
        <div><div className="eyebrow"><span/> YOUR DAILY DOSE OF INSPIRATION</div><h1>Find your next <em>big idea.</em></h1><p>A little inspiration can take you somewhere unexpected.</p></div>
        <div className="welcome-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><span>✳</span><small>STAY CURIOUS</small></div>
      </section>

      <section className="category-row" aria-label="Filter by category">
        {categories.map(item => <button key={item} className={category === item ? "category-chip selected" : "category-chip"} onClick={() => setCategory(item)}>{item}</button>)}
        <button className="filter-btn" onClick={() => {setCategory("For you");setQuery("")}}><Settings2 size={15}/> Reset</button>
      </section>

      <div className="media-type-row"><div><div className="eyebrow"><span/> EXPLORE THE VISUAL WORLD</div><h2>{query ? "Results for “" + query + "”" : category === "For you" ? "Made for your mood" : category === "Saved ideas" ? "Your saved ideas" : category + " inspiration"}</h2></div><div className="media-switch"><button className={mediaType === "images" ? "selected" : ""} onClick={() => setMediaType("images")}><ImageIcon size={15}/> Images</button><button className={mediaType === "videos" ? "selected" : ""} onClick={() => setMediaType("videos")}><Video size={15}/> Videos</button></div></div>
      {mediaError && <div className="media-error" role="status">{mediaError} <button onClick={() => {setMediaPage(1);setMediaType(type => type);setQuery(q => q)}}>Try again</button></div>}

      {mediaItems.length ? <section className="masonry" aria-label={mediaType === "videos" ? "Video discovery feed" : "Image discovery feed"}>
        {mediaItems.map((item, index) => <article className="pin-card" key={item.type + item.id}>
          <div className="pin-image" style={{aspectRatio: item.width && item.height ? item.width + " / " + item.height : "4 / 5"}}>
            <img src={item.thumbnail || item.image} alt={item.title} loading={index > 5 ? "lazy" : "eager"} onClick={() => openMedia(item)} onKeyDown={e => {if(e.key === "Enter") openMedia(item)}} tabIndex={0} role="button" aria-label={"Open " + item.title}/>
            <div className="image-gradient"/>
            <span className="pin-category">{mediaType === "videos" ? <><Video size={12}/> Video</> : "Photo"}</span>
            <button className="pin-save" onClick={() => void toggleSavedMedia(item)} aria-label={savedMediaIds.includes(item.id) ? "Unsave idea" : "Save idea"}>{savedMediaIds.includes(item.id) ? <Check size={17}/> : <Bookmark size={17}/>}</button>
            {mediaType === "videos" && <span className="video-play"><Video size={16}/></span>}
          </div>
          <div className="pin-meta"><div><h3>{item.title}</h3><p><span className="creator-avatar">{item.user[0]?.toUpperCase() || "P"}</span>{item.user}</p></div><button className="like-btn" onClick={() => void toggleSavedMedia(item)} aria-label="Save this media"><Heart size={17} fill={savedMediaIds.includes(item.id) ? "currentColor" : "none"}/></button></div>
        </article>)}
      </section> : !mediaLoading && <div className="empty-state"><Search size={30}/><h3>{mediaError ? "Media is unavailable right now" : "No media found"}</h3><p>{mediaError || "Try another search or category."}</p><button className="upload-btn" onClick={() => {setQuery("");setCategory("For you")}}>Clear filters</button></div>}
      <div ref={setLoadMoreNode} className="load-more-status">{mediaLoading ? "Loading more inspiration…" : hasMoreMedia ? "Scroll for more" : mediaItems.length ? "You’re all caught up" : ""}</div>

      <footer className="footer"><span>© 2026 Pixora</span><span>Made for the endlessly curious <span className="footer-star">✳</span></span><a href="https://supabase.com" target="_blank" rel="noreferrer">Secure auth by Supabase</a></footer>
    </main>

    {authOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => {if(e.target === e.currentTarget) {setAuthOpen(false);setAuthMessage("")}}}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close icon-btn" onClick={() => {setAuthOpen(false);setAuthMessage("")}} aria-label="Close account dialog"><X/></button>
        <div className="modal-logo"><Sparkles size={23}/></div><div className="eyebrow centered">WELCOME TO PIXORA</div>
        <h2 id="auth-title">{userEmail ? "You're signed in" : authMode === "signup" ? "Create your account." : authMode === "reset" ? "Reset your password." : "Make room for inspiration."}</h2>
        <p>{userEmail ? "Your account is connected. Likes and saved ideas are stored on this device." : authMode === "signup" ? "Create a free account to start your creative journey." : authMode === "reset" ? "We'll email you a secure link to choose a new password." : "Sign in to keep your favorite ideas close."}</p>
        {userEmail ? <button className="upload-btn full" onClick={async () => {await supabase?.auth.signOut();setAuthOpen(false)}}>Sign out</button> : <>
          <label className="field-label" htmlFor="email">Email address</label>
          <input id="email" className="email-input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/>
          {authMode !== "reset" && <><label className="field-label" htmlFor="password">Password</label><div className="password-wrap"><input id="password" className="email-input" type={showPassword ? "text" : "password"} autoComplete={authMode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" onKeyDown={e => {if(e.key === "Enter") void submitAuth()}}/><button className="password-toggle" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></>}
          <button className="upload-btn full auth-submit" onClick={() => void submitAuth()} disabled={busy}>{busy ? "Please wait…" : authMode === "signup" ? "Create free account" : authMode === "reset" ? "Send reset link" : "Sign in"} {authMode === "reset" ? <KeyRound size={16}/> : <ArrowRight size={16}/>}</button>
          {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
          <div className="auth-links">{authMode === "login" ? <><button onClick={() => openAuth("signup")}>Create an account</button><button onClick={() => openAuth("reset")}>Forgot password?</button></> : <button onClick={() => openAuth("login")}>Back to sign in</button>}</div>
          <p className="fine-print">Free to join. Your password is securely managed by Supabase.</p>
        </>}
      </section>
    </div>}

    {viewer && <div className="viewer-backdrop" role="presentation" onMouseDown={e => {if(e.target === e.currentTarget) setViewer(null)}}>
      <section className="image-viewer" role="dialog" aria-modal="true" aria-label={"Image viewer: " + viewer.title}>
        <button className="viewer-close" onClick={() => setViewer(null)} aria-label="Close image viewer"><X size={21}/></button>
        <img className="viewer-image" src={imageUrl(viewer.image)} alt={viewer.title}/>
        <div className="viewer-details"><div><h2>{viewer.title}</h2><p>{viewer.category} · by {viewer.creator}</p></div><div className="viewer-actions"><button className="viewer-action" onClick={() => setSaved(old => old.includes(viewer.id) ? old.filter(id => id !== viewer.id) : [...old, viewer.id])}>{saved.includes(viewer.id) ? <Check size={17}/> : <Bookmark size={17}/>} {saved.includes(viewer.id) ? "Saved" : "Save"}</button><a className="viewer-action" href={imageUrl(viewer.image)} download target="_blank" rel="noreferrer"><ArrowDownToLine size={17}/> Open image</a></div></div>
      </section>
    </div>}
    <div className="toast-note"><span className="toast-dot"/> Free to explore <span>·</span> No subscription required</div>
  </div>;
}