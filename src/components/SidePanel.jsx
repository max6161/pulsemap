import { useState } from "react";
import "../styles/panel.css";

export default function SidePanel({
  user,
  onLogout,
  infoText,
  setIsPlacingCheckpoint,
  tempCheckpoint,
  inputText,
  setInputText,
  handleSaveCheckpoint
}) {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`side-panel ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}
      <div className="panel-header">
        <div className="panel-user">
          Привет, {user?.displayName}
        </div>

        <button className="panel-logout" onClick={onLogout}>
          Выход
        </button>
      </div>

      {/* SEARCH */}
      <div className="panel-search">
        <input placeholder="Поиск эвент-поинтов..." />
      </div>

      {/* INFO */}
      <div className="panel-info">

        {!tempCheckpoint && (
          <div className="info-text">
            {infoText}
          </div>
        )}

        {tempCheckpoint && (
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите описание..."
              style={{ width: "100%", height: "60px", borderRadius: "6px" }}
            />

            <button
              onClick={handleSaveCheckpoint}
              style={{ marginTop: "5px" }}
            >
              Сохранить
            </button>
          </div>
        )}

      </div>

      {/* BUTTONS */}
      <div className="panel-buttons">
        <button
          className="event-button public"
          onClick={() => setIsPlacingCheckpoint(true)}
        />
        <button className="event-button private" />
      </div>

      {/* HANDLE */}
      <div
        className="panel-handle"
        onClick={() => setCollapsed(!collapsed)}
      />

    </div>
  );
}