"use client";

import React, { useEffect, useRef, useState } from "react";

type EventPayload = {
  run_id: string;
  timestamp: string;
  agent_id: string;
  step_id?: string;
  event_type: string;
  payload?: any;
};

export default function ExecutionPanel({ runId }: { runId?: string }) {
  const [events, setEvents] = useState<EventPayload[]>([]);
  const [agents, setAgents] = useState<Record<string, any>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready");
  const wsRef = useRef<WebSocket | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    // connect to local mock server by default
    const url = (process.env.NEXT_PUBLIC_RUN_WS_URL as string) || "ws://localhost:8081";
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      setStatus("Connected");
    };
    ws.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data) as EventPayload;
        setEvents((prev) => [...prev, ev]);
        setAgents((prev) => {
          const prevAgent = prev[ev.agent_id] || { id: ev.agent_id, events: [] };
          const updated = { ...prevAgent, lastEvent: ev, events: [...prevAgent.events, ev] };
          return { ...prev, [ev.agent_id]: updated };
        });
      } catch (err) {
        console.error("Invalid event", err);
      }
    };
    ws.onclose = () => setStatus("Disconnected");
    ws.onerror = (err) => {
      console.error("WS error", err);
      setStatus("Error");
    };

    return () => {
      ws.close();
    };
  }, [runId]);

  const sendCommand = (cmd: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "command", command: cmd, run_id: runId }));
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={{ width: 320, borderRight: "1px solid #eee", padding: 12, overflow: 'auto' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Workflow Execution</h3>
          <div style={{ fontSize: 12 }}>{status}</div>
        </div>

        <div style={{ marginTop: 8 }}>
          <button onClick={() => sendCommand("run")} style={{ marginRight: 6 }}>Run</button>
          <button onClick={() => sendCommand("pause")} style={{ marginRight: 6 }}>Pause</button>
          <button onClick={() => sendCommand("stop")} style={{ marginRight: 6 }}>Stop</button>
        </div>

        <h4 style={{ marginTop: 16 }}>Agents</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.keys(agents).length === 0 && <div style={{ color: "#666" }}>No agents yet</div>}
          {Object.entries(agents).map(([id, a]) => (
            <div
              key={id}
              onClick={() => setSelectedAgent(id)}
              style={{
                padding: 8,
                border: selectedAgent === id ? "2px solid #5b21b6" : "1px solid #f0f0f0",
                borderRadius: 6,
                cursor: "pointer",
                background: selectedAgent === id ? "rgba(91,33,182,0.04)" : "transparent",
              }}
            >
              <div style={{ fontWeight: 600 }}>{id}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{a.lastEvent?.event_type}</div>
              <div style={{ marginTop: 6 }}>
                <button onClick={() => sendCommand(`pause_agent:${id}`)} style={{ marginRight: 6 }}>Pause</button>
                <button onClick={() => sendCommand(`resume_agent:${id}`)} style={{ marginRight: 6 }}>Resume</button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ margin: 0 }}>Live Transcript</h4>
          <div style={{ fontSize: 12, color: "#666" }}>Events: {events.length}</div>
        </div>
        <div
          ref={transcriptRef}
          onScroll={() => {
            const el = transcriptRef.current;
            if (!el) return;
            // If user scrolls up, stop auto-scrolling until they scroll to bottom again
            const atBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 20;
            userScrolledRef.current = !atBottom;
          }}
          style={{ overflow: "auto", border: "1px solid #eee", padding: 12, borderRadius: 6, flex: 1 }}
        >
          {events.map((ev, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#888" }}>{ev.timestamp} • {ev.agent_id} • {ev.event_type}</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {ev.event_type === "token" ? <span style={{ color: "#2563eb" }}>{ev.payload?.text}</span> : (ev.payload?.text ?? JSON.stringify(ev.payload))}
              </pre>
            </div>
          ))}
        </div>
      </main>

      <aside style={{ width: 380, borderLeft: "1px solid #eee", padding: 12, overflow: 'auto' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ margin: 0 }}>Agent Details</h4>
          <div style={{ fontSize: 12, color: "#666" }}>{selectedAgent ?? "(none)"}</div>
        </div>

        {!selectedAgent && <div style={{ marginTop: 12, color: "#666" }}>Select an agent to view details</div>}

        {selectedAgent && (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>{selectedAgent}</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>{agents[selectedAgent]?.lastEvent?.event_type ?? "—"}</div>
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
              {(agents[selectedAgent]?.events || []).map((ev: EventPayload, i: number) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#888" }}>{ev.timestamp} • {ev.event_type}</div>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{ev.payload?.text ?? JSON.stringify(ev.payload)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
