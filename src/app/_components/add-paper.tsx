"use cleint";

import React, { useState } from "react";
import { createPaper } from "../../server/actions";
import { useLibrary } from "./library-provider";

export default function AddPaper() {
  const { folders } = useLibrary();
  const [arxivIdOrLink, setArxivIdOrLink] = useState("");

  const selectedFolder = folders.find((folder) => folder.isSelected);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = await createPaper(arxivIdOrLink, selectedFolder!.id);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          arXiv ID or Link:
          <input
            type="text"
            value={arxivIdOrLink}
            onChange={(e) => setArxivIdOrLink(e.target.value)}
          />
        </label>
        <button type="submit">Create Paper</button>
      </form>
    </div>
  );
}
