import { useState, useEffect, useRef } from "react";

/* ── constants ── */

const LAYER_COLORS = ["#38bdf8", "#5eead4", "#a78bfa", "#f0abfc"];
const LAYER_NAMES = ["Raw Experience", "Noticing", "Reflection", "Meta-Awareness"];
const LAYER_ICONS = ["◉", "◎", "◈", "✦"];

const EXAMPLE_PROMPTS = [
  "I feel bullied by my mom's behavior. She always criticizes how I parent my kids and it makes me feel like nothing I do is ever good enough.",
  "My partner never initiates plans or dates anymore. I feel like I'm the only one putting in effort and it makes me wonder if they even care.",
  "My coworker took credit for my idea in a meeting and my manager didn't say anything. I feel invisible and like hard work doesn't matter.",
  "I keep procrastinating on my goals and then hating myself for it. I don't understand why I sabotage the things I say I want most.",
];

const SYSTEM_PROMPT = `You are a metacognition and differentiation coach. A person will share a raw experience, feeling, or situation they're struggling with. Your job is to deeply analyze this using a layered metacognition framework paired with an empathy challenger.

You must return ONLY valid JSON (no markdown, no backticks, no preamble) with this exact structure:

{
  "summary": "A brief 1-sentence compassionate summary of what the person shared",
  "streams": [
    {
      "id": "stream_1",
      "label": "Short stream name (3-5 words)",
      "icon": "single emoji",
      "color": "#hex color from: #38bdf8, #a78bfa, #f59e0b, #f0abfc, #34d399, #fb7185",
      "tagline": "Brief tagline (3-7 words)",
      "narrator": "What the person said/meant about this stream, in their voice",
      "layers": [
        {
          "thinking": "What they're THINKING at this metacognitive layer",
          "feeling": "What they're FEELING at this layer — body sensations, emotions, not thoughts disguised as feelings",
          "challenger": {
            "reframe": "A compassionate but firm reframe that challenges blind spots. Not invalidating — expanding. Show where the frame has edges.",
            "throughTheirEyes": "First-person inner monologue from the OTHER person's perspective. Make it human, specific, and emotionally real. This is the hardest part — make it genuinely empathetic, not a caricature.",
            "feeling": "What the other person is likely FEELING. Again, real emotions, not analysis."
          }
        }
      ]
    }
  ],
  "integration": [
    "Layer 0 integration insight — what differentiation reveals at the raw experience level",
    "Layer 1 integration insight — what becomes visible when streams separate",
    "Layer 2 integration insight — what patterns and frames become visible",
    "Layer 3 integration insight — the deepest truth about the dynamic"
  ],
  "thirdOption": "The path forward that only becomes visible through differentiation. Not advice — a reframe that opens possibility. This should be specific to their situation."
}

CRITICAL RULES:
1. Identify 2-4 simultaneous streams happening in the moment. These are NOT just different topics — they are different LAYERS of what's happening simultaneously (e.g., the surface event, the subtext/deeper need, the narrative being constructed, the identity at stake).
2. Each stream must have exactly 4 layers (Raw Experience, Noticing, Reflection, Meta-Awareness).
3. DIFFERENTIATE thinking from feeling at every layer. Feelings are body-based and emotional (anger, tightness, grief, warmth). Thoughts are cognitive (analyzing, interpreting, narrating). People often disguise thoughts as feelings ("I feel like she doesn't care" is a THOUGHT. "Loneliness. A hollow ache in my chest" is a FEELING).
4. The challenger must represent the OTHER person's perspective with genuine empathy — not defending them, but making their inner world real and dimensional. The other person has fears, wounds, and good intentions too.
5. Each layer should go DEEPER. Layer 0 is raw and fused. Layer 1 starts separating streams. Layer 2 reveals patterns and frameworks. Layer 3 is recursive awareness — seeing the seer.
6. The "throughTheirEyes" sections should be written in first person as if the other person is speaking their private inner truth. Make it ache. Make it real. Don't make them a villain or a saint.
7. If the person's experience involves self-directed struggle (procrastination, self-sabotage), the "other person" in the challenger can be the part of themselves they're in conflict with — their inner protector, their fear, their younger self.
8. Integration insights should build — each layer revealing something the previous couldn't see.
9. Write with emotional precision. Use specific language. Avoid therapy-speak clichés.
10. CRITICAL: Return ONLY the JSON object. No markdown code fences. No explanation. Just the JSON.`;

/* ── API call ── */

async function analyzeExperience(text) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is the raw experience someone shared:\n\n"${text}"\n\nAnalyze this using the metacognition + differentiation framework. Return ONLY valid JSON.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

/* ── components ── */

function ChallengerPanel({ data, layerColor }) {
  const [tab, setTab] = useState("reframe");
  const tabs = [
    { id: "reframe", label: "Challenge", icon: "⚡" },
    { id: "throughTheirEyes", label: "Through Their Eyes", icon: "👁" },
    { id: "feeling", label: "Their Feeling", icon: "💜" },
  ];
  return (
    <div className="challenger-panel" style={{ borderRadius: 14, background: "linear-gradient(170deg,#1a0a2a,#0f172a)", border: `1px solid ${layerColor}25`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${layerColor}18`, border: `1.5px solid ${layerColor}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>⟐</div>
        <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: layerColor, fontWeight: 600 }}>Empathy Challenger</span>
      </div>
      <div style={{ display: "flex", gap: 2, padding: "10px 16px 0" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={(e) => { e.stopPropagation(); setTab(t.id); }}
            style={{
              padding: "7px 13px", borderRadius: "8px 8px 0 0", border: "none",
              borderBottom: tab === t.id ? `2px solid ${layerColor}` : "2px solid transparent",
              background: tab === t.id ? `${layerColor}10` : "transparent",
              color: tab === t.id ? layerColor : "#64748b",
              fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500,
              cursor: "pointer", transition: "all .25s ease", display: "flex", alignItems: "center", gap: 5,
            }}>
            <span style={{ fontSize: 12 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontFamily: "'Newsreader',serif", fontSize: 14, lineHeight: 1.7, color: tab === "feeling" ? "#d8b4fe" : "#cbd5e1", fontStyle: tab === "throughTheirEyes" ? "italic" : "normal" }}>
          {tab === "reframe" && data.reframe}
          {tab === "throughTheirEyes" && `"${data.throughTheirEyes}"`}
          {tab === "feeling" && data.feeling}
        </div>
      </div>
    </div>
  );
}

function StreamCard({ stream, activeLayer, isOpen, onToggle }) {
  const ld = stream.layers?.[activeLayer];
  const lc = LAYER_COLORS[activeLayer];
  if (!ld) return null;
  return (
    <div style={{ borderRadius: 16, border: `1.5px solid ${isOpen ? stream.color + "40" : "#1e293b"}`, background: isOpen ? `linear-gradient(170deg,${stream.color}06,#0d1117)` : "#0d1117", transition: "all .4s ease", overflow: "hidden" }}>
      <div onClick={onToggle} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <span style={{ fontSize: 20 }}>{stream.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: isOpen ? stream.color : "#e2e8f0", transition: "color .3s" }}>{stream.label}</div>
          <div style={{ fontFamily: "'Newsreader',serif", fontSize: 12, fontStyle: "italic", color: "#64748b" }}>{stream.tagline}</div>
        </div>
        <div style={{ fontSize: 16, color: stream.color + "50", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .3s" }}>▾</div>
      </div>
      {isOpen && (
        <div style={{ padding: "0 18px 18px" }} className="stream-body">
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "#0a0e1780", border: "1px solid #1e293b", fontFamily: "'Newsreader',serif", fontSize: 13, lineHeight: 1.6, color: "#94a3b8", fontStyle: "italic", marginBottom: 16 }}>
            "{stream.narrator}"
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "#64748b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: `${stream.color}20`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: stream.color }}>me</span>
                My inner world at this layer
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: "12px 14px", borderRadius: 10, background: `${lc}08`, borderLeft: `3px solid ${lc}30` }}>
                  <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>🧠 Thinking</div>
                  <div style={{ fontFamily: "'Newsreader',serif", fontSize: 13, lineHeight: 1.6, color: "#e2e8f0" }}>{ld.thinking}</div>
                </div>
                <div style={{ padding: "12px 14px", borderRadius: 10, background: `${lc}08`, borderRight: `3px solid ${lc}30` }}>
                  <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>💗 Feeling</div>
                  <div style={{ fontFamily: "'Newsreader',serif", fontSize: 13, lineHeight: 1.6, color: "#e2e8f0" }}>{ld.feeling}</div>
                </div>
              </div>
            </div>
            <ChallengerPanel data={ld.challenger} layerColor={lc} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main app ── */

export default function App() {
  const [screen, setScreen] = useState("input");
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [activeLayer, setActiveLayer] = useState(0);
  const [openStreams, setOpenStreams] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mc_history") || "[]"); } catch { return []; }
  });
  const textareaRef = useRef(null);

  const loadingMessages = [
    "Separating the streams...",
    "Differentiating thinking from feeling...",
    "Building the empathy challenger...",
    "Finding what's underneath...",
    "Mapping the layers of awareness...",
  ];

  useEffect(() => {
    if (screen !== "loading") return;
    const iv = setInterval(() => setLoadingPhase((p) => (p + 1) % loadingMessages.length), 2800);
    return () => clearInterval(iv);
  }, [screen]);

  useEffect(() => {
    try { localStorage.setItem("mc_history", JSON.stringify(history)); } catch {}
  }, [history]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setScreen("loading");
    setError(null);
    setLoadingPhase(0);
    try {
      const result = await analyzeExperience(inputText.trim());
      setAnalysis(result);
      setActiveLayer(0);
      setOpenStreams(result.streams?.length ? [result.streams[0].id] : []);
      setHistory((h) => [{ text: inputText.trim(), timestamp: Date.now() }, ...h.filter(x => x.text !== inputText.trim())].slice(0, 20));
      setScreen("results");
    } catch (e) {
      console.error(e);
      setError(e.message || "Something went wrong. Please try again.");
      setScreen("input");
    }
  };

  const handleNew = () => {
    setInputText("");
    setAnalysis(null);
    setScreen("input");
    setActiveLayer(0);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const changeLayer = (i) => {
    setTransitioning(true);
    setTimeout(() => { setActiveLayer(i); setTransitioning(false); }, 180);
  };

  const toggleStream = (id) => {
    setOpenStreams((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]));
  };

  const lc = LAYER_COLORS[activeLayer];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e17", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Newsreader:ital,wght@0,400;0,500;1,400&family=Syne:wght@700;800&display=swap');
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes breathe{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(167,139,250,.08)}50%{box-shadow:0 0 40px rgba(167,139,250,.18)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
        textarea{font-family:'Newsreader',serif}
        textarea:focus{outline:none}
        textarea::placeholder{color:#475569}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
        @media(max-width:640px){
          .two-col{grid-template-columns:1fr !important}
          .example-grid{grid-template-columns:1fr !important}
          .layer-btns{gap:3px !important}
          .layer-btns button{padding:6px 10px !important;font-size:11px !important}
        }
      `}</style>

      {/* ambient */}
      <div style={{ position: "fixed", top: "-25%", right: "-15%", width: "55vw", height: "55vw", borderRadius: "50%", background: `radial-gradient(circle,${lc}05 0%,transparent 60%)`, transition: "background 1s ease", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 920, margin: "0 auto", padding: "36px 20px" }}>

        {/* ─── INPUT SCREEN ─── */}
        {screen === "input" && (
          <div style={{ animation: "fadeIn .5s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: "#a78bfa", marginBottom: 10, animation: "breathe 4s ease-in-out infinite" }}>
                Metacognition + Differentiation Coach
              </div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(26px,5vw,44px)", fontWeight: 800, lineHeight: 1.12, color: "#f1f5f9", marginBottom: 14 }}>
                What's alive in you{" "}
                <span style={{ color: "#a78bfa" }}>right now?</span>
              </h1>
              <p style={{ fontFamily: "'Newsreader',serif", fontSize: 16, fontStyle: "italic", color: "#64748b", maxWidth: 540, margin: "0 auto", lineHeight: 1.65 }}>
                Share a situation, a feeling, a rant, a moment that's sitting with you.
                Don't filter it. Don't organize it. Just let it out — the messier the better.
                We'll find the layers together.
              </p>
            </div>

            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <div style={{ borderRadius: 18, border: "1.5px solid #1e293b", background: "linear-gradient(170deg,#0f172a,#0a0e17)", animation: "pulseGlow 4s ease-in-out infinite", overflow: "hidden" }}>
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                  placeholder="Start here... e.g. 'I feel bullied by my mom's behavior. She always criticizes how I parent my kids and it makes me feel like nothing I do is ever good enough...'"
                  rows={7}
                  style={{ width: "100%", padding: "24px 24px 12px", border: "none", background: "transparent", color: "#e2e8f0", fontSize: 16, lineHeight: 1.7, resize: "vertical", minHeight: 180 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 14px" }}>
                  <span style={{ fontSize: 11, color: "#334155" }}>
                    {inputText.length > 0 ? `${inputText.split(/\s+/).filter(Boolean).length} words` : "⌘/Ctrl+Enter to submit"}
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={!inputText.trim()}
                    style={{
                      padding: "10px 28px", borderRadius: 100, border: "none",
                      background: inputText.trim() ? "linear-gradient(135deg,#a78bfa,#7c3aed)" : "#1e293b",
                      color: inputText.trim() ? "#fff" : "#475569",
                      fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600,
                      cursor: inputText.trim() ? "pointer" : "not-allowed", transition: "all .3s ease",
                    }}>
                    Begin exploration →
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "#7f1d1d20", border: "1px solid #7f1d1d40", color: "#fca5a5", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: 28 }}>
                <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "#334155", marginBottom: 12, textAlign: "center" }}>or try an example</div>
                <div className="example-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {EXAMPLE_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => setInputText(p)}
                      style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #1e293b", background: "#0d1117", color: "#94a3b8", fontFamily: "'Newsreader',serif", fontSize: 13, lineHeight: 1.5, textAlign: "left", cursor: "pointer", transition: "all .25s ease", fontStyle: "italic" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a78bfa40"; e.currentTarget.style.color = "#e2e8f0"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#94a3b8"; }}>
                      "{p.length > 100 ? p.slice(0, 100) + "..." : p}"
                    </button>
                  ))}
                </div>
              </div>

              {history.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "#334155" }}>Recent explorations</span>
                    <button onClick={() => { setHistory([]); localStorage.removeItem("mc_history"); }}
                      style={{ fontSize: 10, color: "#334155", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                      Clear
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {history.slice(0, 5).map((h, i) => (
                      <button key={i} onClick={() => setInputText(h.text)}
                        style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontFamily: "'Newsreader',serif", fontSize: 13, textAlign: "left", cursor: "pointer", transition: "all .2s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}>
                        {h.text.length > 120 ? h.text.slice(0, 120) + "..." : h.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── LOADING SCREEN ─── */}
        {screen === "loading" && (
          <div style={{ textAlign: "center", paddingTop: "15vh", animation: "fadeIn .4s ease" }}>
            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 36px" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  position: "absolute", inset: i * 18, borderRadius: "50%",
                  border: `1.5px solid ${LAYER_COLORS[i]}${loadingPhase >= i ? "50" : "15"}`,
                  animation: `spin ${6 + i * 3}s linear infinite${i % 2 ? " reverse" : ""}`,
                  transition: "border-color .6s ease",
                }} />
              ))}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: LAYER_COLORS[loadingPhase], boxShadow: `0 0 24px ${LAYER_COLORS[loadingPhase]}50`, transition: "all .5s ease" }} />
              </div>
            </div>
            <div style={{ fontFamily: "'Newsreader',serif", fontSize: 18, fontStyle: "italic", color: LAYER_COLORS[loadingPhase], transition: "color .5s ease", marginBottom: 8 }}>
              {loadingMessages[loadingPhase]}
            </div>
            <div style={{ fontSize: 12, color: "#334155" }}>This takes about 15–30 seconds</div>
          </div>
        )}

        {/* ─── RESULTS SCREEN ─── */}
        {screen === "results" && analysis && (
          <div style={{ animation: "fadeIn .5s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: lc, marginBottom: 10, animation: "breathe 4s ease-in-out infinite", transition: "color .6s" }}>
                Metacognition + Differentiation
              </div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, lineHeight: 1.15, color: "#f1f5f9", marginBottom: 10 }}>
                Your story is real.{" "}
                <span style={{ color: lc, transition: "color .6s" }}>It's also not the whole story.</span>
              </h1>
              {analysis.summary && (
                <p style={{ fontFamily: "'Newsreader',serif", fontSize: 15, fontStyle: "italic", color: "#94a3b8", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
                  {analysis.summary}
                </p>
              )}
            </div>

            {/* what you shared */}
            <div style={{ maxWidth: 680, margin: "0 auto 24px", padding: "14px 18px", borderRadius: 12, background: "#0f172a", border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>What you shared</div>
              <div style={{ fontFamily: "'Newsreader',serif", fontSize: 14, lineHeight: 1.65, color: "#94a3b8", fontStyle: "italic" }}>
                "{inputText.length > 300 ? inputText.slice(0, 300) + "..." : inputText}"
              </div>
            </div>

            {/* legend */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ padding: "8px 16px", borderRadius: 10, background: "#0f172a", border: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${lc}15`, border: `1.5px solid ${lc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0, color: lc }}>me</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Your perspective</span>
              </div>
              <div style={{ padding: "8px 16px", borderRadius: 10, background: "linear-gradient(170deg,#1a0a2a,#0f172a)", border: "1px solid #a78bfa20", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${lc}15`, border: `1.5px solid ${lc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>⟐</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Empathy challenger</span>
              </div>
            </div>

            {/* layer selector */}
            <div className="layer-btns" style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 8, flexWrap: "wrap" }}>
              {LAYER_NAMES.map((name, i) => (
                <button key={i} onClick={() => changeLayer(i)}
                  style={{
                    padding: "8px 16px", borderRadius: 100,
                    border: `1.5px solid ${activeLayer === i ? LAYER_COLORS[i] : LAYER_COLORS[i] + "20"}`,
                    background: activeLayer === i ? LAYER_COLORS[i] + "15" : "transparent",
                    color: activeLayer === i ? LAYER_COLORS[i] : "#475569",
                    fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500,
                    cursor: "pointer", transition: "all .3s ease", whiteSpace: "nowrap",
                  }}>
                  <span style={{ marginRight: 5, fontSize: 10 }}>{LAYER_ICONS[i]}</span>{name}
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <span style={{ fontFamily: "'Newsreader',serif", fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                {activeLayer === 0 && "Fused experience — everything feels like one thing"}
                {activeLayer === 1 && "Streams separate — 'oh, there's more happening here'"}
                {activeLayer === 2 && "Patterns visible — your frame is a frame, not a fact"}
                {activeLayer === 3 && "Awareness turns on itself — seeing the seer"}
              </span>
            </div>

            {/* expand all */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <button
                onClick={() => setOpenStreams(openStreams.length === (analysis.streams?.length || 0) ? (analysis.streams?.length ? [analysis.streams[0].id] : []) : (analysis.streams || []).map((s) => s.id))}
                style={{ padding: "7px 18px", borderRadius: 100, border: `1px solid ${lc}25`, background: "transparent", color: "#64748b", fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: "pointer", transition: "all .3s ease" }}>
                {openStreams.length === (analysis.streams?.length || 0) ? "◉ Collapse" : "◈ Expand all streams"}
              </button>
            </div>

            {/* streams */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: transitioning ? .4 : 1, transition: "opacity .2s ease" }}>
              {(analysis.streams || []).map((s) => (
                <StreamCard key={s.id} stream={s} activeLayer={activeLayer} isOpen={openStreams.includes(s.id)} onToggle={() => toggleStream(s.id)} />
              ))}
            </div>

            {/* integration */}
            {analysis.integration?.[activeLayer] && (
              <div style={{ marginTop: 28, padding: "22px 24px", borderRadius: 16, background: "linear-gradient(170deg,#0f172a,#0a0e17)", border: `1px solid ${lc}18`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${lc}35,transparent)` }} />
                <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: lc, marginBottom: 10 }}>✦ What differentiation reveals</div>
                <div style={{ fontFamily: "'Newsreader',serif", fontSize: 15, lineHeight: 1.75, color: "#cbd5e1" }}>{analysis.integration[activeLayer]}</div>
              </div>
            )}

            {/* third option */}
            {activeLayer >= 2 && analysis.thirdOption && (
              <div style={{ marginTop: 16, padding: "20px 24px", borderRadius: 14, background: "#f59e0b08", border: "1px solid #f59e0b20", animation: "slideUp .5s ease" }}>
                <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 10 }}>⚡ The Third Option</div>
                <div style={{ fontFamily: "'Newsreader',serif", fontSize: 15, lineHeight: 1.7, color: "#cbd5e1" }}>{analysis.thirdOption}</div>
              </div>
            )}

            {/* new */}
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button onClick={handleNew}
                style={{ padding: "12px 32px", borderRadius: 100, border: "1.5px solid #a78bfa40", background: "transparent", color: "#a78bfa", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all .3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#a78bfa15"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                ← Explore something new
              </button>
            </div>

            {/* footer */}
            <div style={{ textAlign: "center", marginTop: 40, paddingTop: 24, borderTop: "1px solid #1e293b" }}>
              <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.7, maxWidth: 520, margin: "0 auto", fontFamily: "'Newsreader',serif", fontStyle: "italic" }}>
                Metacognition without empathy is just a more elegant ego.
                Empathy without metacognition is just losing yourself in someone else.
                Together, they are differentiation — the ability to be fully yourself while fully seeing another.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
