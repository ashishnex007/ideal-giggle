import React, { useState } from 'react';
import { useMeeting } from "@videosdk.live/react-sdk";
import { Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, PhoneOff, Users, Clipboard, Check } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export function Controls() {
  const { toggleScreenShare, leave, toggleMic, toggleWebcam, meetingId } = useMeeting();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleScreenShare = () => {
    toggleScreenShare();
    setIsScreenSharing(!isScreenSharing);
  };

  const handleToggleMic = () => {
    toggleMic();
    setIsMicOn(!isMicOn);
  };

  const handleToggleWebcam = () => {
    toggleWebcam();
    setIsWebcamOn(!isWebcamOn);
  };

  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000); // Reset copied state after 1 second
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 bg-gray-900 bg-opacity-80">
      <div className="flex space-x-4">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleToggleMic}
                className={`p-3 rounded-full ${
                  isMicOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isMicOn ? (
                  <Mic className="text-white" size={24} />
                ) : (
                  <MicOff className="text-white" size={24} />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                {isMicOn ? "Mute" : "Unmute"}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleToggleWebcam}
                className={`p-3 rounded-full ${
                  isWebcamOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isWebcamOn ? (
                  <Video className="text-white" size={24} />
                ) : (
                  <VideoOff className="text-white" size={24} />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                {isWebcamOn ? "Stop Video" : "Start Video"}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleScreenShare}
                className={`p-3 rounded-full ${
                  isScreenSharing ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {isScreenSharing ? (
                  <ScreenShareOff className="text-white" size={24} />
                ) : (
                  <ScreenShare className="text-white" size={24} />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                {isScreenSharing ? "Stop Sharing" : "Share Screen"}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => leave()}
                className="p-3 rounded-full bg-red-500 hover:bg-red-600"
              >
                <PhoneOff className="text-white" size={24} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                Leave Meeting
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      <div className="absolute right-4 flex space-x-2">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm">
                <Users size={20} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                Meeting ID: {meetingId}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleCopyMeetingId}
                className={`p-2 rounded-md text-white text-sm ${
                  isCopied ? "bg-green-500" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {isCopied ? <Check size={20} /> : <Clipboard size={20} />}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                {isCopied ? "Copied!" : "Copy Meeting ID"}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </div>
  );
}
