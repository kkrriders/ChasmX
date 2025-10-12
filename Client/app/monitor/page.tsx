"use client";

import React from "react";
import ExecutionPanel from "../../components/ExecutionPanel";

export default function MonitorPage() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <h2 style={{ margin: 0 }}>Monitor</h2>
      </div>
      <div style={{ flex: 1 }}>
        <ExecutionPanel />
      </div>
    </div>
  );
}
