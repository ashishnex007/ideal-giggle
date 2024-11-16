import { ColumnDef } from "@tanstack/react-table";
import { Project } from "./data/project";
import {
  HiArrowsUpDown,
} from "react-icons/hi2";

export const columnsAll: ColumnDef<Project>[] = [
  {
    accessorKey: "projectName",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left">
          Name
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const { projectName } = row.original;
      return <div className="font-medium text-left ">{projectName}</div>;
    },
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left ">
          Deadline
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-[80px]">
        {row.getValue("deadline")}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  // ...
];
