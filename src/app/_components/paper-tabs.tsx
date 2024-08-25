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
  const { openPapers, setOpenPapers, activeTab, setActiveTab } = useLibrary();

  const handleClosePaper = (id: number) => {
    setOpenPapers((prevPapers) => {
      const newPapers = prevPapers.filter((p) => p.id !== id);
      if (newPapers.length > 0) {
        if (activeTab === String(id)) {
          setActiveTab(String(newPapers[newPapers.length - 1]!.id));
        }
      } else {
        setActiveTab("my-library");
      }
      return newPapers;
    });
  };

  return (
    <Tabs
      defaultValue="my-library"
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex h-full w-[calc(100vw-328px)] flex-col"
    >
      <TabsList className="w-full justify-start gap-1">
        <TabsTrigger
          value="my-library"
          className="w-60 shrink-0 data-[state=inactive]:hover:bg-gray-700"
        >
          My Library
        </TabsTrigger>
        {openPapers.map((paper) => (
          <TabsTrigger
            key={paper.id}
            value={String(paper.id)}
            className="group w-60 min-w-0 shrink data-[state=inactive]:hover:bg-gray-700"
          >
            <span className="min-w-0 truncate text-left">{paper.title}</span>
            <X
              onPointerDown={(e) => {
                e.stopPropagation();
                handleClosePaper(paper.id);
              }}
              className="ml-2 h-5 w-5 shrink-0 rounded-md p-0.5 hover:bg-gray-600"
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
            src={
              paper.link?.replace("abs", "pdf").replace("http", "https") ?? ""
            }
            className="grow"
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
