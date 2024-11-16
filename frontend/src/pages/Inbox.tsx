import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';

import Chat from "@/components/inbox/Chat";
import Chats from "@/components/inbox/Chats";

import bg from "@/assets/photos/chat_bg.png";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BsThreeDots } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { Dialog as DialogComponent, DialogContent, DialogFooter, DialogHeader, DialogTitle as DialogTitleComponent, DialogTrigger, DialogDescription} from "@/components/ui/dialog";
import { Card, CardContent, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import Swal from 'sweetalert2';

interface Chat {
    _id: string;
    projectId: string;
    chatName: string;
    isGroupChat: boolean;
    groupAdmin: string;
    users: { _id: string; name: string; role: string }[];
}
interface User {
    _id: string;
    name: string;
    role: string;
}

const Inbox = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDetails, setShowDetails] = useState(false);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null); // * state for noting the selected chat
    const [users, setUsers] = useState<User[] | null>(null); // * state for noting the users in the selected chat
    const [allUsers, setAllUsers] = useState<User[] | null>(null); // * all users 
    const [groupAdmin, setGroupAdmin] = useState(null); // * state for noting the group admin
    let [isActionsOpen, setIsActionsOpen] = useState(false); // * state for toggling the actions dialog
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    let [deleteGroupModal, setDeleteGroupModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [searchUserToAdd, setSearchUserToAdd] = useState<string>(''); // * search user to add to the selected chat
    const [userToAdd, setUserToAdd] = useState<User | null>(null); // * select the user to add to the selected chat
    const [userToRemove, setUserToRemove] = useState<User | null>(null); // * select the user to delete from the selected chat

    // * complete project states
    const [showCompleteProject, setShowCompleteProject] = useState(false);
    const [projectBudget, setProjectBudget] = useState<number>(0);
    const [freelancersInfo, setFreelancersInfo] = useState<{ role: string; name: string; freelancerId: string }[]>([]);
    const [freelancerAmounts, setFreelancerAmounts] = useState<number[]>([]);
    
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(()=> {
        if(!token){
          navigate("/login");
        }
    }, [token]);

    useEffect(() => {
        // Check if selectedChat was passed through navigation state
        if (location.state && location.state.selectedChat) {
            console.log(location.state.selectedChat);
            setSelectedChat(location.state.selectedChat);
            // Optionally, set the current view to 'chat' if you want to display the chat immediately
            setCurrentView('chat');
        }
    }, [location.state]);
    
    // @ts-ignore
    const currentUser = useSelector((state: RootState) => state.auth.user._id);
    // @ts-ignore
    const currentUserRole = useSelector((state: RootState) => state.auth.user.role);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        if (selectedChat) {
            scrollToBottom();
        }
    }, [selectedChat]);

    const fetchChatDetails = useCallback(async(chatId: string) => {
        if(chatId){
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });
                // console.log(response.data);
                if(response.data.isGroupChat){
                    setGroupAdmin(response.data.groupAdmin._id);
                }
                setUsers(response.data.users);
                setSelectedChat(response.data);
                setShowDetails(false);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch chat details", error);
                setIsLoading(false);
            }
        }
    }, [token]);

    const fetchAllUsers = useCallback(async() => {
        if (isLoading || !selectedChat) return; // Don't fetch if still loading chat details or no selected chat

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/users`, {
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            });
            const filteredUsers = response.data.filter((user: User) => {
                return !selectedChat.users.some((chatUser) => chatUser._id === user._id);
            });
            // console.log("Filtered users:", filteredUsers);
            setAllUsers(filteredUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    }, [token, selectedChat, isLoading]);

    const addUserToGroup = async(userId: string) => {
        if(userId && selectedChat){
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/groupadd`, {
                    chatId: selectedChat._id,
                    userId: userId,
                }, {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });
                setIsAddUserDialogOpen(false);
                fetchChatDetails(selectedChat._id);
                setUserToAdd(null);
            } catch (error) {
                console.error("Failed to add user to group", error);
            }
        }
    };

    const removeUserFromGroup = async() => {
        if(userToRemove && selectedChat){
            try {
                // console.log(selectedChat._id);
                // console.log(userToRemove._id);
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/groupremove`, {
                    chatId: selectedChat._id,
                    userId: userToRemove._id,
                }, {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                });
                // console.log(response.data);
                fetchChatDetails(selectedChat._id);
            } catch (error) {
                console.error("Failed to remove user from group", error);
            }
        }
    };

    const deleteGroup = async() => {
        if(selectedChat){
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/chat/deletegroup/`, {
                    data: {
                        chatId: selectedChat._id
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                
            } catch (error) {
                console.error("Failed to delete group", error);
            }
        }
    };

    const handleCompleteProject = async() => {

        // * check if the total amount equals the project budget before proceeding
        const totalAmount = freelancerAmounts.reduce((acc, amount) => acc + amount, 0);
        console.log(freelancersInfo);
        console.log(totalAmount);
        if (totalAmount !== projectBudget) {
            alert(`The total amount must equal the project budget of ${projectBudget}.`);
            return;
        }

        console.log(selectedChat);
        // * get the project details

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/get-project/${selectedChat?.projectId}`);
        // console.log(res.data.project);        

        if(selectedChat){
            try {

                // * add the credits to the freelancers
                await Promise.all(
                    freelancersInfo.map(async (freelancer, index) => {
                      const amount = freelancerAmounts[index];
                      const freelancerPayment = await axios.post(`${import.meta.env.VITE_API_URL}/api/credits/addCredits`, {
                        numCredits: amount,
                        userId: freelancer.freelancerId,
                        role: 'freelancer', // Assuming the role is freelancer
                      });
                    //   console.log(freelancerPayment);
                    })
                );

                // * remove the credits from the client
                const removeCredits = await axios.post(`${import.meta.env.VITE_API_URL}/api/credits/removeCredits`, {
                    numCredits: projectBudget,
                    userId: res.data.project.client
                });
        
                // console.log(removeCredits.data);

                // * mark the project as completed
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/complete`, {
                    projectId: selectedChat.projectId,
                });

                if (response.status === 200) {
                    Swal.fire({
                      icon: "success",
                      title: `Project marked as completed successfully`,
                      text: `The project has been marked as completed and the freelancers have been paid.`,
                    }).then(() => {
                        window.location.reload();
                    });
                }
            
                // console.log(response);
            } catch (error: any) {
                if (error.response && error.response.status === 400) {
                    Swal.fire({
                        icon: "error",
                        title: "Project already completed",
                        text: "This project is already marked as completed and cannot be marked again.",
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Failed to complete project",
                        text: "An error occurred while trying to complete the project. Please try again later.",
                    });
                }
                console.error("Failed to complete project", error);
            }
        };
    };

    const handleShowDetails = async() => {
        setShowDetails(true);
        setCurrentView('details');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/project/get-project/${selectedChat?.projectId}`);
        // console.log(res.data);
        // console.log(res.data.project.status);

        if(res.data.project.status === 'completed') {
            setShowCompleteProject(false);
        }else{
            setShowCompleteProject(true);
        }

        const freelancers = res.data.project.freelancers;
        // console.log(freelancers);

        const freelancersData = await Promise.all(
        freelancers.map(async (freelancer: any) => {
            const freelancerData = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/user/${freelancer.freelancer}`);
            // console.log(freelancerData.data);
            // console.log(freelancer);
                return {
                    role: freelancer.role,
                    name: freelancerData.data.name,
                    freelancerId: freelancer.freelancer // * user _id of the freelancer
                };
            })
        );

        setFreelancersInfo(freelancersData);
        setProjectBudget(res.data.project.budget);
        setFreelancerAmounts(new Array(freelancersData.length).fill(0));
        // console.log(freelancersData);
    };

    const handleAmountChange = (index: number, value: number) => {
        const newAmounts = [...freelancerAmounts];
        newAmounts[index] = value;
        setFreelancerAmounts(newAmounts);
    };

    useEffect(() => {
        if (!isLoading && selectedChat) {
            fetchAllUsers();
        }
    }, [fetchAllUsers, isLoading, selectedChat]);

     // New state to manage views
    const [currentView, setCurrentView] = useState<'chats' | 'chat' | 'details'>('chats');

    // Handlers for navigation
    const handleSelectChat = (chatId: string) => {
        fetchChatDetails(chatId);
        setCurrentView('chat');
    };

    const handleBackToChats = () => {
        setCurrentView('chats');
        setSelectedChat(null);
    };

    const handleBackToChat = () => {
        setCurrentView('chat');
    };

  return (
    <div className="flex h-screen pt-12 md:pt-0">

    {/* {// * shows the list of the chats} */}

    {/* Chats List */}
      {(currentView === 'chats' || window.innerWidth >= 768) && (
        <div className={`${currentView === 'chat' && 'hidden md:block'} w-full md:w-[20rem]`}>
          {/* Back button for mobile */}
          {currentView !== 'chats' && window.innerWidth < 768 && (
            <Button onClick={handleBackToChats} className="m-4">
              Back
            </Button>
          )}
          <Chats onSelectChat={handleSelectChat} />
        </div>
      )}

    {/* {// * shows the selected chat} */}

    {/* Chat Window */}
    {(currentView === 'chat' || window.innerWidth >= 768) && selectedChat && (
        <div className={`flex-grow w-screen relative ${currentView !== 'chat' && 'hidden md:block'}`}>
          {/* Back button for mobile */}
          {currentView === 'details' && window.innerWidth < 768 && (
            <Button onClick={handleBackToChat} className="absolute top-4 left-4 z-10">
              Back
            </Button>
          )}
          {/* Background image */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.2,
            }}
          ></div>
          <div className="relative z-10 h-full overflow-auto">
            <svg className="absolute z-20 top-[10px] left-[10px] md:hidden" onClick={handleBackToChats} width="25" height="30" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <Chat
              onToggleDetails={handleShowDetails}
              selectedChat={selectedChat}
              scrollToBottom={scrollToBottom}
            />
          </div>
        </div>
    )}

    {/* // * {delete group modal} */}
    {<Dialog open={deleteGroupModal} as="div" className="relative z-10 focus:outline-none" onClose={()=> setDeleteGroupModal(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>

            <div className="flex min-h-full items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0" >
                    <DialogTitle as="h3" className="text-base/7 font-medium text-black"> Are you sure? </DialogTitle>
                    <p className="mt-2 text-sm/6 text-black"> Do you want to delete this group?</p>
                    <p className="mt-2 text-sm/6 text-black"> This will permanently delete every chat and media from the database</p>
                    <div className="mt-4 flex gap-x-4">
                        <Button variant="destructive" onClick={()=> {deleteGroup(); setDeleteGroupModal(false);}}>Delete Group</Button>
                        <Button onClick={()=> setDeleteGroupModal(false)}>Cancel</Button>
                    </div>
                </DialogPanel>
            </div>
        </div>
    </Dialog>}

    {/* {// * shows the details of the chat} */}
    {/* {// * details show up only for group chats} */}
    {selectedChat?.isGroupChat && showDetails && (
        (
            <div className={`h-screen w-full md:w-[20rem] ${currentView !== 'details' && 'hidden md:block'}`}>

                <div className="flex justify-between items-center bg-slate-50 h-16 md:w-[20rem] border-b-2 border-l-2 border-slate-300">
                    <h1 className="font-bold mx-4">Group Details</h1>
                    <RxCross1 className="w-[1.5rem] h-[1.5rem] mx-2 cursor-pointer" onClick={() => {setShowDetails(false); setCurrentView('chat')}} />
                </div>

                <div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="p-2">
                            <AccordionTrigger className="font-bold">Members</AccordionTrigger>
                            <AccordionContent>
                                <ScrollArea className="h-[20rem] py-2 pr-2">
                                    <div className="flex flex-col gap-y-4">
                                        {
                                            users && users.map((user: User) => 
                                                <div key={user._id} className="flex items-center justify-between gap-x-2">
                                                    <h1>
                                                        {
                                                            user._id === currentUser ? user.name :
                                                            ((currentUserRole === "freelancer" || currentUserRole === "client") 
                                                            ? 
                                                            (user.role === "freelancer" ? "Freelancer" : user.role === "client" ? "Client" : user.name)
                                                            :
                                                            user.name
                                                        )}
                                                    </h1>
                                                    <div className="flex">
                                                        <Badge className="flex justify-center">{user.role}</Badge>
                                                        {   
                                                            groupAdmin && 
                                                            groupAdmin === user._id &&
                                                            <Badge className="flex justify-center bg-red-500">Group Admin</Badge>
                                                        }
                                                        {   
                                                            currentUser === user._id &&
                                                            <Badge className="flex justify-center bg-green-400">You</Badge>
                                                        }
                                                        <div className="ml-2">
                                                            {
                                                                currentUser === groupAdmin && currentUser !== user._id &&
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button>
                                                                            <BsThreeDots className="w-[1.5rem] h-[1.5rem] cursor-pointer" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent className="w-56">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuGroup>
                                                                            <DropdownMenuItem onClick={() => { setIsActionsOpen(true); setUserToRemove(user); }}>
                                                                                <button>Remove </button>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuGroup>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            }
                                                        </div>
                                                        { // * remove user dialog
                                                            <Dialog open={isActionsOpen} as="div" className="relative z-10 focus:outline-none" onClose={()=> setIsActionsOpen(false)}>
                                                                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>

                                                                    <div className="flex min-h-full items-center justify-center p-4">
                                                                        <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0" >
                                                                        <DialogTitle as="h3" className="text-base/7 font-medium text-black"> Are you sure? </DialogTitle>
                                                                        <p className="mt-2 text-sm/6 text-black"> Do you want to remove {userToRemove?.name} from this group?</p>
                                                                        <div className="mt-4 flex gap-x-4">
                                                                            <Button variant="destructive" onClick={()=> {removeUserFromGroup(); setIsActionsOpen(false); }}>Remove</Button>
                                                                            <Button onClick={()=> {setIsActionsOpen(false)}}>Cancel</Button>
                                                                        </div>
                                                                        </DialogPanel>
                                                                    </div>
                                                                </div>
                                                            </Dialog>
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </ScrollArea>
                                
                                {/* // * add users */}
                                <div className="flex flex-col gap-y-4">
                                    {
                                        currentUser === groupAdmin &&
                                        <DialogComponent open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button onClick={() => setIsAddUserDialogOpen(true)}>Add +</Button>
                                            </DialogTrigger>
                                            <DialogContent className="w-[40rem]">
                                                <DialogHeader>
                                                    <DialogTitleComponent>Add members to {selectedChat?.chatName}</DialogTitleComponent>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="flex gap-x-4 w-[28rem] items-center">
                                                        <Input
                                                            className="col-span-3"
                                                            placeholder="search users"
                                                            value={searchUserToAdd}
                                                            onChange={(e)=> setSearchUserToAdd(e.target.value)}
                                                        />
                                                        <RxCross1 className="cursor-pointer" onClick={()=> setSearchUserToAdd('')} />
                                                    </div>
                                                    <div className="flex w-[28rem] justify-center">
                                                        <ScrollArea className="h-72 w-[28rem] rounded-md border">
                                                            {
                                                                selectedChat && allUsers && 
                                                                allUsers
                                                                .filter(user => user.name.toLowerCase().includes(searchUserToAdd.toLowerCase()))
                                                                .map((user: User) => (
                                                                    <Card className={`h-[4rem] flex items-center ${userToAdd?._id == user._id  ? "bg-slate-300" : ""}`} key={user._id} onClick={()=> {setUserToAdd(user)}}>
                                                                        <CardContent className="flex w-full justify-between">
                                                                            <p>{user.name}</p>
                                                                            <Badge variant="outline">{user.role}</Badge>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))
                                                            }
                                                        </ScrollArea>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    {
                                                        userToAdd && 
                                                        <Button type="submit" onClick={()=> {addUserToGroup(userToAdd._id)}}>Add user</Button>
                                                    }
                                                </DialogFooter>
                                            </DialogContent>
                                        </DialogComponent>
                                    }
                                    {/* // * mark project as completed */}
                                    {
                                        // * show this only if project is not completed 
                                        currentUser === groupAdmin && selectedChat && showCompleteProject && 
                                        <DialogComponent>
                                        <DialogTrigger>
                                            <Button className="w-full text-white bg-green-500 hover:text-black hover:bg-green-600">Complete Project</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                            <DialogTitleComponent>Do you want to mark this project as completed?</DialogTitleComponent>
                                            <DialogDescription className="py-4">
                                                <h1 className="font-bold text-lg text-black">
                                                    Project budget is {projectBudget}
                                                </h1>
                                                <h1>Split the project bdget among the freelancers</h1>
                                                <ScrollArea className="max-h-[40rem] py-4">
                                                    {freelancersInfo.map((freelancer: any, index: any) => (
                                                        <div key={index} className="flex items-center justify-between text-black">
                                                            <h1>{freelancer.name}</h1>
                                                            <div className="flex gap-x-2">
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Enter amount"
                                                                    value={freelancerAmounts[index]}
                                                                    onChange={(e) => handleAmountChange(index, parseFloat(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                                This will mark the project as completed, perform this action only if everything is done.
                                            </DialogDescription>
                                            <div className="w-full py-4">
                                                <Button className="w-full" variant="destructive" onClick={handleCompleteProject}>Mark as completed</Button>
                                            </div>
                                            </DialogHeader>
                                        </DialogContent>
                                        </DialogComponent>
                                    }
                                    {
                                        // * show this only if project is completed 
                                        currentUser === groupAdmin && selectedChat && !showCompleteProject && 
                                        <div className="flex justify-center">
                                            <Badge variant="outline" className="text-black p-4 w-full bg-green-400 text-center">Project Completed</Badge>
                                        </div>
                                    }
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        {/*<AccordionItem value="item-2" className="p-2">
                            <AccordionTrigger className="font-bold">Media</AccordionTrigger>
                            <AccordionContent>
                                <Tabs defaultValue="All" className="w-[20rem] p-2">
                                    <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="All">All</TabsTrigger>
                                    <TabsTrigger value="Docs">Docs</TabsTrigger>
                                    <TabsTrigger value="Photos">Photos</TabsTrigger>
                                    <TabsTrigger value="Videos">Videos</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </AccordionContent>
                        </AccordionItem>*/}
                    </Accordion>
                    <div>
                        {
                            currentUser === groupAdmin &&
                            <Button className="my-4" variant="destructive" onClick={()=> setDeleteGroupModal(true)}>Delete Group</Button>
                        }
                    </div>
                </div>
            </div>
        )
    )}
    </div>
  )
}

export default Inbox
