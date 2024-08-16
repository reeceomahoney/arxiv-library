import Link from "next/link";
import Image from "next/image";
import { Search, LibraryBig } from "lucide-react";

import { Input } from "~/app/_components/ui/input";
import PaperTable from "~/app/_components/paper-table";
import { Explorer, SheetExplorer } from "~/app/_components/explorer";
import { ModeToggle } from "~/app/_components/mode-toggle";
import AccountDropdown from "~/app/_components/account-dropdown";
import { LibraryProvider } from "~/app/_components/library-provider";
import { getServerAuthSession } from "~/server/auth";

import { db } from "~/server/db";

async function fetchData(userId: string) {
  const folderData = await db.query.folders.findMany({
    where: (folders, { eq }) => eq(folders.createdById, userId),
  });

  const paperData = await db.query.papers.findMany({
    where: (papers, { eq }) => eq(papers.createdById, userId),
  });

  return { folderData, paperData };
}

export default async function Page() {
  const session = await getServerAuthSession();

  if (!session) {
    return (
      <div>
        <p>Not authenticated</p>
        <Link href="/api/auth/signin">Sign in</Link>
      </div>
    );
  }

  const { folderData, paperData } = await fetchData(session.user.id);

  return (
    <LibraryProvider initialFolders={folderData} initialPapers={paperData}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="sticky top-0 flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Image
                  src="/apple-touch-icon.png"
                  alt="Arxiv Library"
                  width={24}
                  height={24}
                />
                <span className="">Arxiv Library</span>
              </Link>
            </div>
            <div className="sticky top-[60px] overflow-y-auto">
              <Explorer />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-muted/40 px-4 backdrop-blur lg:h-[60px] lg:px-6">
            <SheetExplorer />
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search papers..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  />
                </div>
              </form>
            </div>
            <ModeToggle />
            <AccountDropdown />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <PaperTable />
          </main>
        </div>
      </div>
    </LibraryProvider>
  );
}
