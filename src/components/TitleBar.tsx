import { getCurrentWindow } from "@tauri-apps/api/window";
import React, { useState } from "react";
import type { Tab } from "../App";
import "./TitleBar.css";

const appWindow = getCurrentWindow();

const handleMinimize = async () => await appWindow.minimize();

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  running: boolean;
  onRequestClose: () => Promise<void>;
}

export default function TitleBar({ tab, setTab, running, onRequestClose }: Props) {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  const toggleAlwaysOnTop = async () => {
    try {
      const newState = !isAlwaysOnTop;
      await appWindow.setAlwaysOnTop(newState);
      setIsAlwaysOnTop(newState);
    } catch (err) {
      console.error("Failed to set always on top:", err);
    }
  };

  return (
    <div
      className="window-title-background"
      style={
        {
          WebkitAppRegion: "drag",
          WebkitUserSelect: "none",
        } as React.CSSProperties
      }
      data-tauri-drag-region
      data-running={running}
    >
      {/* Leftmost settings icon + mode tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {" "}
        {/* Settings button */}
        <button
          className="settings-button"
          data-active={tab === "settings"}
          onClick={() => setTab("settings")}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <svg
            className="settings-svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        {/* Mode tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          <TabPill
            label={tab === "simple" ? "Simple" : "S"}
            active={tab === "simple"}
            onClick={() => setTab("simple")}
            color="var(--accent-green)"
          />
          <TabPill
            label={tab === "advanced" ? "Advanced" : "A"}
            active={tab === "advanced"}
            onClick={() => setTab("advanced")}
            color="var(--accent-yellow)"
          />
          <TabPill
            label={tab === "macro" ? "Macro" : "M"}
            active={tab === "macro"}
            onClick={() => setTab("macro")}
            color="var(--accent-red)"
          />
        </div>
      </div>

      {/* Center: title + active indicator */}

      <div className="title-wrapper">
        <span className="window-title">BlurAutoClicker</span>
      </div>

      {/* Right: window controls */}
      <div
        style={
          {
            display: "flex",
            alignItems: "center",
            gap: "4px",
            WebkitAppRegion: "no-drag",
          } as React.CSSProperties
        }
      >
        {/* Always on Top / Pin */}
        <WindowBtn
          onClick={toggleAlwaysOnTop}
          active={isAlwaysOnTop}
          label={
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: isAlwaysOnTop ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <path d="M21 10V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
              <path d="M7 10v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4" />
              <path d="M12 16v5" />
            </svg>
          }
        />

        {/* Minimize */}
        <WindowBtn
          onClick={handleMinimize}
          label={
            <svg
              width="10"
              height="1"
              viewBox="0 0 10 1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          }
        />

        {/* Close */}
        <WindowBtn
          onClick={onRequestClose}
          danger
          label={
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          }
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function TabPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  const firstLetter = label.charAt(0);
  const restOfWord = label.slice(1);

  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className={`tab-pill ${active ? "active" : ""}`}
      style={
        {
          "--active-color": color,
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties
      }
    >
      <span className="pill-letter">{firstLetter}</span>
      <span className="pill-expansion">{restOfWord}</span>
    </button>
  );
}

function WindowBtn({
  onClick,
  label,
  danger,
  active,
}: {
  onClick: () => void;
  label: React.ReactNode;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className={`window-btn ${danger ? "window-btn-danger" : ""} ${active ? "active" : ""}`}
    >
      {label}
    </button>
  );
}
