import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import { ArrowRight, ArrowUpRight, Github, Linkedin } from './icons';
import { profile } from './config';
import WorkspaceExperience from './WorkspaceExperience';
import { availableCommands, executeCommand, type WorkspaceName } from './commandRegistry';

type Entry = { command: string; output: string; justExecuted?: boolean };
const initialEntries: Entry[] = [
  { command: 'system', output: 'Welcome to Victor’s Portfolio.' },
  { command: 'about', output: 'I explore practical Machine Learning, build thoughtful Android experiences, and work with data systems that connect technology to everyday problems.' },
  { command: 'help', output: 'Type a command below, use Tab to complete, or choose a suggestion. Try ml, android, data, projects, or email.' },
];
const quickCommands = ['ml', 'android', 'data', 'projects', 'skills', 'about', 'contact'];
const moreCommands = ['help', 'healthcare', 'agriculture', 'iot', 'experience', 'certifications', 'github', 'linkedin', 'email', 'security', 'process', 'ls', 'pwd', 'whoami', 'date', 'tree', 'history', 'clear', 'home', 'exit'];

export default function DeveloperTerminal() {
  const [command, setCommand] = useState('');
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeExperience, setActiveExperience] = useState<WorkspaceName | null>(null);
  const [completions, setCompletions] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const typedEntries = useRef(new Set<string>());

  const addCommand = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setHistory(current => [...current, value]);
    setHistoryIndex(history.length + 1);
    setCommand('');
    setCompletions([]);
    const result = value.toLowerCase() === 'history'
      ? { type: 'output' as const, output: history.length ? history.join('\n') : 'No commands have been entered in this session yet.' }
      : executeCommand(value);
    if (result.type === 'clear') { setEntries([]); return; }
    setEntries(current => [...current, { command: value, output: result.output, justExecuted: true }].slice(-24));
    if (result.type === 'home') setActiveExperience(null);
    else if (result.type === 'workspace') setActiveExperience(result.workspace);
    else if (result.type === 'unknown') {
      const hint = result.suggestions.length ? `\nDid you mean: ${result.suggestions.join(', ')}?` : '\nTry help, ml, android, data, projects, or email.';
      setEntries(current => [...current.slice(0, -1), { command: value, output: `${result.output}${hint}`, justExecuted: true }]);
    }
  };

  function submit(event: FormEvent) { event.preventDefault(); addCommand(command); }
  function handleInputKey(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') { event.preventDefault(); const next = Math.max(0, historyIndex - 1); setHistoryIndex(next); setCommand(history[next] ?? ''); setCompletions([]); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); const next = Math.min(history.length, historyIndex + 1); setHistoryIndex(next); setCommand(history[next] ?? ''); setCompletions([]); }
    else if (event.key === 'Tab') { event.preventDefault(); const partial = command.trim().toLowerCase(); const matches = availableCommands.filter(name => name.startsWith(partial)); if (matches.length === 1) { setCommand(matches[0]); setCompletions([]); } else setCompletions(matches.slice(0, 6)); }
    else if (event.key === 'Escape') { setCommand(''); setCompletions([]); if (activeExperience) setActiveExperience(null); }
  }
  function exitWorkspace() { setActiveExperience(null); requestAnimationFrame(() => input.current?.focus()); }
  useEffect(() => { if (activeExperience) requestAnimationFrame(() => input.current?.focus()); }, [activeExperience]);
  useEffect(() => {
    const historyPanel = output.current;
    if (historyPanel) historyPanel.scrollTop = historyPanel.scrollHeight;
  }, [entries]);
  useEffect(() => {
    const viewTitles: Partial<Record<WorkspaceName,string>> = { help:'Command directory', about:'About Victor Mwaniki', skills:'Skills', ml:'Machine Learning', android:'Android Development', data:'Data Engineering', projects:'Projects', healthcare:'Healthcare', agriculture:'Agriculture', iot:'PulseIQ · IoT', experience:'Experience & Community', certifications:'Certifications', github:'GitHub', linkedin:'LinkedIn', contact:'Contact', email:'Email Victor', security:'Responsible Engineering', process:'Engineering Process' };
    document.title = activeExperience ? `${viewTitles[activeExperience] ?? activeExperience} | Victor’s Portfolio` : 'Victor’s Portfolio';
  }, [activeExperience]);
  useEffect(() => {
    if (!activeExperience) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') exitWorkspace(); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [activeExperience]);

  const session = <TerminalSession activeExperience={activeExperience} entries={entries} input={input} output={output} typedEntries={typedEntries.current} command={command} setCommand={setCommand} completions={completions} setCompletions={setCompletions} submit={submit} handleInputKey={handleInputKey} addCommand={addCommand}/>;
  return <section className={`terminal-stage${activeExperience ? ` has-active-app active-${activeExperience}` : ''}`} id="terminal-home" aria-label={activeExperience ? `${activeExperience} portfolio application` : 'Victor Mwaniki portfolio terminal'}>
    <div className="terminal-stage-grid" aria-hidden="true"/>
    <svg className="terminal-stage-network" viewBox="0 0 1000 560" aria-hidden="true"><path d="M0 410 190 290 340 380 510 180 690 260 860 100 1000 190M70 80 230 180 410 80 510 180 670 70 860 100"/><g>{[[0,410],[190,290],[340,380],[510,180],[690,260],[860,100],[1000,190],[70,80],[230,180],[410,80],[670,70]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%4===0?4:2.5} style={{animationDelay:`${i*.16}s`}}/>)}</g></svg>
    <div className="terminal-stage-inner">
      <div className="terminal-brandline"><span><i/> VICTOR’S PORTFOLIO / ENGINEERING WORKSTATION</span></div>
      {!activeExperience && <div className="terminal-landing-layout"><div className="terminal-heading"><span className="terminal-overline">VICTOR MWANIKI <i/> MACHINE LEARNING · ANDROID · DATA</span><h1 id="terminal-title">Victor’s Portfolio<br/><em>Terminal.</em></h1><p>I explore practical Machine Learning, build thoughtful Android experiences, and work with data systems that connect technology to everyday problems.</p></div><PortfolioPhotoGallery/>{session}</div>}
      {activeExperience && <div className="terminal-active-layout">{session}<WorkspaceExperience experience={activeExperience} onExit={exitWorkspace} onCommand={addCommand}/></div>}
      <div className="terminal-stage-footer"><span>SIMULATED CLI · PREDEFINED COMMANDS · NO SHELL ACCESS</span><div><a href={profile.github} target="_blank" rel="noreferrer"><Github size={16}/> GitHub</a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16}/> LinkedIn</a></div></div>
      {!activeExperience&&<button className="terminal-scroll-cue" type="button" onClick={()=>addCommand('help')}>BROWSE THE COMMAND DIRECTORY <span>↓</span></button>}
    </div>
  </section>;
}

const portfolioPhotos = [
  { src:'/face_MAIN_potifolio.jpeg', alt:'Portrait of Victor Mwaniki', caption:'Victor Mwaniki', kind:'PORTRAIT / 01', shape:'shape-natural', angle:'0deg' },
  { src:'/odoo_pic1.jpeg', alt:'Victor with teammates at a team event at Odoo HQ Kenya', caption:'Team event · Odoo HQ Kenya', kind:'TEAM / 02', shape:'shape-tilt-left', angle:'-2.4deg' },
  { src:'/odoo_selfpic.jpeg', alt:'Victor pointing to Kenya on a world map during a team event at Odoo HQ Kenya', caption:'Team event · Odoo HQ Kenya · Kenya on the world map', kind:'TEAM / 03', shape:'shape-natural', angle:'0deg' },
  { src:'/agriculture.jpeg', alt:'Victor outdoors among trees', caption:'A personal outdoor field note', kind:'FIELD NOTE / 04', shape:'shape-tilt-right', angle:'2.2deg' },
  { src:'/8ae3d177-4465-461c-9200-a86611e43d4e.jpeg', alt:'Victor meeting llamas outdoors', caption:'An outdoor visit · personal photograph', kind:'FIELD NOTE / 05', shape:'shape-circle', angle:'-1deg' },
];
function PortfolioPhotoGallery() {
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const activeIndex=useRef(0);
  const pauseUntil=useRef(0);
  const pointerStart=useRef<{x:number;id:number}|null>(null);
  function advance(direction:number) {
    const next=(activeIndex.current+direction+portfolioPhotos.length)%portfolioPhotos.length;
    activeIndex.current=next;
    setActive(next);
  }
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>{
      if(paused||Date.now()<pauseUntil.current)return;
      advance(1);
    },5000);
    return ()=>window.clearInterval(timer);
  },[paused]);
  const photo=portfolioPhotos[active];
  function pointerDown(event:React.PointerEvent<HTMLDivElement>){pointerStart.current={x:event.clientX,id:event.pointerId};event.currentTarget.setPointerCapture(event.pointerId);pauseUntil.current=Date.now()+8000;}
  function pointerUp(event:React.PointerEvent<HTMLDivElement>){const start=pointerStart.current;if(!start||start.id!==event.pointerId)return;const delta=event.clientX-start.x;pointerStart.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);if(Math.abs(delta)>34)advance(delta<0?1:-1);}
  function keyNavigate(event:React.KeyboardEvent<HTMLDivElement>){if(event.key==='ArrowRight'){event.preventDefault();advance(1);}else if(event.key==='ArrowLeft'){event.preventDefault();advance(-1);}}
  return <div className="terminal-portrait photo-gallery" role="region" aria-roledescription="carousel" aria-label="Victor’s photo gallery" onPointerEnter={event=>{if(event.pointerType==='mouse')setPaused(true);}} onPointerLeave={event=>{if(event.pointerType==='mouse')setPaused(false);}} onKeyDown={keyNavigate} onFocus={()=>setPaused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setPaused(false);}}><div className="photo-gallery-heading"><span>PHOTO NOTES · {String(portfolioPhotos.length).padStart(2,'0')}</span><span aria-live="off">{String(active+1).padStart(2,'0')} / {String(portfolioPhotos.length).padStart(2,'0')}</span></div><div className="camera-gallery-stage" tabIndex={0} aria-label="Swipe or drag to change photograph; use left and right arrow keys" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={()=>{pointerStart.current=null;}}><div className="camera-iris" aria-hidden="true"><i/><i/><i/><i/><i/><i/><span/></div><figure className={`camera-photo ${photo.shape}`} key={photo.src}><img src={photo.src} alt={photo.alt} style={{'--photo-angle':photo.angle} as React.CSSProperties}/></figure></div><div className="camera-photo-caption" aria-live="polite"><span>{photo.kind}</span><b>{photo.caption}</b></div><p className="photo-gallery-hint">AUTO-ADVANCE · SWIPE OR DRAG TO BROWSE</p></div>;
}

type SessionProps = { activeExperience: WorkspaceName|null; entries: Entry[]; input: RefObject<HTMLInputElement|null>; output: RefObject<HTMLDivElement|null>; typedEntries: Set<string>; command: string; setCommand: (value:string)=>void; completions: string[]; setCompletions: (values:string[])=>void; submit: (event:FormEvent)=>void; handleInputKey: (event:ReactKeyboardEvent<HTMLInputElement>)=>void; addCommand:(value:string)=>void };
function TypedOutput({ text, id, animate, played, onStep }: { text:string; id:string; animate:boolean; played:Set<string>; onStep:()=>void }) {
  const [shown,setShown]=useState(()=>animate&&!played.has(id)?0:text.length);
  useEffect(()=>{
    if(!animate||played.has(id)||window.matchMedia('(prefers-reduced-motion: reduce)').matches){played.add(id);setShown(text.length);return;}
    played.add(id);
    let count=0;
    const timer=window.setInterval(()=>{count+=1;setShown(count);onStep();if(count>=text.length)window.clearInterval(timer);},13);
    return ()=>window.clearInterval(timer);
  },[animate,id,onStep,played,text]);
  return <>{text.slice(0,shown)}{animate&&shown<text.length&&<span className="terminal-output-cursor" aria-hidden="true">▍</span>}</>;
}
function TerminalSession({ activeExperience, entries, input, output, typedEntries, command, setCommand, completions, setCompletions, submit, handleInputKey, addCommand }:SessionProps) {
  const keepOutputVisible=useCallback(()=>{if(output.current)output.current.scrollTop=output.current.scrollHeight;},[output]);
  return <div className="terminal-window terminal-home-window"><div className="terminal-bar"><span className="terminal-lights" aria-hidden="true"><i/><i/><i/></span><span>victor@portfolio: {activeExperience?`~/${activeExperience}`:'~'}</span><span className="terminal-ready">INTERACTIVE SESSION</span></div><div className="terminal-output terminal-home-output"><div ref={output} className="terminal-history-scroll" aria-live="polite" aria-label="Terminal output">{entries.map((entry,index)=><div className={`terminal-entry${entry.justExecuted?' is-command-output':''}`} key={`${entry.command}-${index}`}><p><span>victor@portfolio</span>:~$ {entry.command}</p><small><TypedOutput text={entry.output} id={`${entry.command}-${index}`} animate={Boolean(entry.justExecuted)} played={typedEntries} onStep={keepOutputVisible}/></small></div>)}</div><form className="terminal-form" onSubmit={submit}><label htmlFor="terminal-command">victor@portfolio:~{activeExperience?`/${activeExperience}`:''}$</label><input ref={input} id="terminal-command" value={command} onChange={event=>{setCommand(event.target.value);setCompletions([])}} onKeyDown={handleInputKey} autoComplete="off" spellCheck={false} aria-label="Enter a portfolio command" aria-describedby="terminal-tip"/><button type="submit" aria-label="Execute command"><ArrowRight size={18}/></button></form>{completions.length>0&&<div className="terminal-completions" aria-label="Command completions">{completions.map(value=><button type="button" key={value} onClick={()=>setCommand(value)}>{value}</button>)}</div>}</div><div className="terminal-hints"><div className="terminal-hints-main"><span id="terminal-tip">TYPE A COMMAND OR SELECT ONE</span><div className="terminal-command-suggestions">{quickCommands.map(item=><button key={item} type="button" onClick={()=>addCommand(item)}><code>{item}</code><ArrowUpRight size={12}/></button>)}</div></div><details className="terminal-more-commands"><summary>More commands <span>({moreCommands.length})</span></summary><div className="terminal-command-suggestions">{moreCommands.map(item=><button key={item} type="button" onClick={()=>addCommand(item)}><code>{item}</code><ArrowUpRight size={12}/></button>)}</div></details></div></div>;
}
