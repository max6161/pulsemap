import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function syncUserProfile(firebaseUser) {
  if (!firebaseUser) return;

  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnapshot = await getDoc(userRef);

    const userData = {
      displayName: firebaseUser.displayName || "Unknown user",
      photoURL: firebaseUser.photoURL || "",
      email: firebaseUser.email || "",
      updatedAt: Timestamp.now(),
    };

    if (!userSnapshot.exists()) {
      userData.createdAt = Timestamp.now();
    }

    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error("Ошибка sync user:", error);
  }
}

export async function getUserById(userId) {
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) return null;

    return {
      id: userSnapshot.id,
      ...userSnapshot.data(),
    };
  } catch (error) {
    console.error("Ошибка getUserById:", error);
    return null;
  }
}