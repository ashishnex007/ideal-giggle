import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import validator from "validator";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { dots, hero, logo } from "@/assets/photos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(()=> {
        if(!location.state){
            navigate("/onboard"); // * helps if the role is not passed
        }
    }, [location.state, navigate]);

    const handleEmail = async (email: string) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/check-email`, { email });
            return response.data.message === "Email is available";
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                return false; // Email already exists
            }
            console.error("Error checking email:", error);
            throw error;
        }
    };

    const handleSignup = async(e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if(!validator.isEmail(email)){
            setError("Invalid email");
            return;
        }

        if(name.length < 1){
            setError("Name cannot be empty");
            return;
        }

        if(password.length < 8){
            setError("Password must be atleast 8 characters long");
            return;
        }

        try {
            const isEmailAvailable = await handleEmail(email);

            if (!isEmailAvailable) {
                setError("Email already exists");
                return;
            }

            const role = location.state;
            // Navigate to the OnBoardingPage with the user data
            navigate(`/onboard/${role}`, { state: {name, email, password } });
        } catch (error) {
            console.error("Signup error:", error);
            setError("An error occurred during signup. Please try again.");
        }
    };

    const handleGoogleSuccess = (credentialResponse: any) => {
        const credential = credentialResponse.credential;
        // console.log("Google Credential:", credential);
        navigate(`/onboard/${location.state}`, { state: { credential } });
    };
    
    const handleGoogleError = () => {
        alert("Google Login failed");
        console.error("Google Login Failed");
    };
    
  return (
    <div>
        <div className="flex items-center px-4 py-2 border-b-2 md:px-24">
            <img src={logo} className="w-[2rem] md:w-[3rem]" />
            <h1 className="text-lg font-bold md:text-xl">Creator Copilot</h1>
        </div>

        <div>
            <div className="flex flex-col w-full px-4 md:flex-row md:px-10">
                {/* {left} */}
                <div className="w-full md:w-1/2">
                    <div className="pt-10 pb-4 md:pt-20 md:pb-6">
                        <h1 className="font-bold text-2xl md:text-[2.5rem]">Welcome to Creator Copilot</h1>
                        <p className="text-ccSecondary text-lg md:text-[1.2rem]">Enter your email to get started</p>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <div>
                        <div className="pt-4">
                            <Input type="text" placeholder="Enter your name" value={name} onChange={(e)=>{setName(e.target.value);}} />
                        </div>
                        <div className="pt-4">
                            <Input type="email" placeholder="Email" value={email} onChange={(e)=>{setEmail(e.target.value);}} />
                        </div>
                        <div className="pt-4">
                            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="pt-4">
                            <Button className="w-full bg-ccDarkBlue" onClick={handleSignup}>Continue</Button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center pb-4 md:flex-row md:justify-evenly">
                        <Separator className="w-full my-4 md:w-[19rem]" />
                        <h1 className="text-ccTertiary px-2">OR</h1>
                        <Separator className="w-full my-4 md:w-[19rem]" />
                    </div>
                    <div>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                        />
                    </div>
                    <div className="py-8 md:py-12">
                        <p>Already have an account? <Link to="/login" className="text-ccDarkBlue">Login</Link></p>
                    </div>
                </div>

                {/* {right} */}
                <div className="relative w-full mt-10 md:w-1/2 md:ml-20 md:mt-0 overflow-hidden">
                    <img src={dots} className="absolute top-10 w-full h-[15rem] object-cover opacity-50 md:w-[35rem] md:h-[23rem]" />
                    <img src={hero} className="absolute top-20 left-10 w-full md:left-20 md:w-[60rem]" />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Signup;
