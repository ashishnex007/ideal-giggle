import { ColumnDef } from "@tanstack/react-table";
import { Project } from "./data/project";
import {
  HiArrowsUpDown,
} from "react-icons/hi2";
// import { MoreHorizontal } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "title",
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
      const { title } = row.original;
      return <div className="font-medium text-left ">{title}</div>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left ">
          Date
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="w-[80px]">
        {row.getValue("date")}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left">
          Status
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const status = String(row.original.status);
      const colors = {
        "completed": "bg-green-500",
        "open": "bg-yellow-500",
        "ongoing": "bg-orange-500",
        "unapproved": "bg-red-500",
      };
      
      return (
        <Progress className={`text-white justify-center w-3/4`} indicatorColor={`${colors[status as keyof typeof colors]}`} value={80} />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }
  // ...
];
