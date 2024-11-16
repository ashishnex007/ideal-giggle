import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Copy, Video, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JoinScreenProps {
  getMeetingAndToken: (meetingId?: string) => void;
}

const MotionDiv = motion.div;

export function JoinScreen({ getMeetingAndToken }: JoinScreenProps) {
  const [meetingId, setMeetingId] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  const handleJoinClick = () => {
    if (!meetingId.trim()) {
      toast.error('Please enter a valid Meeting ID.');
      return;
    }
    getMeetingAndToken(meetingId);
  };

  const handleCreateClick = () => {
    setMeetingId('');
    getMeetingAndToken();
    toast.success('New meeting created!');
  };

  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setHasCopied(true);
    toast.success('Meeting ID copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-300 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center py-10">
      <Toaster position="top-right" />
      <div className="container max-w-2xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 w-full"
        >
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-center text-blue-500">
              Creator Copilot
            </h1>
            <p className="text-lg text-center text-gray-700 dark:text-gray-200">
              Seamlessly join or create a meeting to collaborate
            </p>
            <div className="flex flex-col items-center justify-center w-full relative py-5">
              <div className="flex flex-row space-x-4 w-full">
                <Input
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="Enter Meeting ID"
                  className="flex-grow"
                />
                <Button
                  onClick={handleCopyMeetingId}
                  disabled={!meetingId}
                  variant={hasCopied ? "outline" : "default"}
                  size="icon"
                >
                  <Copy className={hasCopied ? "text-green-500" : ""} />
                </Button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row w-full justify-center mt-4 space-y-4 md:space-y-0 md:space-x-4">
              <Button
                onClick={handleJoinClick}
                className="flex-1 w-full md:w-auto"
              >
                <Video className="mr-2 h-4 w-4" /> Join Meeting
              </Button>
              <Button
                onClick={handleCreateClick}
                variant="secondary"
                className="flex-1 w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Meeting
              </Button>
            </div>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}