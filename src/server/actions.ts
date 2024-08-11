"use server";

import { db } from "~/server/db";
import { folders } from "~/server/db/schema";
import { getServerAuthSession } from "~/server/auth";

export async function createFolder(formData: FormData) {
  const session = await getServerAuthSession();
  if (!session) return null;

  const name = formData.get("name") as string;
  const parentFolderIdValue = formData.get("selectedFolderId");
  const parentFolderId = parentFolderIdValue
    ? Number(parentFolderIdValue)
    : null;

  const newFolder = await db
    .insert(folders)
    .values({ name, parentFolderId, createdById: session.user.id })
    .returning();

  return newFolder[0];
}
