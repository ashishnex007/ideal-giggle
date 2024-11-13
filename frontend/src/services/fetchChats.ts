import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/chat`;

// interface Chat {
//     _id: string;
//     chatName: string;
//     isGroupChat: boolean;
//     latestMessage: {
//         content: string;
//     }
// }

const fetchChats = async(token: string) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(`${API_URL}`, config);
    // console.log(response);
    // console.log(response.data);
    return response.data;
}

export default fetchChats;