import Link from "next/link";
import NotesPreview from "./notes-preview";
import { ArrowUpRight, ArrowDown, ArrowUp, Check, Download, Mic, Ear, Notes, Mark } from "./icons";
import s from "./landing.module.css";

const steps = [
  { icon: Mic, title: "Press record.", text: "Open Muesli on your phone, laptop, or tablet. Name the meeting and let the conversation begin." },
  { icon: Ear, title: "Follow the thought.", text: "Listen. Ask the good question. Go off on a tangent. Your browser keeps the audio while you stay in the room." },
  { icon: Notes, title: "Leave with clarity.", text: "Stop recording and generate your notes. The summary, the decisions, and the next steps, ready to take with you." },
];

export default function LandingPage() {
  return (
    <div className={s.page}>
      <a href="#main" className={s.skip}>Skip to content</a>
      <header className={s.header}>
        <Link href="/" className={s.brand} aria-label="Muesli home">muesli<span>.</span></Link>
        <nav aria-label="Main navigation" className={s.nav}><a href="#how-it-works">How it works</a><a href="#preview">See a sample</a></nav>
        <Link href="/dashboard" className={s.navCta}>Open Muesli <ArrowUpRight /></Link>
      </header>
      <main id="main">
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={s.heroCopy}>
            <h1 id="hero-title">Less scribbling.<br />More <em>being here.</em></h1>
            <p className={s.intro}>Muesli is AI meeting notes that run in your browser. Record on any device, stay in the conversation, and leave with the summary, the decisions, and the next steps.</p>
            <div className={s.actions}><Link href="/dashboard" className={s.primary}>Start recording <ArrowUpRight size={18} /></Link><a href="#preview" className={s.textLink}>See a sample <ArrowDown /></a></div>
            <p className={s.smallPrint}>No installs. Nothing to join. Works on your phone, laptop, or tablet.</p>
          </div>
          <div className={s.heroVisual} aria-hidden="true">
            <div className={s.stage}>
              <div className={s.chip}><span className={s.chipDot} /><span>Recording</span><div className={s.wave}>{[9,18,12,25,16,30,13,23,10,18,26,12].map((height,i)=><i key={i} style={{height}} />)}</div><span>12:48</span></div>
              <div className={s.note}>
                <div className={s.noteMeta}><span>Product sync</span><span>Today, 9:30</span></div>
                <h2>Keep the first launch small.</h2>
                <p>One complete flow before new features. Alex sends a working draft on Friday, and the feedback decides the next release.</p>
                <h3>Decisions</h3>
                <ul><li>Focus on one complete flow.</li><li>Test the working draft before adding features.</li></ul>
                <h3>Next steps</h3>
                <div className={s.task}><span className={s.taskBox}><Check size={12} /></span>Alex · Share the working draft by Friday.</div>
                <div className={s.noteFoot}><span>Made with Muesli</span><span><Download size={14} /> product-sync.md</span></div>
              </div>
            </div>
          </div>
        </section>
        <div className={s.ribbon}><span>A good place for</span><span>Meetings</span><i /><span>Voice memos</span><i /><span>Brain dumps</span><i /><span>Content drafts</span></div>
        <section id="film" className={s.film} aria-labelledby="film-title"><div className={s.sectionHeading}><h2 id="film-title">See it in<br /><em>fifty seconds.</em></h2><p>Press record, stop, and leave with your notes.</p></div><div className={s.filmFrame}><video controls playsInline preload="none" poster="/muesli-film-poster.jpg" aria-label="A 50-second film of Muesli: record a meeting, generate the notes, and download them."><source src="/muesli-film.mp4" type="video/mp4" /></video></div></section>
        <section id="preview"className={s.previewSection} aria-labelledby="preview-title">
          <div className={s.previewCopy}><h2 id="preview-title">A little messy in.<br /><em>A lot clearer out.</em></h2><p>The meeting that went everywhere. The idea on your morning walk. The thought you just need to say out loud.</p><p>Choose a mode. See how Muesli gives your words a useful shape.</p><div className={s.exportNote}><Download size={22} className={s.exportIcon} /><div><strong>Good notes travel.</strong><p>Download Markdown files. Take them to Obsidian or wherever your ideas live.</p></div></div></div>
          <NotesPreview />
        </section>
        <section id="how-it-works" className={s.how} aria-labelledby="how-title"><div className={s.sectionHeading}><h2 id="how-title">Be present.<br /><em>We’ll handle the notes.</em></h2><p>Three small steps. One less thing on your mind.</p></div><div className={s.steps}>{steps.map(({icon: Icon, title, text})=><article className={s.step} key={title}><span className={s.stepIcon}><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section className={s.manifesto}><h2>You brought the ideas.<br />You shouldn’t have to bring<br /><em>the perfect memory.</em></h2><Mark size={320} className={s.manifestoMark} /><p>For the details you almost missed.<br />And the ideas you almost forgot.</p></section>
        <section className={s.faq} aria-labelledby="faq-title"><div><h2 id="faq-title">A few good<br /><em>questions.</em></h2></div><div className={s.questions}>
          <details><summary>Do I need to install anything?</summary><p>No. Muesli records microphone audio in your browser. Allow microphone access when you start recording.</p></details>
          <details><summary>Can I use it away from my desk?</summary><p>Yes. Open Muesli in a supported browser on your phone or tablet for in-person conversations and voice memos. Ask everyone for permission before you record.</p></details>
          <details><summary>What happens to my recording?</summary><p>Your audio is uploaded to cloud storage. AI services process it to create a transcript and notes. Use care with private information.</p></details>
          <details><summary>Can I take my notes with me?</summary><p>Yes. Download your notes as Markdown files for Obsidian, your project folder, or another writing app.</p></details>
        </div></section>
        <section className={s.closing}><h2>Good conversations.<br /><em>Great notes.</em></h2><Link href="/dashboard" className={s.primary}>Open Muesli <ArrowUpRight size={18} /></Link><p className={s.smallPrint}>Your next good idea is waiting.</p></section>
      </main>
      <footer className={s.footer}><Link href="/" className={s.brand}>muesli<span>.</span></Link><p>A fresh start for your thoughts.</p><a href="#main">Back to the top <ArrowUp size={14} /></a></footer>
    </div>
  );
}
