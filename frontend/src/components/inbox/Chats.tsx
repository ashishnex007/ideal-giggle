import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import { useSelector  } from "react-redux";
import { RootState } from "@/hooks/store";

import fetchChats from "@/services/fetchChats";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import ChatCard from "./ChatCard";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Dialog as DialogComponent, DialogContent, DialogHeader, DialogTitle as DialogTitleComponent, DialogTrigger, } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { RxCross1 } from "react-icons/rx";
import { Search } from "lucide-react";

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  latestMessage: {
    content: string;
    createdAt: string;
  };
  users: string[];
}

interface User {
  _id: string;
  name: string;
  role: string;
}

interface ChatsProps{
  onSelectChat: (chatId: string) => void;
}

interface ChatParams {
  userId: string; // Assuming userId is a string
  name: string;
}

const Chats: React.FC<ChatsProps> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>();
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [showButton, setShowButton] = useState<boolean>(true);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [searchUserToAdd, setSearchUserToAdd] = useState<string>(''); 
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  // console.log(currentUser);

  // * filters

  const directChats = () => {
    let subChats = allChats.filter(ch => ch.isGroupChat === false);
    setShowButton(true);
    setChats(subChats);
  }

  const groupChats = () => {
    let subChats = allChats.filter(ch => ch.isGroupChat === true);
    setShowButton(false);
    setChats(subChats);
  }

  const showAllChats = () => {
    setShowButton(true);
    setChats(allChats); 
  };

  const getChats = useCallback(async () => {
    try {
      if(token){
        const fetchedChats = await fetchChats(token);
        setChats(fetchedChats);
        setAllChats(fetchedChats);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed fetching chats", error);
      setIsLoading(false);
    }
  }, [token]);

  const fetchAllUsers = useCallback(async () => {
    if (isLoading || !currentUser) return; // Don't fetch if still loading chats or no current user

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/users`, {
        headers:{
          Authorization: `Bearer ${token}`,
        }
      });

      // Get all user IDs that the current user already has a 1:1 chat with
      const existingChatUserIds = new Set(
        chats
          .filter(chat => !chat.isGroupChat && chat.users.length === 2)
          .flatMap(chat => chat.users)
          .filter(user => user._id !== currentUser._id)
          .map(user => user._id)
      );

      // Filter out users who are already in 1:1 chats with the current user
      const filteredUsers = response.data.filter((user: User) => 
        user._id !== currentUser._id && !existingChatUserIds.has(user._id)
      );

      setAllUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  }, [chats, currentUser, token, isLoading]);

  const createNewChat = async({userId, name}: ChatParams) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, {
        userId: userId,
        chatName: name,
      }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
      });
      getChats();
      setSelectedChat(response.data._id);
      onSelectChat(response.data._id);
    } catch (error) {
      console.error("Failed to create a direct chat", error);
    }
  };
  
  useEffect(()=> {
    getChats();
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      fetchAllUsers();
    }
  }, [fetchAllUsers, isLoading]);

  useEffect(()=> {
    if(searchQuery){
      setChats(allChats.filter(chat => chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())));
    }
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <Tabs defaultValue="All" className="md:w-[20rem] p-2 flex justify-center">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="All" onClick={showAllChats}>All</TabsTrigger>
            <TabsTrigger value="Direct" onClick={directChats}>Direct</TabsTrigger>
            <TabsTrigger value="Group" onClick={groupChats}>Group</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
        </div>
        
      </div>
      <ScrollArea>
        {
          showButton &&  
          <div className="w-full p-2">
            <DialogComponent open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
              <DialogTrigger asChild>
                  <Button onClick={() => setIsNewChatDialogOpen(true)} className="w-full rounded-3xl">New chat +</Button>
              </DialogTrigger>
              <DialogContent className="md:w-[40rem] max-w-[90vw]">
                <DialogHeader>
                    <DialogTitleComponent>Add new Direct chat</DialogTitleComponent>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex gap-x-4 md:w-[28rem] max-w-[90vw] items-center">
                        <Input
                            className="col-span-3 w-[17rem]"
                            placeholder="search users"
                            value={searchUserToAdd}
                            onChange={(e)=> setSearchUserToAdd(e.target.value)}
                          />
                        <RxCross1 className="cursor-pointer" onClick={()=> setSearchUserToAdd('')} />
                    </div>
                    <div className="flex md:w-[28rem] max-w-[90vw] justify-center">
                        <ScrollArea className="h-72 md:w-[28rem] w-[20rem] rounded-md border">
                            {
                              allUsers && 
                                allUsers
                                .filter(user => user.name.toLowerCase().includes(searchUserToAdd.toLowerCase()))
                                .map((user: User) => (
                                    <Card className={`h-[4rem] flex items-center`}>
                                        <CardContent className="flex w-full justify-between items-center">
                                            <p>{user.name}</p>
                                            <div className="flex items-center">
                                              <Badge variant="outline">{user.role}</Badge>
                                              <Button className="bg-ccDarkBlue" onClick={() => {const chatName = `${user.name} <-> ${currentUser.name}` ;  createNewChat({userId: user._id, name: chatName}); setIsNewChatDialogOpen(false);}}>Chat</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </ScrollArea>
                    </div>
                </div>
              </DialogContent>
            </DialogComponent>
          </div>
        }
        {chats.map((chat) => (
          <div key={chat._id} className={`rounded-2xl ${selectedChat === chat._id ? "bg-blue-200" : ""}`} onClick={() => {onSelectChat(chat._id); setSelectedChat(chat._id);}}>
            <ChatCard chat={chat} />
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

export default Chats;
