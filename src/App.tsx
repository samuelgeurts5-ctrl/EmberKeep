import { useMemo, useState } from "react";

type Token = { id: string; name: string; kind: "hero" | "foe"; x: number; y: number; initials: string; color: string; hp: number };
type LogEntry = { id: number; text: string; tone?: "gold" | "red" };

const initialTokens: Token[] = [
  { id: "aria", name: "Aria Thorn", kind: "hero", x: 4, y: 6, initials: "AT", color: "#d8a4a0", hp: 18 },
  { id: "brom", name: "Brom Ironvale", kind: "hero", x: 6, y: 8, initials: "BI", color: "#b5c3a1", hp: 24 },
  { id: "goblin1", name: "Cave Goblin", kind: "foe", x: 10, y: 5, initials: "G", color: "#8d9a6c", hp: 7 },
  { id: "goblin2", name: "Cave Goblin", kind: "foe", x: 12, y: 7, initials: "G", color: "#8d9a6c", hp: 7 },
  { id: "captain", name: "Ashen Captain", kind: "foe", x: 14, y: 4, initials: "AC", color: "#b45d5f", hp: 21 },
];

const initialLog: LogEntry[] = [
  { id: 1, text: "The party enters the Ashen Vault.", tone: "gold" },
  { id: 2, text: "The air smells of wet stone and old iron." },
  { id: 3, text: "A goblin shifts behind a broken pillar." },
];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

export default function App() {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [selectedId, setSelectedId] = useState("aria");
  const [activeTab, setActiveTab] = useState<"scene" | "journal">("scene");
  const [log, setLog] = useState<LogEntry[]>(initialLog);
  const [lastRoll, setLastRoll] = useState<{ label: string; total: number; rolls: number[] } | null>(null);
  const [round, setRound] = useState(1);
  const [fog, setFog] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGM, setShowGM] = useState(true);

  const selected = tokens.find((token) => token.id === selectedId) ?? tokens[0];
  const addLog = (text: string, tone?: "gold" | "red") => {
    setLog((current) => [{ id: Date.now() + Math.random(), text, tone }, ...current].slice(0, 12));
  };

  const rollDice = (sides: number, label = `d${sides}`, bonus = 0) => {
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + bonus;
    setLastRoll({ label, total, rolls: [result] });
    addLog(`Rolled ${label}: ${result}${bonus ? ` + ${bonus}` : ""} = ${total}.`, "gold");
  };

  const moveToken = (x: number, y: number) => {
    if (!selected || selected.kind !== "hero") return;
    if (tokens.some((token) => token.x === x && token.y === y)) {
      addLog("That space is occupied. Choose an empty tile.");
      return;
    }
    const distance = Math.abs(selected.x - x) + Math.abs(selected.y - y);
    if (distance > 4) {
      addLog("That's too far for one move. Try a nearby tile.");
      return;
    }
    setTokens((current) => current.map((token) => token.id === selected.id ? { ...token, x, y } : token));
    addLog(`${selected.name} moves to a new position.`);
  };

  const selectedCell = useMemo(() => selected ? `${String.fromCharCode(65 + selected.x)}${selected.y + 1}` : "—", [selected]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="EmberKeep home">
          <span className="brand-mark"><span>✦</span></span>
          <span className="brand-copy"><strong>EMBERKEEP</strong><small>THE VIRTUAL TABLETOP</small></span>
        </a>
        <div className="campaign-heading">
          <span className="eyebrow">CAMPAIGN / THE SHATTERED CROWN</span>
          <h1>The Ashen Vault <span className="live-dot" /> <span className="live-label">LOCAL SESSION</span></h1>
        </div>
        <div className="top-actions">
          <button className="subtle-button" onClick={() => { setShowGM(!showGM); }}><Icon>☷</Icon> {showGM ? "Hide tools" : "Show tools"}</button>
          <button className="profile-button" title="Current player">AT</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="left-rail">
          <button className="rail-button active" title="Tabletop"><Icon>⌘</Icon><span>Table</span></button>
          <button className="rail-button" title="Characters" onClick={() => addLog("Character management is on the roadmap.")}><Icon>♙</Icon><span>Heroes</span></button>
          <button className="rail-button" title="Journal" onClick={() => setActiveTab("journal")}><Icon>▤</Icon><span>Journal</span></button>
          <div className="rail-spacer" />
          <button className="rail-button" title="Settings" onClick={() => addLog("Session settings are coming soon.")}><Icon>⚙</Icon><span>Settings</span></button>
        </aside>

        <main className="main-area">
          <div className="scene-toolbar">
            <div className="scene-title"><span className="mini-emblem">✧</span><div><strong>{activeTab === "scene" ? "THE ASHEN VAULT" : "ADVENTURE JOURNAL"}</strong><small>{activeTab === "scene" ? "RUINS · LEVEL 1 · ENCOUNTER 01" : "SESSION NOTES & DISCOVERIES"}</small></div></div>
            <div className="toolbar-actions">
              <button className={showGrid ? "tool-button chosen" : "tool-button"} onClick={() => setShowGrid(!showGrid)}><Icon>▦</Icon> Grid</button>
              <button className={fog ? "tool-button chosen" : "tool-button"} onClick={() => setFog(!fog)}><Icon>◒</Icon> Fog</button>
              <button className="tool-button" onClick={() => addLog("Map controls are ready for the next build.")}><Icon>⛶</Icon> Fit map</button>
            </div>
          </div>

          {activeTab === "scene" ? (
            <section className={`map-stage ${showGrid ? "with-grid" : ""} ${fog ? "fog-on" : ""}`} aria-label="Interactive tabletop map">
              <div className="map-label"><span className="map-pin">✦</span><span>ASHEN VAULT</span><i>•</i><span>LOWER CHAMBER</span></div>
              <div className="map-art">
                <div className="stone-ring ring-one" /><div className="stone-ring ring-two" />
                <div className="room room-a" /><div className="room room-b" /><div className="room room-c" />
                <div className="broken-wall wall-a" /><div className="broken-wall wall-b" /><div className="broken-wall wall-c" />
                <div className="rubble rubble-a" /><div className="rubble rubble-b" /><div className="rubble rubble-c" />
                <div className="water-pool" /><div className="altar"><span>✧</span></div>
              </div>
              <div className="tile-grid" role="grid" aria-label="Map tiles">
                {Array.from({ length: 18 * 12 }, (_, index) => {
                  const x = index % 18;
                  const y = Math.floor(index / 18);
                  const token = tokens.find((item) => item.x === x && item.y === y);
                  return <button key={index} role="gridcell" aria-label={`Tile ${String.fromCharCode(65 + x)}${y + 1}${token ? `, ${token.name}` : ""}`} className={`tile ${token ? "has-token" : ""} ${token?.id === selectedId ? "selected-tile" : ""}`} onClick={() => token ? setSelectedId(token.id) : moveToken(x, y)} title={token ? token.name : `Move to ${String.fromCharCode(65 + x)}${y + 1}`}>
                    {token && <span className={`token ${token.kind} ${token.id === selectedId ? "token-selected" : ""}`} style={{ "--token-color": token.color } as React.CSSProperties}><span className="token-initials">{token.initials}</span><span className="token-name">{token.name}</span></span>}
                  </button>;
                })}
              </div>
              {fog && <div className="fog-overlay"><span>FOG OF WAR PREVIEW</span><small>Toggle Fog to reveal the chamber</small></div>}
              <div className="map-coordinates"><span>18 × 12 GRID</span><span>SCENE 01 / 01</span></div>
              <div className="map-compass">N <span>✦</span></div>
              <div className="map-legend"><span><i className="legend-dot hero-dot" /> Party</span><span><i className="legend-dot foe-dot" /> Hostiles</span></div>
            </section>
          ) : (
            <section className="journal-panel">
              <div className="journal-ornament">✦</div><p className="eyebrow">FIELD NOTES · SESSION I</p><h2>The Ashen Vault</h2>
              <p className="journal-intro">Beneath the old watchtower, a sealed stair descends into a vault that predates the kingdom. Something has disturbed the dust below.</p>
              <div className="journal-note"><span>01</span><div><strong>Current objective</strong><p>Find the source of the strange red light and recover the missing signet.</p></div></div>
              <div className="journal-note"><span>02</span><div><strong>Known dangers</strong><p>Goblin scouts, unstable stonework, and an unknown figure called the Ashen Captain.</p></div></div>
              <button className="primary-button" onClick={() => setActiveTab("scene")}>Return to tabletop <span>→</span></button>
            </section>
          )}

          <div className="bottom-strip">
            <div className="turn-status"><span className="status-icon">⚔</span><div><small>ENCOUNTER STATUS</small><strong>Round {round} <span>·</span> Exploration</strong></div></div>
            <div className="bottom-controls"><button onClick={() => { setRound((r) => r + 1); addLog(`Round ${round + 1} begins.`, "gold"); }}>Next round <span>→</span></button><span className="divider" /><span className="keyboard-hint">TIP: SELECT A HERO, THEN CLICK A NEARBY TILE</span></div>
          </div>
        </main>

        {showGM && <aside className="right-panel">
          <div className="panel-heading"><div><span className="eyebrow">YOUR ADVENTURERS</span><h2>Party & encounter</h2></div><button className="more-button" onClick={() => addLog("Party options are coming soon.")}>···</button></div>
          <div className="party-list">
            {tokens.filter((token) => token.kind === "hero").map((token, index) => <button key={token.id} className={`party-card ${token.id === selectedId ? "party-selected" : ""}`} onClick={() => setSelectedId(token.id)}>
              <span className="party-avatar" style={{ "--token-color": token.color } as React.CSSProperties}>{token.initials}</span><span className="party-info"><strong>{token.name}</strong><small>{index === 0 ? "ELF · RANGER" : "DWARF · FIGHTER"}</small><span className="hp-track"><i style={{ width: `${Math.max(0, token.hp / (token.id === "brom" ? 24 : 18) * 100)}%` }} /></span></span><span className="hp-number">{token.hp}<small>HP</small></span>
            </button>)}
          </div>
          <div className="panel-divider" />
          <div className="section-heading"><span className="eyebrow">QUICK ACTIONS</span><span className="tiny-rule" /></div>
          <div className="dice-actions"><button onClick={() => rollDice(20, "d20")}><span className="die-icon">D20</span><span><strong>Roll d20</strong><small>Ability check</small></span><b>↗</b></button><button onClick={() => rollDice(6, "d6")}><span className="die-icon">D6</span><span><strong>Roll d6</strong><small>Damage / chance</small></span><b>↗</b></button><button onClick={() => rollDice(20, "Initiative", 2)}><span className="die-icon">⚔</span><span><strong>Initiative</strong><small>Roll d20 + 2</small></span><b>↗</b></button></div>
          {lastRoll && <div className="roll-result"><span className="eyebrow">LAST ROLL · {lastRoll.label.toUpperCase()}</span><div><strong>{lastRoll.total}</strong><span>Result</span></div><small>Roll: {lastRoll.rolls.join(" + ")}{lastRoll.total !== lastRoll.rolls[0] ? ` + ${lastRoll.total - lastRoll.rolls[0]}` : ""}</small></div>}
          <div className="panel-divider" />
          <div className="section-heading"><span className="eyebrow">SCENE LOG</span><span className="log-count">{log.length} EVENTS</span></div>
          <div className="scene-log">{log.slice(0, 7).map((entry) => <div className="log-entry" key={entry.id}><span className={entry.tone === "gold" ? "log-bullet gold" : entry.tone === "red" ? "log-bullet red" : "log-bullet"} /><p>{entry.text}</p></div>)}</div>
          <div className="selected-footer"><div className="selected-label"><span className="eyebrow">SELECTED TOKEN</span><strong>{selected?.name ?? "None selected"}</strong></div><div className="selected-coordinate"><span className="eyebrow">POSITION</span><strong>{selectedCell}</strong></div></div>
        </aside>}
      </div>
      <footer className="app-footer"><span>✦ EMBERKEEP <i>BUILD 0.1 · PROTOTYPE</i></span><span>MADE FOR ADVENTURE <b>◆</b></span></footer>
    </div>
  );
}
