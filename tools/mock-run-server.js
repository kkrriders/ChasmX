// Simple mock WebSocket server that emits simulated workflow events.
// Usage: node dev_tools/mock-run-server.js

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });

console.log("Mock run server listening ws://localhost:8081");

function now() {
  return new Date().toISOString();
}

function randomText() {
  const samples = [
    "Thinking...",
    "Querying knowledge base",
    "Calling external tool",
    "Composing response",
    "Finished step",
    "Encountered error: timeout"
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}

function makeEvent(runId, agentId, step, type, payload) {
  return JSON.stringify({
    run_id: runId,
    timestamp: now(),
    agent_id: agentId,
    step_id: step,
    event_type: type,
    payload,
  });
}

wss.on("connection", function connection(ws) {
  console.log("client connected");

  const runId = `run-${Math.floor(Math.random() * 10000)}`;

  // Simulate two agents
  const agents = ["agent:assistant", "agent:researcher"];

  let step = 0;

  const interval = setInterval(() => {
    step += 1;
    const a = agents[step % agents.length];
    const t = step < 3 ? "start" : step < 8 ? "progress" : step === 12 ? "error" : "done";
    const payload = { text: randomText(), step };
    const ev = makeEvent(runId, a, `step-${step}`, t, payload);
    ws.send(ev);

    // after some steps, send a token stream event
    if (step % 4 === 0) {
      ws.send(makeEvent(runId, a, `step-${step}`, "token", { text: "partial token..." }));
    }

    if (step > 14) {
      clearInterval(interval);
      ws.close();
    }
  }, 700);

  ws.on("message", (msg) => {
    try {
      const parsed = JSON.parse(msg.toString());
      console.log("Received command from client", parsed);
      if (parsed && parsed.type === "command") {
        ws.send(makeEvent(runId, "system", "", "info", { text: `command_received:${parsed.command}` }));
      }
    } catch (e) {
      console.log("invalid client message", msg.toString());
    }
  });

  ws.on("close", () => console.log("client disconnected"));
});
