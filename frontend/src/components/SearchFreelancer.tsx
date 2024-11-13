import axios from "axios";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,

} from "@/components/ui/dialog";

import {
  Card,
  CardTitle,
} from "@/components/ui/card"


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SendProposal from "@/components/SendProposal"

import { useState, useEffect } from "react";
import UserProfileView from "./UserProfileView";

interface Freelancer {
  name: string;
  skills:[string];
  _id: string;
}
export default function SearchFreelancer( {projectId,projectName,deadline}: { projectId: string; projectName: string; deadline:string }) {

  const token = useSelector((state: RootState) => state.auth.token);
  
  const [SearchFreelancer,setSearchFreelancer] = useState<Freelancer[]>([]);
  const [SearchSkills,setSearchSkills] = useState<Freelancer[]>([]);
  const searchSkills = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(event.currentTarget); 
    const inputValue = formData.get('skills') as string; 
    const data = {"skills":inputValue.split(',').map(item => item.trim()).filter(item => item)} // string to array
    try{
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/search`,data, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });
      // console.log(response.data.freelancers)
      setSearchSkills(response.data.freelancers.map((item:any) => {
        // Find the freelancer by ID and extract the name
        const freelancer: Freelancer | undefined = SearchFreelancer.find((freelancer) => freelancer._id === item.userId);
        // console.log(item)
        return {
          name: freelancer ? freelancer.name : 'Unknown', // Use the freelancer's name if found, otherwise 'Unknown'
          skills: item.skills,
          _id: item._id,
        };
      }))
       // Handle the response data as needed
    } catch (error:any) {
      console.error("Failed to Search Freelancer details", error.response.data);
    }
  };

  const Freelancers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/freelancers`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });
      // console.log(response.data)
      
      setSearchFreelancer(response.data.map((item:any) => ({
        name: item.name,
        skills: item.freelancerDetails.skills ? item.freelancerDetails.skills : [],
        _id: item._id,
      })));// Handle the response data as needed
    } catch (error) {
      console.error("Failed to Freelancers details", error);
    }
  };

  useEffect(() => {
    Freelancers();
  }, []);

  // * view profile

  const [profileData, setProfileData] = useState(null);
  const viewProfile = async(userId: string) => {
    // console.log(userId);
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/viewProfile/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
    setProfileData(response.data);
  };

  return (
      <div>
        <Dialog className="max-w-[90vw]">
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 " variant="outline">
              {/* <IoSearch className="w-5 h-5 text-white mr-2" /> */}
              <p className="text-white">+ Add Freelancers</p>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] sm:max-w-[80rem] h-[43.5rem] ">
          <DialogTitle className="hidden"></DialogTitle>
            <div className="relative flex flex-col">
              <div className="">
                <span>Search Freelancer by Skills for the project "{projectName}"</span>
                <p>Use a Comma (,) to seperate skills</p>
                
                <div className="flex flex-row">
                  <form onSubmit={searchSkills} className="flex flex-row">
                    <Input name="skills" className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0 w-[31rem]"/>
                    <Button className="ml-2">Search</Button>
                  </form>
                  <Button className="ml-2" onClick={() => setSearchSkills([])} >Clear</Button>
                </div>
                
              </div>
              <div className="flex flex-col overflow-auto max-h-[36rem]">
                {SearchSkills.length<1 && SearchFreelancer.map((freelancer) => (
                      <Card className="w-[90vw] sm:w-[75rem] mt-2 border-2">
                      <div className="flex flex-col md:flex-row justify-between">
                        <CardTitle className="mt-2 ml-2">{freelancer.name}</CardTitle>
                        <div className="flex justify-end space-x-2 mt-2 mr-2">
                        <Dialog>
                            <DialogTrigger>
                                <Button onClick={() => viewProfile(freelancer._id)}>View Profile</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Profile Details</DialogTitle>
                                <DialogDescription>
                                    {profileData 
                                        &&
                                        profileData.user.role === "freelancer"
                                        &&
                                        (
                                        <UserProfileView 
                                            user={profileData.user} 
                                            details={profileData[profileData.user.role][0]}
                                        />
                                    )}
                                </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                          </Dialog>
                          <SendProposal projectId={projectId} freelancerId={freelancer._id} projectName={projectName} deadline={deadline}/>
                        </div>
                      </div>
                      <div className="flex flex-wrap m-2">
                        {freelancer.skills.map((skills) => (
                          <Button className="bg-gray-200 hover:bg-gray-200 font-light h-6 mr-1 mb-1 text-black">{skills}</Button>
                        ))}
                      </div>
                    </Card>
                ))}
                {SearchSkills.map((freelancer) => (
                      <Card className="w-[75rem] mt-2 border-2">
                      <div className="flex flex-col md:flex-row justify-between">
                        <CardTitle className="mt-2 ml-2">{freelancer.name}</CardTitle>
                        <div className="flex justify-end space-x-2 mt-2 mr-2">
                          <Dialog>
                            <DialogTrigger>
                                <Button onClick={() => viewProfile(freelancer._id)}>View Profile</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Profile Details</DialogTitle>
                                <DialogDescription>
                                    {profileData 
                                        &&
                                        profileData.user.role === "freelancer"
                                        &&
                                        (
                                        <UserProfileView 
                                            user={profileData.user} 
                                            details={profileData[profileData.user.role][0]}
                                        />
                                    )}
                                </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                          </Dialog>
                          <SendProposal projectId={projectId} freelancerId={freelancer._id} projectName={projectName} deadline={deadline}/>
                        </div>
                      </div>
                      <div className="flex flex-wrap m-2">
                        {freelancer.skills.map((skills) => (
                          <Button className="bg-gray-200 hover:bg-gray-200 font-light h-6 mr-1 mb-1 text-black">{skills}</Button>
                        ))}
                      </div>
                    </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};
