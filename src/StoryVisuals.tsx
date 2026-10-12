import { useEffect, useState } from 'react';

type PresenceRef = { current: HTMLElement | null };
export function useScrollPresence(): [PresenceRef, boolean, boolean, boolean] {
  const [ref] = useState<PresenceRef>({ current: null });
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reduceMotion);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      setEntered(true);
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setEntered(true);
      setActive(entry.isIntersecting);
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return [ref, entered, active, reduced];
}

const layers = [4, 5, 6, 5, 4];
const yFor = (layer: number, node: number) => 160 - ((layers[layer] - 1) * 27) / 2 + node * 27;
const xFor = (layer: number) => 74 + layer * 213;
const edges = layers.slice(0, -1).flatMap((count, layer) =>
  Array.from({ length: count }, (_, source) =>
    Array.from({ length: layers[layer + 1] }, (_, target) => ({ layer, source, target })),
  ).flat(),
);

export function NeuralWorld() {
  const [ref, entered, active, reduced] = useScrollPresence();
  const paths = [
    `M${xFor(0)} ${yFor(0, 0)} L${xFor(1)} ${yFor(1, 1)} L${xFor(2)} ${yFor(2, 2)} L${xFor(3)} ${yFor(3, 3)} L${xFor(4)} ${yFor(4, 2)}`,
    `M${xFor(0)} ${yFor(0, 3)} L${xFor(1)} ${yFor(1, 3)} L${xFor(2)} ${yFor(2, 3)} L${xFor(3)} ${yFor(3, 1)} L${xFor(4)} ${yFor(4, 1)}`,
    `M${xFor(0)} ${yFor(0, 2)} L${xFor(1)} ${yFor(1, 4)} L${xFor(2)} ${yFor(2, 4)} L${xFor(3)} ${yFor(3, 2)} L${xFor(4)} ${yFor(4, 0)}`,
  ];
  return <div ref={node => { ref.current = node; }} className={`neural-scene${entered ? ' is-entered' : ''}${active ? ' is-active' : ''}`} role="group" aria-label="An animated neural network visualization. Data moves between connected computational layers.">
    <div className="neural-scene-heading"><span>COMPUTATIONAL FIELD / 001</span><span>INPUT → REPRESENTATION → OUTPUT</span></div>
    <svg className="neural-network" viewBox="0 0 1000 320" preserveAspectRatio="none" role="img" aria-label="Connected neural network layers with data moving between nodes">
      <defs>
        <pattern id="neural-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#24483c" strokeOpacity=".07" strokeWidth=".6"/></pattern>
        <radialGradient id="core-glow"><stop offset="0" stopColor="#a8b9a0" stopOpacity=".42"/><stop offset="1" stopColor="#a8b9a0" stopOpacity="0"/></radialGradient>
        {paths.map((path, index) => <path key={index} id={`neural-route-${index}`} d={path} fill="none"/>)}
      </defs>
      <rect width="1000" height="320" fill="url(#neural-grid)"/>
      <circle className="neural-core-glow" cx="500" cy="160" r="123" fill="url(#core-glow)"/>
      <g className="neural-edges">{edges.map((edge) => <path key={`${edge.layer}-${edge.source}-${edge.target}`} d={`M${xFor(edge.layer)} ${yFor(edge.layer, edge.source)} L${xFor(edge.layer + 1)} ${yFor(edge.layer + 1, edge.target)}`} pathLength="1" style={{ animationDelay: `${(edge.layer * 0.18) + ((edge.source + edge.target) % 5) * 0.07}s` }}/>)}</g>
      <g className="neural-node-field">{layers.map((count, layer) => Array.from({ length: count }, (_, node) => <g key={`${layer}-${node}`} className={`neural-node neural-layer-${layer}`} style={{ animationDelay: `${layer * 0.12 + node * 0.055}s` }}><circle className="node-halo" cx={xFor(layer)} cy={yFor(layer, node)} r="15"/><circle className="node-dot" cx={xFor(layer)} cy={yFor(layer, node)} r={layer === 2 && node === 2 ? 7 : 5}/></g>))}</g>
      <g className="neural-packets">{reduced ? paths.map((_, index)=><circle key={index} cx={[287, 500, 713][index]} cy={[yFor(1,1), yFor(2,3), yFor(3,2)][index]} r="3"/>) : paths.map((_, index) => <circle key={index} r={index === 1 ? 3.2 : 2.5}><animateMotion dur={`${3.2 + index * 0.55}s`} begin={`${index * 0.9}s`} repeatCount="indefinite"><mpath href={`#neural-route-${index}`}/></animateMotion></circle>)}</g>
      <g className="ai-core"><circle cx="500" cy="160" r="37"/><circle cx="500" cy="160" r="26"/><path d="M488 160h24M500 148v24M492 152l16 16m0-16-16 16"/><text x="500" y="216" textAnchor="middle">MODEL CORE</text></g>
      <g className="neural-layer-labels"><text x="74" y="294" textAnchor="middle">OBSERVATIONS</text><text x="287" y="294" textAnchor="middle">FEATURES</text><text x="500" y="294" textAnchor="middle">REPRESENTATION</text><text x="713" y="294" textAnchor="middle">EVALUATION</text><text x="926" y="294" textAnchor="middle">INSIGHT</text></g>
    </svg>
    <div className="neural-scene-footer"><span><i/> STREAM: SYNTHETIC / DEMONSTRATION ONLY</span><span>CONNECTIONS ARE A VISUAL METAPHOR, NOT A TRAINED MODEL</span></div>
  </div>;
}

export type PipelineStageVisual = { label: string; kind: string };
export function PipelineAssembly({ stages, selected, onSelect }: { stages: PipelineStageVisual[]; selected: number; onSelect: (index: number) => void }) {
  const [ref, entered, active, reduced] = useScrollPresence();
  const x = (index: number) => 100 + index * 200;
  return <div ref={node => { ref.current = node; }} className={`assembled-pipeline${entered ? ' is-entered' : ''}${active ? ' is-active' : ''}`} role="group" aria-label="A data pipeline assembling from source systems through analytics">
    <svg className="assembly-connectors" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
      <defs>{stages.slice(0, -1).map((_, index) => <path key={index} id={`pipeline-route-${index}`} d={`M${x(index)} 68 H${x(index + 1)}`}/>)}</defs>
      {stages.slice(0, -1).map((_, index) => <path className="assembly-route" key={index} d={`M${x(index)} 68 H${x(index + 1)}`} pathLength="1" style={{ animationDelay: `${0.55 + index * 0.23}s` }}/>)}
      <g className="pipeline-packets">{reduced ? stages.slice(0, -1).map((_, index)=><circle key={index} cx={x(index)+55} cy="68" r="3"/>) : stages.slice(0, -1).map((_, index) => <circle key={index} r="4"><animateMotion dur="2.8s" begin={`${1.8 + index * 0.25}s`} repeatCount="indefinite"><mpath href={`#pipeline-route-${index}`}/></animateMotion></circle>)}</g>
    </svg>
    <div className="assembly-nodes">{stages.slice(0, 6).map((stage, index) => <button type="button" key={stage.label} className={`assembly-node stage-${index}${selected === index ? ' selected' : ''}`} style={{ animationDelay: `${index * 0.23}s` }} aria-pressed={selected === index} onClick={() => onSelect(index)}>
      <span className="assembly-node-top"><small>{String(index + 1).padStart(2, '0')}</small><i>{['▦', '↓', '✓', '∿', '▤', '▥'][index]}</i></span><b>{stage.label}</b><small className="assembly-kind">{stage.kind.split('·')[1]?.trim()}</small>
      {index === 2 && <span className="validation-indicator"><i/>QUALITY GATE</span>}
      {index === 4 && <span className="warehouse-stack"><i/><i/><i/></span>}
      {index === 5 && <span className="analytics-spark"><i/><i/><i/><i/><i/></span>}
    </button>)}</div>
    <div className="assembly-footer"><span>FLOW STATE <b>STREAMING SAMPLE</b></span><span>PYTHON · SQL · POSTGRESQL · DATA QUALITY</span></div>
  </div>;
}
