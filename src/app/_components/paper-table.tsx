"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import { Button } from "~/app/_components/ui/button";

import { useFolderData } from "~/app/_components/folder-context";
import { collectPapers } from "~/lib/utils";

export default function PaperTable() {
  const { folders, papers, currentId } = useFolderData();
  const title = folders.find((folder) => folder.id === currentId)?.name;

  const filteredPapers = collectPapers(currentId, folders, papers);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        <Button className="mt-4">Add Paper</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Authors</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPapers?.map((paper) => (
            <TableRow key={paper.title}>
              <TableCell>{paper.title}</TableCell>
              <TableCell>{paper.authors.join(", ")}</TableCell>
              <TableCell>
                {new Date(paper.date).toLocaleDateString("en-US")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
