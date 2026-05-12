import { useState } from "react";
import "../styles/panel.css";

export default function SidePanel({
  user,
  onLogout,
  infoText,
  selectedEvent,
  currentUserId,
  onDeleteEvent,
  setIsPlacingCheckpoint,
  isPlacingCheckpoint,
  tempCheckpoint,
  inputText,
  setInputText,
  handleSaveCheckpoint,
  eventLifetime,
  setEventLifetime
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

  const lifetimeOptions = [
    { label: "1ч", value: 1 * 60 * 60 * 1000 },
    { label: "3ч", value: 3 * 60 * 60 * 1000 },
    { label: "12ч", value: 12 * 60 * 60 * 1000 },
    { label: "1 день", value: 24 * 60 * 60 * 1000 },
    { label: "3 дня", value: 3 * 24 * 60 * 60 * 1000 }
  ];

  const selectedEventIsOwn =
    selectedEvent && String(selectedEvent.userId) === String(currentUserId);

  return (
    <div
      className={`side-panel ${collapsed ? "collapsed" : ""} ${
        isPlacingCheckpoint ? "placing-mode" : ""
      } ${selectedEvent ? "selected-event-mode" : ""}`}
    >
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

      {isPlacingCheckpoint && (
        <div className="placing-status">
          <span className="placing-dot" />
          <span>Выбери место на карте</span>

          <button type="button" onClick={() => setIsPlacingCheckpoint(false)}>
            Отмена
          </button>
        </div>
      )}

      <div className={`panel-info ${tempCheckpoint ? "event-edit-mode" : ""}`}>
        {!tempCheckpoint && selectedEvent && (
          <div className="selected-event-info">
            <div className="info-title">{selectedEvent.title}</div>

            <div className="info-description">
              Автор: {selectedEventIsOwn ? "Вы" : selectedEvent.userName}
              <br />
              Живёт до:{" "}
              {selectedEvent.expiresAt
                ? new Date(selectedEvent.expiresAt).toLocaleString("ru-RU")
                : "неизвестно"}
            </div>

            {selectedEventIsOwn ? (
              <button
                type="button"
                className="delete-event-button"
                onClick={() => onDeleteEvent(selectedEvent.id)}
              >
                Удалить Эвент-Пойнт
              </button>
            ) : (
              <div className="foreign-event-label">
                Чужой эвент — удалить нельзя
              </div>
            )}
          </div>
        )}

        {!tempCheckpoint && !selectedEvent && (
          <div className="info-text">
            <div className="info-title">
              {isPlacingCheckpoint
                ? "Режим создания Эвент-Пойнта"
                : "Создай первый Эвент-Пойнт"}
            </div>

            <div className="info-description">
              {isPlacingCheckpoint
                ? "Нажми на карту в том месте, где хочешь поставить новый эвент."
                : infoText}
            </div>
          </div>
        )}

        {tempCheckpoint && (
          <div className="event-edit-content">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Опиши свой Эвент-Пойнт..."
              className="event-description-input"
              autoFocus
            />

            <div className="event-lifetime">
              <div className="event-lifetime-title">
                Сколько будет активен?
              </div>

              <div className="event-lifetime-options">
                {lifetimeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`lifetime-chip ${
                      eventLifetime === option.value ? "active" : ""
                    }`}
                    onClick={() => setEventLifetime(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSaveCheckpoint} className="event-save-button">
              Создать
            </button>
          </div>
        )}
      </div>

      <div className="panel-bottom">
        <button
          className={`event-button public ${
            isPlacingCheckpoint ? "active" : ""
          }`}
          onClick={() => {
            setIsPlacingCheckpoint(true);
          }}
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