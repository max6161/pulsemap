import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore";

import { db } from "../firebase";

export async function sendEventMessage({ eventId, user, text }) {
  if (!eventId || !user || !text.trim()) return;

  const messagesRef = collection(db, "events", eventId, "messages");

  await addDoc(messagesRef, {
    text: text.trim(),
    userId: user.uid,
    userName: user.displayName || "Unknown user",
    userPhotoURL: user.photoURL || "",
    createdAt: Timestamp.now(),
  });
}

export async function deleteEventMessage({ eventId, messageId }) {
  if (!eventId || !messageId) return;

  await deleteDoc(doc(db, "events", eventId, "messages", messageId));
}