import { useState } from "react";
import useEventChat from "../hooks/useEventChat";
import { sendEventMessage } from "../services/eventChatService";

export default function EventChat({ eventId, user }) {
  const messages = useEventChat(eventId);
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    await sendEventMessage({
      eventId,
      user,
      text: messageText
    });

    setMessageText("");
  };

  return (
    <div className="event-chat">
      <div className="event-chat-title">Чат эвента</div>

      <div className="event-chat-messages">
        {messages.length === 0 && (
          <div className="event-chat-empty">
            Пока нет сообщений. Напиши первым.
          </div>
        )}

        {messages.map((message) => (
          <div className="event-chat-message" key={message.id}>
            <div className="event-chat-author">
              {message.userPhotoURL ? (
                <img src={message.userPhotoURL} alt={message.userName} />
              ) : (
                <span>{message.userName?.[0] || "U"}</span>
              )}

              <strong>{message.userName}</strong>
            </div>

            <div className="event-chat-text">{message.text}</div>
          </div>
        ))}
      </div>

      <form className="event-chat-form" onSubmit={handleSendMessage}>
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Написать..."
        />

        <button type="submit">➤</button>
      </form>
    </div>
  );
}