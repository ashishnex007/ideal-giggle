import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import { RootState } from "@/hooks/store";

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiCirclesFour } from "react-icons/pi";
import { BiTime } from "react-icons/bi";
import { IoMdCheckmark, IoMdInformationCircle } from "react-icons/io";
import PaymentsDisplay from "@/components/PaymentsDisplayTable/PaymentsDisplay";
import { FaPlus } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";

const PaymentDashboard = () => {
  const navigate = useNavigate();
  const[ credits, setCredits ] = useState(0);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  // console.log(currentUser);
  useEffect(()=> {
    if(!token){
      navigate("/login");
    }
  }, [token]);

  const getFreelancerDetails = async() => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/freelancer/${currentUser?._id}`);
    if(response.data){
        setCredits(response.data.credits);
    }
  }

  const getClientDetails = async() => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/client/${currentUser?._id}`);
      // console.log(response.data);
      if(response.data){
          setCredits(response.data.credits);
      }
  }

  const handleSupport = async() => {
    const name = `${import.meta.env.VITE_ADMIN_NAME} <-> ${currentUser?.name}`;
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, {
        userId: import.meta.env.VITE_ADMIN_ID,
        chatName: name,
      }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
      });
      console.log(response.data);
      navigate('/inbox', { state: { selectedChat: response.data } });
    } catch (error) {
      console.error("Failed to create a direct chat", error);
    }
  };

  useEffect(()=> {
    if(currentUser?.role === "freelancer"){
        getFreelancerDetails();
    } else if(currentUser?.role === "client"){
        getClientDetails();
    }
  }, [currentUser]);

  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="ml-4 flex-grow mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <span className="text-3xl md:text-4xl font-bold">Payments</span>
    
          <div className="flex mt-4 md:mt-0 px-4 md:px-8 gap-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <IoMdInformationCircle />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Payment Notice</AlertDialogTitle>
                  <AlertDialogDescription>
                    <ul className="list-disc pl-5">
                      <li>
                        In all payments, an 18% GST will be explicitly charged as per government regulation. 
                      </li>
                      <li>
                        <Badge className="bg-green-200 text-green-500 hover:bg-green-200 hover:text-green-500">credit</Badge> indicates the amount credited to your Creator Copilot account.                     
                      </li>
                      <li>
                        <Badge className="bg-[#f4e2bc] text-[#c29c50] hover:bg-green-200 hover:text-green-500">debit</Badge> indicates the amount debited from your Creator Copilot account.                     
                      </li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Got it</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              className="bg-[#d3e4fd] hover:bg-[#cfd6e0] rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
              variant="outline"
              onClick={handleSupport}
            >
              <p className="text-[#216DD1]">Support</p>
            </Button>
            {currentUser?.role === "client" && (
              <Button
                className="bg-[#fdd3d3] hover:bg-[#e0cfcf] rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                variant="outline"
                onClick={() => navigate("./add-credits")}
              >
                <FaPlus className="w-5 h-5 text-[#d12121]" />
                <p className="text-[#d12121]">Add Credits</p>
              </Button>
            )}
          </div>
        </div>
    
        <div className="flex flex-wrap w-full space-y-6 md:space-y-0 md:space-x-6 mt-8 justify-evenly">

          {/* Credit Balance */}
          <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#6092ff] bg-[#eff4ff] rounded-l">
            <div className="flex flex-col space-y-2 mt-3 ml-3">
              <span className="font-normal text-[#313642]">Credit Balance</span>
              <span className="font-bold flex items-center text-3xl m-0 p-0 text-[#313642]">
                <FaRupeeSign /> {credits}
              </span>
            </div>
          </Card>

          {/* Lifetime Records Card */}
          {/* <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#216DD1] bg-[#F2F6FC] rounded-l">
            <div className="flex flex-col space-y-2 mt-3 ml-3">
              <span className="font-normal text-[#313642]">Lifetime Records</span>
              <span className="font-bold flex text-3xl m-0 p-0 text-[#313642]">
                <FaRupeeSign />
              </span>
              <div className="w-[5rem] border-[1px] border-[#317de0] rounded-full flex items-center justify-center">
                <span className="text-[#216DD1] font-normal-[350] text-xs items-center p-1">
                  0 records
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center bg-[#216DD1] w-[2.5rem] h-[2.5rem] rounded-full xl m-3.5">
              <PiCirclesFour className="text-white w-6 h-6" />
            </div>
          </Card> */}
    
          {/* Money Credited Card */}
          {/* <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#4CE880] bg-[#EDFCF2] rounded-l">
            <div className="flex flex-col space-y-2 mt-3 ml-3">
              <span className="font-normal text-[#313642]">Money Credited</span>
              <span className="font-bold flex text-3xl m-0 p-0 text-[#313642]">
                <FaRupeeSign />
              </span>
              <div className="w-[5rem] border-[1px] border-[#117A34] rounded-full flex items-center justify-center">
                <span className="text-[#117A34] font-normal-[350] text-xs items-center p-1">
                  0 records
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center bg-[#1BD659] w-[2.5rem] h-[2.5rem] rounded-full m-3.5">
              <IoMdCheckmark className="text-white w-6 h-6" />
            </div>
          </Card> */}
    
          {/* Pending Credits */}
           {/* <Card className="flex flex-row justify-between w-[90vw] md:w-[16rem] h-[8rem] border-[1px] border-[#F2C263] bg-[#FFFAEF] rounded-l">
            <div className="flex flex-col space-y-2 mt-3 ml-3">
              <span className="font-normal text-[#313642]">Pending Credits</span>
              <span className="font-bold flex text-3xl m-0 p-0 text-[#313642]">
                <FaRupeeSign />
              </span>
              <div className="w-[5rem] border-[1px] border-[#996A0C] rounded-full flex items-center justify-center">
                <span className="text-[#996A0C] font-normal-[350] text-xs items-center p-1">
                  0 records
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center bg-[#D19010] w-[2.5rem] h-[2.5rem] rounded-full m-3.5">
              <BiTime className="text-white w-6 h-6" />
            </div>
          </Card>  */}
        </div>
    
        {/* Projects Tab */}
        <div className="mt-8 px-4 md:px-0">
          <PaymentsDisplay />
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
