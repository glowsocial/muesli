"use client";
import { useState } from "react";
import { ArrowUpRight, Check, Download } from "./icons";
import s from "./landing.module.css";

const examples = [
  { mode: "Meeting", label: "TEAM CHECK-IN", title: "Monday, with a plan.", input: "Okay, let's keep the launch small. One complete flow, not ten half-built features. Alex, can you send a working draft by Friday? Then we can get feedback and see what people actually need.", summary: "Launch a smaller first version. Use early feedback to guide the next release.", heading: "Key decisions", items: ["Focus on one complete flow.", "Test the working draft before adding features."], task: "Alex · Share the working draft by Friday." },
  { mode: "Voice memo", label: "MORNING WALK", title: "An idea worth keeping.", input: "Just had a thought on my walk. What if the welcome message didn't explain everything? Just show one useful first step. Maybe a real example so people know what they'll get. I should write that down.", summary: "Help new customers reach their first useful result with a short welcome message.", heading: "The idea", items: ["Show one simple first step.", "Use a real example to make the result clear."], task: "Next step · Draft the welcome message." },
  { mode: "Brain dump", label: "THOUGHTS, SORTED", title: "A little more headspace.", input: "So much in my head. The launch page needs finishing. I keep wanting to start something new. But really I need two people to try this first. And I should block out half an hour to just finish the page.", summary: "Finish the launch page before starting a new project. Get feedback on the first version.", heading: "What matters", items: ["Finish the page first.", "Ask two people to try the product."], task: "Start here · Set aside 30 minutes for the page." },
  { mode: "Content draft", label: "SOMETHING TO SHARE", title: "From thought to first draft.", input: "I want to write about meeting notes. You're trying to listen and type at the same time, and you miss the good question. Good notes should let you be present. Then afterward you have clear next steps. That's the post.", summary: "The best meeting notes let you be present. Capture what matters, then spend your attention on the people in the room.", heading: "Draft outline", items: ["Start with the cost of divided attention.", "Show how clear next steps help a team move."], task: "Working title · More listening. Less scribbling." },
];
export default function NotesPreview() {
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState<"notes" | "words">("notes");
  const item = examples[selected];
  return <div className={s.previewWidget}>
    <div className={s.modePicker} aria-label="Example note modes">{examples.map((item,index)=><button type="button" key={item.mode} aria-pressed={selected===index} className={selected===index?s.selectedMode:""} onClick={()=>setSelected(index)}>{item.mode}</button>)}</div>
    <div className={s.previewPaper}>
      <div className={s.paperMeta}><span>{item.label}</span><span className={s.sampleBadge}>SAMPLE</span></div>
      <div className={s.viewPicker} aria-label="Example view"><button type="button" aria-pressed={view==="words"} onClick={()=>setView("words")}>The words</button><ArrowUpRight size={14} /><button type="button" aria-pressed={view==="notes"} onClick={()=>setView("notes")}>The clarity</button></div>
      <div aria-live="polite" aria-atomic="true" className={s.paperContent}>
        <h3>{item.title}</h3>
        {view === "notes" ? <><div className={s.paperRule}/><h4>Summary</h4><p>{item.summary}</p><h4>{item.heading}</h4><ul>{item.items.map(text=><li key={text}>{text}</li>)}</ul><div className={s.paperTask}><span className={s.taskBox}><Check size={12} /></span>{item.task}</div></> : <><div className={s.paperRule}/><h4>Before the notes</h4><p className={s.rawWords}>“{item.input}”</p><p className={s.rawHint}>A thought doesn’t need to arrive neatly packaged.</p></>}
      </div>
      <div className={s.paperBottom}><span>Made with Muesli</span><span><Download size={14} /> notes.md</span></div>
    </div>
    <p className={s.previewCaption}>A sample, not a live recording. Try a mode. Compare the words and the notes.</p>
  </div>;
}
