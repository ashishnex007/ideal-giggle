import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RootState } from '@/hooks/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationItem from '../components/NotificationItem';

interface Notification {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

const Notifications = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchNotifications();
        }
    }, [token, user]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            setError('Failed to load notifications. Please try again.');
            console.error('Error fetching notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <h1 className="text-3xl text-center md:text-[3rem] p-4 font-bold ">Notifications</h1>
            <div className="w-full md:w-auto md:absolute md:top-[1rem] md:right-[1rem]">
                {user?.role === "admin" && (
                    <div className="flex justify-center">
                        <Button className="w-[80vw] md:w-auto" onClick={() => navigate("./new")}>New Notification +</Button>
                    </div>
                )}
            </div>
            <ScrollArea className="w-full h-full p-4">
                {isLoading && <p>Loading notifications...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && notifications.length === 0 && (
                    <p>No notifications available.</p>
                )}
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification._id}
                        title={notification.title}
                        description={notification.description}
                        createdAt={notification.createdAt}
                    />
                ))}
            </ScrollArea>
        </div>
    );
};

export default Notifications;