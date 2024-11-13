import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import Swal from 'sweetalert2';

import { useSelector } from "react-redux";
import { RootState } from "@/hooks/store";

import UserProfileView from "@/components/UserProfileView";

import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import PaginationComponent from "@/components/AdminPagination";

// import { GrDocumentText } from "react-icons/gr";
import { ArrowUpDown } from "lucide-react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from '@/components/ui/use-toast';
import RateCardTable from "@/components/RateCardTable";
import { useNavigate } from "react-router-dom";

interface User {
    _id: string;
    UID: string;
    name: string;
    email: string;
    role: string;
    active_projects: any[];
    total_projects: number;
    verificationToken: string;
    resetToken: string | null;
    verified: boolean;
    adminVerified: boolean;
    isSuspended: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

const roleList = [
    { value: "client", label: "All Clients" },
    { value: "freelancer", label: "All freelancers"},
    { value: "project manager", label: "All Project Manager"},
];

// PM Zod Schema
const projectManagerSchema = z.object({
    UID: z.string().min(3, { message: "UID must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    name: z.string().min(1, { message: "Name is required" }),
    phoneNumber: z
    .string()
    .regex(/^\d+$/, { message: "Phone number must contain only digits" })
    .min(8, { message: "Phone number must be at least 8 digits long" }),
    address: z.string().min(1, { message: "Address is required" }),
    languages: z.array(z.string()).min(1, { message: "At least one language is required" }),
    domains: z.array(z.string()).min(1, { message: "At least one domain is required" }),
});

const AdminDashboard = () => {

    const navigate = useNavigate();

    // const cards = [
    //     {
    //         title: "Lifetime Records",
    //         value: 90,
    //         color: "#3799E5",
    //         icon: <GrDocumentText className="text-white w-6 h-6" />,
    //         bgColor: "#EFF7FC",
    //         border: "#65B2ED"
    //     },
    //     {
    //         title: "Projects this month",
    //         value: 90,
    //         color: "#3799E5",
    //         icon: <GrDocumentText className="text-white w-6 h-6" />,
    //         bgColor: "#EFF7FC",
    //         border: "#65B2ED"
    //     },
    //     {
    //         title: "Projects this week",
    //         value: 90,
    //         color: "#3799E5",
    //         icon: <GrDocumentText className="text-white w-6 h-6" />,
    //         bgColor: "#EFF7FC",
    //         border: "#65B2ED"
    //     },
    //     {
    //         title: "Lifetime Sales",
    //         value: 90,
    //         color: "#3799E5",
    //         icon: <GrDocumentText className="text-white w-6 h-6" />,
    //         bgColor: "#EFF7FC",
    //         border: "#65B2ED"
    //     },
    //     {
    //         title: "Sales this month",
    //         value: 90,
    //         color: "#3799E5",
    //         icon: <GrDocumentText className="text-white w-6 h-6" />,
    //         bgColor: "#EFF7FC",
    //         border: "#65B2ED"
    //     },
    //     {
    //         title: "Sales this week",
    //         value: 90,
    //         color: "#3799E5",
    //         icon: <GrDocumentText className="text-white w-6 h-6" />,
    //         bgColor: "#EFF7FC",
    //         border: "#65B2ED"
    //     },
    // ];

    const token = useSelector((state: RootState) => state.auth.token);

    // Utility function to format the date
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // * states

    // * freelancers
    const [allFreelancers, setAllFreelancers] = useState<User[]>([]);
    const [newFreelancers, setNewFreelancers] = useState<User[]>([]); // * admin unverified freelancers
    
    const [newFreelancersPage, setNewFreelancersPage] = useState(1);
    const [allFreelancersPage, setAllFreelancersPage] = useState(1);

    const [freelancerSearchTerm, setFreelancerSearchTerm] = useState("");
    const [freelancerSortConfig, setFreelancerSortConfig] = useState({ key: "", direction: "" });
    
    const itemsPerPage = 10; // * global items per page

    const handleFreelancerSort = (key: any) => {
        let direction = "ascending";
        if (freelancerSortConfig.key === key && freelancerSortConfig.direction === "ascending") {
          direction = "descending";
        }
        setFreelancerSortConfig({ key, direction });
    };
    
    const sortedFreelancers = (freelancers: any) => {
        if (!freelancerSortConfig.key) return freelancers;
        return [...freelancers].sort((a, b) => {
            if (a[freelancerSortConfig.key] < b[freelancerSortConfig.key]) {
            return freelancerSortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[freelancerSortConfig.key] > b[freelancerSortConfig.key]) {
            return freelancerSortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    };
    
    const filteredNewFreelancers = sortedFreelancers(newFreelancers).filter(
        (freelancer: any) =>
            freelancer.name.toLowerCase().includes(freelancerSearchTerm.toLowerCase()) ||
            freelancer.email.toLowerCase().includes(freelancerSearchTerm.toLowerCase())
    );
    
    const filteredAllFreelancers = sortedFreelancers(allFreelancers).filter(
        (freelancer: any) =>
            freelancer.name.toLowerCase().includes(freelancerSearchTerm.toLowerCase()) ||
            freelancer.email.toLowerCase().includes(freelancerSearchTerm.toLowerCase())
    );
    
    const paginatedNewFreelancers = filteredNewFreelancers.slice(
        (newFreelancersPage - 1) * itemsPerPage,
        newFreelancersPage * itemsPerPage
    );

    const paginatedAllFreelancers = filteredAllFreelancers.slice(
        (allFreelancersPage - 1) * itemsPerPage,
        allFreelancersPage * itemsPerPage
    );
    
    const renderSortIcon = (key: any) => {
        if (freelancerSortConfig.key === key) {
            return <ArrowUpDown className={`ml-2 h-4 w-4 inline ${freelancerSortConfig.direction === "ascending" ? "transform rotate-180" : ""}`} />;
        }
        return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />;
    };

    // * clients
    const [allClients, setAllClients] = useState<User[]>([]);
    const [newClients, setNewClients] = useState<User[]>([]); // * admin unverified clients
    
    const [newClientsPage, setNewClientsPage] = useState(1);
    const [allClientsPage, setAllClientsPage] = useState(1);
    
    const [clientSearchTerm, setClientSearchTerm] = useState("");
    const [clientSortConfig, setClientSortConfig] = useState({ key: "", direction: "" });

    const handleClientSort = (key: any) => {
        let direction = "ascending";
        if (clientSortConfig.key === key && clientSortConfig.direction === "ascending") {
            direction = "descending";
        }
        setClientSortConfig({ key, direction });
    };

    const sortedClients = (clients: any) => {
        if (!clientSortConfig.key) return clients;
        return [...clients].sort((a, b) => {
            if (a[clientSortConfig.key] < b[clientSortConfig.key]) {
                return clientSortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[clientSortConfig.key] > b[clientSortConfig.key]) {
                return clientSortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    };

    const filteredNewClients = sortedClients(newClients).filter(
        (client: any) =>
            client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

    const filteredAllClients = sortedClients(allClients).filter(
        (client: any) =>
            client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

    const paginatedNewClients = filteredNewClients.slice(
        (newClientsPage - 1) * itemsPerPage,
        newClientsPage * itemsPerPage
    );

    const paginatedAllClients = filteredAllClients.slice(
        (allClientsPage - 1) * itemsPerPage,
        allClientsPage * itemsPerPage
    );

    // * project managers
    const [allPms, setAllPms] = useState<User[]>([]);
    const [allPmsPage, setAllPmsPage] = useState(1);

    const [pmSearchTerm, setPmSearchTerm] = useState("");
    const [pmSortConfig, setPmSortConfig] = useState({ key: "", direction: "" });
    
    const handlePmSort = (key: keyof User) => {
        let direction = "ascending";
        if (pmSortConfig.key === key && pmSortConfig.direction === "ascending") {
          direction = "descending";
        }
        setPmSortConfig({ key, direction });
    };
    
    const sortedPms = (pms: User[]) => {
    if (!pmSortConfig.key) return pms;
    return [...pms].sort((a, b) => {
        if (a[pmSortConfig.key] < b[pmSortConfig.key]) {
        return pmSortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[pmSortConfig.key] > b[pmSortConfig.key]) {
        return pmSortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
    });
    };

    const filteredPms = sortedPms(allPms).filter(
    (pm) =>
        pm.name.toLowerCase().includes(pmSearchTerm.toLowerCase()) ||
        pm.email.toLowerCase().includes(pmSearchTerm.toLowerCase())
    );

    const paginatedAllPms = filteredPms.slice(
    (allPmsPage - 1) * itemsPerPage,
    allPmsPage * itemsPerPage
    );    

    const getPendingUsers = async() => {
        const response = await axios.get<User[]>(`${import.meta.env.VITE_API_URL}/api/users/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        // console.log(response);
  
        const freelancers: User[] = [];
        const newFreelancers: User[] = [];

        const clients: User[] = [];
        const newClients: User[] = [];

        response.data.forEach((item) => {
            if (item.role === "freelancer") {
                freelancers.push(item);
                if(!item.adminVerified) {
                    newFreelancers.push(item);
                }
            } else if (item.role === "client") {
                clients.push(item);
                if(!item.adminVerified) {
                    newClients.push(item);
                }
            }
        });

        const pms = response.data.filter(item => item.role === "project manager");
    
        setAllFreelancers(freelancers);
        setNewFreelancers(newFreelancers);
        setAllClients(clients);
        setNewClients(newClients);
        setAllPms(pms);
    };

    useEffect(() => {
        getPendingUsers();
    }, []);

    useEffect(()=> {
        if(!token){
          navigate("/login");
        }
    }, [token]);

    // * new PM 
    const [pmForm, setPmForm] = useState({
        UID: "",
        email: "",
        password: "",
        name: "",
        phoneNumber: "",
        address: "",
        languages: "",
        domains: "",
    });
    
    const [pmErrors, setPmErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPmForm((prev) => ({ ...prev, [id]: value }));
    };

    const handleCreateNewPM = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
            // Validate the form data
            const validData = projectManagerSchema.parse({
            ...pmForm,
            languages: pmForm.languages.split(",").map((lang) => lang.trim()),
            domains: pmForm.domains.split(",").map((domain) => domain.trim()),
            });

            console.log(validData);
    
             // Submit to backend API using axios
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/admin/createProjectManager`,
                validData,
                {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                }
            ).then(() => {
                window.location.reload();
            });
    
            // console.log(response);

            setPmForm({
                UID: "",
                email: "",
                password: "",
                name: "",
                phoneNumber: "",
                address: "",
                languages: "",
                domains: "",
            });
            getPendingUsers();
        } catch (error: any) {
          if (error instanceof z.ZodError) {
            // Display Zod validation errors
            const fieldErrors: { [key: string]: string } = {};
            error.errors.forEach((err) => {
              fieldErrors[err.path[0]] = err.message;
            });
            setPmErrors(fieldErrors);
          } else {
            alert(error.message);
          }
        }
      };

    // * controllers

    const approveUser = async(userId: string) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/admin/approveUser`,
                {userId},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // console.log(response.data);
            getPendingUsers();
        } catch (error: any) {
            throw new Error(error.response.data.message);
        }
    };
    
    const suspendUser = async(userId: string) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/admin/suspendUser`,
                {userId},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // console.log(response.data);
            getPendingUsers();
        } catch (error: any) {
            throw new Error(error.response.data.message);
        }
    };

    const resumeUser = async(userId: string) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/admin/resumeUser`,
                {userId},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // console.log(response.data);
            getPendingUsers();
        } catch (error: any) {
            throw new Error(error.response.data.message);
        }
    };

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

    const [clientDetails, setClientDetails] = useState({});
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedManagerType, setSelectedManagerType] = useState('');
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  
    // * client ops
    const fetchClientDetails = async () => {
        const details = {};
        for (const client of allClients) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/client/${client._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                details[client._id] = response.data;
            } catch (error) {
                console.error(`Error fetching details for client ${client._id}:`, error);
                details[client._id] = null;
            }
        }
        setClientDetails(details);
    };

    const getManagerName = (clientId: string, index: number): string => {
        const client = clientDetails[clientId];
        if (!client || !client.manager || !client.manager[index]) {
            return "Not set";
        }
        const managerId = client.manager[index];
        const manager = allPms.find(pm => pm._id === managerId._id);
        return manager ? manager.name : "Unknown";
    };

    const handleAssignOrUpdateManager = async () => {
        if (!selectedClient || !selectedManagerType || !selectedManagerId) {
          toast({ title: "Error", description: "Please select all required fields", variant: "destructive" });
          return;
        }
    
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/updateManager`, 
                {
                    clientId: selectedClient._id,
                    managerObj: selectedManagerId,
                    type: selectedManagerType
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                toast({ title: "Success", description: response.data.message });
                Swal.fire({
                    title: "Success",
                    text:  `Successfully assigned/updated manager for ${selectedClient?.name}`,
                    icon: "success"
                });
                fetchClientDetails(); // Refresh client details
                setIsDialogOpen(false);
            }
        } catch (error: any) {
            console.error('Error assigning/updating manager:', error);
            Swal.fire({
                title: "Error",
                text:  error.response?.data?.message || "Failed to assign/update manager",
                icon: "error"
            });
        }
    };  
      
    const openManagerDialog = (client: any, type: string) => {
        setSelectedClient(client);
        setSelectedManagerType(type);
        setSelectedManagerId('');
        setIsDialogOpen(true);
    };

    useEffect(() => {
        if (allClients.length > 0) {
            fetchClientDetails();
        }
    }, [allClients]);

    //download data
    const [selectedRolesList, setSelectedRolesList] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

    const downloadInfo = async() => {
        console.log(selectedRolesList);
        setMessage(null);
        if (selectedRolesList.length < 1) {
          setMessage("Please select a role");
          setMessageType("error");
          return;
        }
        try {
          const response = await axios.post(
              'http://localhost:8000/api/users/download-info',
              { roles: selectedRolesList.join(',') },
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
                  responseType: 'blob', // Important for handling binary data
              }
          );
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'data.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.log("Error downloading the file",error)
            setMessage("Error downloading the file");
            setMessageType("error");
        }
    };

  return (
    <div>
        <h1 className="text-3xl text-center font-bold py-5">Admin Dashboard</h1>
        <div>
            <Tabs defaultValue="sales" className="w-full">

                <TabsList className="lg:space-x-40 border-b-0 w-full flex py-4 md:justify-center">
                    <TabsTrigger value="sales" className="text-[#565D6D] w-[3rem] md:w-auto">Misc.</TabsTrigger>
                    <TabsTrigger value="clients" className="text-[#565D6D] w-[4rem] md:w-auto">Clients</TabsTrigger>
                    <TabsTrigger value="freelancers" className="text-[#565D6D] w-[6rem] md:w-auto">Freelancers</TabsTrigger>
                    <TabsTrigger value="pms" className="text-[#565D6D] w-[10rem] md:w-auto">Project Managers</TabsTrigger>
                </TabsList>

                {/* // * sales */}
                <TabsContent value="sales">
                    {/* <div className="flex w-full justify-evenly py-2">
                        <div className="grid grid-cols-3 gap-x-40 gap-y-8">
                            {cards.map((card, index) => (
                                <Card className="flex flex-row justify-between w-[17rem] h-[9rem] border-[1px] border-[#65B2ED] bg-[#EFF7FC] rounded-xl">
                                    <div className="flex flex-col ml-3.5 mt-5" >
                                        <span className="font-medium text-xl text-[#313642]">{card.title}</span>
                                        <span className="font-bold text-[#3799E5] text-3xl mt-4">{card.value}</span>
                                    </div>
                                    <div className="flex items-center justify-center bg-[#3799E5] w-[3rem] h-[3rem] rounded-xl m-3.5">
                                        {card.icon}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div> */}
                    <RateCardTable />

                    {/* download user data */}
                    <div className="p-4">
                        <p className="font-medium">Select users to download their profile information</p>
                        <MultiSelect
                            options={roleList}
                            onValueChange={setSelectedRolesList}
                            defaultValue={selectedRolesList}
                            placeholder="Select Users"
                            variant="inverted"
                            maxCount={3}
                            className="w-30 border-2 mb-2"
                        />
                        <Button className="" onClick={downloadInfo}>Download data.csv</Button>
                        {message && (
                        <div className="flex mt-2">
                            <p
                            className={`${
                                messageType === "success"
                                ? "text-green-500"
                                : "text-red-500"
                            } font-bold`}
                            >
                            {message}
                            </p>
                        </div>
                        )}
                    </div>
                </TabsContent>
                
                {/* // * clients */}
                <TabsContent value="clients" className="text-[#565D6D]">
                    <Tabs defaultValue="new_clients" className="w-full flex-grow">
                        <TabsList className="lg:space-x-40 space-x-12 border-b-0 w-full flex py-4 justify-center">
                            <TabsTrigger value="new_clients" className="text-[#565D6D]">New</TabsTrigger>
                            <TabsTrigger value="client_pairs" className="text-[#565D6D]">Pairs</TabsTrigger>
                            <TabsTrigger value="all_clients" className="text-[#565D6D]">All Clients</TabsTrigger>
                        </TabsList>

                        <div className="mb-4 px-12">
                            <Input
                                placeholder="Search client name or email"
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                            />
                        </div>

                        <TabsContent value="new_clients" className="text-[#565D6D]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleClientSort("name")}>
                                            Name {renderSortIcon("name")}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleClientSort("email")}>
                                            Email {renderSortIcon("email")}
                                        </TableHead>
                                        <TableHead className="w-[13rem] text-center cursor-pointer" onClick={() => handleClientSort("createdAt")}>
                                            Date of application {renderSortIcon("createdAt")}
                                        </TableHead>
                                        <TableHead className="text-center w-[24rem]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedNewClients.map((client: any) => (
                                        <TableRow key={client._id}>
                                            <TableCell className="font-medium text-center">{client.name}</TableCell>
                                            <TableCell className="font-medium text-center">{client.email}</TableCell>
                                            <TableCell className="font-medium text-center">{formatDate(client.createdAt)}</TableCell>
                                            <TableCell className="flex justify-evenly">
                                                <Button className="bg-green-500 hover:bg-green-600" onClick={() => approveUser(client._id)}>Approve</Button>
                                                <Button className="bg-red-500 hover:bg-red-600">Reject</Button>
                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => viewProfile(client._id)}>View Profile</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                        <DialogTitle>Profile Details</DialogTitle>
                                                        <DialogDescription>
                                                            {profileData 
                                                                &&
                                                                profileData.user.role === "client"
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <PaginationComponent
                                currentPage={newClientsPage}
                                totalPages={Math.ceil(newClients.length / itemsPerPage)}
                                onPageChange={setNewClientsPage}
                            />
                        </TabsContent>

                        <TabsContent value="client_pairs" className="text-[#565D6D]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="flex w-full justify-around">
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleClientSort("name")}>
                                            Name {renderSortIcon("name")}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Primary Manager
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Secondary Manager
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedAllClients.map((client: any) => (
                                        <TableRow key={client._id} className="flex w-full justify-around">
                                            <TableCell className="font-medium text-center">{client.name}</TableCell>
                                            {/* // *primary manager */}
                                            <TableCell className="font-medium text-center flex items-center gap-x-4 w-[20rem]">
                                                <Input 
                                                    value={getManagerName(client._id, 0)}
                                                    readOnly
                                                />
                                                <Button onClick={() => openManagerDialog(client, 'primary')}>
                                                    <Pencil1Icon className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                            {/* // *secondary manager */}
                                            <TableCell className="font-medium text-center flex items-center gap-x-4 w-[20rem]">
                                                <Input 
                                                    value={getManagerName(client._id, 1)}
                                                    readOnly
                                                />
                                                <Button onClick={() => openManagerDialog(client, 'secondary')}>
                                                    <Pencil1Icon className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                    Assign/Update {selectedManagerType === 'primary' ? 'Primary' : 'Secondary'} Manager
                                    </DialogTitle>
                                    <DialogDescription>
                                    Select a manager for {selectedClient?.name}
                                    </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                    {allPms.map((pm) => (
                                    <Button
                                        key={pm._id}
                                        onClick={() => {setSelectedManagerId(pm);}}
                                        className={`w-full justify-start mb-2 ${selectedManagerId === pm._id ? 'bg-primary text-primary-foreground' : ''}`}
                                    >
                                        {pm.name}
                                    </Button>
                                    ))}
                                </ScrollArea>
                                <DialogFooter>
                                    <Button onClick={handleAssignOrUpdateManager}>Assign/Update Manager</Button>
                                </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <PaginationComponent
                                currentPage={allClientsPage}
                                totalPages={Math.ceil(allClients.length / itemsPerPage)}
                                onPageChange={setAllClientsPage}
                            />
                        </TabsContent>

                        <TabsContent value="all_clients" className="text-[#565D6D]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleClientSort("name")}>
                                            Name {renderSortIcon("name")}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleClientSort("email")}>
                                            Email {renderSortIcon("email")}
                                        </TableHead>
                                        <TableHead className="text-center w-[10rem] cursor-pointer" onClick={() => handleClientSort("total_projects")}>
                                            Total Projects {renderSortIcon("total_projects")}
                                        </TableHead>
                                        <TableHead className="w-[12rem] text-center cursor-pointer" onClick={() => handleClientSort("active_projects")}>
                                            Active Projects {renderSortIcon("active_projects")}
                                        </TableHead>
                                        <TableHead className="w-[10rem] text-center">Status</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedAllClients.map((client: any) => (
                                        <TableRow key={client._id}>
                                            <TableCell className="font-medium text-center">{client.name}</TableCell>
                                            <TableCell className="font-medium text-center">{client.email}</TableCell>
                                            <TableCell className="font-medium text-center">{client.total_projects}</TableCell>
                                            <TableCell className="font-medium text-center">{client.active_projects.length}</TableCell>
                                            <TableCell className="font-medium text-center">
                                                {client.adminVerified ? client.isSuspended ? <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge> : <Badge className="bg-green-500 hover:bg-green-600">Verfied</Badge> : <Badge>Unverified</Badge>}
                                            </TableCell>
                                            <TableCell className="flex justify-evenly">
                                                {
                                                    client.isSuspended
                                                    ? <Button className="bg-green-500 hover:bg-green-600" onClick={()=> resumeUser(client._id)}>Resume</Button>
                                                    : <Button className="bg-red-500 hover:bg-red-600" onClick={()=> suspendUser(client._id)}>Suspend</Button>
                                                }
                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => viewProfile(client._id)}>View Profile</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                        <DialogTitle>Profile Details</DialogTitle>
                                                        <DialogDescription>
                                                            {profileData && 
                                                            profileData.user.role === "client" && 
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <PaginationComponent
                                currentPage={allClientsPage}
                                totalPages={Math.ceil(allClients.length / itemsPerPage)}
                                onPageChange={setAllClientsPage}
                            />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
                                    
                {/* // * freelancers */}
                <TabsContent value="freelancers" className="text-[#565D6D]">
                    <Tabs defaultValue="new_freelancers">
                        <TabsList className="space-x-40 border-b-0 w-full py-4 justify-center">
                            <TabsTrigger value="new_freelancers" className="text-[#565D6D]">New</TabsTrigger>
                            <TabsTrigger value="all_freelancers" className="text-[#565D6D]">All Freelancers</TabsTrigger>
                        </TabsList>

                        <div className="mb-4 px-12">
                            <Input
                                placeholder="Search freelancer name or email"
                                value={freelancerSearchTerm}
                                onChange={(e) => setFreelancerSearchTerm(e.target.value)}
                            />
                        </div>

                        <TabsContent value="new_freelancers" className="text-[#565D6D]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleFreelancerSort("name")}>
                                            Name {renderSortIcon("name")}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleFreelancerSort("email")}>
                                            Email {renderSortIcon("email")}
                                        </TableHead>
                                        <TableHead className="w-[13rem] text-center cursor-pointer" onClick={() => handleFreelancerSort("createdAt")}>
                                            Date of application {renderSortIcon("createdAt")}
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedNewFreelancers.map((freelancer: any) => (
                                        <TableRow key={freelancer._id}>
                                            <TableCell className="font-medium text-center">{freelancer.name}</TableCell>
                                            <TableCell className="font-medium text-center">{freelancer.email}</TableCell>
                                            <TableCell className="font-medium text-center">{formatDate(freelancer.createdAt)}</TableCell>
                                            <TableCell className="flex justify-evenly">
                                                <Button className="bg-green-500 hover:bg-green-600" onClick={() => approveUser(freelancer._id)}>Approve</Button>
                                                <Button className="bg-red-500 hover:bg-red-600">Reject</Button>
                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => viewProfile(freelancer._id)}>View Profile</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                        <DialogTitle>Profile Details</DialogTitle>
                                                        <DialogDescription>
                                                            {profileData && 
                                                            profileData.user.role === "freelancer" &&
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <PaginationComponent
                                currentPage={newFreelancersPage}
                                totalPages={Math.ceil(newFreelancers.length / itemsPerPage)}
                                onPageChange={setNewFreelancersPage}
                            />
                        </TabsContent>
                        <TabsContent value="all_freelancers" className="text-[#565D6D]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleFreelancerSort("name")}>
                                            Name {renderSortIcon("name")}
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleFreelancerSort("email")}>
                                            Email {renderSortIcon("email")}
                                        </TableHead>
                                        <TableHead className="text-center w-[10rem] cursor-pointer" onClick={() => handleFreelancerSort("total_projects")}>
                                            Total Projects {renderSortIcon("total_projects")}
                                        </TableHead>
                                        <TableHead className="w-[12rem] text-center cursor-pointer" onClick={() => handleFreelancerSort("active_projects")}>
                                            Active Projects {renderSortIcon("active_projects")}
                                        </TableHead>
                                        <TableHead className="w-[10rem] text-center">Status</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedAllFreelancers.map((freelancer: any) => (
                                        <TableRow key={freelancer._id}>
                                            <TableCell className="font-medium text-center">{freelancer.name}</TableCell>
                                            <TableCell className="font-medium text-center">{freelancer.email}</TableCell>
                                            <TableCell className="font-medium text-center">{freelancer.total_projects}</TableCell>
                                            <TableCell className="font-medium text-center">{freelancer.active_projects.length}</TableCell>
                                            <TableCell className="font-medium text-center">
                                                {freelancer.adminVerified ? freelancer.isSuspended ? <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge> :<Badge className="bg-green-500 hover:bg-green-600">Verfied</Badge> : <Badge>Unverified</Badge>}
                                            </TableCell>
                                            <TableCell className="flex justify-evenly">
                                                {
                                                    freelancer.isSuspended
                                                    ? <Button className="bg-green-500 hover:bg-green-600" onClick={()=> resumeUser(freelancer._id)}>Resume</Button>
                                                    : <Button className="bg-red-500 hover:bg-red-600" onClick={()=> suspendUser(freelancer._id)}>Suspend</Button>
                                                }
                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => viewProfile(freelancer._id)}>View Profile</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                        <DialogTitle>Profile Details</DialogTitle>
                                                        <DialogDescription>
                                                            {profileData && 
                                                            profileData.user.role === "freelancer" &&
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>    
                            <PaginationComponent
                                currentPage={allFreelancersPage}
                                totalPages={Math.ceil(allFreelancers.length / itemsPerPage)}
                                onPageChange={setAllFreelancersPage}
                            />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
                                        
                {/* // * project managers */}
                <TabsContent value="pms" className="text-[#565D6D]">
                    <div>
                        <Tabs defaultValue="all_pms">
                            <TabsList className="space-x-40 border-b-0 w-full py-4 justify-center">
                                <TabsTrigger value="all_pms" className="text-[#565D6D]">All PMs</TabsTrigger>
                            </TabsList>

                            <div className="mb-4 px-12 flex gap-x-12">
                                <Input
                                    placeholder="Search PM name or email"
                                    value={pmSearchTerm}
                                    onChange={(e) => setPmSearchTerm(e.target.value)}
                                />
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-ccDarkBlue hover:bg-blue-700">Create new PM +</Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[50rem]">
                                        <DialogHeader>
                                            <DialogTitle>Create New Project Manager</DialogTitle>
                                            <DialogDescription>
                                                Enter details of the project manager you want to create
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form className="grid gap-4 py-4" onSubmit={handleCreateNewPM}>
                                            {Object.keys(pmErrors).length > 0 && (
                                                <div className="text-red-600">Please fix the errors before submitting.</div>
                                            )}
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="UID" className="text-right">
                                                    Username
                                                </Label>
                                                <Input
                                                id="UID"
                                                value={pmForm.UID}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.UID && <p className="text-red-500">{pmErrors.UID}</p>}
                                            </div>

                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="email" className="text-right">
                                                Email
                                                </Label>
                                                <Input
                                                id="email"
                                                value={pmForm.email}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.email && <p className="text-red-500">{pmErrors.email}</p>}
                                            </div>

                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="password" className="text-right">
                                                Password
                                                </Label>
                                                <Input
                                                id="password"
                                                type="password"
                                                value={pmForm.password}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.password && <p className="text-red-500">{pmErrors.password}</p>}
                                            </div>

                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                Name
                                                </Label>
                                                <Input
                                                id="name"
                                                value={pmForm.name}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.name && <p className="text-red-500">{pmErrors.name}</p>}
                                            </div>

                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="phoneNumber" className="text-right">
                                                Phone Number
                                                </Label>
                                                <Input
                                                id="phoneNumber"
                                                value={pmForm.phoneNumber}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.phoneNumber && <p className="text-red-500">{pmErrors.phoneNumber}</p>}
                                            </div>

                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="address" className="text-right">
                                                Address
                                                </Label>
                                                <Input
                                                id="address"
                                                value={pmForm.address}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.address && <p className="text-red-500">{pmErrors.address}</p>}
                                            </div>

                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="languages" className="text-right">
                                                Languages (comma-separated)
                                                </Label>
                                                <Input
                                                id="languages"
                                                value={pmForm.languages}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.languages && <p className="text-red-500">{pmErrors.languages}</p>}
                                            </div>

                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="domains" className="text-right">
                                                Domains (comma-separated)
                                                </Label>
                                                <Input
                                                id="domains"
                                                value={pmForm.domains}
                                                onChange={handleInputChange}
                                                className="col-span-3"
                                                />
                                                {pmErrors.domains && <p className="text-red-500">{pmErrors.domains}</p>}
                                            </div>
                                            <Button type="submit">Create Project Manager</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <TabsContent value="all_pms" className="text-[#565D6D]">
                                <div className="w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                            <TableHead className="text-center cursor-pointer" onClick={() => handlePmSort("name")}>
                                                Name {renderSortIcon("name")}
                                            </TableHead>
                                            <TableHead className="text-center cursor-pointer" onClick={() => handlePmSort("email")}>
                                                Email {renderSortIcon("email")}
                                            </TableHead>
                                            <TableHead className="text-center w-[10rem] cursor-pointer" onClick={() => handlePmSort("total_projects")}>
                                                Total Projects {renderSortIcon("total_projects")}
                                            </TableHead>
                                            <TableHead className="w-[12rem] text-center cursor-pointer" onClick={() => handlePmSort("active_projects")}>
                                                Active Projects {renderSortIcon("active_projects")}
                                            </TableHead>
                                            <TableHead className="w-[10rem] text-center">Status</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedAllPms.map((pm) => (
                                                <TableRow key={pm._id}>
                                                    <TableCell className="font-medium text-center">{pm.name}</TableCell>
                                                    <TableCell className="font-medium text-center">{pm.email}</TableCell>
                                                    <TableCell className="font-medium text-center">{pm.total_projects}</TableCell>
                                                    <TableCell className="font-medium text-center">{pm.active_projects.length}</TableCell>
                                                    <TableCell className="font-medium text-center">
                                                    {pm.adminVerified ? pm.isSuspended ? <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge> : <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge> : <Badge>Unverified</Badge>}
                                                    </TableCell>
                                                    <TableCell className="flex justify-evenly">
                                                        {
                                                            pm.isSuspended
                                                            ? <Button className="bg-green-500 hover:bg-green-600" onClick={()=> resumeUser(pm._id)}>Resume</Button>
                                                            : <Button className="bg-red-500 hover:bg-red-600" onClick={()=> suspendUser(pm._id)}>Suspend</Button>
                                                        }
                                                        <Dialog>
                                                    <DialogTrigger>
                                                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={()=> viewProfile(pm._id)}>View Profile</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                        <DialogTitle>Profile Details</DialogTitle>
                                                        <DialogDescription>
                                                            {profileData && 
                                                            profileData.user.role === "project manager" && 
                                                            (
                                                                <UserProfileView 
                                                                    user={profileData.user} 
                                                                    details={profileData.projectManager[0]} 
                                                                />
                                                            )}
                                                        </DialogDescription>
                                                        </DialogHeader>
                                                    </DialogContent>
                                                </Dialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <PaginationComponent
                                        currentPage={allPmsPage}
                                        totalPages={Math.ceil(filteredPms.length / itemsPerPage)}
                                        onPageChange={setAllPmsPage}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    </div>
  )
}

export default AdminDashboard;