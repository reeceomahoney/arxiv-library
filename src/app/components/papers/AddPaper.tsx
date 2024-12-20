"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import { createPaper } from "../../../server/actions";
import { useLibraryContext } from "../providers/LibraryProvider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function AddPaper() {
  const folders = useLibraryContext((state) => state.folders);
  const addPapers = useLibraryContext((state) => state.addPapers);
  const userId = useLibraryContext((state) => state.userId);
  const [arxivIdOrLink, setArxivIdOrLink] = useState("");

  const selectedFolder = folders.find((folder) => folder.isSelected);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const idOrLink = arxivIdOrLink.trim();
    setArxivIdOrLink("Adding...");

    let retry = 0;
    while (retry < 3) {
      try {
        const data = await createPaper(idOrLink, selectedFolder!.id, userId);
        if (!data) return;
        addPapers([data]);
        setArxivIdOrLink("");
        return;
      } catch (error) {
        if (retry < 3) retry++;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grow">
      <div className="flex w-full max-w-sm items-center space-x-2 rounded-lg border bg-muted/40 p-2">
        <Input
          type="text"
          placeholder="Add papers by arXiv link"
          value={arxivIdOrLink}
          onChange={(e) => setArxivIdOrLink(e.target.value)}
          className="lg:w-60"
        />
        <Button type="submit" className="w-10 md:w-auto">
          <span className="hidden md:block">Add Paper</span>
          <span className="block md:hidden">
            <Plus />
          </span>
        </Button>
      </div>
    </form>
  );
}
