"use client"

import React from "react"

type Node = { id: string; label?: string; x?: number; y?: number }
type Edge = { from: string; to: string }

export default function ExecutionVisualizer({ wsUrl, nodes = [], edges = [] }: { wsUrl?: string; nodes?: Node[]; edges?: Edge[] }) {
  return (
    <div className="p-4 bg-white/5 rounded-md h-full overflow-auto">
      <div className="mb-2 text-sm text-muted-foreground">Execution Visualizer</div>
      <div className="text-xs">
        <div className="font-medium">Websocket:</div>
        <div className="break-words">{wsUrl}</div>
      </div>

      <div className="mt-3 text-sm">
        <div className="font-medium">Nodes</div>
        <ul className="list-disc pl-5">
          {nodes.map((n) => (
            <li key={n.id}>{n.label ?? n.id}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 text-sm">
        <div className="font-medium">Edges</div>
        <ul className="list-disc pl-5">
          {edges.map((e, i) => (
            <li key={i}>{e.from} → {e.to}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
