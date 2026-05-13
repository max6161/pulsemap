import useParticipants from "../hooks/useParticipants";

export default function ParticipantsStack({ participantIds = [] }) {
  const participants = useParticipants(participantIds);
  const visibleParticipants = participants.slice(0, 3);
  const hiddenCount = Math.max(0, participantIds.length - visibleParticipants.length);

  if (!participantIds.length) return null;

  return (
    <div className="participants-stack">
      {visibleParticipants.map((participant) => (
        <div className="participant-avatar" key={participant.id}>
          {participant.photoURL ? (
            <img src={participant.photoURL} alt={participant.displayName || "user"} />
          ) : (
            <span>{participant.displayName?.[0] || "U"}</span>
          )}
        </div>
      ))}

      {hiddenCount > 0 && (
        <div className="participant-avatar participant-more">+{hiddenCount}</div>
      )}
    </div>
  );
}