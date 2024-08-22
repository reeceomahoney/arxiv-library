"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/app/_components/ui/tabs";
import PaperTable from "~/app/_components/paper-table";
import { useLibrary } from "~/app/_components/library-provider";

export default function PaperTabs() {
  const { openPapers } = useLibrary();

  // TOOD: fix heights

  return (
    <Tabs defaultValue="my-library" className="flex h-full flex-col">
      <TabsList>
        <TabsTrigger value="my-library">My Library</TabsTrigger>
        {openPapers.map((paper) => (
          <TabsTrigger key={paper.id} value={String(paper.id)}>
            <span className="w-60 overflow-hidden truncate whitespace-nowrap text-left">
              {paper.title}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="my-library">
        <PaperTable />
      </TabsContent>
      {openPapers.map((paper) => (
        <TabsContent key={paper.id} value={String(paper.id)}>
          <h1 className="pb-4 pt-2 text-lg font-semibold md:text-2xl">
            {paper.title}
          </h1>
          <iframe
            src={paper.link?.replace("abs", "pdf") ?? ""}
            className="h-full w-full"
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
