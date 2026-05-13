import { useState } from "react";
import "../styles/panel.css";

export default function SidePanel({
  user,
  onLogout,
  infoText,
  selectedEvent,
  currentUserId,
  setIsPlacingCheckpoint,
  isPlacingCheckpoint,
  tempCheckpoint,
  inputText,
  setInputText,
  handleSaveCheckpoint,
  eventLifetime,
  setEventLifetime,
  activeFilter,
  setActiveFilter,
  selectedCategory,
  setSelectedCategory,
  categoryMeta
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(92);

  const filters = [
    { id: "all", label: "Все" },
    { id: "music", label: "🎵 Музыка" },
    { id: "games", label: "🎲 Игры" },
    { id: "chill", label: "☕ Чилл" },
    { id: "dating", label: "❤️ Знакомства" }
  ];

  const categoryOptions = filters.filter((filter) => filter.id !== "all");

  const lifetimeOptions = [
    { label: "1ч", value: 1 * 60 * 60 * 1000 },
    { label: "3ч", value: 3 * 60 * 60 * 1000 },
    { label: "12ч", value: 12 * 60 * 60 * 1000 },
    { label: "1 день", value: 24 * 60 * 60 * 1000 },
    { label: "3 дня", value: 3 * 24 * 60 * 60 * 1000 }
  ];

  const selectedCategoryLabel =
    categoryMeta?.[selectedEvent?.category || "chill"]?.label || "☕ Чилл";

  const selectedEventIsOwn =
    selectedEvent && String(selectedEvent.userId) === String(currentUserId);

  const handleDescriptionChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = "92px";

    const nextHeight = Math.min(e.target.scrollHeight, 190);
    setTextareaHeight(Math.max(92, nextHeight));
  };

  const editExtraHeight = Math.max(0, textareaHeight - 92);

  return (
    <div
      className={`side-panel ${collapsed ? "collapsed" : ""} ${
        isPlacingCheckpoint ? "placing-mode" : ""
      } ${selectedEvent ? "selected-event-mode" : ""}`}
      style={
        tempCheckpoint
          ? {
              "--event-textarea-height": `${textareaHeight}px`,
              "--event-edit-extra-height": `${editExtraHeight}px`
            }
          : undefined
      }
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
              Категория: {selectedCategoryLabel}
              <br />
              Автор: {selectedEventIsOwn ? "Вы" : selectedEvent.userName}
              <br />
              Идут: {selectedEvent.participants?.length || 0}
              <br />
              Открой карточку над меткой для подробностей и чата.
            </div>
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
              onChange={handleDescriptionChange}
              placeholder="Опиши свой Эвент-Пойнт и выбери подходящую категорию ниже..."
              className="event-description-input"
              autoFocus
            />

            <div className="event-lifetime">
              <div className="event-lifetime-title">Категория эвента</div>

              <div className="event-lifetime-options">
                {categoryOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`lifetime-chip ${
                      selectedCategory === option.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

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
          </div>
        )}
      </div>

      <div className={`panel-bottom ${tempCheckpoint ? "edit-bottom" : ""}`}>
        <button
          className={`event-button public ${
            isPlacingCheckpoint ? "active" : ""
          }`}
          onClick={() => setIsPlacingCheckpoint(true)}
          aria-label="Создать публичный эвент"
        >
          <span>📍</span>
        </button>

        {tempCheckpoint && (
          <button
            type="button"
            className="bottom-save-button"
            onClick={handleSaveCheckpoint}
          >
            Создать
          </button>
        )}

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