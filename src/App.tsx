import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

const AIS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    maker: "OpenAI",
    avatar: "⬡",
    color: "#10a37f",
    accent: "#10a37f",
    persona: `You are ChatGPT by OpenAI participating in a collaborative AI brainstorm session.

STRICT RULES — follow these exactly:
1. Only state facts you are highly confident about. If uncertain, say "I'm not sure, but..." or "This needs verification."
2. Read ALL previous messages carefully. Reference what other AIs said by name when building on their points.
3. Do NOT repeat what has already been said. Add genuinely new ideas or perspectives.
4. Keep your contribution to 3-5 sentences maximum.
5. Never fabricate statistics, names, dates, or sources. If you don't have a reliable fact, skip it.
6. End with ONE open question to push the brainstorm forward.
7. You ARE ChatGPT — practical, structured, slightly formal.`,
  },
  {
    id: "claude",
    name: "Claude",
    maker: "Anthropic",
    avatar: "◈",
    color: "#cc785c",
    accent: "#e8956d",
    persona: `You are Claude by Anthropic participating in a collaborative AI brainstorm session.

STRICT RULES — follow these exactly:
1. Only state facts you are highly confident about. If uncertain, say "I'm not sure, but..." or "This needs verification."
2. Read ALL previous messages carefully. Reference what other AIs said by name when building on their points.
3. Do NOT repeat what has already been said. Add genuinely new ideas or perspectives.
4. Keep your contribution to 3-5 sentences maximum.
5. Never fabricate statistics, names, dates, or sources. If you don't have a reliable fact, skip it.
6. End with ONE open question to push the brainstorm forward.
7. You ARE Claude — thoughtful, nuanced, intellectually honest, willing to flag disagreements.`,
  },
  {
    id: "gemini",
    name: "Gemini",
    maker: "Google",
    avatar: "✦",
    color: "#4285f4",
    accent: "#669df6",
    persona: `You are Gemini by Google participating in a collaborative AI brainstorm session.

STRICT RULES — follow these exactly:
1. Only state facts you are highly confident about. If uncertain, say "I'm not sure, but..." or "This needs verification."
2. Read ALL previous messages carefully. Reference what other AIs said by name when building on their points.
3. Do NOT repeat what has already been said. Add genuinely new ideas or perspectives.
4. Keep your contribution to 3-5 sentences maximum.
5. Never fabricate statistics, names, dates, or sources. If you don't have a reliable fact, skip it.
6. End with ONE open question to push the brainstorm forward.
7. You ARE Gemini — curious, research-oriented, grounded in broad knowledge, enthusiastic about data.`,
  },
  {
    id: "copilot",
    name: "Copilot",
    maker: "Microsoft",
    avatar: "⬟",
    color: "#7b68ee",
    accent: "#9d8ef5",
    persona: `You are Microsoft Copilot participating in a collaborative AI brainstorm session.

STRICT RULES — follow these exactly:
1. Only state facts you are highly confident about. If uncertain, say "I'm not sure, but..." or "This needs verification."
2. Read ALL previous messages carefully. Reference what other AIs said by name when building on their points.
3. Do NOT repeat what has already been said. Add genuinely new ideas or perspectives.
4. Keep your contribution to 3-5 sentences maximum.
5. Never fabricate statistics, names, dates, or sources. If you don't have a reliable fact, skip it.
6. End with ONE open question to push the brainstorm forward.
7. You ARE Copilot — pragmatic, productivity-focused, enterprise-minded, actionable.`,
  },
  {
    id: "llama",
    name: "Llama",
    maker: "Meta",
    avatar: "◎",
    color: "#0866ff",
    accent: "#4a90e2",
    persona: `You are Llama by Meta participating in a collaborative AI brainstorm session.

STRICT RULES — follow these exactly:
1. Only state facts you are highly confident about. If uncertain, say "I'm not sure, but..." or "This needs verification."
2. Read ALL previous messages carefully. Reference what other AIs said by name when building on their points.
3. Do NOT repeat what has already been said. Add genuinely new ideas or perspectives.
4. Keep your contribution to 3-5 sentences maximum.
5. Never fabricate statistics, names, dates, or sources. If you don't have a reliable fact, skip it.
6. End with ONE open question to push the brainstorm forward.
7. You ARE Llama — open-source minded, community-focused, transparent about limitations.`,
  },
];

type AI = (typeof AIS)[number];

interface Message {
  id: string;
  aiId: string;
  aiName: string;
  round: number;
  content: string;
}

function TypingDots({ color }: { color: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: color,
            animation: `bdot 1.2s ease-in-out ${i * 0.2}s infinite`,
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}

function MessageBubble({ msg, isNew }: { msg: Message; isNew: boolean }) {
  const ai = AIS.find((a) => a.id === msg.aiId)!;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "16px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        animation: isNew ? "slideIn 0.4s ease" : "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: `${ai.color}22`,
          border: `1.5px solid ${ai.accent}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          color: ai.accent,
          flexShrink: 0,
          fontFamily: "monospace",
        }}
      >
        {ai.avatar}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: ai.accent,
              letterSpacing: 0.5,
            }}
          >
            {ai.name}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: 1,
            }}
          >
            {ai.maker} · Round {msg.round}
          </span>
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 14,
            lineHeight: 1.7,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const callAIAction = useAction(api.brainstorm.callAI);

  const [topic, setTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle"
  );
  const [currentAI, setCurrentAI] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);
  const [newMsgIds, setNewMsgIds] = useState(new Set<string>());
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAI]);

  async function callAI(
    ai: AI,
    brainstormTopic: string,
    msgs: Message[]
  ): Promise<string> {
    return callAIAction({
      persona: ai.persona,
      topic: brainstormTopic,
      messages: msgs.map((m) => ({ aiName: m.aiName, content: m.content })),
    });
  }

  async function startBrainstorm() {
    if (!topic.trim()) return;
    abortRef.current = false;
    setActiveTopic(topic.trim());
    setMessages([]);
    setNewMsgIds(new Set());
    setRound(1);
    setStatus("running");
    await runRounds(topic.trim(), [], 1);
  }

  async function runRounds(
    topicStr: string,
    existingMessages: Message[],
    startRound: number
  ) {
    let currentMessages = [...existingMessages];

    for (let r = startRound; r <= maxRounds; r++) {
      setRound(r);
      for (const ai of AIS) {
        if (abortRef.current) {
          setStatus("paused");
          return;
        }

        setCurrentAI(ai.id);

        try {
          const reply = await callAI(ai, topicStr, currentMessages);
          const newMsg: Message = {
            id: `${ai.id}-${r}-${Date.now()}`,
            aiId: ai.id,
            aiName: ai.name,
            round: r,
            content: reply,
          };
          currentMessages = [...currentMessages, newMsg];
          setMessages((prev) => [...prev, newMsg]);
          setNewMsgIds((prev) => new Set([...prev, newMsg.id]));
        } catch (e) {
          const errMsg: Message = {
            id: `${ai.id}-${r}-err`,
            aiId: ai.id,
            aiName: ai.name,
            round: r,
            content: `⚠️ ${(e as Error).message}`,
          };
          currentMessages = [...currentMessages, errMsg];
          setMessages((prev) => [...prev, errMsg]);
        }

        if (abortRef.current) {
          setStatus("paused");
          setCurrentAI(null);
          return;
        }
      }
    }

    setCurrentAI(null);
    setStatus("done");
  }

  function stopBrainstorm() {
    abortRef.current = true;
  }

  async function addRound() {
    if (status !== "done" && status !== "paused") return;
    abortRef.current = false;
    const nextRound = round + 1;
    setMaxRounds(nextRound);
    setStatus("running");
    await runRounds(activeTopic, messages, nextRound);
  }

  const suggestedTopics = [
    "The future of remote work in 2030",
    "How to reduce plastic waste globally",
    "Will AI replace creative jobs?",
    "Best strategies for learning a new language",
    "How to build a successful startup with no funding",
  ];

  const activeAI = AIS.find((a) => a.id === currentAI);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060608; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        @keyframes bdot {
          0%,80%,100% { transform: translateY(0); opacity:0.3; }
          40% { transform: translateY(-5px); opacity:1; }
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateX(-12px); }
          to { opacity:1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:0.6; }
          50% { opacity:1; }
        }
        textarea:focus, input:focus { outline: none; }
        button:hover { opacity: 0.85; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#060608",
          color: "#f0f0f0",
          display: "flex",
          flexDirection: "column",
          maxWidth: 860,
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: "-1px",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(90deg, #10a37f, #669df6, #e8956d, #9d8ef5, #4a90e2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI ROUNDTABLE
            </span>
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 12,
              letterSpacing: 2,
            }}
          >
            5 MODELS · COLLABORATIVE BRAINSTORM · FACTUAL ONLY
          </div>

          {/* AI roster */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {AIS.map((ai) => (
              <div
                key={ai.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: `1px solid ${currentAI === ai.id ? ai.accent : "rgba(255,255,255,0.08)"}`,
                  background:
                    currentAI === ai.id ? `${ai.color}18` : "transparent",
                  transition: "all 0.2s",
                  animation:
                    currentAI === ai.id ? "pulse 1s ease infinite" : "none",
                }}
              >
                <span style={{ color: ai.accent, fontSize: 14 }}>
                  {ai.avatar}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    color:
                      currentAI === ai.id
                        ? ai.accent
                        : "rgba(255,255,255,0.35)",
                  }}
                >
                  {ai.name}
                </span>
                {currentAI === ai.id && <TypingDots color={ai.accent} />}
              </div>
            ))}
          </div>
        </div>

        {/* Topic input — only when idle */}
        {status === "idle" && (
          <div style={{ padding: "28px 0" }}>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: 2,
                marginBottom: 12,
              }}
            >
              BRAINSTORM TOPIC
            </div>

            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic for all 5 AIs to brainstorm together..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "14px 16px",
                color: "#f0f0f0",
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.5,
                resize: "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  startBrainstorm();
                }
              }}
            />

            {/* Rounds selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: 1,
                }}
              >
                ROUNDS:
              </span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxRounds(n)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor:
                      maxRounds === n ? "#fff" : "rgba(255,255,255,0.15)",
                    background:
                      maxRounds === n
                        ? "rgba(255,255,255,0.12)"
                        : "transparent",
                    color:
                      maxRounds === n ? "#fff" : "rgba(255,255,255,0.35)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {n}
                </button>
              ))}
              <span
                style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}
              >
                = {maxRounds * 5} total messages
              </span>
            </div>

            <button
              onClick={startBrainstorm}
              disabled={!topic.trim()}
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                border: "none",
                background: topic.trim()
                  ? "linear-gradient(135deg, #10a37f 0%, #669df6 50%, #9d8ef5 100%)"
                  : "rgba(255,255,255,0.08)",
                color: topic.trim() ? "#fff" : "rgba(255,255,255,0.2)",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                cursor: topic.trim() ? "pointer" : "not-allowed",
                letterSpacing: 1,
              }}
            >
              START BRAINSTORM →
            </button>

            {/* Suggestions */}
            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: 2,
                  marginBottom: 10,
                }}
              >
                TRY THESE TOPICS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {suggestedTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active brainstorm */}
        {status !== "idle" && (
          <>
            {/* Topic banner */}
            <div
              style={{
                padding: "14px 16px",
                margin: "16px 0 0",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  TOPIC
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#f0f0f0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {activeTopic}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {status === "running" && (
                  <button
                    onClick={stopBrainstorm}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,80,80,0.4)",
                      background: "rgba(255,80,80,0.1)",
                      color: "#ff6060",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    ⏸ PAUSE
                  </button>
                )}
                {(status === "done" || status === "paused") && (
                  <>
                    <button
                      onClick={addRound}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "1px solid rgba(100,255,160,0.3)",
                        background: "rgba(100,255,160,0.08)",
                        color: "#64ffa0",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      + MORE ROUNDS
                    </button>
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setMessages([]);
                        setTopic("");
                        setActiveTopic("");
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "transparent",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      NEW TOPIC
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Status indicator */}
            {status === "running" && activeAI && (
              <div
                style={{
                  padding: "10px 16px",
                  marginTop: 8,
                  borderRadius: 8,
                  background: `${activeAI.color}11`,
                  border: `1px solid ${activeAI.accent}33`,
                  fontSize: 12,
                  color: activeAI.accent,
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: 1,
                  animation: "pulse 1s ease infinite",
                }}
              >
                {activeAI.avatar} {activeAI.name} is thinking... · Round{" "}
                {round} of {maxRounds}
              </div>
            )}
            {status === "done" && (
              <div
                style={{
                  padding: "10px 16px",
                  marginTop: 8,
                  borderRadius: 8,
                  background: "rgba(100,255,160,0.06)",
                  border: "1px solid rgba(100,255,160,0.2)",
                  fontSize: 12,
                  color: "#64ffa0",
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: 1,
                }}
              >
                ✓ BRAINSTORM COMPLETE · {messages.length} contributions ·{" "}
                {round} rounds
              </div>
            )}
            {status === "paused" && (
              <div
                style={{
                  padding: "10px 16px",
                  marginTop: 8,
                  borderRadius: 8,
                  background: "rgba(255,200,0,0.06)",
                  border: "1px solid rgba(255,200,0,0.2)",
                  fontSize: 12,
                  color: "#ffc800",
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: 1,
                }}
              >
                ⏸ PAUSED · {messages.length} contributions so far
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, padding: "8px 0 40px" }}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isNew={newMsgIds.has(msg.id)}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
