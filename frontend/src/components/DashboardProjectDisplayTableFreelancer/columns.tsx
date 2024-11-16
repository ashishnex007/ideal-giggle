import axios from "axios";
// import { useState,useEffect } from 'react';
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';
import { ColumnDef } from "@tanstack/react-table";
import { Project } from "./data/project";
import {
  HiArrowsUpDown,
} from "react-icons/hi2";
// import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button";
import Swal from 'sweetalert2';

export const columns: ColumnDef<Project>[] = [
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
  {
    accessorKey: "id",
    header: () => {
      return (
        <div className="flex py-2 text-left">
          Action
        </div>
      );
    },
    cell: ({ row }) => {
      const token = useSelector((state: RootState) => state.auth.token);
      // const user = useSelector((state: RootState) => state.auth.user);
      const id = row.getValue("id");
      // console.log(id)
      const accept_or_reject = async (action:string) =>{
        const _id ={
        "proposalId":id
        }
        if(action === "accept"){
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/accept-proposal`, _id,{
              headers: {
                Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
              },
            });
            // console.log(response)
            Swal.fire({
              icon: "success",
              title: `Project Proposal Accepted`,
              text: `You have been added in the group chat of the project`,
            }).then(() => {
              window.location.reload();
            });
          } catch (error) {
            console.error("Failed to Approve Project", error);
          }
        }
        else{
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/reject-proposal`, 
              _id,{ // Assuming _id is an object that contains the ID to delete
              headers: {
                Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
              }});
            console.log(response)
            window.location.reload();
          } catch (error) {
            console.error("Failed to Reject Project", error);
          }
        }
      }
      return (
        <div className="flex flex-row space-x-2">
          {/* <Button>Call</Button> */}
          <Button onClick={() => accept_or_reject("accept")} className="bg-green-500 hover:bg-green-400" ><span className="text-black">Accept</span></Button>
          <Button onClick={() => accept_or_reject("delete")} className="bg-red-500 hover:bg-red-400">Reject</Button>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }
  // ...
];
