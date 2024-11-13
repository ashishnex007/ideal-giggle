import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/hooks/store';

import { MeetingProvider, MeetingConsumer } from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./API";
import { JoinScreen } from './JoinScreen';
import { MeetingView } from './MeetingView';
import { useNavigate } from 'react-router-dom';

export default function VideoCall() {
  const navigate = useNavigate();
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(()=> {
        if(!token){
          navigate("/login");
        }
    }, [token]);
  
  const [meetingId, setMeetingId] = useState<string | null>(null);

  const getMeetingAndToken = async (id?: string) => {
    const meetingId = id || await createMeeting({ token: authToken });
    setMeetingId(meetingId);
  };

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Participant",
        debugMode: false,
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}