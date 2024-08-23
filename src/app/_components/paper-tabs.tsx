"use client";

import { X } from "lucide-react";

import { useLibrary } from "~/app/_components/library-provider";
import PaperTable from "~/app/_components/paper-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/app/_components/ui/tabs";
import { getAuthorString } from "~/lib/utils";

export default function PaperTabs() {
  const { openPapers, setOpenPapers } = useLibrary();

  const handleClosePaper = (id: number) => {
    setOpenPapers((prevPapers) => prevPapers.filter((p) => p.id !== id));
  };

  // TODO: Fix close button UI and behavior

  return (
    <Tabs
      defaultValue="my-library"
      className="flex h-full w-[calc(100vw-328px)] flex-col"
    >
      <TabsList className="w-full justify-start">
        <TabsTrigger value="my-library" className="w-60 shrink-0">
          My Library
        </TabsTrigger>
        {openPapers.map((paper) => (
          <TabsTrigger
            key={paper.id}
            value={String(paper.id)}
            className="w-60 min-w-0 shrink"
          >
            <span className="min-w-0 truncate text-left">{paper.title}</span>
            <X
              onClick={(e) => {
                e.stopPropagation();
                handleClosePaper(paper.id);
              }}
              className="ml-2 w-12 rounded-md px-1 hover:bg-muted/40"
            />
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="my-library">
        <PaperTable />
      </TabsContent>
      {openPapers.map((paper) => (
        <TabsContent
          key={paper.id}
          value={String(paper.id)}
          className="m-0 flex flex-col data-[state=active]:grow"
        >
          <h1 className="pt-4 text-lg font-semibold md:text-2xl">
            {paper.title}
          </h1>
          <h2 className="text-md pb-4 text-muted-foreground">
            {getAuthorString(paper.authors)}{" "}
            {paper.publicationDate?.split("-")[0] ?? ""}
          </h2>
          <iframe
            src={paper.link?.replace("abs", "pdf") ?? ""}
            className="grow"
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
