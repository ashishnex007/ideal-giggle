import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { IoMdArrowBack } from "react-icons/io";

const sendersList = [
  { value: "client", label: "All Clients" },
  { value: "freelancer", label: "All freelancers"},
  { value: "project manager", label: "All Project Manager"},
];

const NewNotification = () => {
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedSendersList, setSelectedSendersList] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(!token){
      navigate("/login");
    }
    if(user?.role !== "admin"){
      navigate("/notifications");
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedSendersList.length === 0) {
      setValidationError('Please select at least one user.');
      return;
    }
    setValidationError(null);
    const title = titleRef.current?.value || '';
    const description = descriptionRef.current?.value || '';

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          target: selectedSendersList,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const data = await response.json();
      console.log('Notification sent:', data);
      navigate("/notifications");
    } catch (error) {
      console.error('Error sending notification:', error);
      setValidationError('Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col ml-4">
      <div className="py-4 md:py-2" />
      <div className="flex items-center gap-x-8">
        <Button className="w-[3rem]" onClick={() => {navigate("/notifications")}}>
          <IoMdArrowBack />
        </Button>
        <span className="text-4xl font-bold mt-10 mb-10">New Notification</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <div>
            <Label className="text-xl font-bold">Title</Label>
            <Input className="w-[90vw] border-2" minLength={5} ref={titleRef} required/>
          </div>
          <div>
            <Label className="text-xl font-bold">Description</Label>
            <Textarea className="w-[90vw] border-2" minLength={10} ref={descriptionRef} required/>
          </div>
          <div>
            <div className="flex items-center">
                <p className="text-xl font-bold whitespace-nowrap mr-2">Send to</p>
                <MultiSelect
                  options={sendersList}
                  onValueChange={setSelectedSendersList}
                  defaultValue={selectedSendersList}
                  placeholder="Select Users"
                  variant="inverted"
                  maxCount={3}
                  className="w-30 border-2"
                />
            </div>
            <div>
              {validationError && <p className="text-red-500">{validationError}</p>}
            </div>
          </div>
         
          <Button className="hover:bg-blue-500 bg-blue-600" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewNotification;