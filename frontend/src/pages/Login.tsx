import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch } from "@/hooks";
import { setToken, setUser } from "@/hooks/authSlice";

import { dots, hero, logo } from "@/assets/photos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { GoogleLogin } from '@react-oauth/google';

import Swal from 'sweetalert2';
import { useSelector } from "react-redux";
import { RootState } from "@/hooks/store";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(()=> {
        if(token){
          navigate("/dashboard");
        }
    }, [token]);

    const handleLogin = async(e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
                email,
                password
            });
            // console.log(response.data);
            const token = response.data.token;
            // console.log(token);
            dispatch(setToken(token));

            const _id = response.data._id;
            const UID = response.data.UID;
            const name = response.data.name;
            const role = response.data.role;
            const active_projects = response.data.active_projects;
            const total_projects = response.data.total_projects;

            const user = {_id, UID, name, role, active_projects, total_projects};
            dispatch(setUser(user));

            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
            console.error("error " + err);
        }
    };

    const loginUserWithGoogle = async(credential: string) => {
        try {
            return await axios.post(`${import.meta.env.VITE_API_URL}/api/users/google-login`, { credential });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "User not found.",
                text: "Please signup first and then login.",
            });
            navigate("/onboard");
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const credential = credentialResponse.credential;
        // console.log("Google Credential:", credential);
        const userResponse = await loginUserWithGoogle(credential);
        // console.log(userResponse);

        // if user not found, navigate to onboard page
        if(userResponse){
            // console.log(userResponse?.data);

            const _id = userResponse?.data._id;
            const UID = userResponse?.data.UID;
            const name = userResponse?.data.name;
            const role = userResponse?.data.role;
            const active_projects = userResponse?.data.active_projects;
            const total_projects = userResponse?.data.total_projects;
            const token = userResponse?.data.token;
            const user = {_id, UID, name, role, active_projects, total_projects};

            // remove old ones
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            dispatch(setToken(token));
            dispatch(setUser(user));
            navigate("/dashboard");
        }
    };
    
    const handleGoogleError = () => {
        alert("Google Login failed");
        // console.log("Google Login Failed");
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
              <h1 className="font-bold text-2xl md:text-[2.5rem]">Welcome back</h1>
              <p className="text-ccSecondary text-lg md:text-[1.2rem]">Enter your credentials and get going</p>
            </div>
            <div className="py-4">
              <div className="pt-4">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); }} />
              </div>
              <div className="pt-4">
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="pt-4">
                <Button onClick={handleLogin} className="w-full bg-ccDarkBlue">Login</Button>
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
              <p>Don't have an account? <Link to="/onboard" className="text-ccDarkBlue">Signup</Link></p>
              <p><Link to="#" className="text-ccDarkBlue">Forgot Password? </Link></p>
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

export default Login;