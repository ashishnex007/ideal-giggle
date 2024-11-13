import axios from "axios";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";


import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"


const SendProposal = ({ projectId, freelancerId,projectName,deadline }: { projectId: string; freelancerId: string; projectName:string;deadline:string }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [error, setError] = useState("");
  const [color, setColor] = useState("");
  // const skill = ["weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee","weeeeeeeeee"]
  //hand send proposal event
  const handleButtonClick = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(event.currentTarget); 
    const description = formData.get('description') as string; 
    if (description.length < 10) {
      alert('Description must be at least 10 characters long.');
      return; // Stop the function execution if condition is met
    }
    const data = {
      "projectName":projectName,
      "projectId": projectId,
      "freelancerId": freelancerId,
      "description": description,
      "deadline": deadline,
      "amount": 5000,
      "projectRole": "worker"
    }
    try{
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/send-proposal`,data, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });
      setError(response.data.message)
      setColor("text-green-600")
    } catch (error:any) {
      setError(error.response.data.message)
      setColor("text-red-600")
      console.error("Failed to Send Proposal to Freelancer", error.response.data);
    }
  };

  return (
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 " variant="outline">
              <p className="text-white">Send Proposal</p>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[34rem] h-[18rem] ">
          <DialogTitle className="hidden"></DialogTitle>
            <div className="relative flex flex-col">
                <div className="flex flex-col">
                <p className="text-lg font-semibold" >Project Name: {projectName}</p>
                <form onSubmit={handleButtonClick}>
                  <p className="mt-2" >Description about project</p>
                  <Textarea className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0 w-[31rem]" name="description" minLength={10} required/>
                  <p className="text-xl font-bold mt-2">Deadline: {deadline}</p>
                  {error && <p className={`${color} font-medium`} >{error}</p>}
                  <Button className="mt-2 bg-green-600 hover:bg-green-500">Send Proposal</Button>
                  </form>
                </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default SendProposal;