import React, { useEffect, useMemo, useRef } from 'react';
import { useParticipant } from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import { MicOff, VideoOff } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";

interface ParticipantViewProps {
  participantId: string;
  isMaximized: boolean;
}

export function ParticipantView({ participantId, isMaximized }: ParticipantViewProps) {
  const micRef = useRef<HTMLAudioElement>(null);
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
    screenShareStream,
    screenShareOn,
  } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  const screenShareVideoStream = useMemo(() => {
    if (screenShareOn && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      return mediaStream;
    }
  }, [screenShareStream, screenShareOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) => console.error("micRef.current.play() failed", error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  const videoClassName = isMaximized
    ? "w-full h-full object-cover"
    : "w-full h-full object-cover rounded-lg";

  return (
    <div
      className={`relative ${
        isMaximized ? "col-span-full row-span-full" : "col-span-1"
      }`}
    >
      <audio ref={micRef} autoPlay muted={isLocal} />
      {webcamOn && videoStream ? (
        <ReactPlayer
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={videoStream}
          width="100%"
          height="100%"
          onError={(err) => {
            console.log(err, "participant video error");
          }}
          className={videoClassName}
        />
      ) : (
        <div className={`bg-gray-800 ${videoClassName} flex items-center justify-center`}>
          <Avatar.Root className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-600">
            <Avatar.Fallback className="text-white text-2xl font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        </div>
      )}
      {screenShareOn && (
        <ReactPlayer
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={screenShareVideoStream}
          width="300%"
          height="100%"
          onError={(err) => {
            console.log(err, "screen share video error");
          }}
          className="absolute inset-0 z-10"
        />
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
        {displayName} {isLocal && "(You)"}
      </div>
      <div className="absolute top-2 right-2 flex space-x-2">
        {!micOn && (
          <div className="bg-red-500 rounded-full p-1">
            <MicOff size={16} className="text-white" />
          </div>
        )}
        {!webcamOn && (
          <div className="bg-red-500 rounded-full p-1">
            <VideoOff size={16} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}