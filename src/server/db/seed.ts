import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";
import { folders, papers } from "./schema";
import dotenv from "dotenv";

dotenv.config();

async function createDB() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const queryClient = postgres(DATABASE_URL);
  const db = drizzle(queryClient, { schema });

  return db;
}

async function seed() {
  const db = await createDB();

  await db.transaction(async (trx) => {
    const user = await db.query.users.findFirst();

    if (!user) {
      console.error("No user found to seed data");
      return;
    }

    // Seed data for papers
    const paperData: {
      title: string;
      authors: string[];
      folderId: number;
      createdById: string;
    }[] = [];

    // Clear existing data
    await trx.delete(papers);
    await trx.delete(folders);

    // Insert "All papers" folder first
    const allPapersFolder = await trx
      .insert(folders)
      .values({
        name: "All papers",
        createdById: user.id,
      })
      .returning();

    const allPapersFolderId = allPapersFolder[0]?.id;

    if (!allPapersFolderId) {
      throw new Error("Failed to insert 'All papers' folder");
    }

    // Seed data for folders
    const folderData = [
      {
        name: "Folder 2",
        createdById: user.id,
        parentFolderId: allPapersFolderId,
      },
      {
        name: "Folder 3",
        createdById: user.id,
        parentFolderId: allPapersFolderId,
      },
    ];

    for (let i = 1; i <= 3; i++) {
      paperData.push({
        title: `Paper ${i}`,
        authors: [`Author ${i}`],
        folderId: allPapersFolderId,
        createdById: user.id,
      });
    }

    // Insert folders
    for (const folder of folderData) {
      await trx.insert(folders).values(folder);
    }

    // Insert papers
    for (const paper of paperData) {
      await trx.insert(papers).values(paper);
    }
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seeding done!");
    process.exit(0);
  });
