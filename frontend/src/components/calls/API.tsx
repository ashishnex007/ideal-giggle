export const authToken: string = import.meta.env.VITE_AUTH_TOKEN;

export const createMeeting = async ({ token }: {token: string}) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const { roomId }: {roomId: string} = await res.json();
  return roomId;
};