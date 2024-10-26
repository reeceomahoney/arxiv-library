"use server";

import { eq, and, inArray } from "drizzle-orm";
import { parseStringPromise } from "xml2js";

import {
  ArxivEntrySchema,
  ArxivPaperDataSchema,
  ArxivResponseSchema,
} from "~/lib/definitions";
// import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { folders, papers, users } from "~/server/db/schema";
import type { FolderUI } from "~/app/components/providers/LibraryProvider";

export async function createFolder(formData: FormData, userId: string) {
  // const session = await getServerAuthSession();
  // if (!session) return null;

  const name = formData.get("name") as string;
  const parentFolderIdValue = formData.get("selectedFolderId");
  const parentFolderId = parentFolderIdValue
    ? Number(parentFolderIdValue)
    : null;

  const newFolder = await db
    .insert(folders)
    .values({ name, parentFolderId, createdById: userId })
    .returning();

  return newFolder[0];
}

export async function renameFolder(
  folderId: number,
  name: string,
  userId: string,
) {
  // const session = await getServerAuthSession();
  // if (!session) return null;

  await db
    .update(folders)
    .set({ name })
    .where(and(eq(folders.id, folderId), eq(folders.createdById, userId)));

  return { success: true };
}

export async function deleteFolders(folderIds: number[], userId: string) {
  // const session = await getServerAuthSession();
  // if (!session) return null;

  await db
    .delete(folders)
    .where(
      and(inArray(folders.id, folderIds), eq(folders.createdById, userId)),
    );

  // Schema can't self reference so we need to delete subfolders manually
  await db
    .delete(folders)
    .where(
      and(
        inArray(folders.parentFolderId, folderIds),
        eq(folders.createdById, userId),
      ),
    );

  return { success: true };
}

export async function moveFolder(
  folderId: number,
  newParentId: number,
  userId: string,
) {
  await db
    .update(folders)
    .set({ parentFolderId: newParentId })
    .where(and(eq(folders.id, folderId), eq(folders.createdById, userId)));
}

export async function createPaper(
  arxivIdOrLink: string,
  selectedFolderId: number,
  userId: string,
) {
  // const session = await getServerAuthSession();
  // if (!session) return null;

  const arxivId = extractArxivId(arxivIdOrLink);
  const response = await fetch(
    `http://export.arxiv.org/api/query?id_list=${arxivId}`,
  );
  const paperData = await parseArxivResponse(response);

  const newPaper = await db
    .insert(papers)
    .values({
      title: paperData.title,
      authors: paperData.authors,
      publicationDate: paperData.published,
      summary: paperData.summary,
      primaryCategory: paperData.primaryCategory,
      categories: paperData.categories,
      link: paperData.link,
      folderId: selectedFolderId,
      createdById: userId,
    })
    .returning();

  return newPaper[0];
}

export async function deletePapers(paperIds: number[], userId: string) {
  // const session = await getServerAuthSession();
  // if (!session) return null;

  await db
    .delete(papers)
    .where(and(inArray(papers.id, paperIds), eq(papers.createdById, userId)));

  return { success: true };
}

export async function movePapers(
  paperIds: number[],
  folderId: number,
  userId: string,
) {
  // const session = await getServerAuthSession();
  // if (!session) return null;

  await db
    .update(papers)
    .set({ folderId })
    .where(and(inArray(papers.id, paperIds), eq(papers.createdById, userId)));

  return { success: true };
}

function extractArxivId(arxivIdOrLink: string) {
  const match = arxivIdOrLink.match(
    /(?:arxiv\.org\/abs\/|arxiv\.org\/pdf\/)(\d+\.\d+|\d{4}\.\d{4,5})/,
  );
  return match ? match[1] : arxivIdOrLink;
}

async function parseArxivResponse(response: Response) {
  const xml = await response.text();
  const parsedXml = ArxivResponseSchema.parse(await parseStringPromise(xml));
  const data = ArxivEntrySchema.parse(parsedXml.feed.entry[0]);

  const paperData = ArxivPaperDataSchema.parse({
    link: data.id[0],
    updated: data.updated[0],
    published: data.published[0],
    title: data.title[0],
    summary: data.summary[0],
    authors: data.author.map((author) => author.name[0]),
    primaryCategory: data["arxiv:primary_category"][0]?.$.term ?? "",
    categories: data.category.map((cat) => cat.$.term),
  });

  return paperData;
}

export async function initUser(userId: string) {
  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!existingUser) {
    // Create new user
    await db.insert(users).values({ id: userId });
  }
}

export async function fetchUserData(userId: string) {
  let folderData = await db.query.folders.findMany({
    where: (folders, { eq }) => eq(folders.createdById, userId),
  });

  // Check if "All Papers" folder exists
  const allPapersFolder = folderData.find(
    (folder) => folder.name === "All Papers",
  );

  if (!allPapersFolder) {
    // Create "All Papers" folder if it doesn't exist
    await db
      .insert(folders)
      .values({
        name: "All Papers",
        createdById: userId,
      })
      .returning();

    // Refresh folder data
    folderData = await db.query.folders.findMany({
      where: (folders, { eq }) => eq(folders.createdById, userId),
    });
  }

  const paperData = await db.query.papers.findMany({
    where: (papers, { eq }) => eq(papers.createdById, userId),
  });

  // Set "All Papers" folder as selected by default
  const folderUIData = folderData.map((folder) => ({
    ...folder,
    isOpen: true,
    isSelected: folder.name === "All Papers",
    isRenaming: false,
  })) as FolderUI[];

  return { folders: folderUIData, papers: paperData };
}
