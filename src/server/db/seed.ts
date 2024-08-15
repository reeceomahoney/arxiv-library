import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";
import { folders, papers } from "./schema";
import dotenv from "dotenv";
import {
  ArxivEntrySchema,
  ArxivResponseSchema,
  ArxivPaperDataSchema,
} from "~/lib/definitions";
import { parseStringPromise } from "xml2js";

dotenv.config();

async function createDB() {
  const POSTGRES_URL = process.env.POSTGRES_URL;

  if (!POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not set");
  }

  const queryClient = postgres(POSTGRES_URL);
  const db = drizzle(queryClient, { schema });

  return db;
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

async function seed(links: string[]) {
  const db = await createDB();

  await db.transaction(async (trx) => {
    const user = await db.query.users.findFirst();

    if (!user) {
      console.error("No user found to seed data");
      return;
    }

    // Clear existing data
    await trx.delete(papers);
    await trx.delete(folders);

    // Insert "All papers" folder first
    const allPapersFolder = await trx
      .insert(folders)
      .values({
        name: "All Papers",
        createdById: user.id,
      })
      .returning();

    const allPapersFolderId = allPapersFolder[0]?.id;

    if (!allPapersFolderId) {
      throw new Error("Failed to insert 'All papers' folder");
    }

    // Seed data for folders
    const subfolderData = [];
    for (let i = 1; i <= 5; i++) {
      subfolderData.push({
        name: `Folder ${i}`,
        createdById: user.id,
        parentFolderId: allPapersFolderId,
      });
    }

    // Insert folders
    const subfolders = await trx
      .insert(folders)
      .values(subfolderData)
      .returning();

    const folderIds = subfolders.map((folder) => folder.id);
    folderIds.push(allPapersFolderId);

    for (const link of links) {
      const arxivId = extractArxivId(link);
      const response = await fetch(
        `http://export.arxiv.org/api/query?id_list=${arxivId}`,
      );
      const paperData = await parseArxivResponse(response);
      await trx.insert(papers).values({
        title: paperData.title,
        authors: paperData.authors,
        publicationDate: paperData.published,
        summary: paperData.summary,
        primaryCategory: paperData.primaryCategory,
        categories: paperData.categories,
        link: paperData.link,
        folderId: folderIds[Math.floor(Math.random() * folderIds.length)],
        createdById: user.id,
      });
    }
  });
}

async function clear() {
  const db = await createDB();

  await db.transaction(async (trx) => {
    const user = await db.query.users.findFirst();

    if (!user) {
      console.error("No user found to seed data");
      return;
    }

    // Clear existing data
    await trx.delete(papers);
    await trx.delete(folders);
  });
}

const links = [
  "http://arxiv.org/abs/1907.05600",
  "http://arxiv.org/abs/2109.00137",
  "http://arxiv.org/abs/2304.02532",
  "http://arxiv.org/abs/2006.11239",
  "http://arxiv.org/abs/2303.04137",
  "http://arxiv.org/abs/2304.10573",
  "http://arxiv.org/abs/2208.06193",
  "http://arxiv.org/abs/2301.10677",
  "http://arxiv.org/abs/1503.03585",
  "http://arxiv.org/abs/1906.08649",
  "http://arxiv.org/abs/2105.05233",
  "http://arxiv.org/abs/2010.02502",
  "http://arxiv.org/abs/2311.01223",
  "http://arxiv.org/abs/2304.05364",
  "http://arxiv.org/abs/2211.01095",
  "http://arxiv.org/abs/2112.10752",
  "http://arxiv.org/abs/2306.14079",
  "http://arxiv.org/abs/2206.00364",
  "http://arxiv.org/abs/2206.13397",
  "http://arxiv.org/abs/2007.01520",
];

seed(links)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seeding done!");
    process.exit(0);
  });

// clear()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(() => {
//     console.log("Clearing done!");
//     process.exit(0);
//   });
