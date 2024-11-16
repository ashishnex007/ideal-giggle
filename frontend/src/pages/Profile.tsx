import {useEffect, useState,useRef} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { RootState } from '@/hooks/store';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setUser } from "@/hooks/authSlice";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"  
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface Manager {
  _id: string;
  UID: string;
  name: string;
  email: string;
  role: string;
  active_projects: any[];
  total_projects: number;
  verificationToken: string | null;
  resetToken: string | null;
  verified: boolean;
  adminVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(()=> {
        if(!token){
          navigate("/login");
        }
      }, [token]);

    // freelancer states
    const [education, setEducation] = useState<string[]>([]);
    const [experience, setExperience] = useState<string[]>([]);
    const [portfolios, setPortfolios] = useState<string[]>([]);
    const [servicesList, setServicesList] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    
    // client states
    const [requirements, setRequirements] = useState("");
    const [skillset, setSkillset] = useState<string[]>([]);
    const [managers, setManagers] = useState<(Manager | null)[]>([null, null]);
    
    // common states
    // const [credits, setCredits] = useState(0);
    const [bio, setBio] = useState("");
    const [selectedSlot, setSelectedSlot] = useState('');
    // set status for availibility
    const [status, setStatus] = useState('offline');
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

    // ref used for edit profile
    const nameRef = useRef<HTMLInputElement>(null);
    const bioRef = useRef<HTMLTextAreaElement>(null);

    const getFreelancerDetails = async() => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/freelancer/${user?._id}`);
        if(response.data){
            setBio(response.data.bio);
            setEducation(response.data.education);
            setExperience(response.data.experience);
            setPortfolios(response.data.portfolios);
            setServicesList(response.data.servicesList);
            setSkills(response.data.skills);
            setLanguages(response.data.languages);
            // setCredits(response.data.credits);
        }
      }
      
      const getClientDetails = async() => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/client/${user?._id}`);
        console.log(response.data);
        if(response.data){
          setBio(response.data.description);
          setRequirements(response.data.requirements);
          setSkillset(response.data.skillset);
          // setCredits(response.data.credits);
          const managerData = response.data.manager || [];
          // Update the managers state
          setManagers([
            managerData[0] || null, // Primary manager
            managerData[1] || null, // Secondary manager
          ]);
        }
      }

    useEffect(()=> {
        if(user?.role === "freelancer"){
            getFreelancerDetails();
        } else if(user?.role === "client"){
            getClientDetails();
        }
    }, [user]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    }
    const handleSlotClick = (slot:string) => {
        setSelectedSlot(slot);
    };

    // handle submit of edit profile
    const handleSubmit = async(event: React.FormEvent) => {
        event.preventDefault();
        const editedName = nameRef.current?.value ?? "";
        const editedBio = bioRef.current?.value ?? "";
        setMessage(null);
        setMessageType(null);
        if (editedName.length < 1) {
            setMessage("Name must have at least 1 character");
            setMessageType("error");
            return;
        }

        if (editedBio.length < 10) {
            setMessage("Bio must have at least 10 characters");
            setMessageType("error");
            return;
        }

        const updates: { name?: string; bio?: string } = {};
        if (editedName !== user?.name) {
            updates.name = editedName;
        }
        if (editedBio !== bio) {
            updates.bio = editedBio;
        }
        if (Object.keys(updates).length > 0) {
            // console.log("Updates to be sent:", updates);
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/editProfile/${user?._id}`, 
                    updates,
                    {
                        headers:{
                        Authorization: `Bearer ${token}`,
                        }
                    });
                const updatedUser = {
                    _id: user?._id ?? "",
                    UID: user?.UID ?? "",
                    name: editedName ?? user?.name ?? "",
                    role: user?.role ?? "",
                    active_projects: user?.active_projects ?? [],
                    total_projects: user?.total_projects ?? 0,
                };
                dispatch(setUser(updatedUser));
                setMessage("Edited successfully");
                setMessageType("success");
                // console.log(response)
            }
            catch (error) {
                console.log(error)
                setMessage("Edit failed");
                setMessageType("error");
                console.log("Error in Updating Profile")
            }
        }
        else{
            setMessage("No changes were made to your profile.");
            setMessageType("success");
        }
    };
    
  return (
    <ScrollArea className="h-full">
      <h1 className="md:hidden font-bold text-center py-6 text-3xl">Profile</h1>
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between">
              <CardTitle className="text-center md:text-left">{user?.name}</CardTitle>
              <div className="flex flex-col md:flex-row mt-4 md:mt-0 gap-2 md:gap-4">
                {(user?.role === "freelancer") && (
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Status</Button>
                      </DialogTrigger>
                      <DialogContent className="w-full md:w-[40rem]">
                        <DialogHeader>
                          <DialogTitle>Status</DialogTitle>
                          <DialogDescription>Change Your Status</DialogDescription>
                        </DialogHeader>
                        <div className="grid py-4">
                          <div className="flex items-center">
                            <ToggleGroup
                              type="single"
                              defaultValue="offline"
                              onValueChange={(value) => setStatus(value)}
                              className="flex"
                            >
                              <ToggleGroupItem
                                value="online"
                                aria-label="Toggle online"
                                className="hover:bg-green-300"
                              >
                                Online
                              </ToggleGroupItem>
                              <ToggleGroupItem
                                value="offline"
                                aria-label="Toggle offline"
                                className="hover:bg-red-300"
                              >
                                Offline
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                          {status === "online" && (
                            <div className="flex flex-col gap-4 py-2">
                              <Label htmlFor="timeSlots" className="text-left">
                                Time Slots
                              </Label>
                              <div className="flex gap-2 flex-wrap">
                                {["8-12", "12-16", "16-20", "20-12"].map((slot) => (
                                  <Button
                                    key={slot}
                                    className={`${
                                      selectedSlot === slot
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                                    } text-white hover:bg-green-300`}
                                    onClick={() => handleSlotClick(slot)}
                                  >
                                    {slot}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="submit">Change Status</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Edit Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="w-full md:w-[31rem]">
                        <form onSubmit={handleSubmit}>
                          <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                              Make changes to your profile here. Click save when
                              you're done.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-2">
                            <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                              <Label htmlFor="name" className="text-right">
                                Name
                              </Label>
                              <Input
                                id="name"
                                defaultValue={user?.name}
                                className="col-span-3"
                                minLength={1}
                                ref={nameRef}
                              />
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                              <Label htmlFor="username" className="text-right">
                                Bio
                              </Label>
                              <Textarea
                                defaultValue={bio}
                                className="w-full md:w-[26rem]"
                                minLength={10}
                                ref={bioRef}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-center pt-2">
                            <Button type="submit">Save changes</Button>
                            {message && (
                              <div className="flex justify-center mt-2">
                                <p
                                  className={`${
                                    messageType === "success"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  } font-bold`}
                                >
                                  {message}
                                </p>
                              </div>
                            )}
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mx-4">
                      Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Do you want to logout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will log you out of Creator Copilot.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4">
              <CardDescription>@{user?.UID}</CardDescription>
              <CardDescription>{user?.role}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {user?.role === "freelancer" && (
              <div>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {skills.map((skill, index) => (
                    <Badge key={index} className="py-2 px-4">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">About me</h1>
                  <h1>{bio}</h1>
                </div>
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem] pb-2">Languages known</h1>
                  <div className="flex flex-wrap gap-2 md:gap-4">
                    {languages.map((language, index) => (
                      <Badge key={index} className="py-2 px-4">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
    
            {user?.role === "client" && (
              <div>
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">About me</h1>
                  <h1>{bio}</h1>
                </div>
    
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">
                    Requirements I'm looking for
                  </h1>
                  <h1>{requirements}</h1>
                </div>

                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">Assigned Managers</h1>
                  {
                    managers.map((manager, index) => (
                      <div key={index} className="py-2 flex">
                        {manager ? (
                          <Badge className="flex p-2 w-auto">
                            <h1>{manager.name} - {manager.email}</h1>
                          </Badge>
                        ) : (
                          <Badge className="flex p-2 w-auto">No manager assigned</Badge>
                        )}
                      </div>
                    ))
                  }
                </div>
    
                <h1 className="font-bold text-[1.5rem] py-4">Skillset looking for</h1>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {skillset.map((skill, index) => (
                    <Badge key={index} className="py-2 px-4">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <h1 className="font-bold text-[1.5rem] py-2 flex justify-center">
              Stats
            </h1>
            <div className="py-4 flex flex-wrap justify-evenly gap-4">
              <Card className="w-[10rem] h-[10rem] flex flex-col items-center">
                <h1 className="text-[3rem] py-6">{user?.active_projects.length}</h1>
                <h1>Active Projects</h1>
              </Card>
              <Card className="w-[10rem] h-[10rem] flex flex-col items-center">
                <h1 className="text-[3rem] py-6">{user?.total_projects}</h1>
                <h1>Total Projects</h1>
              </Card>
            </div>
    
            {user?.role === "freelancer" && (
              <div>
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">Education</h1>
                  {education.map((edu, index) => (
                    <h1 key={index}>{edu}</h1>
                  ))}
                </div>
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">Experience</h1>
                  {experience.map((exp, index) => (
                    <h1 key={index}>{exp}</h1>
                  ))}
                </div>
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">Portfolios</h1>
                  {portfolios.map((portfolio, index) => (
                    <h1 key={index}>{portfolio}</h1>
                  ))}
                </div>
                <div className="py-4">
                  <h1 className="font-bold text-[1.5rem]">Services</h1>
                  {servicesList.map((service, index) => (
                    <h1 key={index}>{service}</h1>
                  ))}
                </div>
              </div>
            )}         
          </CardContent>
        </Card>
        
      </div>
    </ScrollArea>
  )
}

export default Profile;