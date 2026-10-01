import Image from "next/image";
import Link from "next/link";
import NotesPreview from "./notes-preview";
import s from "./landing.module.css";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function LandingPage() {
  return (
    <div className={s.page}>
      <a href="#main" className={s.skip}>Skip to content</a>
      <header className={s.header}>
        <Link href="/" className={s.brand} aria-label="Muesli home"><svg viewBox="0 0 40 32" width="34" height="28" fill="none" aria-hidden="true"><path d="M3 27 14 7l7 12 5-9 11 17H3Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="m10 14 4 3 4-3" stroke="currentColor" strokeWidth="2"/></svg>muesli<span>.</span></Link>
        <nav aria-label="Main navigation" className={s.nav}><a href="#how-it-works">The simple part</a><a href="#preview">See it in action</a></nav>
        <Link href="/dashboard" className={s.navCta}>Open Muesli <Arrow /></Link>
      </header>
      <main id="main">
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={s.heroCopy}>
            <p className={s.eyebrow}><span className={s.dot} /> FOR MINDS THAT WANDER. AND IDEAS THAT MATTER.</p>
            <h1 id="hero-title">Less scribbling.<br />More <em>being here.</em></h1>
            <p className={s.intro}>Stay in the conversation. Muesli turns your recordings into clear notes, key decisions, and next steps. A little less busywork. A lot more headspace.</p>
            <div className={s.actions}><Link href="/dashboard" className={s.primary}>Find your flow <Arrow /></Link><a href="#preview" className={s.textLink}>Take a little look <span aria-hidden="true">↓</span></a></div>
            <p className={s.smallPrint}>In your browser. On your phone or laptop. No installs.</p>
            <div className={s.heroFoot}><span className={s.tinySun} aria-hidden="true">✳</span><p>For your big meetings.<br /><strong>And your small strokes of genius.</strong></p></div>
          </div>
          <div className={s.heroVisual}>
            <Image src="/muesli-hero.jpg" alt="Morning light over a bowl of muesli, wildflowers, and an Alpine valley" fill sizes="(max-width: 800px) 100vw, 50vw" preload className={s.heroImage} />
            <div className={s.imageLabel}><span aria-hidden="true">✳</span> Fresh air for your thoughts.</div>
            <div className={s.recordingChip}><span className={s.recordingDot}/><span>One good conversation.</span><div className={s.wave} aria-hidden="true">{[9,18,12,25,16,30,13,23,10,18,26,12].map((height,i)=><i key={i} style={{height}} />)}</div><span>12:48</span></div>
            <div className={s.floatingNote}><div className={s.noteTop}><span className={s.noteIcon} aria-hidden="true">✓</span><span>A little clarity, coming right up.</span><span className={s.sampleBadge}>SAMPLE</span></div><h2>The next step is the clear one.</h2><p>Decision: Keep the first launch simple.</p><div className={s.noteTask}><span aria-hidden="true">□</span> Share the working draft with the team.</div></div>
          </div>
        </section>
        <div className={s.ribbon}><span>A good place for</span><span>Meetings</span><span aria-hidden="true">✳</span><span>Voice memos</span><span aria-hidden="true">✳</span><span>Brain dumps</span><span aria-hidden="true">✳</span><span>Content drafts</span></div>
        <section id="preview" className={s.previewSection} aria-labelledby="preview-title">
          <div className={s.previewCopy}><p className={s.eyebrow}>01 / FROM A THOUGHT TO A THING</p><h2 id="preview-title">A little messy in.<br /><em>A lot clearer out.</em></h2><p>The meeting that went everywhere. The idea on your morning walk. The thought you just need to say out loud.</p><p>Choose a mode. See how Muesli gives your words a useful shape.</p><div className={s.exportNote}><span aria-hidden="true">↗</span><div><strong>Good notes travel.</strong><p>Download Markdown files. Take them to Obsidian or wherever your ideas live.</p></div></div></div>
          <NotesPreview />
        </section>
        <section id="how-it-works" className={s.how} aria-labelledby="how-title"><div className={s.sectionHeading}><p className={s.eyebrow}>02 / THE SIMPLE PART</p><h2 id="how-title">Be present.<br /><em>We’ll handle the notes.</em></h2><p>Three small steps. One less thing on your mind.</p></div><div className={s.steps}>{[
          ["01","Press record.","Open Muesli on your phone, laptop, or tablet. Name your recording and let the conversation begin."],
          ["02","Follow the thought.","Listen. Ask the good question. Go off on a tangent. Your browser captures the audio while you stay in the moment."],
          ["03","Leave with clarity.","Stop recording and generate your notes. Get the summary, the decisions, and the next steps. Take them with you."],
        ].map(([number,title,description])=><article className={s.step} key={number}><span className={s.stepNumber}>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
        <section className={s.manifesto}><p className={s.eyebrow}>LESS NOISE. MORE ROOM.</p><h2>You brought the ideas.<br />You shouldn’t have to bring<br /><em>the perfect memory.</em></h2><span className={s.manifestoSun} aria-hidden="true">✳</span><p>For the details you almost missed.<br />And the ideas you almost forgot.</p></section>
        <section className={s.faq} aria-labelledby="faq-title"><div><p className={s.eyebrow}>03 / BEFORE YOU PRESS RECORD</p><h2 id="faq-title">A few good<br /><em>questions.</em></h2></div><div className={s.questions}>
          <details><summary>Do I need to install anything?</summary><p>No. Muesli records microphone audio in your browser. Allow microphone access when you start recording.</p></details>
          <details><summary>Can I use it away from my desk?</summary><p>Yes. Open Muesli in a supported browser on your phone or tablet for in-person conversations and voice memos. Ask everyone for permission before you record.</p></details>
          <details><summary>What happens to my recording?</summary><p>Your audio is uploaded to cloud storage. AI services process it to create a transcript and notes. Use care with private information.</p></details>
          <details><summary>Can I take my notes with me?</summary><p>Yes. Download your notes as Markdown files for Obsidian, your project folder, or another writing app.</p></details>
        </div></section>
        <section className={s.closing}><span className={s.sun} aria-hidden="true">✳</span><p className={s.eyebrow}>MAKE A LITTLE ROOM FOR CLARITY</p><h2>Good conversations.<br /><em>Great notes.</em></h2><Link href="/dashboard" className={s.primary}>Open Muesli <Arrow /></Link><p className={s.smallPrint}>Your next good idea is waiting.</p></section>
      </main>
      <footer className={s.footer}><Link href="/" className={s.brand}>muesli<span>.</span></Link><p>A fresh start for your thoughts.</p><a href="#main">Back to the top ↑</a></footer>
    </div>
  );
}
