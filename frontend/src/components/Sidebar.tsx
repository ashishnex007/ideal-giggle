import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hooks/store";

import { AiOutlineHome } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { FaRegBell, FaRegFolder } from "react-icons/fa6";
import { IoChatboxOutline } from "react-icons/io5";
import { MdAttachMoney } from "react-icons/md";
import { IoMdAttach } from "react-icons/io";
import { Menu, X } from "lucide-react";
import logo from "../assets/photos/logo.png";

interface MenuItem {
  name: string;
  Icon: React.ElementType;
  Endpoint: string;
}

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [selectedTab, setSelectedTab] = useState<string | null>("Home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems: MenuItem[] = [
    { name: "Home", Icon: AiOutlineHome, Endpoint: "/dashboard" },
    { name: "Projects", Icon: FaRegFolder, Endpoint: "/projects" },
    ...(user?.role !== "client"
      ? [{ name: "Resources", Icon: IoMdAttach, Endpoint: "/resources" }]
      : []),
    { name: "Inbox", Icon: IoChatboxOutline, Endpoint: "/inbox" },
    { name: "Notifications", Icon: FaRegBell, Endpoint: "/notifications" },
    { name: "Payments", Icon: MdAttachMoney, Endpoint: "/payments" },
    { name: "Profile", Icon: CgProfile, Endpoint: "/profile" },
  ]

  const location = useLocation();
  const navigate = useNavigate();

  const isSelected = (tabName: string) => selectedTab === tabName;

  useEffect(() => {
    const path = location.pathname;
    const matchingItem = menuItems.find(item => item.Endpoint === path);
    if (matchingItem) {
      setSelectedTab(matchingItem.name);
    }
  }, [location.pathname]);

  const handleItemClick = (name: string, endpoint: string) => {
    setSelectedTab(name);
    navigate(endpoint);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-200 md:hidden"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-ccDarkBlue" />
        ) : (
          <Menu className="w-6 h-6 text-ccDarkBlue" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        ${className}
      `}>
        {/* Sidebar Content */}
        <div className="h-full bg-slate-200 w-64 md:w-44 lg:w-52 shadow-lg">
          {/* Logo */}
          <div className="p-4 flex flex-col justify-center">
            <div className="flex justify-center">
              <img src={logo} className="w-[5rem]" />
            </div>
            <h1 className="lg:block text-center font-black text-xl">Creator Copilot</h1>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-y-2 px-2 pt-6">
            {menuItems.map(({ name, Icon, Endpoint }) => (
              <div
                key={name}
                onClick={() => handleItemClick(name, Endpoint)}
                className={`
                  flex items-center gap-x-4 p-2 rounded-xl cursor-pointer
                  transition-all duration-300 ease-in-out
                  ${isSelected(name) 
                    ? 'bg-ccDarkBlue text-white' 
                    : 'hover:bg-slate-300'
                  }
                  md:justify-start
                `}
              >
                <Icon className={`
                  w-6 h-6
                  ${isSelected(name) 
                    ? 'text-white' 
                    : 'text-ccSecondary group-hover:text-ccDarkBlue'
                  }
                `} />
                <span className={`
                  inline
                  ${isSelected(name) 
                    ? 'text-white' 
                    : 'text-ccSecondary'
                  }
                `}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;