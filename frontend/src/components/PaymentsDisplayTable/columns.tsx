import { ColumnDef } from "@tanstack/react-table";
import { HiArrowsUpDown } from "react-icons/hi2";

export interface FormattedTransaction {
  code: string;
  status: "Succeeded" | "Incomplete" | "Pending" | "Failed" | "credit";
  project: string;
  time: string;
  amount: number;
}

const getTimeFromString = (dateString: string) => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0'+minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

export const columns: ColumnDef<FormattedTransaction>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left">
          <span className="text-[#16191E]">PAYMENT ID</span>
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const { code } = row.original;
        return <div className="font-medium text-left text-[#3799E5] ">{code}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left">
          <span className="text-[#16191E]">TYPE</span>
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status.toString();
      const colors = {
        debit: "text-[#996A0C] bg-[#FFFAEF]",
        failed: "text-[#DD3B41] bg-[#FCF2F2]",
        credit: "text-[#117A34] bg-[#EDFCF2]", // Added credit status
      };
      
      return (
        <div className={`${colors[status as keyof typeof colors]} w-[5rem] border-[1px] rounded-full flex items-center justify-center`}>
          <span className="font-normal-[350] text-xs items-center p-1" >{status}</span>
        </div>
        // <Progress className={`text-white justify-center w-3/4`} indicatorColor={`${colors[status as keyof typeof colors]}`} value={Number(status)} />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left">
          <span className="text-[#16191E]">PROJECT</span>   
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const { project } = row.original;
      return <div className="text-left ">{project}</div>;
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left">
          <span className="text-[#16191E]">TIME</span>     
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const { time } = row.original;
      return <div className="text-left ">{getTimeFromString(time)}</div>;
    },
  },
  {
    accessorKey: "time",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left ">
          <span className="text-[#16191E]">DATE</span>       
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
     const { time } = row.original;
     return <div className="w-[80px]">
        {time.split('T')[0]}
      </div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="flex py-2 text-left">
          <span className="text-[#16191E]">CREDITS</span>      
          <HiArrowsUpDown
            className="w-4 h-4 ml-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const { amount } = row.original;
      return <div className="text-left ">₹{amount.toString()}</div>;
    },
  },
  // ...
];
