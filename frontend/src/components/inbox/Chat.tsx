import { useCallback, useEffect, useRef, useState } from "react";

import axios from "axios";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';

import chatFallback from "@/assets/vectors/undraw_select.svg";

import { RiAttachment2 } from "react-icons/ri";
import { TbPhoto } from "react-icons/tb";
import { IoSend } from "react-icons/io5";
import { AiOutlineVideoCamera } from "react-icons/ai";
import { BiSearchAlt } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// socket io
import io from "socket.io-client";

type ChatProps = {
  onToggleDetails: () => void;
  selectedChat: any;
  scrollToBottom: () => void;
};

type Message = {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  status: string;
  createdAt: string;
}

const ENDPOINT = `${import.meta.env.VITE_API_URL}`;
let socket: any;

const Chat: React.FC<ChatProps> = ({onToggleDetails, selectedChat, scrollToBottom}) => {
  const [messages, setMessages] = useState<Message[]>([]); // * to populate the messages in chat
  const [message, setMessage] = useState(''); // * to send the message
  const [socketConnected, setSocketConnected] = useState(false);

  const [searchInchat, setSearchInchat] = useState(''); // * to search in chat
  const [chatSearchResults, setChatSearchResults] = useState([]); // * to store the search result

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const loggedInUserId = useSelector((state: RootState) => state.auth.user?._id);

  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(()=> {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    if(selectedChat) {
      try {
        // console.log(selectedChat);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/message/fetch/${selectedChat._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setMessages(response.data);
        // console.log(response.data);
        socket.emit("join chat", selectedChat._id);
        scrollToBottom();
      } catch (error) {
        console.error(error);
      }
    }
  }, [selectedChat, token, scrollToBottom]);

  useEffect(()=> {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connection", ()=> {
      setSocketConnected(true);
    });
  }, []);

  useEffect(() => {
    const handleNewMessage = (newMessageReceived: any) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        return;
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket.on("message received", handleNewMessage);
  }, [selectedChat]);

  const isMessageValid = (msg: string): boolean => {
    return msg.trim().length > 0;
  };

  const sendMessage = async() => {
    if(selectedChat._id && message){
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/message/`, {
          chatId: selectedChat._id,
          content: message.trim(), // Trim the message before sending
        }, {
          headers:{
            Authorization: `Bearer ${token}`,
          }
        });
        socket.emit("new message", {...response.data, chat: selectedChat});
        setMessages([...messages, response.data]);
        setMessage('');
      } catch (error) {
        console.error(error);
      }
    }
  }

  function autoResizeTextarea(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.target;
    const maxHeight = 160; // 10rem in pixels, assuming 1rem = 16px
    textarea.style.height = '2rem'; // Reset height to initial to properly calculate new scroll height
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevents the default action of inserting a new line
      sendMessage();
    }
  };

  const searchMessage = async() => {
    if(searchInchat){
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/message/search/${selectedChat._id}/${searchInchat}`);
      setChatSearchResults(response.data);
      // console.log(response.data);
    }
  };

  useEffect(()=> {
    searchMessage();
  }, [searchInchat]);

  // Helper function to format date and time
  const formatDateAndTime = (isoString: string) => {
    const messageDate = new Date(isoString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    // Format time in HH:MM 24hrs format
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    if (isToday) {
      // If the message is from today, return only the time
      return time;
    }else if (isYesterday) {
      // If the message is from yesterday, return "Yesterday" and the time
      return `Yesterday ${time}`;
    } else {
      // If the message is from a previous day, return the date and time
      const year = messageDate.getFullYear();
      const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
      const day = messageDate.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${time}`;
    }
  };

  const getChatName = (chatName: string, currentUserName: string) => {
    const names = chatName.split(' <-> ');
    return names[0] === currentUserName ? names[1] : names[0];
  };

  if (!selectedChat) {
    return (
      <div className="flex flex-col h-full justify-center items-center bg-slate-50">
        <h1 className="text-2xl font-bold text-ccSecondary">Select a chat to see messages</h1>
        <img src={chatFallback} className="w-[40rem] mt-[5rem]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-full">
      {/* {top section} */}
      <div className="flex-shrink-0 flex justify-between bg-slate-50 h-16 border-b-2 border-slate-300">
        <div className="flex items-center">
          <div className="md:w-[20rem] px-4">
            <h1 className="font-bold ml-10 md:ml-0">{selectedChat.isGroupChat ? selectedChat?.chatName : getChatName(selectedChat.chatName, user?.name)}</h1>
            {
              selectedChat?.isGroupChat
              ? <h1 className="text-[0.7rem] ml-10 md:ml-0 text-ccSecondary">{selectedChat ? `${selectedChat.users.length} participants` : '0 participants'}</h1>
              : 
              <Badge className="ml-10 md:ml-0">
                {
                  selectedChat?.users.find((user: any) => user._id !== loggedInUserId)?.role
                }
              </Badge>
            }
          </div>
        </div>
        <div className="flex items-center">
          <AiOutlineVideoCamera onClick={()=> {window.open("/calls", "_blank")}} className="w-[1.5rem] h-[1.5rem] mx-2 cursor-pointer" />
          {/* <IoCallOutline className="w-[1.5rem] h-[1.5rem] mx-2 cursor-pointer" /> */}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline"><BiSearchAlt className="w-[1.5rem] h-[1.5rem] mx-2 cursor-pointer" /></Button>
            </PopoverTrigger>
            <PopoverContent className="md:w-[30rem] w-[20rem] max-h-[24rem]">
              <Input placeholder="Search in chat" value={searchInchat} onChange={(e)=> setSearchInchat(e.target.value)} />
              <ScrollArea className="h-[20rem]">
                {
                  chatSearchResults &&
                  chatSearchResults.map((result: any) => (
                    <div key={result._id} className="p-2 border-b-2 border-slate-300">
                      <h1>{result.content.length > 40 ? `${result.content.substring(0, 40)}...` : result.content}</h1>
                      <div className="flex justify-between">                    
                        <h1>{formatDateAndTime(result.createdAt)}</h1>
                      </div>
                    </div>
                  ))
                }
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {
            selectedChat.isGroupChat &&
            <BsThreeDotsVertical
              className="w-[1.5rem] h-[1.5rem] mx-2 cursor-pointer"
              onClick={onToggleDetails}
            />
          }
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-grow h-[calc(100vh-200px)]">
        <div className="p-4">
          {selectedChat && messages.map((message) => (
            <div key={message._id} className={`flex flex-col ${message.sender._id === loggedInUserId ? 'items-end' : 'items-start'} mb-4`}>
              <div className={`p-2 rounded-xl md:max-w-[40rem] max-w-[20rem] break-words ${message.sender._id === loggedInUserId ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>
                {message.status === "pending"
                  ? <p className="whitespace-pre-wrap text-red-500">Message yet to be approved</p>
                  : <p className="whitespace-pre-wrap">{message.content}</p>
                }
              </div>
              <div className="flex gap-x-2 mt-1">
                {
                  user?.role === "freelancer" || user?.role === "client" ? (
                    message.sender.role === "project manager" || message.sender?.role === "admin" ? (
                      <span className="text-xs text-gray-500">{message.sender.name}</span>
                    ) : (
                      user?._id === message.sender._id ? (
                        <span className="text-xs text-gray-500">You</span>
                      ) : (
                        <span className="text-xs text-gray-500">{message.sender?.role === "freelancer" ? "Freelancer" : "Client"}</span>
                      )
                    )
                  ) : (
                    user?._id === message.sender._id ? (
                      <span className="text-xs text-gray-500">You</span>
                    ) : (
                      <span className="text-xs text-gray-500">{message.sender.name}</span>
                    )
                  )
                }
                <span className="text-xs text-gray-500">{formatDateAndTime(message.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* {bottom section} */}
      <div className="flex-shrink-0 flex items-center p-2 bg-slate-200 border-t-2 border-slate-300">
        {/* <RiAttachment2 className="w-[1.5rem] h-[1.5rem] mx-2 cursor-pointer" />
        <TbPhoto className="w-[1.5rem] h-[1.5rem] mx-2 cursor-pointer" /> */}
        <textarea
          className="resize-none overflow-y-auto h-[2rem] md:max-h-[10rem] max-h-[7rem] w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ccDarkBlue"
          placeholder="Enter your message"
          onInput={autoResizeTextarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IoSend className={`w-[1.75rem] h-[1.75rem] mx-2 cursor-pointer ${isMessageValid(message) ? "text-ccDarkBlue": "text-ccSecondary disabled"}`} onClick={sendMessage} />
      </div>
    </div>
  )
}

export default Chat;
