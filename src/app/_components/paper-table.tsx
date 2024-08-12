"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import AddPaper from "./add-paper";

import { collectPapers } from "~/lib/utils";
import { useLibrary } from "./library-provider";

export default function PaperTable() {
  const { folders, papers } = useLibrary();
  const selectedFolder = folders.find((folder) => folder.isSelected);
  const title = selectedFolder?.name;

  const filteredPapers = selectedFolder
    ? collectPapers(selectedFolder.id, folders, papers)
    : [];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        <AddPaper />
      </div>
      {filteredPapers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Authors</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPapers.map((paper) => (
              <TableRow key={paper.id}>
                <TableCell>{paper.title}</TableCell>
                <TableCell>{paper.authors?.join(", ")}</TableCell>
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
