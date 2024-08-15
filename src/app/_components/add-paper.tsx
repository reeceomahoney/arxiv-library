"use cleint";

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
    <form onSubmit={handleSubmit}>
      <div className="flex w-full max-w-sm items-center space-x-2 rounded-lg border bg-muted/40 p-2">
        <Input
          type="text"
          value={arxivIdOrLink}
          onChange={(e) => setArxivIdOrLink(e.target.value)}
        />
        <Button type="submit">Add Paper</Button>
      </div>
    </form>
  );
}
