import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { VscChromeClose } from "react-icons/vsc";
import { z } from "zod";

import { useAppDispatch } from "@/hooks";
import { setToken, setUser } from "@/hooks/authSlice";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import logo from "../assets/photos/logo.png";
import illustration from "../assets/onboard/illustration_client.png";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IoMdArrowRoundBack } from "react-icons/io";

interface UserRegistrationData {
  UID: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

interface ClientRegistrationData {
  userId: string;
  description: string;
  requirements: string;
  skillset: string[];
  domains: string[];
  phoneNumber: string;
  address: string;
  portfolios: string[];
  businessNames: string;
}

const FormSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  requirement: z.string().min(10, {
    message: "Requirement must be at least 10 characters.",
  }),
  portfolio: z.array(z.string()).optional(),
  businesses: z.string().optional(),
  skills: z
  .array(z.string())
  .min(1, { message: "You must select at least one skill." }),
  domains: z
  .array(z.string())
  .min(1, { message: "You must select at least one domain." })
});

const OnBoardClient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {name, email, password} = location.state || {};
  const credential = location.state?.credential; // * Get Google credential from location state

  const [section, setSection] = useState<1 | 2>(1);
  const [UID, setUID] = useState("");
  const [errorx, setErrorx] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [businessNames, setBusinessNames] = useState("");
  const [portfolioFields, setPortfolioFields] = useState<string[]>([""]);

  // * register user with google function
  const registerUserWithGoogle = async (credential: string, role: string) => {
    return axios.post(`${import.meta.env.VITE_API_URL}/api/users/google-signup`, { credential, role, UID });
  };

  // * register user function
  async function registerUser(userData: UserRegistrationData){
    return axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, userData);
  }
  
  // * register client function
  async function registerClient(clientData: ClientRegistrationData){
    return axios.post(`${import.meta.env.VITE_API_URL}/api/users/register/client`, clientData);
  }

  const handleNextSection = () => {
    if (section === 1) {
      if (!phoneNumber || !address) {
        setErrorx("Please fill in all the fields");
        return;
      }
    }
    setSection(2);
    setErrorx("");
  }

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    // console.log("Form Data:", data);

    try {
      if(credential){
        // console.log(credential);
        const userResponse = await registerUserWithGoogle(credential, "client");
        // console.log(userResponse);

        // Now, create the client object
        const clientResponse = await registerClient({
          userId: userResponse.data._id,
          description: data.description,
          requirements: data.requirement,
          skillset: data.skills,
          domains: data.domains,
          phoneNumber: phoneNumber,
          address: address,
          // @ts-ignore
          portfolios: data.portfolio,
          businesses: businessNames,
        });

        // console.log("Client registered:", clientResponse.data);

        // After successful client registration, log the user in
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        const _id = userResponse.data._id;
        const UID = userResponse.data.UID;
        const name = userResponse.data.name;
        const role = userResponse.data.role;
        const active_projects = userResponse.data.active_projects;
        const total_projects = userResponse.data.total_projects;
        const token = userResponse.data.token;
        const user = {_id, UID, name, role, active_projects, total_projects};

        dispatch(setToken(token));
        dispatch(setUser(user));
        navigate("/dashboard");
      }
      else{ // if no google credentials
        // register the user 
        const userResponse = await registerUser({
          UID,
          name,
          email, 
          password,
          role: "client",
        });
        // console.log(userResponse.data);
        const clientResponse = await registerClient({
          userId: userResponse.data._id,
          description: data.description,
          requirements: data.requirement,
          skillset: data.skills,
          domains: data.domains,
          phoneNumber: phoneNumber,
          address: address,
          // @ts-ignore
          portfolios: data.portfolio,
          businesses: businessNames,
        });
        // console.log(clientResponse.data);
        // Remove the old token before logging in the new user
        localStorage.removeItem('token'); 
        localStorage.removeItem('user');

        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
            email,
            password
          });
          const _id = response.data._id;
          const UID = response.data.UID;
          const name = response.data.name;
          const role = response.data.role;
          const active_projects = response.data.active_projects;
          const total_projects = response.data.total_projects;
          const token = response.data.token;
          const user = {_id, UID, name, role, active_projects, total_projects};

          // console.log(token);
          dispatch(setToken(token));
          dispatch(setUser(user));
          navigate("/dashboard");
        } catch (error) {
          console.error("Unable to login", error);
        }
      }
    } catch (userError) {
      console.error("Failed to registeruser", userError);
    }
  };

  // section 1
  // portfolio

  const handleAddPortfolio = () => {
    setPortfolioFields([...portfolioFields, ""]);
  };

  const handlePortfolioChange = (index: number, value: string) => {
    const newPortfolioFields = [...portfolioFields];
    newPortfolioFields[index] = value;
    setPortfolioFields(newPortfolioFields);
    form.setValue("portfolio", newPortfolioFields  as [string, ...string[]]);
    form.trigger("portfolio");
  };

  const handleRemovePortfolio = (portfolioIndex: number) => {
    const newFields = [...portfolioFields];
    newFields.splice(portfolioIndex, 1); // Remove the entry at index
    setPortfolioFields(newFields); 
    form.setValue("portfolio", newFields  as [string, ...string[]]);
    form.trigger("portfolio");
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      requirement: "",
      skills: []
    },
  });

  const skillOptions = [
    "Customer Service",
    "Web Content",
    "Video Production",
    "Photography",
    "Graphic Design",
    "Logo Design",
    "UX/UI Design",
    "UX Design",
    "Product Design",
    "Video Editing",
  ];

  const domainOptions = [
    "Video Editing",
    "Photo Editing",
    "Graphic Design",
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  //skills
  const handleAddSkills = (value: string) => {
    if (selectedItems.length < 5 && !selectedItems.includes(value)) {
      const newItems = [...selectedItems, value];
      setSelectedItems(newItems);
      form.setValue("skills", newItems);
      form.trigger("skills"); // manually trigger validation
    }
  };

  const handleRemoveSkills = (value: string) => {
    const newItems = selectedItems.filter((item) => item !== value);
    setSelectedItems(newItems);
    form.setValue("skills", newItems);
    form.trigger("skills"); // manually trigger validation
  };

  //domains
  const handleAddDomains = (value: string) => {
    if (selectedDomains.length < 5 && !selectedDomains.includes(value)) {
      const newDomains = [...selectedDomains, value];
      setSelectedDomains(newDomains);
      form.setValue("domains", newDomains);
      form.trigger("domains"); // manually trigger validation
    }
  };

  const handleRemoveDomains = (value: string) => {
    const newDomains = selectedDomains.filter((item) => item !== value);
    setSelectedDomains(newDomains);
    form.setValue("domains", newDomains);
    form.trigger("domains"); // manually trigger validation
  };
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section */}
      <div className="w-full lg:w-1/2 bg-white overflow-auto h-screen">
        {/* Header */}
        <div className="py-2 px-4 lg:px-0">
          <div className="flex ml-4 lg:ml-14">
            <div className="flex items-center">
              <img src={logo} className="w-[2.5rem] lg:w-[3rem]"/>
              <h1 className="text-lg lg:text-xl font-bold">Creator Copilot</h1>
            </div>
          </div>
        </div>

        <div className="mt-4 lg:mt-7">
          {
            section === 1 ? (
              <p className="font-bold text-2xl lg:text-4xl mx-4 lg:ml-14">Give us your basic details</p>
            ) : (
              <p className="font-bold text-2xl lg:text-4xl mx-4 lg:ml-14 flex items-center gap-x-4">
                <Button 
                  className="bg-red-500 hover:bg-red-700 transition-colors duration-300"
                  onClick={() => setSection(1)}  
                >
                  <IoMdArrowRoundBack />
                </Button>
                Tell us more
              </p>
            )
          }
        </div>

        {
          section === 1 ? 
          (
            <div className="w-full">
              <div className="w-full py-8 lg:py-12 px-4 lg:px-16">
                <div className="w-full pb-6 lg:pb-8 items-center gap-1.5">
                  <Label htmlFor="email">Username</Label>
                  <Input
                    id="UID"
                    value={UID}
                    onChange={(e)=> {setUID(e.target.value); setErrorx("");}}
                    placeholder="UID"
                    className="w-full"
                  />
                </div>

                <div className="w-full pb-6 lg:pb-8 items-center gap-1.5">
                  <Label htmlFor="email">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e)=> {setPhoneNumber(e.target.value); setErrorx("");}}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                    placeholder="Phone Number"
                    className="w-full"
                  />
                </div>

                <div className="w-full items-center gap-1.5">
                  <Label htmlFor="email">Your address</Label>
                  <Textarea 
                    value={address} 
                    onChange={(e)=> {setAddress(e.target.value); setErrorx("");}} 
                    placeholder="Type your message here." 
                    className="w-full"
                  />
                </div>

                <h1 className="text-md text-red-700">{errorx}</h1>
              </div>

              <div className="py-8 lg:py-20 px-4 lg:px-14 flex w-full justify-center">
                <Button
                  className="bg-blue-600 text-white rounded-md hover:bg-green-700 w-full "
                  onClick={handleNextSection}
                >
                  Next
                </Button>
              </div>
            </div>
          )
          : 
          (
            <div className="mt-6 lg:mt-8 pb-8 px-4 lg:px-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full lg:w-[494px] h-auto lg:h-[81px] mx-auto lg:ml-14 space-y-0 mb-6 lg:mb-0">
                        <FormLabel className="text-gray-700 pb-2 text-lg lg:text-xl">Give us your description</FormLabel>
                        <FormControl>
                          <Input
                            className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirement"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full lg:w-[494px] h-auto lg:h-[81px] mx-auto lg:ml-14 mt-6 lg:mt-9 space-y-0">
                        <FormLabel className="text-gray-700 pb-2 text-lg lg:text-xl">What are your requirements?</FormLabel>
                        <FormControl>
                          <Input
                            className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={() => (
                      <FormItem className="w-full lg:w-[494px] h-auto mx-auto lg:ml-14 mt-6 lg:mt-9 space-y-0">
                        <FormLabel className="text-gray-700 text-lg lg:text-xl">
                          What are the skills you're looking for?
                        </FormLabel>
                        <FormDescription className="relative text-gray-500 mt-0 pb-2 text-sm">
                          Select up to 5 topics that interest you.
                        </FormDescription>
                        <FormControl>
                          <Select onValueChange={handleAddSkills} value="">
                            <SelectTrigger className="px-4 py-2 border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-white">
                              <span className="text-gray-500">Select the skills</span>
                            </SelectTrigger>
                            <SelectContent className="mt-2 border border-gray-300 rounded-md bg-white shadow-lg z-10">
                              {skillOptions.map((option) => (
                                <SelectItem
                                  key={option}
                                  value={option}
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                  <span>{option}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <div className="flex flex-wrap mt-2">
                          {selectedItems.map((item) => (
                            <div className="pt-2 pr-2" key={item}>
                              <Button
                                onClick={() => handleRemoveSkills(item)}
                                className="text-white rounded-3xl bg-blue-600 hover:bg-blue-500"
                              >
                                <div className="flex flex-row items-center">
                                  <p>{item}</p>
                                  <div className="pt-[0.15rem] pl-2">
                                    <VscChromeClose className="w-5 h-5" />
                                  </div>
                                </div>
                              </Button>
                            </div>
                          ))}
                        </div>
                        {form.formState.errors.skills && (
                          <FormMessage className="text-red-500">
                            {form.formState.errors.skills.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="domains"
                    render={() => (
                      <FormItem className="w-full lg:w-[494px] h-auto mx-auto lg:ml-14 mt-6 lg:mt-9 space-y-0">
                        <FormLabel className="text-gray-700 text-lg lg:text-xl">
                          What are the domains you're looking for?
                        </FormLabel>
                        <FormDescription className="relative text-gray-500 mt-0 pb-2 text-sm">
                          Select the domains that you are interested in.
                        </FormDescription>
                        <FormControl>
                          <Select onValueChange={handleAddDomains} value="">
                            <SelectTrigger className="px-4 py-2 border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-white">
                              <span className="text-gray-500">Select the domains</span>
                            </SelectTrigger>
                            <SelectContent className="mt-2 border border-gray-300 rounded-md bg-white shadow-lg z-10">
                              {domainOptions.map((option) => (
                                <SelectItem
                                  key={option}
                                  value={option}
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                  <span>{option}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <div className="flex flex-wrap mt-2">
                          {selectedDomains.map((item) => (
                            <div className="pt-2 pr-2" key={item}>
                              <Button
                                onClick={() => handleRemoveDomains(item)}
                                className="text-white rounded-3xl bg-blue-600 hover:bg-blue-500"
                              >
                                <div className="flex flex-row items-center">
                                  <p>{item}</p>
                                  <div className="pt-[0.15rem] pl-2">
                                    <VscChromeClose className="w-5 h-5" />
                                  </div>
                                </div>
                              </Button>
                            </div>
                          ))}
                        </div>
                        {form.formState.errors.domains && (
                          <FormMessage className="text-red-500">
                            {form.formState.errors.domains.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="lg:ml-14 mb-4 my-6 w-full lg:w-[494px]">
                    <Label htmlFor="portfolio" className="text-lg lg:text-xl py-2">Portfolios (if you have any)</Label>
                    <div>
                      {portfolioFields.map((_, index) => (
                        <div key={index} className="w-full lg:w-[494px] space-y-2 relative">
                          <FormField
                            control={form.control}
                            name={`portfolio.${index}`}
                            render={(field) => (
                              <FormItem className="flex flex-col space-y-0">
                                <FormLabel className="text-gray-700 text-lg lg:text-xl mb-6">Portfolio {index + 1}</FormLabel>
                                  <Input
                                    className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                                    {...field}
                                    value={portfolioFields[index]}
                                    onChange={(e) => handlePortfolioChange(index, e.target.value)}
                                  />
                                  <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="">
                            {index > 0 && (
                              <Button
                                type="button"
                                className="absolute px-3 py-1 top-0 right-0 bg-red-600 hover:bg-red-500 focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                                onClick={() => handleRemovePortfolio(index)}
                              >
                                <p>Remove</p>
                                <div className="pt-[0.15rem] pl-2">
                                  <VscChromeClose className="w-5 h-5" />
                                </div>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 flex w-full justify-end">
                        <Button
                          type="button"
                          className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                          onClick={handleAddPortfolio}
                        >
                          + Add Portfolio
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid max-w-md lg:ml-14 mb-4 my-6 w-full items-center gap-1.5">
                    <Label htmlFor="email" className="text-lg lg:text-xl">Business Names (if you have any)</Label>
                    <Textarea 
                      className="w-full lg:w-[494px]" 
                      value={businessNames} 
                      onChange={(e)=> setBusinessNames(e.target.value)} 
                      placeholder="Type the details here." 
                    />
                  </div>

                  <div className="mt-6 lg:mt-9 lg:ml-14">
                    <Button
                      type="submit"
                      className="bg-blue-600 text-white rounded-md hover:bg-green-700 w-full lg:w-auto"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )
        }
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center bg-gray-50 h-screen">
        {/* Centered Illustration */}
        <div className="w-full max-w-[600px] px-4">
          <img src={illustration} alt="Illustration" className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default OnBoardClient;