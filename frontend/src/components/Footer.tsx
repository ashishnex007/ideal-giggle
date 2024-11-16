import { FaXTwitter } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { ImLinkedin2 } from "react-icons/im";
import { FiYoutube } from "react-icons/fi";
import { logo } from "@/assets/photos";

const Footer = () => {
  const navList = ["Our services", "Pricing", "Blogs", "About Us", "Contact Us"];
  return (
    <div className="bg-slate-100 flex flex-col items-center p-4 md:p-8">
      <div className="pt-8 pb-6">
        <img src={logo} className="w-[5rem]" />
      </div>
      <div className="flex flex-wrap justify-center items-center">
        {navList.map((nav, index) => (
          <p key={index} className="px-2 py-1 text-center">
            {nav}
          </p>
        ))}
      </div>
      <div className="flex gap-x-4 md:gap-x-8 py-8">
        <div className="w-[2.5rem] h-[2.5rem] md:w-[3rem] md:h-[3rem] border-2 border-black rounded-full flex justify-center items-center">
          <IoLogoInstagram size={"1.5rem"} />
        </div>
        <div className="w-[2.5rem] h-[2.5rem] md:w-[3rem] md:h-[3rem] border-2 border-black rounded-full flex justify-center items-center">
          <FaXTwitter size={"1.5rem"} />
        </div>
        <div className="w-[2.5rem] h-[2.5rem] md:w-[3rem] md:h-[3rem] border-2 border-black rounded-full flex justify-center items-center">
          <ImLinkedin2 size={"1.5rem"} />
        </div>
        <div className="w-[2.5rem] h-[2.5rem] md:w-[3rem] md:h-[3rem] border-2 border-black rounded-full flex justify-center items-center">
          <FiYoutube size={"1.5rem"} />
        </div>
      </div>
      <div className="pb-6 text-center">
        <p>© 2024 Creator Copilot. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;