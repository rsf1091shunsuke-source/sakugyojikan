"use client";
import { useState, useMemo } from "react";

const MODULES = ["M-01", "M-02", "M-03", "M-04", "M-05", "M-06", "M-07", "M-08"];
const PROCESSES = ["墨付", "加工", "組立"];
const PROCESS_COLORS = {
  墨付: "#e8a838",
  加工: "#4a9eda",
  組立: "#5cbd8a",
};

function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === "0:00" || timeStr === "") return 0;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0]) || 0;
  const m = parseInt(parts[1]) || 0;
  return h * 60 + m;
}

function minutesToTime(mins) {
  if (!mins || mins === 0) return "0:00";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function TimeInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      placeholder="0:00"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "7px 8px",
        background: focused ? "#1e2a3a" : "#151e2b",
        border: `1px solid ${focused ? "#4a9eda" : "#243348"}`,
        borderRadius: "5px",
        color: "#d4e4f4",
        fontSize: "15px",
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: "center",
        outline: "none",
        transition: "border-color 0.15s",
        boxSizing: "border-box",
      }}
    />
  );
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 80, height: 6, background: "#1e2a3a", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8ba7c4", minWidth: 36 }}>
        {minutesToTime(value)}
      </span>
    </div>
  );
}

export default function App() {
  const today = new Date().toISOString().split("T")[0];
  const [tab, setTab] = useState("entry");
  const [rows, setRows] = useState([
    { id: 1, date: today, module: "M-01", 墨付: "", 加工: "", 組立: "" },
  ]);
  const [nextId, setNextId] = useState(2);

  const addRow = () => {
    setRows((r) => [
      ...r,
      { id: nextId, date: today, module: "M-01", 墨付: "", 加工: "", 組立: "" },
    ]);
    setNextId((n) => n + 1);
  };

  const removeRow = (id) => setRows((r) => r.filter((row) => row.id !== id));

  const updateRow = (id, field, val) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: val } : row)));

  // Aggregation
  const processTotals = useMemo(() => {
    const totals = {};
    PROCESSES.forEach((p) => {
      totals[p] = rows.reduce((acc, r) => acc + timeToMinutes(r[p]), 0);
    });
    return totals;
  }, [rows]);

  const moduleTotals = useMemo(() => {
    const totals = {};
    MODULES.forEach((m) => {
      totals[m] = {};
      PROCESSES.forEach((p) => {
        totals[m][p] = rows
          .filter((r) => r.module === m)
          .reduce((acc, r) => acc + timeToMinutes(r[p]), 0);
      });
      totals[m].total = PROCESSES.reduce((acc, p) => acc + totals[m][p], 0);
    });
    return totals;
  }, [rows]);

  const grandTotal = useMemo(
    () => PROCESSES.reduce((acc, p) => acc + processTotals[p], 0),
    [processTotals]
  );

  const maxProcessTotal = Math.max(...PROCESSES.map((p) => processTotals[p]), 1);
  const maxModuleTotal = Math.max(...MODULES.map((m) => moduleTotals[m].total), 1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1520",
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "#c8ddf0",
        padding: "24px 16px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=JetBrains+Mono:wght@400;600&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{ maxWidth: 960, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 6,
              height: 42,
              background: "linear-gradient(180deg, #4a9eda, #5cbd8a)",
              borderRadius: 3,
            }}
          />
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4a9eda", textTransform: "uppercase", marginBottom: 2 }}>
              Trainee Work Log
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#e8f4ff", letterSpacing: "0.05em" }}>
              作業時間管理表
            </h1>
          </div>
        </div>
        <div style={{ marginLeft: 18, fontSize: 12, color: "#4e6a84" }}>
          工程別作業時間の記録・集計・分析
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 960, margin: "0 auto 20px", display: "flex", gap: 4, borderBottom: "1px solid #1a2d42" }}>
        {[
          { id: "entry", label: "📋 データ入力" },
          { id: "process", label: "📊 工程別集計" },
          { id: "module", label: "🗂 モジュール別集計" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px",
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #4a9eda" : "2px solid transparent",
              color: tab === t.id ? "#4a9eda" : "#4e6a84",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400,
              cursor: "pointer",
              transition: "color 0.15s",
              marginBottom: -1,
              letterSpacing: "0.03em",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* === TAB: Entry === */}
        {tab === "entry" && (
          <div>
            <div
              style={{
                background: "#0f1c2b",
                border: "1px solid #1a2d42",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* Rows - card layout */}
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #121d2c",
                    background: idx % 2 === 0 ? "#0f1c2b" : "#0d1929",
                  }}
                >
                  {/* 上段: 日付・モジュール・削除ボタン */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, "date", e.target.value)}
                      style={{
                        background: "#151e2b",
                        border: "1px solid #243348",
                        borderRadius: 4,
                        color: "#c8ddf0",
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: "6px 8px",
                        outline: "none",
                        flex: "1 1 auto",
                        minWidth: 0,
                      }}
                    />
                    <select
                      value={row.module}
                      onChange={(e) => updateRow(row.id, "module", e.target.value)}
                      style={{
                        background: "#151e2b",
                        border: "1px solid #243348",
                        borderRadius: 4,
                        color: "#c8ddf0",
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: "6px 8px",
                        outline: "none",
                        width: "82px",
                        flexShrink: 0,
                      }}
                    >
                      {MODULES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeRow(row.id)}
                      style={{
                        background: "none",
                        border: "1px solid #2a3d54",
                        borderRadius: 4,
                        color: "#4e6a84",
                        cursor: "pointer",
                        fontSize: 18,
                        width: 34,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >×</button>
                  </div>
                  {/* 下段: 4工程を均等に並べる */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {PROCESSES.map((p) => (
                      <div key={p}>
                        <div style={{
                          fontSize: 11,
                          color: PROCESS_COLORS[p],
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          marginBottom: 5,
                          textAlign: "center",
                        }}>{p}</div>
                        <TimeInput value={row[p]} onChange={(v) => updateRow(row.id, p, v)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Row */}
              <div style={{ padding: "12px 16px" }}>
                <button
                  onClick={addRow}
                  style={{
                    background: "linear-gradient(135deg, #152436, #1a2f45)",
                    border: "1px dashed #2a4d6e",
                    borderRadius: 6,
                    color: "#4a9eda",
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 13,
                    padding: "8px 20px",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#1c3349")}
                  onMouseLeave={(e) => (e.target.style.background = "linear-gradient(135deg, #152436, #1a2f45)")}
                >
                  ＋ 行を追加
                </button>
              </div>
            </div>

            {/* Quick Summary Footer */}
            <div
              style={{
                marginTop: 16,
                background: "#0a1421",
                border: "1px solid #1a2d42",
                borderRadius: 8,
                padding: "12px 20px",
                display: "flex",
                gap: 32,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#4e6a84", letterSpacing: "0.1em" }}>
                総作業時間
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#e8f4ff",
                  letterSpacing: "0.05em",
                }}
              >
                {minutesToTime(grandTotal)}
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {PROCESSES.map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: PROCESS_COLORS[p],
                        display: "inline-block",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#7a9ab8" }}>{p}</span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        color: "#c8ddf0",
                      }}
                    >
                      {minutesToTime(processTotals[p])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === TAB: Process === */}
        {tab === "process" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#0f1c2b",
                border: "1px solid #1a2d42",
                borderRadius: 10,
                padding: "20px 24px",
              }}
            >
              <div style={{ fontSize: 11, color: "#4e6a84", letterSpacing: "0.15em", marginBottom: 20, textTransform: "uppercase" }}>
                工程別合計時間
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {PROCESSES.map((p) => {
                  const pct = maxProcessTotal > 0 ? (processTotals[p] / maxProcessTotal) * 100 : 0;
                  return (
                    <div key={p}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background: PROCESS_COLORS[p],
                              display: "inline-block",
                            }}
                          />
                          <span style={{ fontWeight: 500, fontSize: 14 }}>{p}</span>
                        </div>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 15,
                            color: PROCESS_COLORS[p],
                            fontWeight: 600,
                          }}
                        >
                          {minutesToTime(processTotals[p])}
                        </span>
                      </div>
                      <div style={{ height: 10, background: "#0a1421", borderRadius: 5, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: `linear-gradient(90deg, ${PROCESS_COLORS[p]}99, ${PROCESS_COLORS[p]})`,
                            borderRadius: 5,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: "#4e6a84", marginTop: 3, textAlign: "right" }}>
                        全体の {grandTotal > 0 ? Math.round((processTotals[p] / grandTotal) * 100) : 0}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {PROCESSES.map((p) => (
                <div
                  key={p}
                  style={{
                    background: "#0f1c2b",
                    border: `1px solid ${PROCESS_COLORS[p]}33`,
                    borderLeft: `3px solid ${PROCESS_COLORS[p]}`,
                    borderRadius: 8,
                    padding: "14px 18px",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#4e6a84", marginBottom: 6 }}>{p}工程</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 24,
                      fontWeight: 700,
                      color: PROCESS_COLORS[p],
                    }}
                  >
                    {minutesToTime(processTotals[p])}
                  </div>
                  <div style={{ fontSize: 11, color: "#4e6a84", marginTop: 4 }}>
                    {rows.filter((r) => timeToMinutes(r[p]) > 0).length} 件
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === TAB: Module === */}
        {tab === "module" && (
          <div
            style={{
              background: "#0f1c2b",
              border: "1px solid #1a2d42",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "90px repeat(4, 1fr) 110px",
                background: "#0a1421",
                padding: "10px 16px",
                borderBottom: "1px solid #1a2d42",
                gap: 8,
              }}
            >
              {["モジュール", ...PROCESSES, "合計"].map((h, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    color: i > 0 && i <= 4 ? PROCESS_COLORS[PROCESSES[i - 1]] : "#4e6a84",
                    fontWeight: 600,
                    textAlign: i === 0 ? "left" : "center",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {MODULES.map((m, idx) => {
              const mt = moduleTotals[m];
              const hasData = mt.total > 0;
              return (
                <div
                  key={m}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px repeat(4, 1fr) 110px",
                    padding: "10px 16px",
                    borderBottom: "1px solid #121d2c",
                    background: idx % 2 === 0 ? "#0f1c2b" : "#0d1929",
                    gap: 8,
                    alignItems: "center",
                    opacity: hasData ? 1 : 0.4,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: hasData ? "#e8f4ff" : "#4e6a84",
                    }}
                  >
                    {m}
                  </div>
                  {PROCESSES.map((p) => (
                    <MiniBar key={p} value={mt[p]} max={maxModuleTotal} color={PROCESS_COLORS[p]} />
                  ))}
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      color: hasData ? "#e8f4ff" : "#4e6a84",
                      textAlign: "right",
                    }}
                  >
                    {minutesToTime(mt.total)}
                  </div>
                </div>
              );
            })}

            {/* Footer total row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "90px repeat(4, 1fr) 110px",
                padding: "12px 16px",
                background: "#0a1421",
                borderTop: "1px solid #1a2d42",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#4e6a84", fontWeight: 600 }}>合計</div>
              {PROCESSES.map((p) => (
                <div
                  key={p}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: PROCESS_COLORS[p],
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {minutesToTime(processTotals[p])}
                </div>
              ))}
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#e8f4ff",
                  textAlign: "right",
                }}
              >
                {minutesToTime(grandTotal)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
