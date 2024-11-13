import React, { useState, useEffect } from 'react';
import { useMeeting } from "@videosdk.live/react-sdk";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ParticipantView } from './ParticipantView';
import { Controls } from './Controls';

interface MeetingViewProps {
  onMeetingLeave: () => void;
  meetingId: string;
}

export function MeetingView({ onMeetingLeave, meetingId }: MeetingViewProps) {
  const [joined, setJoined] = useState<string | null>(null);
  const { join, participants } = useMeeting({
    onMeetingJoined: () => setJoined("JOINED"),
    onMeetingLeft: () => onMeetingLeave(),
  });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [maximizedParticipant, setMaximizedParticipant] = useState<string | null>(null);

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  const participantCount = participants.size;

  useEffect(() => {
    if (participantCount > 0 && participantCount <= 5) {
      setSelectedParticipants(Array.from(participants.keys()));
    }
  }, [participants]);

  const handleParticipantSelection = (participantId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(participantId)) {
        return prev.filter((id) => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  const gridClassName = maximizedParticipant
    ? "grid-cols-1 grid-rows-1"
    : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr`;

  return (
    <div className="h-screen bg-gray-900 text-white">
      {joined === "JOINED" ? (
        <div className="relative h-full">
          <div className={`grid ${gridClassName} gap-4 p-4 h-[calc(100vh-80px)]`}>
            {(maximizedParticipant
              ? [maximizedParticipant]
              : selectedParticipants
            ).map((participantId) => (
              <ParticipantView
                key={participantId}
                participantId={participantId}
                isMaximized={participantId === maximizedParticipant}
              />
            ))}
          </div>
          <Controls />
          {participantCount > 5 && (
            <div className="absolute top-4 right-4">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm">
                    Select Participants
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="bg-gray-800 rounded-md p-2 shadow-lg">
                                      {Array.from(participants.keys()).map((participantId) => (
                                        <DropdownMenu.CheckboxItem
                                          key={participantId}
                                          checked={selectedParticipants.includes(participantId)}
                                          onCheckedChange={() => handleParticipantSelection(participantId)}
                                          className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                                        >
                                          {participants.get(participantId)?.displayName}
                                        </DropdownMenu.CheckboxItem>
                                      ))}
                                    </DropdownMenu.Content>
                                  </DropdownMenu.Portal>
                                </DropdownMenu.Root>
                              </div>
                            )}
                          </div>
                        ) : joined === "JOINING" ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-xl">Joining the meeting...</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <button
                              onClick={joinMeeting}
                              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Join Meeting
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }