import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { hero } from '@/assets/photos';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-slate-100 p-4 md:p-8">
      <div>
        <div className="flex flex-col items-center pt-12">
          <h1 className="text-[2rem] md:text-[3.5rem] font-bold tracking-tighter text-center">
            Creator Copilot
          </h1>
        </div>

        <div className="flex flex-col items-center">
          <div className="py-4 flex flex-col items-center">
            <h1 className="text-[1.25rem] md:text-[1.5rem] text-ccSecondary text-center">
              Your Partner in Content Creation
            </h1>
          </div>
          <Button className="bg-ccDarkBlue hover:bg-blue-800 px-6 md:px-8 py-3 md:py-4" onClick={() => { navigate("/onboard") }}>Sign up for free</Button>
          <div className="mt-8 w-full flex justify-center">
            <img src={hero} className="w-full max-w-[20rem] md:max-w-[60rem]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero;