import { useEffect, useState } from "react";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

import { db } from "../firebase";

export default function useEventChat(eventId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!eventId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "events", eventId, "messages"),
      orderBy("createdAt", "asc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages = snapshot.docs.map((docItem) => {
        const data = docItem.data();

        return {
          id: docItem.id,
          text: data.text || "",
          userId: data.userId || "",
          userName: data.userName || "Unknown user",
          userPhotoURL: data.userPhotoURL || "",
          createdAt: data.createdAt?.toMillis?.() || null,
        };
      });

      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [eventId]);

  return messages;
}