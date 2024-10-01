"use client";

import { File, Files } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/components/ui/table";
import AddPaper from "./AddPaper";
import DeletePaper from "./DeletePaper";
import { Checkbox } from "../ui/checkbox";

import { collectPapers, getAuthorString } from "~/lib/utils";
import type { Paper } from "~/server/db/schema";
import { useLibraryContext } from "../providers/LibraryProvider";

function PaperDragLayer({ count }: { count: number }) {
  const { itemType, isDragging, clientOffset } = useDragLayer((monitor) => ({
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  if (!isDragging || !clientOffset || itemType !== "PAPER") return null;

  // BUG: The previw should be using the draggable count
  return (
    <div
      className="pointer-events-none fixed"
      style={{ left: clientOffset.x, top: clientOffset.y }}
    >
      {count > 1 ? <Files size={32} /> : <File size={32} />}
    </div>
  );
}

function PaperRow({
  paper,
  isSelected,
  handleSelectPaper,
}: {
  paper: Paper;
  isSelected: boolean;
  handleSelectPaper: (id: number) => void;
}) {
  const openPapers = useLibraryContext((state) => state.openPapers);
  const addOpenPaper = useLibraryContext((state) => state.addOpenPaper);
  const setActiveTab = useLibraryContext((state) => state.setActiveTab);

  const ref = useRef(null);

  const handleOpenPaper = () => {
    if (openPapers.includes(paper.id)) setActiveTab(String(paper.id));
    addOpenPaper(paper);
    setActiveTab(String(paper.id));
  };

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "PAPER",
    item: { id: paper.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(ref);

  return (
    <TableRow
      ref={ref}
      className={`${isDragging ? "opacity-50" : ""}`}
      onDoubleClick={handleOpenPaper}
    >
      <TableCell>
        <Checkbox
          className="align-middle"
          checked={isSelected}
          onCheckedChange={() => handleSelectPaper(paper.id)}
        />
      </TableCell>
      <TableCell>{paper.title}</TableCell>
      <TableCell>{getAuthorString(paper.authors)}</TableCell>
      <TableCell className="hidden md:table-cell">
        {paper.publicationDate}
      </TableCell>
    </TableRow>
  );
}

export default function PaperTable() {
  const folders = useLibraryContext((state) => state.folders);
  const papers = useLibraryContext((state) => state.papers);
  const selectedPapers = useLibraryContext((state) => state.selectedPapers);
  const setSelectedPapers = useLibraryContext(
    (state) => state.setSelectedPapers,
  );
  const addSelectedPaper = useLibraryContext((state) => state.addSelectedPaper);

  const selectedFolder = folders.find((folder) => folder.isSelected);
  const title = selectedFolder?.name;

  const filteredPapers = selectedFolder
    ? collectPapers(selectedFolder.id, folders, papers)
    : [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPapers(filteredPapers.map((paper) => paper.id));
    } else {
      setSelectedPapers([]);
    }
  };

  return (
    <>
      <PaperDragLayer count={selectedPapers.length} />
      <div className="flex flex-col items-start justify-between py-4 md:flex-row md:items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        <div className="mt-4 flex w-full items-center gap-4 md:mt-0 md:w-auto">
          <AddPaper />
          <DeletePaper />
        </div>
      </div>
      {filteredPapers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  className="align-middle"
                  checked={selectedPapers.length === filteredPapers.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-2/3">Title</TableHead>
              <TableHead className="w-1/6">Authors</TableHead>
              <TableHead className="hidden w-1/6 md:table-cell">
                Publication Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPapers.map((paper) => (
              <PaperRow
                key={paper.id}
                paper={paper}
                isSelected={selectedPapers.includes(paper.id)}
                handleSelectPaper={addSelectedPaper}
              />
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No papers</p>
      )}
    </>
  );
}
