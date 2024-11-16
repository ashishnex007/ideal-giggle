import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RootState } from "@/hooks/store";
import { useSelector } from "react-redux";
import Swal from 'sweetalert2';

import logo from "@/assets/photos/logo.png";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaRupeeSign } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

declare global {
    interface Window {
        Razorpay: any;
    }
};

const AddCredits = () => {
    const [credits, setCredits] = useState(0);
    const [clientId, setClientId] = useState<string>('');
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);

    if(currentUser?.role === "freelancer"){
        navigate("/dashboard");
    };

    useEffect(()=> {
        if(!token){
          navigate("/login");
        }
    }, [token]);

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

    function loadScript(src: string): Promise<boolean> {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    async function displayRazorpay() {
        const res = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
        );

        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/credits/orders`, {
                totalBill: credits * 1.18  // Send the total amount including GST
            });

            if (!result.data) {
                alert("Server error. Are you online?");
                return;
            }
            
            const { amount, id: order_id, currency } = result.data;

            const options = {
                key: razorpayKey, 
                amount: amount.toString(),
                currency: currency,
                name: "Creator Copilot",
                description: "Credits Purchase",
                image: logo,
                order_id: order_id,
                handler: async function (response: any) {
                    try {
                        const data = {
                            orderCreationId: order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        };

                        const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/credits/success`, data);
                        // data: {
                        //     msg: 'success',
                        //     orderId: 'order_OX06m0JPnarseq',
                        //     paymentId: 'pay_OX072XBdUHk3Gh'
                        // },

                        // console.log(result);

                        if(result.data.msg === "success"){
                            await addCredits(result.data.paymentId);
                        }
                    } catch (error) {
                        console.error("Error in payment verification:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Verification Failed",
                            text: "Payment verification failed. Please contact support.",
                        });
                    }
                },
                prefill: {
                    name: "Creator Copilot",
                    email: "cc@cc.com",
                    contact: "9999999999",
                },
                notes: {
                    address: "Creator Copilot Inc.",
                },
                theme: {
                    color: "#61dafb",
                },
            };
    
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Error in displayRazorpay:", error);
            alert("Failed to initiate payment. Please try again.");
        }
    };

    const getClientDetails = async() => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/client/${currentUser?._id}`);
        // console.log(response.data);
        if(response.data){
            setClientId(response.data._id);
        }
    }

    useEffect(()=> {
        if(currentUser?.role === "client"){
            getClientDetails();
        }
    }, [currentUser]);

    const addCredits = async(paymentId: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/credits/addCredits`, {
                numCredits: credits,
                userId: clientId,
                role: "client",
                razorpayPaymentId: paymentId,
            });
            Swal.fire({
                title: "Payment Successful!",
                text:  `Successfully added ${credits} credits to your account.`,
                icon: "success"
            });
            navigate("/payments");
        } catch (error) {
            console.error("Error adding credits:", error);
            Swal.fire({
                icon: "error",
                title: "Error adding credits",
                text: "Please contact the admin",
            });
        }
    }

  return (
    <div>
        <div className="flex h-screen justify-center items-center">
            <Card className="w-[30rem] h-[30rem]">
                <CardHeader>
                    <CardTitle>Purchase Credits</CardTitle>
                    <CardDescription>Add credits to create projects.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className=" flex items-center space-x-4 rounded-md border p-4">
                        <Input value={credits} type="number" min="0" onChange={(e)=> setCredits(Number(e.target.value))} />
                        <h1>Credits</h1>
                    </div>

                    <div className="flex justify-evenly mt-4">
                        {[2000, 2500, 5000, 10000].map((value) => (
                            <Badge 
                                key={value}
                                className="py-2 px-4 text-lg cursor-pointer" 
                                onClick={() => setCredits(value)}
                            >
                                {value}
                            </Badge>
                        ))}
                    </div>

                    <div className="mt-16">
                        <h1>Amount payable for {credits} credits is {(credits * 1.18).toFixed(2)}</h1>
                        <h1 className="text-ccSecondary">18% GST included</h1>
                    </div>

                    <Button 
                        className={`w-full mt-4 ${credits <= 0 ? "opacity-50 cursor-not-allowed" : ""}`} 
                        onClick={displayRazorpay}
                        disabled={credits <= 0}
                    >                        
                        Pay <FaRupeeSign /> {(credits * 1.18).toFixed(2)}
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

export default AddCredits;