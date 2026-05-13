import ParticipantsStack from "./ParticipantsStack";
import EventChat from "./EventChat";

const EVENT_ICON_BY_CATEGORY = {
  music: "🎵",
  games: "🎮",
  chill: "☕",
  dating: "❤️"
};

export default function EventDetails({
  selectedEvent,
  currentUserId,
  user,
  onDeleteEvent,
  onToggleJoinEvent,
  categoryMeta
}) {
  if (!selectedEvent) return null;

  const isOwn = String(selectedEvent.userId) === String(currentUserId);

  const category = selectedEvent.category || "chill";

  const categoryLabel =
    categoryMeta?.[category]?.label || "☕ Чилл";

  const participants = selectedEvent.participants || [];

  const joined = participants.includes(currentUserId);

  const lat = Array.isArray(selectedEvent.position)
    ? selectedEvent.position[0]
    : null;

  const lng = Array.isArray(selectedEvent.position)
    ? selectedEvent.position[1]
    : null;

  const eventIcon =
    EVENT_ICON_BY_CATEGORY[category] || "📍";

  return (
    <div className="event-details-card">
      <div className="event-details-header">
        <div className="event-details-avatar">
          {eventIcon}
        </div>

        <div className="event-details-heading">
          <div className="event-details-title">
            {selectedEvent.title}
          </div>

          <div className="event-details-status">
            ПУБЛИЧНЫЙ
          </div>
        </div>
      </div>

      <div className="event-details-main">
        <div className="event-details-line">
          <span>🎛</span>

          <p>
            Категория: {categoryLabel}
          </p>
        </div>

        <div className="event-details-line">
          <span>👤</span>

          <p>
            Автор: {isOwn ? "Вы" : selectedEvent.userName}
          </p>
        </div>

        <div className="event-details-line">
          <span>👥</span>

          <p>
            Идут: {participants.length}
          </p>
        </div>

        <ParticipantsStack
          participantIds={participants}
        />
      </div>

      <EventChat
        eventId={selectedEvent.id}
        user={user}
      />

      <div className="event-details-main event-details-secondary">
        <div className="event-details-line">
          <span>🕒</span>

          <p>
            Живёт до:{" "}
            {selectedEvent.expiresAt
              ? new Date(
                  selectedEvent.expiresAt
                ).toLocaleString("ru-RU")
              : "неизвестно"}
          </p>
        </div>

        {lat && lng && (
          <div className="event-details-line muted">
            <span>📍</span>

            <p>
              Координаты:{" "}
              {lat.toFixed(5)},{" "}
              {lng.toFixed(5)}
            </p>
          </div>
        )}
      </div>

      <div className="event-details-actions">
        {!isOwn && (
          <button
            type="button"
            className={`join-event-button ${
              joined ? "joined" : ""
            }`}
            onClick={() =>
              onToggleJoinEvent(selectedEvent.id)
            }
          >
            {joined ? "Не иду" : "Я иду"}
          </button>
        )}

        {isOwn && (
          <button
            type="button"
            className="delete-event-button"
            onClick={() =>
              onDeleteEvent(selectedEvent.id)
            }
          >
            Удалить Эвент-Пойнт
          </button>
        )}
      </div>
    </div>
  );
}