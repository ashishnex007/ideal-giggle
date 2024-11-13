import { logo } from "@/assets/photos";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

const Navbar = () => {
  const navList = [
    { name: "Our services", path: "/services" },
    { name: "Blogs", path: "/blogs" },
    { name: "About Us", path: "/" },
    { name: "Contact Us", path: "/contact" }
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get("scrollTo");
    if (scrollTo) {
      const element = document.getElementById(scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="py-2 bg-white shadow-md">
      <div className="flex justify-between items-center px-4 md:px-8">
        <div className="flex items-center cursor-pointer" onClick={() => { navigate("/") }}>
          <img src={logo} className="w-[3rem]" />
          <h1 className="text-xl font-bold ml-2">Creator Copilot</h1>
        </div>
        <div className="hidden md:flex items-center">
          {navList.map(nav => (
            <h1 key={nav.name} className="px-2 cursor-pointer" onClick={() => { navigate(nav.path) }}>
              {nav.name}
            </h1>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-x-4">
          <Button className="border-ccDarkBlue" variant="outline" onClick={() => { navigate("/login") }}>Login</Button>
          <Button className="bg-ccDarkBlue hover:bg-blue-700" onClick={() => { navigate("/onboard") }}>Sign Up</Button>
        </div>
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col items-center mt-4">
          {navList.map(nav => (
            <h1 key={nav.name} className="py-2 cursor-pointer" onClick={() => { navigate(nav.path); toggleMobileMenu(); }}>
              {nav.name}
            </h1>
          ))}
          <Button className="border-ccDarkBlue w-full mb-2" variant="outline" onClick={() => { navigate("/login"); toggleMobileMenu(); }}>Login</Button>
          <Button className="bg-ccDarkBlue hover:bg-blue-700 w-full" onClick={() => { navigate("/onboard"); toggleMobileMenu(); }}>Sign Up</Button>
        </div>
      )}
    </div>
  );
}

export default Navbar;