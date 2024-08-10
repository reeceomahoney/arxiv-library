import Link from "next/link";
import { Search, LibraryBig } from "lucide-react";

import { Input } from "~/app/_components/ui/input";
import PaperTable from "~/app/_components/paper-table";
import { Explorer, SheetExplorer } from "~/app/_components/explorer";
import { ModeToggle } from "~/app/_components/mode-toggle";
import AccountDropdown from "~/app/_components/account-dropdown";
import { FolderDataProvider } from "~/app/_components/folder-context";
import { getServerAuthSession } from "~/server/auth";

// import type { Folder } from "~/lib/definitions";

async function fetchFolderData() {
  // const folderData: Folder[] = await prisma.folder.findMany();
  // const paperData = await prisma.paper.findMany();
  // return { folderData, paperData };
}

export default async function Page() {
  // const { folderData, paperData } = await fetchFolderData();
  const folderData = [];
  const paperData = [];

  return (
    <FolderDataProvider folderData={folderData} papers={paperData}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="bg-muted/40 hidden border-r md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="sticky top-0 flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold"
              >
                <LibraryBig className="h-6 w-6" />
                <span className="">Arxiv Library</span>
              </Link>
            </div>
            <div className="sticky top-[60px] overflow-y-auto">
              <Explorer />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="bg-muted/40 sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-4 backdrop-blur lg:h-[60px] lg:px-6">
            <SheetExplorer />
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search papers..."
                    className="bg-background w-full appearance-none pl-8 shadow-none md:w-2/3 lg:w-1/3"
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
    </FolderDataProvider>
  );
}

// const session = await getServerAuthSession();
// <p>{session && <span>Logged in as {session.user?.name}</span>}</p>
// <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
//   {session ? "Sign out" : "Sign in"}
// </Link>
