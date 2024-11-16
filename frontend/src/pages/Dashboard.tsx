import axios from "axios";
import { useState,useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardProject from "@/components/DashboardProjectDisplayTable/DashboardProject";
import DashboardProjectAll from "@/components/DashboardProjectDisplayTable/DashboardProjectAll"
import DashboardProjectFreelancer from "@/components/DashboardProjectDisplayTableFreelancer/DashboardProjectFreelancer";

interface ProjectInfo {
  id:string
  title: string;
  status: string;
  date: string;
}

interface PMProjectInfo {
  id:string
  title: string;
  description: string;
  client: string;
  clientName: string;
  status: string;
  date: string;
}

interface FreelancerProjectInfo{
  id:string
  status: string
  projectName:string
  description:string
  deadline:string 
  amount:Number
}
const Dashboard = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(()=> {
    if(!token){
      navigate("/login");
    }
  }, [token]);

  const [newProjects, setNewProjects] = useState<ProjectInfo[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<ProjectInfo[]>([]);
  const [completedProjects, setCompletedProjects] = useState<ProjectInfo[]>([]);

  // * project manager takes care of approving the projects
  const [unapprovedProjects, setUnapprovedProjects] = useState<PMProjectInfo[]>([]);
  // * freelancer pending proposals
  const [pendingFreelancerProjects, setPendingFreelancerProjects] = useState<FreelancerProjectInfo[]>([]);
  // * client unapproved projects
  const [unapprovedClientProjects, setUnapprovedClientProjects] = useState<ProjectInfo[]>([]);

  // * common(F/ C/ PM) for all which shows all the projects
  const fetchprojectDetails = async () => {
    try {
      let apiCall = "";
      const baseUrl = `${import.meta.env.VITE_API_URL}/api/project/`;

      if(user?.role === "freelancer"){
        apiCall = `${baseUrl}all-freelancer-projects`;
      }else if(user?.role === "project manager"){
        apiCall = `${baseUrl}all-pm-projects`;
      }else{
        apiCall = `${baseUrl}all-client-projects`;
      }

      const response = await axios.get(apiCall, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });

      if (response.data){
        const projects = response.data.projects;
        // Initialize temporary arrays to hold categorized projects
        const tempNewProjects: ProjectInfo[] = [];
        const tempOngoingProjects: ProjectInfo[] = [];
        const tempCompletedProjects: ProjectInfo[] = [];

        // Categorize projects based on their status
        projects.forEach((project:any) => {
          const { title, deadline, status, _id } = project; // Destructure needed properties
          const projectInfo: ProjectInfo= {id:_id, title, date:deadline.split("T")[0], status }; // Construct an object with the needed properties

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
        });

        // Update state with categorized projects
        setNewProjects(tempNewProjects);
        setOngoingProjects(tempOngoingProjects);
        setCompletedProjects(tempCompletedProjects);
      } else {
        console.error('Expected response.data.projects to be an array, but received:', response.data);
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  // * project manager takes care of approving the projects
  const fetchUnapprovedProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/unapproved`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });
      // console.log(response.data);

      if (response.data){
        const projects = response.data.projects;
        // Initialize temporary arrays to hold categorized projects
        const tempUnapprovedProjects: PMProjectInfo[] = [];

        // Categorize projects based on their status
        projects.forEach((project:any) => {
          const { title, deadline,_id, description, client, clientName} = project; // Destructure needed properties
          const projectInfo: PMProjectInfo= { id:_id , title, description, client, clientName, date:deadline.split("T")[0], status:"unapproved" }; // Construct an object with the needed properties
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

  // * freelancer pending proposal view
  const fetchUnapprovedFreelancerProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/view-proposal`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });
      if (response.data.proposals){
        const proposals = response.data.proposals;
        // Initialize temporary arrays to hold categorized projects
        const tempUnapprovedProjects: FreelancerProjectInfo[] = [];

        // Categorize projects based on their status
        proposals.forEach((proposal:any) => {
          const { projectName,description, deadline, amount,status, _id } = proposal; // Destructure needed properties
          const projectInfo: FreelancerProjectInfo= {id:_id, projectName, description, deadline, status,amount }; // Construct an object with the needed properties

          switch (status) {
            case 'unapproved':
              tempUnapprovedProjects.push(projectInfo);
              break;
            default:
              console.log('Unknown status:', status);
          }
        });
        setPendingFreelancerProjects(tempUnapprovedProjects);
      } else {
        console.error('Expected response.data.proposals to be an array, but received:', response.data);
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  //* client unapproved projects
  const fetchClientUnapprovedProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/all-client-projects`, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });
      if(response.data){
        const projects = response.data.projects;
        const tempUnapprovedProjects: ProjectInfo[] = [];

        projects.forEach((project:any) => {
          const { title, deadline,_id} = project; // Destructure needed properties
          const projectInfo: ProjectInfo= { id:_id , title, date:deadline.split("T")[0], status:"unapproved" }; // Construct an object with the needed properties
          tempUnapprovedProjects.push(projectInfo);
        });

        setUnapprovedClientProjects(tempUnapprovedProjects);
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  useEffect(() => {
    if(user && user.role === 'project manager'){
      fetchUnapprovedProjects();
    }else if(user!==null && user.role === 'freelancer'){
      fetchUnapprovedFreelancerProjects();
    }else if(user && user.role === 'client'){
      fetchClientUnapprovedProjects();
    }
    fetchprojectDetails();
  }, [user?._id]);

  return (
    <div className="flex flex-row justify-between">
      <div className="ml-4 flex-grow mt-10">
      <div className="flex flex-col">
        <span className="text-3xl font-bold	mb-6 text-center md:text-left">Dashboard</span>
        <div>
          <Tabs defaultValue="new" className="lg:w-[70rem]">
            <TabsList className="lg:space-x-32 border-b-0">
              <TabsTrigger value="new" className="text-[#565D6D]">All</TabsTrigger>
              <TabsTrigger value="progress" className="text-[#565D6D]">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="text-[#565D6D]">Completed</TabsTrigger>
              <TabsTrigger value="pending" className="text-[#565D6D]">New</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="text-[#565D6D]">
              <div className="-ml-8 -mt-8">
                  <DashboardProjectAll data={newProjects}/>
              </div>
            </TabsContent>
            <TabsContent value="progress" className="text-[#565D6D]">
              <div className="-ml-8 -mt-8">
                <DashboardProjectAll data={ongoingProjects}/>
              </div>
            </TabsContent>
            <TabsContent value="completed" className="text-[#565D6D]">
              <div className="-ml-8 -mt-8">
                <DashboardProjectAll data={completedProjects}/>
              </div>
            </TabsContent>
            <TabsContent value="pending" className="text-[#565D6D]">
              {
                user?.role === 'freelancer'?
                  <div className="-ml-8 -mt-8">
                    <DashboardProjectFreelancer data={pendingFreelancerProjects}/>
                  </div>
                :
                user?.role === 'client'? 
                  <div className="-ml-8 -mt-8">
                    <DashboardProjectAll data={unapprovedClientProjects}/>
                  </div>
                :
                <div className="-ml-8 -mt-8">
                  <DashboardProject data={unapprovedProjects}/>
                </div>
              }
            </TabsContent>

          </Tabs>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;