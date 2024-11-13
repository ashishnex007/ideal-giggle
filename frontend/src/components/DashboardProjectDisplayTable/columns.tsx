import axios from "axios";
// import { useState,useEffect } from 'react';
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';
import { ColumnDef } from "@tanstack/react-table";
import { Project } from "./data/project";
import {
  HiArrowsUpDown,
} from "react-icons/hi2";
import Swal from 'sweetalert2';
// import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button";

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
        {row.getValue("date")}
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
        "projectId":id
        }
        if(action === "accept"){
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/accept`, _id,{
              headers: {
                Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
              },
            });
            // console.log(response)
            const createGroup = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/group`,
              {
                name: row.original.title,
                users: JSON.stringify([row.original.client]),
                projectId: id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
                },
              }
            );
            Swal.fire({
              icon: "success",
              title: `Project ${row.original.title} Accepted`,
              text: `Project ${row.original.title} by client ${row.original.clientName} has been accepted and created chat group for the project`,
            }).then(() => {
              window.location.reload();
            });
            // console.log(createGroup);
          } catch (error) {
            console.error("Failed to Approve Project", error);
          }
        }
        else{
          try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/project/delete`, {
              data: _id, // Assuming _id is an object that contains the ID to delete
              headers: {
                Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
              },
            });
            // console.log(response)
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
