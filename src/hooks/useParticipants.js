import { useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";

const usersCache = {};

export default function useParticipants(participantIds = []) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadParticipants() {
      if (!participantIds.length) {
        setParticipants([]);
        return;
      }

      try {
        const users = await Promise.all(
          participantIds.map(async (userId) => {
            if (usersCache[userId]) {
              return usersCache[userId];
            }

            const userRef = doc(db, "users", userId);

            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
              return null;
            }

            const userData = {
              id: userSnapshot.id,
              ...userSnapshot.data(),
            };

            usersCache[userId] = userData;

            return userData;
          })
        );

        if (!cancelled) {
          setParticipants(users.filter(Boolean));
        }
      } catch (error) {
        console.error("Ошибка загрузки participants:", error);
      }
    }

    loadParticipants();

    return () => {
      cancelled = true;
    };
  }, [participantIds]);

  return participants;
}