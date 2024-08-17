"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";

import AddPaper from "./add-paper";
import DeletePaper from "./delete-paper";
import MovePaper from "./move-paper";
import { Checkbox } from "./ui/checkbox";

import { collectPapers } from "~/lib/utils";
import { useLibrary } from "./library-provider";

function getAuthorString(authors: string[] | null) {
  if (!authors || authors.length === 0) return null;

  const getLastName = (fullName: string) => {
    const parts = fullName.split(" ");
    return parts[parts.length - 1];
  };

  if (authors.length === 1) {
    return getLastName(authors[0] ?? "");
  } else {
    return `${getLastName(authors[0] ?? "")} et al.`;
  }
}

export default function PaperTable() {
  const { folders, papers, setPapers } = useLibrary();
  const selectedFolder = folders.find((folder) => folder.isSelected);
  const title = selectedFolder?.name;

  const filteredPapers = selectedFolder
    ? collectPapers(selectedFolder.id, folders, papers)
    : [];

  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPapers(filteredPapers.map((paper) => paper.id));
    } else {
      setSelectedPapers([]);
    }
  };

  const handleSelectPaper = (paperId: number) => {
    setSelectedPapers((prevSelected) =>
      prevSelected.includes(paperId)
        ? prevSelected.filter((id) => id !== paperId)
        : [...prevSelected, paperId],
    );
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        <div className="flex items-center gap-4">
          <AddPaper />
          <MovePaper
            selectedPapers={selectedPapers}
            setSelectedPapers={setSelectedPapers}
            setPapers={setPapers}
          />
          <DeletePaper
            selectedPapers={selectedPapers}
            setSelectedPapers={setSelectedPapers}
            setPapers={setPapers}
          />
        </div>
      </div>
      {filteredPapers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={selectedPapers.length === filteredPapers.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-2/3">Title</TableHead>
              <TableHead className="w-1/6">Authors</TableHead>
              <TableHead className="w-1/6">Publication Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPapers.map((paper) => (
              <TableRow key={paper.id} className="h-16">
                <TableCell>
                  <Checkbox
                    checked={selectedPapers.includes(paper.id)}
                    onCheckedChange={() => handleSelectPaper(paper.id)}
                  />
                </TableCell>
                <TableCell>{paper.title}</TableCell>
                <TableCell>{getAuthorString(paper.authors)}</TableCell>
                <TableCell>{paper.publicationDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No papers</p>
      )}
    </>
  );
}
