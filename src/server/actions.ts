"use server";

import { eq, inArray } from "drizzle-orm";
import { parseStringPromise } from "xml2js";

import {
  ArxivEntrySchema,
  ArxivPaperDataSchema,
  ArxivResponseSchema,
} from "~/lib/definitions";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { folders, papers } from "~/server/db/schema";

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

export async function renameFolder(folderId: number, name: string) {
  const session = await getServerAuthSession();
  if (!session) return null;

  await db.update(folders).set({ name }).where(eq(folders.id, folderId));

  return { success: true };
}

export async function deleteFolders(folderIds: number[]) {
  const session = await getServerAuthSession();
  if (!session) return null;

  await db.delete(folders).where(inArray(folders.id, folderIds));

  // Schema can't self reference so we need to delete subfolders manually
  await db.delete(folders).where(inArray(folders.parentFolderId, folderIds));

  return { success: true };
}

export async function moveFolder(folderId: number, newParentId: number) {
  await db
    .update(folders)
    .set({ parentFolderId: newParentId })
    .where(eq(folders.id, folderId));
}

export async function createPaper(
  arxivIdOrLink: string,
  selectedFolderId: number,
) {
  const session = await getServerAuthSession();
  if (!session) return null;

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
      createdById: session.user.id,
    })
    .returning();

  return newPaper[0];
}

export async function deletePapers(paperIds: number[]) {
  const session = await getServerAuthSession();
  if (!session) return null;

  await db.delete(papers).where(inArray(papers.id, paperIds));

  return { success: true };
}

export async function movePapers(paperIds: number[], folderId: number) {
  const session = await getServerAuthSession();
  if (!session) return null;

  await db.update(papers).set({ folderId }).where(inArray(papers.id, paperIds));

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
