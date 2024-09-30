import AccountDropdown from "~/app/components/header/AccountDropdown";
import { Explorer, SheetExplorer } from "~/app/components/sidebar/Explorer";
import { ModeToggle } from "~/app/components/header/ModeToggle";
import PaperTabs from "~/app/components/papers/PaperTabs";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import LandingPage from "./components/LandingPage";
import PaperSearch from "./components/header/PaperSearch";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import Title from "./components/sidebar/Title";
import {
  LibraryProvider,
  type FolderUI,
} from "./components/providers/LibraryProvider";

async function fetchData(userId: string) {
  const folderData = await db.query.folders.findMany({
    where: (folders, { eq }) => eq(folders.createdById, userId),
  });

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

  return { folderUIData, paperData };
}

export default async function Page() {
  const session = await getServerAuthSession();

  if (!session) return <LandingPage />;

  const { folderUIData, paperData } = await fetchData(session.user.id);

  return (
    <LibraryProvider folders={folderUIData} papers={paperData}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col">
              <Title />
              <div className="sticky top-[60px] overflow-y-auto">
                <Explorer />
              </div>
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-muted/40 px-4 backdrop-blur lg:h-[60px] lg:px-6">
              <SheetExplorer />
              <PaperSearch />
              <ModeToggle />
              <AccountDropdown userName={session.user.name ?? ""} />
            </header>
            <main className="grow p-4 lg:p-6">
              <PaperTabs />
            </main>
          </div>
        </div>
      </ThemeProvider>
    </LibraryProvider>
  );
}
