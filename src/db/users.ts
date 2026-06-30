import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      } as any)
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
        } as any,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("getOrCreateUser failed:", error);
    throw new Error("Failed to synchronize user profile.", { cause: error });
  }
}
