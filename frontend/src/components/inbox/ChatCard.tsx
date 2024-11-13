import { RootState } from '@/hooks/store';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';

interface ChatProps{
    chat: {
        _id: string;
        chatName: string;
        isGroupChat: boolean;
        latestMessage: {
            content: string;
            createdAt: string;
        }
    }
}


const ChatCard: React.FC<ChatProps> = ({chat}) => {
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const formatMessageTime = (timestamp: string) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    const getDisplayName = (chatName: string, currentUserName: string) => {
        const names = chatName.split(' <-> ');
        return names[0] === currentUserName ? names[1] : names[0];
    };

  return (
    <div className="h-[4.5rem] w-[20rem] items-center py-1 cursor-pointer">
        <h1 className="font-bold truncate ml-4 py-2">{chat.isGroupChat ? chat.chatName : getDisplayName(chat.chatName, currentUser?.name)}</h1>
        <div className="flex justify-between">
            <div className="w-[10rem] ml-4">
                <h1 className="text-[0.7rem] text-gray-600 truncate">
                    {chat.latestMessage?.content || 'No messages yet'}
                </h1>
            </div>
            <div className="w-[10rem] flex justify-end mr-4 text-[0.7rem]">
                {chat.latestMessage?.createdAt 
                ? formatMessageTime(chat.latestMessage.createdAt)
                : ''}
            </div>
        </div>
    </div>
  )
}

export default ChatCard;
