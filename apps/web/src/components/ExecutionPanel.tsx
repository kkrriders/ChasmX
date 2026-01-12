import React, { useEffect, useRef, useState } from "react";
import { 
  Activity, 
  Cpu,
  Pause, 
  Play, 
  Search,
  Server, 
  Square, 
  Terminal
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type EventPayload = {
  run_id: string;
  timestamp: string;
  agent_id: string;
  step_id?: string;
  event_type: string;
  payload?: any;
};

type AgentState = {
  id: string;
  events: EventPayload[];
  lastEvent?: EventPayload;
  status?: 'running' | 'paused' | 'stopped' | 'idle';
};

export default function ExecutionPanel({ runId }: { runId?: string }) {
  const [events, setEvents] = useState<EventPayload[]>([]);
  const [agents, setAgents] = useState<Record<string, AgentState>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [status, setStatus] = useState<"Connected" | "Disconnected" | "Error" | "Ready">("Ready");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // connect to local mock server by default
    const url = (process.env.NEXT_PUBLIC_RUN_WS_URL as string) || "ws://localhost:8081";
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onopen = () => setStatus("Connected");
    
    ws.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data) as EventPayload;
        setEvents((prev) => [...prev, ev]);
        setAgents((prev) => {
          const prevAgent = prev[ev.agent_id] || { id: ev.agent_id, events: [], status: 'idle' };
          const updated: AgentState = { 
            ...prevAgent, 
            lastEvent: ev, 
            events: [...prevAgent.events, ev],
            status: 'running' // Assume running on new event
          };
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

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [events, autoScroll]);

  const sendCommand = (cmd: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    ws.send(JSON.stringify({ type: "command", command: cmd, run_id: runId }));
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Connected": return "bg-emerald-500";
      case "Disconnected": return "bg-slate-400";
      case "Error": return "bg-red-500";
      default: return "bg-amber-500";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">Execution Monitor</h2>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 pl-1 pr-2 py-0.5 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <span className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
            {status}
          </Badge>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => sendCommand("run")} className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
              <Play className="w-4 h-4 fill-current" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => sendCommand("pause")} className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20">
              <Pause className="w-4 h-4 fill-current" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => sendCommand("stop")} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Square className="w-4 h-4 fill-current" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Run ID: {runId || "local-dev"}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Agents Sidebar */}
        <div className="col-span-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col min-w-[250px]">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Cpu className="w-3 h-3" /> Active Agents
            </h3>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{Object.keys(agents).length}</Badge>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {Object.keys(agents).length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  Waiting for agents...
                </div>
              )}
              {Object.entries(agents).map(([id, agent]) => (
                <div
                  key={id}
                  onClick={() => setSelectedAgent(id)}
                  className={cn(
                    "group p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                    selectedAgent === id 
                      ? "bg-white dark:bg-slate-800 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-sm" 
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm truncate max-w-[120px]" title={id}>{id}</span>
                    <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      Active
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
                    {agent.lastEvent?.event_type || "Initializing..."}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <Button 
                      size="sm" variant="ghost" 
                      className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={(e) => { e.stopPropagation(); sendCommand(`pause_agent:${id}`); }}
                      title="Pause Agent"
                    >
                      <Pause className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" variant="ghost" 
                      className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={(e) => { e.stopPropagation(); sendCommand(`resume_agent:${id}`); }}
                      title="Resume Agent"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Transcript */}
        <div className="col-span-6 flex flex-col bg-white dark:bg-slate-950">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Live Transcript
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-slate-400">{events.length} events</span>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={cn("h-6 text-[10px] px-2", autoScroll ? "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "text-slate-400")}
                 onClick={() => setAutoScroll(!autoScroll)}
               >
                 Auto-scroll
               </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="p-4 space-y-4 font-mono text-sm">
              {events.length === 0 && (
                <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No events received yet.</p>
                  <p className="text-xs mt-1">Start the runner to see live output.</p>
                </div>
              )}
              {events.map((ev, i) => (
                <div key={i} className="group flex gap-3 text-xs md:text-sm animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <div className="text-slate-400 dark:text-slate-600 w-16 flex-shrink-0 text-[10px] pt-1 select-none">
                    {ev.timestamp.split('T')[1]?.split('.')[0] || ev.timestamp}
                  </div>
                  <div className="flex-1 min-w-0 break-words">
                     <div className="flex items-center gap-2 mb-0.5">
                       <span className={cn(
                         "font-bold text-[10px] px-1.5 rounded",
                         ev.agent_id === "system" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                       )}>
                         {ev.agent_id}
                       </span>
                       <span className="text-[10px] text-slate-400 uppercase tracking-wide">{ev.event_type}</span>
                     </div>
                     <div className={cn(
                       "whitespace-pre-wrap leading-relaxed",
                       ev.event_type === "token" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                     )}>
                       {ev.event_type === "token" ? ev.payload?.text : (
                         typeof ev.payload?.text === 'string' ? ev.payload.text : JSON.stringify(ev.payload, null, 2)
                       )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Details Panel */}
        <div className="col-span-3 border-l border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Search className="w-3 h-3" /> Agent Inspector
            </h3>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              {!selectedAgent ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-600 text-center">
                  <Server className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Select an agent to view details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 break-all">
                      {selectedAgent}
                    </h4>
                    <div className="flex gap-2">
                       <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                         {agents[selectedAgent]?.events.length || 0} Events
                       </Badge>
                       <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600 dark:border-emerald-900/30 dark:text-emerald-500">
                         Active
                       </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Recent Activity
                    </h5>
                    {agents[selectedAgent]?.events.slice().reverse().map((ev, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
                        <div className="flex justify-between text-slate-400 mb-1 text-[10px]">
                          <span>{ev.timestamp}</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">{ev.event_type}</span>
                        </div>
                        <div className="font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-20 overflow-hidden text-ellipsis">
                           {ev.payload?.text ?? JSON.stringify(ev.payload)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}