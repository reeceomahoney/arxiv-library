"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";

import { Input } from "../ui/input";
import { useLibraryContext } from "../providers/LibraryProvider";

export default function PaperSearch() {
  const papers = useLibraryContext((state) => state.papers);
  const setPapers = useLibraryContext((state) => state.setPapers);

  const [query, setQuery] = useState("");
  const [allPapers] = useState(papers);

  useEffect(() => {
    if (query.length > 0) {
      setPapers(
        allPapers.filter((paper) => paper.title?.toLowerCase().includes(query)),
      );
    } else {
      setPapers(allPapers);
    }
  }, [query, setPapers, allPapers]);

  return (
    <div className="w-full flex-1">
      <form>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.toLowerCase())}
            placeholder="Search papers..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
      </form>
    </div>
  );
}
