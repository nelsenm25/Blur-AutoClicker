import "./SettingsPanel.css";
import type { AppInfo, Settings } from "../../store";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";

interface CumulativeStats {
  totalClicks: number;
  totalTimeSecs: number;
  totalSessions: number;
  sessionsSent: number;
  avgCpu: number;
}

interface Props {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  appInfo: AppInfo;
  onReset: () => Promise<void>;
}

function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0.01) return "0s";
  if (totalSeconds < 60) {
    return `${Math.floor(totalSeconds)}s`;
  }
  if (totalSeconds < 3600) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatNumber(n: number): string {
  return Math.floor(n).toLocaleString();
}

function formatCpu(cpu: number): string {
  if (cpu < 0) return "N/A";
  return `${cpu.toFixed(1)}%`;
}

export default function SettingsPanel({
  settings,
  update,
  appInfo,
  onReset,
}: Props) {
  const [resetting, setResetting] = useState(false);
  const [resettingStats, setResettingStats] = useState(false);
  const [stats, setStats] = useState<CumulativeStats | null>(null);
  const [atBottom, setAtBottom] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    invoke<CumulativeStats>("get_stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const handleScroll = () => {
    const el = panelRef.current;
    if (!el) return;
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 2);
  };

  const hasStats = stats !== null && stats.totalSessions > 0;

  return (
    <div className="settings-wrapper">
      <div className="settings-panel" ref={panelRef} onScroll={handleScroll}>
        <div className="settings-row">
          <span className="settings-label">Version</span>
          <span className="settings-value">v{appInfo.version}</span>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-label-group">
            <span className="settings-label">Reset All Settings</span>
            <span className="settings-sublabel">
              Will reset all input fields and settings to the Defaults.
            </span>
          </div>
          <button
            className="settings-btn-danger"
            onClick={() => {
              setResetting(true);
              onReset().finally(() => setResetting(false));
            }}
          >
            {resetting ? "Resetting..." : "Reset"}
          </button>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-label-group">
            <span className="settings-label">Anonymous Usage data</span>
            <span className="settings-sublabel">
              Anonymous analytics to improve the app. No personal information will be collected.
            </span>
          </div>
          <div className="settings-seg-group">
            {["On", "Off"].map((o) => (
              <button
                key={o}
                className={`settings-seg-btn ${(settings.telemetryEnabled ? "On" : "Off") === o ? "active" : ""}`}
                onClick={() => update({ telemetryEnabled: o === "On" })}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-divider" />

        {/* -- Your Usage Data -- */}

        <div className="settings-row">
          <div className="settings-label-group">
            <span className="settings-label">Your Usage Data</span>
            <span className="settings-sublabel">
              Your personal clicker stats, tracked locally, not public if
              Telemetry is Disabled.
            </span>
          </div>
          <button
            className="settings-btn-danger"
            onClick={() => {
              setResettingStats(true);
              invoke<CumulativeStats>("reset_stats")
                .then(setStats)
                .finally(() => setResettingStats(false));
            }}
          >
            {resettingStats ? "Clearing..." : "Clear"}
          </button>
        </div>

        {hasStats ? (
          <>
            <div className="stats-grid">
              <div className="stats-cell">
                <span className="stats-cell-label">Total Clicks</span>
                <span className="stats-cell-value">
                  {formatNumber(stats.totalClicks)}
                </span>
              </div>
              <div className="stats-cell">
                <span className="stats-cell-label">
                  Total Time spent clicking
                </span>
                <span className="stats-cell-value">
                  {formatTime(stats.totalTimeSecs)}
                </span>
              </div>
              <div className="stats-cell">
                <span className="stats-cell-label">
                  CPU Usage avg (while running)
                </span>
                <span className="stats-cell-value">
                  {formatCpu(stats.avgCpu)}
                </span>
              </div>
              <div className="stats-cell">
                <span className="stats-cell-label">Sessions</span>
                <span className="stats-cell-value">{stats.totalSessions}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="stats-empty">No runs recorded yet</div>
        )}
      </div>
      <div className="settings-divider" />
      <div
        className={`settings-fade ${atBottom ? "settings-fade--hidden" : ""}`}
      />
    </div>
  );
}
