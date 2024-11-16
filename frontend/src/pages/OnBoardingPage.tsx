import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { FaBriefcase } from "react-icons/fa";
import { LuLampDesk } from "react-icons/lu";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { CgArrowRight } from "react-icons/cg";
import logo from "../assets/photos/logo.png";
import illustration from "../assets/onboard/illustration.png";
import { useSelector } from "react-redux";
import { RootState } from "@/hooks/store";

const OnBoardingPage = () => {
    const [activeButton, setActiveButton] = useState("");
    const navigate = useNavigate();

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(()=> {
        if(token){
          navigate("/dashboard");
        }
    }, [token]);

    const handleClick = (button: string) => {
        setActiveButton(activeButton === button ? "" : button);
    };

    const handleContinue = () => {
        navigate('/signup', { state: activeButton });
    };

    return (
        <div className="h-screen w-full flex">
            {/* Left Section */}
            <div className="md:w-1/2 w-1/3 flex flex-col items-center justify-center bg-white">
                {/* Header */}
                <div className="absolute top-0 left-0 flex items-center p-4">
                    <img src={logo} className="w-6 md:w-12" alt="Logo" />
                    <h1 className="text-md md:text-xl font-bold ml-2">Creator Copilot</h1>
                </div>
                
                {/* Freelancer Button */}
                <div className="relative md:mt-64 mt-20 md:-mr-[30rem]">
                    <Button
                        variant="outline"
                        className={`relative flex flex-col items-center md:w-44 md:h-56 w-28 h-28 border-2 ${activeButton === 'freelancer' ? 'border-blue-500' : 'border-gray-300'}`}
                        onClick={() => handleClick('freelancer')}
                    >
                        <LuLampDesk className="md:w-11 md:h-11 w-6 h-6 text-gray-700 md:mb-4 mb-2" />
                        <p className="md:text-2xl text-md font-normal text-gray-700 mb-4">Freelancer</p>
                    </Button>
                    {activeButton === 'freelancer' && (
                        <div>
                            <IoIosCheckmarkCircle className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-full w-8 h-8 mt-1 fill-current text-blue-500" />
                            <Button
                                className="hover:bg-blue-500 absolute left-1/2 transform -translate-x-1/2 top-full mt-10 flex items-center justify-center gap-1 md:w-[150px] w-[6rem] h-10 border-2 text-white bg-blue-600"
                                onClick={handleContinue}
                            >
                                <span className="md:text-l">Continue</span>
                                <CgArrowRight className="w-6 h-6 mt-1"/>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="md:w-1/2 w-1/3 flex flex-col items-center justify-center md:bg-gray-50">
                {/* Client Button */}
                <div className="relative md:mt-64 mt-20 md:mr-[30rem]">
                    <Button
                        variant="outline"
                        className={`relative flex flex-col items-center md:w-44 md:h-56 w-28 h-28 border-2 ${activeButton === 'client' ? 'border-blue-500' : 'border-gray-300'}`}
                        onClick={() => handleClick('client')}
                    >
                        <FaBriefcase className="md:w-11 md:h-11 w-6 h-6 text-gray-700 md:mb-4 mb-2" />
                        <p className="md:text-2xl text-md font-normal text-gray-700 mb-4">Client</p>
                    </Button>
                    {activeButton === 'client' && (
                        <div>
                            <IoIosCheckmarkCircle className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-full w-8 h-8 mt-1 fill-current text-blue-500" />
                            <Button
                                className="hover:bg-blue-500 absolute left-1/2 transform -translate-x-1/2 top-full mt-10 flex items-center justify-center gap-1 md:w-[150px] w-[6rem] h-10 border-2 text-white bg-blue-600"
                                onClick={handleContinue}
                            >
                                <span className="md:text-l">Continue</span>
                                <CgArrowRight className="w-6 h-6 mt-1"/>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Centered Illustration */}
            <div className="absolute mt-52 md:left-1/2 left-36 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <h2 className="md:text-3xl text-md font-bold">Signup for an account, choose your role</h2>
                <img src={illustration} className="md:w-[27.5rem] w-[15rem] mt-10 mx-auto" alt="Illustration" />
            </div>
        </div>
    );
};

export default OnBoardingPage;
