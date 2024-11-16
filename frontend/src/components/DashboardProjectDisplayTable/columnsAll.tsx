import axios from "axios";
import { useState } from 'react';
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';
import { ColumnDef } from "@tanstack/react-table";
import { Project } from "./data/project";
import { HiArrowsUpDown } from "react-icons/hi2";
// import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button";
import SearchFreelancer from "@/components/SearchFreelancer";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

export const columnsAll: ColumnDef<Project>[] = [
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
    accessorKey: "status",
    header: undefined,
    cell: undefined
  },
  {
    accessorKey: "description",
    header: undefined,
    cell: undefined
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
      const user = useSelector((state: RootState) => state.auth.user);
      return (
        <div className="flex py-2 text-left">
          {
            user?.role === "project manager" &&
            <h1>Action</h1>
          }
        </div>
      );
    },
    cell: ({ row }) => {
      const user = useSelector((state: RootState) => state.auth.user);
      const token = useSelector((state: RootState) => state.auth.token);
      const [showAlert, setShowAlert] = useState(false);
      const status = row.getValue("status");

      // * API calls
      const acceptProject = async() => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/accept`, {
            projectId: row.getValue("id")
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if(response.status === 200){
            window.alert("Project has been accepted");
            window.location.reload();
            setShowAlert(true);
          }
          // console.log(response);
        } catch (error) {
          console.error("Failed to accept project", error);
        }
      };

      const rejectProject = async() => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/reject`, {
          projectId: row.getValue("id")
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if(response.status === 200){
          window.alert("Project has been rejected");
          window.location.reload();
        }
      };

      return (
        <div className="flex flex-row space-x-2">
          {
            user?.role === "project manager" &&
            <div>
              {
                status === "unapproved" ? 
                (
                  <div className="flex gap-x-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-500 hover:bg-green-700 transition-colors duration-300">Accept</Button>
                      </DialogTrigger>
                      <DialogContent className="w-[40rem]">
                        <DialogHeader>
                          <DialogTitle>Do you want to Accept this project?</DialogTitle>
                          <DialogDescription className="py-4">
                            <div className="flex flex-col gap-y-4">
                              <h1>
                                <span className="font-bold">Title:</span> {row.getValue("title")}
                              </h1>
                              <h1>
                              <span className="font-bold">Deadline:</span> {row.getValue("date")}
                              </h1>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <div className="flex gap-x-4">
                            <Button className="bg-green-500 hover:bg-green-700 transition-colors duration-300" onClick={acceptProject}>Accept</Button>
                            <DialogClose>
                              <Button>Cancel</Button>
                            </DialogClose>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-red-500 hover:bg-red-700 transition-colors duration-300">Reject</Button>
                      </DialogTrigger>
                      <DialogContent className="w-[40rem]">
                        <DialogHeader>
                          <DialogTitle>Do you want to Reject this project?</DialogTitle>
                          <DialogDescription>
                            <div className="flex flex-col gap-y-4 py-4 pb-8">
                              <h1>
                                <span className="font-bold">Title:</span> {row.getValue("title")}
                              </h1>
                              <h1>
                                <span className="font-bold">Deadline:</span> {row.getValue("date")}
                              </h1>
                            </div>
                            <Textarea placeholder="Specify the reason." className="py-4" />
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <div className="flex gap-x-4">
                            <Button className="bg-red-500 hover:bg-red-700 transition-colors duration-300" onClick={rejectProject}>Reject</Button>
                            <DialogClose>
                              <Button>Cancel</Button>
                            </DialogClose>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )
                :
                (
                  <SearchFreelancer projectId={row.getValue("id")} projectName={row.getValue("title")}  deadline={row.getValue("date")}/>
                )
              }
            </div>
          }
          {showAlert && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" onClick={() => setShowAlert(false)}>Show Dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Accepted Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    New project has been accepted
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setShowAlert(false)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }
];
