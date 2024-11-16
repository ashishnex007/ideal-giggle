import axios from "axios";
import { useState,useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';

import CreateProject from "@/components/CreateProject";
import {Card} from "@/components/ui/card"
import { GrDocumentText } from "react-icons/gr";
import { RiPlayLine } from "react-icons/ri";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineErrorOutline } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProjectDisplay from "@/components/ProjectDisplayTable/ProjectDisplay";

interface ProjectInfo {
  title: string;
  status: string;
  date: string;
}

const FlashProjects = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const [newProjects, setNewProjects] = useState<ProjectInfo[]>([]);
  const [completedProjects, setCompletedProjects] = useState<ProjectInfo[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<ProjectInfo[]>([]);
  const [unapprovedProjects, setUnapprovedProjects] = useState<ProjectInfo[]>([]);

  useEffect(()=> {
    if(!token){
      navigate("/login");
    }
  }, [token]);
  
  // * PM view

  const fetchPMProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/all-pm-projects`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });

      if (response.data){
        const projects = response.data.projects;
        // Initialize temporary arrays to hold categorized projects
        const tempNewProjects: ProjectInfo[] = [];
        const tempCompletedProjects: ProjectInfo[] = [];
        const tempOngoingProjects: ProjectInfo[] = [];

        // Categorize projects based on their status
        projects.forEach((project:any) => {
          const { title, deadline, status, createdAt } = project; // Destructure needed properties
          const projectInfo: ProjectInfo= { title, date:deadline.split("T")[0], status }; // Construct an object with the needed properties

          const createdDate = new Date(createdAt);
          const currentDate = new Date();
          const timeDifference = currentDate.getTime() - createdDate.getTime();
          const hoursDifference = timeDifference / (1000 * 3600);

          if (status === 'open' && hoursDifference > 24) {
            tempOngoingProjects.push(projectInfo);
          }else{
            switch (status) {
              case 'open':
                tempNewProjects.push(projectInfo);
                break;
              case 'completed':
                tempCompletedProjects.push(projectInfo);
                break;
              case 'ongoing':
                tempOngoingProjects.push(projectInfo);
                break;
              default:
                console.log('Unknown status:', status);
            }
          }
        });

        // Update state with categorized projects
        setNewProjects(tempNewProjects);
        setCompletedProjects(tempCompletedProjects);
        setOngoingProjects(tempOngoingProjects);
      } else {
        console.error('Expected response.data.projects to be an array, but received:', response.data);
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  const fetchUnapprovedProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/unapproved`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });

      if (response.data){
        const projects = response.data.projects;
        // Initialize temporary arrays to hold categorized projects
        const tempUnapprovedProjects: ProjectInfo[] = [];

        // Categorize projects based on their status
        projects.forEach((project:any) => {
          const { title, deadline} = project; // Destructure needed properties
          const projectInfo: ProjectInfo= { title, date:deadline.split("T")[0], status:"unapproved" }; // Construct an object with the needed properties
          tempUnapprovedProjects.push(projectInfo)
        });

        // Update state with categorized projects
        setUnapprovedProjects(tempUnapprovedProjects)
      } else {
        console.error('Expected response.data.projects to be an array, but received:', response.data);
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  // * Client view

  const fetchClientProjects = async() => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/all-client-projects`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if(response.data){
        const projects = response.data.projects;
        const tempNewProjects: ProjectInfo[] = [];
        const tempCompletedProjects: ProjectInfo[] = [];
        const tempOngoingProjects: ProjectInfo[] = [];
        const tempUnapprovedProjects: ProjectInfo[] = [];

        projects.forEach((project:any) => {
          const { title, deadline, status, createdAt } = project;
          const projectInfo: ProjectInfo= { title, date:deadline.split("T")[0], status };

          const createdDate = new Date(createdAt);
          const currentDate = new Date();
          const timeDifference = currentDate.getTime() - createdDate.getTime();
          const hoursDifference = timeDifference / (1000 * 3600);

          if (status === 'open' && hoursDifference > 24) {
            tempOngoingProjects.push(projectInfo);
          }else{
            switch (status) {
              case 'open':
                tempNewProjects.push(projectInfo);
                break;
              case 'completed':
                tempCompletedProjects.push(projectInfo);
                break;
              case 'ongoing':
                tempOngoingProjects.push(projectInfo);
                break;
              case 'unapproved':
                tempUnapprovedProjects.push(projectInfo);
                break;
              default:
                console.log('Unknown status:', status);
            }
          }
        });

        setNewProjects(tempNewProjects);
        setCompletedProjects(tempCompletedProjects);
        setOngoingProjects(tempOngoingProjects);
        setUnapprovedProjects(tempUnapprovedProjects);
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  useEffect(() => {
    if(user){
      if(user.role === "project manager"){
        fetchPMProjects();
        fetchUnapprovedProjects();
      }else if(user.role === "client"){
        fetchClientProjects();
      }
    }
  }, [user?._id]);

  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="ml-4 flex-grow mt-10">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center px-4">
        <h1 className="text-3xl text-center md:text-left font-bold">Project Tracking</h1>

        <div className="pt-5 md:pr-5 flex justify-center">
          {user!==null && user.role === 'client' && <CreateProject/>}
        </div>
      </div>

      <div className="flex flex-wrap w-full space-y-6 md:space-y-0 md:space-x-6 mt-8 justify-evenly">

        {/* New Card */}
        <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#6092ff] bg-[#eff4ff] rounded-xl">
          <div className="flex flex-col ml-3.5 mt-5" >
            <span className="font-medium text-xl text-[#313642]">New</span>
            <span className="font-bold text-[#3799E5] text-3xl mt-4">{newProjects.length}</span>
          </div>
          <div className="flex items-center justify-center bg-[#3799E5] w-[3rem] h-[3rem] rounded-xl m-3.5">
            <GrDocumentText className="text-white w-6 h-6" />
          </div>
        </Card>

        {/* Progress Card */}
        <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#F2C263] bg-[#FFFAEF] rounded-xl">
          <div className="flex flex-col ml-3.5 mt-5" >
            <span className="font-medium text-xl text-[#313642]">In progress</span>
            <span className="font-bold text-[#EFB134] text-3xl mt-4">{ongoingProjects.length}</span>
          </div>
          <div className="flex items-center justify-center bg-[#EFB134] w-[3rem] h-[3rem] rounded-xl m-3.5">
            <RiPlayLine className="text-white w-8 h-8" />
          </div>
        </Card>

        {/* Completed Card */}
        <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#4CE880] bg-[#EDFCF2] rounded-xl">
          <div className="flex flex-col ml-3.5 mt-5" >
            <span className="font-medium text-xl text-[#313642]">Completed</span>
            <span className="font-bold text-[#1BD659] text-3xl mt-4">{completedProjects.length}</span>
          </div>
          <div className="flex items-center justify-center bg-[#1BD659] w-[3rem] h-[3rem] rounded-xl m-3.5">
            <IoIosCheckmarkCircleOutline className="text-white w-7 h-7" />
          </div>
        </Card>

        {/* Pending Card */}
        <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#56CFEA] bg-[#EFFAFC] rounded-xl">
          <div className="flex flex-col ml-3.5 mt-5" >
            <span className="font-medium text-xl text-[#313642]">Unapproved</span>
            <span className="font-bold text-[#56CFEA] text-3xl mt-4">{unapprovedProjects.length}</span>
          </div>
          <div className="flex items-center justify-center bg-[#56CFEA] w-[3rem] h-[3rem] rounded-xl m-3.5">
            <MdOutlineErrorOutline className="text-white w-7 h-7" />
          </div>
        </Card>
      </div>

      {/* Projects Tab */}
      <div className="flex flex-col mt-12">
        <span className="text-2xl font-bold	mb-6">Projects</span>
        <div>
          <Tabs defaultValue="new" className="lg:w-[70rem]">
            <TabsList className="border-b-0 max-w-[80vw]">
              <TabsTrigger value="new" className="text-[#565D6D] w-[3rem] md:w-auto">New</TabsTrigger>
              <TabsTrigger value="progress" className="text-[#565D6D] w-[5.5rem] md:w-auto">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="text-[#565D6D] w-[5.5rem] md:w-auto">Completed</TabsTrigger>
              <TabsTrigger value="unapproved" className="text-[#565D6D] w-[5.5rem] md:w-auto">Unapproved</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="text-[#565D6D]"><div className="-ml-8 -mt-8"><ProjectDisplay data={newProjects}/></div></TabsContent>
            <TabsContent value="progress" className="text-[#565D6D]"><div className="-ml-8 -mt-8"><ProjectDisplay data={ongoingProjects}/></div></TabsContent>
            <TabsContent value="completed" className="text-[#565D6D]"><div className="-ml-8 -mt-8"><ProjectDisplay data={completedProjects}/></div></TabsContent>
            <TabsContent value="unapproved" className="text-[#565D6D]"><div className="-ml-8 -mt-8"><ProjectDisplay data={unapprovedProjects}/></div></TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
      
    </div>
  );
};

export default FlashProjects;
