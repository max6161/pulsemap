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
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "Все" },
    { id: "music", label: "🎵 Музыка" },
    { id: "games", label: "🎲 Игры" },
    { id: "chill", label: "☕ Чилл" },
    { id: "dating", label: "❤️ Знакомства" }
  ];

  return (
    <div className={`side-panel ${collapsed ? "collapsed" : ""}`}>
      <div className="panel-top">
        <div className="panel-profile">
          <div className="panel-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" />
            ) : (
              <span>{user?.displayName?.[0] || "U"}</span>
            )}
          </div>

          <div className="panel-user-text">
            Привет, {user?.displayName || "User"}
          </div>
        </div>

        <div className="panel-live">
          <span className="live-dot" />
          <span>4 активных рядом</span>
        </div>

        <button className="panel-icon-button" type="button">
          🌐
        </button>

        <button className="panel-icon-button" type="button">
          ⚙️
        </button>

        <button className="panel-logout" onClick={onLogout}>
          Выход
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="panel-search">
            <span className="search-icon">⌕</span>
            <input placeholder="Поиск эвент-поинтов..." />
          </div>

          <div className="panel-filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`filter-chip ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="panel-info">
        {!tempCheckpoint && (
          <div className="info-text">
            <div className="info-title">
              Создай первый Эвент-Пойнт
            </div>
            <div className="info-description">
              {infoText}
            </div>
          </div>
        )}

        {tempCheckpoint && (
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите описание..."
              className="panel-textarea"
            />

            <button
              onClick={handleSaveCheckpoint}
              className="panel-save-button"
            >
              Сохранить
            </button>
          </div>
        )}
      </div>

      <div className="panel-bottom">
        <button
          className="event-button public"
          onClick={() => setIsPlacingCheckpoint(true)}
          aria-label="Создать публичный эвент"
        >
          <span>📍</span>
        </button>

        <button
          className="panel-handle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Свернуть или развернуть меню"
        />

        <button
          className="event-button private"
          aria-label="Создать приватный эвент"
        >
          <span>🔒</span>
        </button>
      </div>
    </div>
  );
}