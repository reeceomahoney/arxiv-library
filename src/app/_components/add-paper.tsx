"use cleint";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import { createPaper } from "../../server/actions";
import { useLibrary } from "./library-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function AddPaper() {
  const { folders, setPapers } = useLibrary();
  const [arxivIdOrLink, setArxivIdOrLink] = useState("");

  const selectedFolder = folders.find((folder) => folder.isSelected);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = await createPaper(arxivIdOrLink, selectedFolder!.id);
    if (!data) return;
    setPapers((prevPapers) => [...prevPapers, data]);
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
