import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CaretSortIcon } from "@radix-ui/react-icons"
import { VscChromeClose } from "react-icons/vsc";
import { z } from "zod";

import { useAppDispatch } from "@/hooks";
import { setToken, setUser } from "@/hooks/authSlice";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input";

import logo from "../assets/photos/logo.png";
import illustration from "../assets/onboard/illustration_freelancer.png";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserRegistrationData {
  UID: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

interface FreelancerRegistrationData {
  userId: string;
  bio: string;
  education:string[];
  experience: string[];
  portfolios:string[];
  servicesList:string[];
  skills:string[];
  languages:string[];
}

const FormSchema = z.object({
  bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }),
  skills: z
    .array(z.string())
    .min(1, { message: "You must select at least one skill." }),
  education: z
    .array(z.string())
    .nonempty({ message: "At least one Education entry is required" }),

  experience: z.array(z.string()).optional(),

  portfolio: z.array(z.string().min(1,{message:"Portfolio is required"}))
  .nonempty({ message: "At least one Portfolio entry is required" }),

  servicesList: z.array(z.string().min(1, "Service List is required"))
  .nonempty({ message: "At least one Service List entry is required" }),

  languages: z
    .array(z.string())
    .min(1, { message: "You must select at least one language." }),
});

const OnBoardFreelancer = () => {
  const [section, setSection] = useState<1 | 2>(1);
  const [errorx, setErrorx] = useState("");
  const [UID, setUID] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [educationFields, setEducationFields] = useState<string[]>([""]);
  const [experienceFields, setExperienceFields] = useState<string[]>([""]);
  const [portfolioFields, setPortfolioFields] = useState<string[]>([""]);
  const [servicesListFields, setServicesListFields] = useState<string[]>([""]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {name, email, password} = location.state || {};
  const credential = location.state?.credential; // * Get Google credential from location state

  // * register user with google function
  const registerUserWithGoogle = async (credential: string, role: string) => {
    return axios.post(`${import.meta.env.VITE_API_URL}/api/users/google-signup`, { credential, role, UID });
  };

  // * register user function
  async function registerUser(userData: UserRegistrationData){
    return axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, userData);
  }
  
  // * register freelancer function
  async function registerFreelancer(freelancerData: FreelancerRegistrationData){
    return axios.post(`${import.meta.env.VITE_API_URL}/api/users/register/freelancer`, freelancerData);
  }

  const handleNextSection = async() => {
    if (section === 1) {
      if (!phoneNumber || !address || !UID) {
        setErrorx("Please fill in all the fields");
        return;
      }
      const isUIDAvailable = await handleUID(UID);
      
      if (!isUIDAvailable) {
        setErrorx("UID already exists");
        return;
      }
    }
    setSection(2);
    setErrorx("");
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    // console.log("Form Data:", data);
    // console.log(credential);

    if(credential){
      // console.log(credential);
      const userResponse = await registerUserWithGoogle(credential, "freelancer");
      // console.log(userResponse);

      // Now, create the freelancer object
      const freelancerResponse = await registerFreelancer({
        userId: userResponse.data._id,
        bio: data.bio,
        education: data.education,
        experience: data.experience || [],
        portfolios: data.portfolio,
        servicesList: data.servicesList,
        skills: data.skills,
        languages: data.languages,
        // @ts-ignore
        phoneNumber: phoneNumber,
        address: address,
      });

      // console.log("Freelancer registered:", freelancerResponse.data);

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
    }else{
      // register the user 
      const userResponse = await registerUser({
        UID,
        name,
        email, 
        password,
        role: "freelancer",
      });
      // console.log(userResponse.data);
  
      // register the freelancer
      const freelancerResponse = await registerFreelancer({
        userId: userResponse.data._id,
        bio: data.bio,
        education: data.education,
        experience: data.experience || [],
        portfolios: data.portfolio,
        servicesList: data.servicesList,
        skills: data.skills,
        languages: data.languages,
        // @ts-ignore
        phoneNumber: phoneNumber,
        address: address,
      });
      // console.log(freelancerResponse.data);
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
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      bio: "",
      skills: [],
      education: [""],
      experience: [""],
      languages: [],
      servicesList:[""],
      portfolio:[""]
    },
  });

  const options = [
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

  const languageOptions = [
    "Afrikaans",
    "Albanian - shqip",
    "Amharic - አማርኛ",
    "Arabic - العربية",
    "Aragonese - aragonés",
    "Armenian - հայերեն",
    "Asturian - asturianu",
    "Azerbaijani - azərbaycan dili",
    "Basque - euskara",
    "Belarusian - беларуская",
    "Bengali - বাংলা",
    "Bosnian - bosanski",
    "Breton - brezhoneg",
    "Bulgarian - български",
    "Catalan - català",
    "Central Kurdish - کوردی (دەستنوسی عەرەبی)",
    "Chinese - 中文",
    "Chinese (Hong Kong) - 中文（香港）",
    "Chinese (Simplified) - 中文（简体）",
    "Chinese (Traditional) - 中文（繁體）",
    "Corsican",
    "Croatian - hrvatski",
    "Czech - čeština",
    "Danish - dansk",
    "Dutch - Nederlands",
    "English",
    "English (Australia)",
    "English (Canada)",
    "English (India)",
    "English (New Zealand)",
    "English (South Africa)",
    "English (United Kingdom)",
    "English (United States)",
    "Esperanto - esperanto",
    "Estonian - eesti",
    "Faroese - føroyskt",
    "Filipino",
    "Finnish - suomi",
    "French - français",
    "French (Canada) - français (Canada)",
    "French (France) - français (France)",
    "French (Switzerland) - français (Suisse)",
    "Galician - galego",
    "Georgian - ქართული",
    "German - Deutsch",
    "German (Austria) - Deutsch (Österreich)",
    "German (Germany) - Deutsch (Deutschland)",
    "German (Liechtenstein) - Deutsch (Liechtenstein)",
    "German (Switzerland) - Deutsch (Schweiz)",
    "Greek - Ελληνικά",
    "Guarani",
    "Gujarati - ગુજરાતી",
    "Hausa",
    "Hawaiian - ʻŌlelo Hawaiʻi",
    "Hebrew - עברית",
    "Hindi - हिन्दी",
    "Hungarian - magyar",
    "Icelandic - íslenska",
    "Indonesian - Indonesia",
    "Interlingua",
    "Irish - Gaeilge",
    "Italian - italiano",
    "Italian (Italy) - italiano (Italia)",
    "Italian (Switzerland) - italiano (Svizzera)",
    "Japanese - 日本語",
    "Kannada - ಕನ್ನಡ",
    "Kazakh - қазақ тілі",
    "Khmer - ខ្មែរ",
    "Korean - 한국어",
    "Kurdish - Kurdî",
    "Kyrgyz - кыргызча",
    "Lao - ລາວ",
    "Latin",
    "Latvian - latviešu",
    "Lingala - lingála",
    "Lithuanian - lietuvių",
    "Macedonian - македонски",
    "Malay - Bahasa Melayu",
    "Malayalam - മലയാളം",
    "Maltese - Malti",
    "Marathi - मराठी",
    "Mongolian - монгол",
    "Nepali - नेपाली",
    "Norwegian - norsk",
    "Norwegian Bokmål - norsk bokmål",
    "Norwegian Nynorsk - nynorsk",
    "Occitan",
    "Oriya - ଓଡ଼ିଆ",
    "Oromo - Oromoo",
    "Pashto - پښتو",
    "Persian - فارسی",
    "Polish - polski",
    "Portuguese - português",
    "Portuguese (Brazil) - português (Brasil)",
    "Portuguese (Portugal) - português (Portugal)",
    "Punjabi - ਪੰਜਾਬੀ",
    "Quechua",
    "Romanian - română",
    "Romanian (Moldova) - română (Moldova)",
    "Romansh - rumantsch",
    "Russian - русский",
    "Scottish Gaelic",
    "Serbian - српски",
    "Serbo-Croatian - Srpskohrvatski",
    "Shona - chiShona",
    "Sindhi",
    "Sinhala - සිංහල",
    "Slovak - slovenčina",
    "Slovenian - slovenščina",
    "Somali - Soomaali",
    "Southern Sotho",
    "Spanish - español",
    "Spanish (Argentina) - español (Argentina)",
    "Spanish (Latin America) - español (Latinoamérica)",
    "Spanish (Mexico) - español (México)",
    "Spanish (Spain) - español (España)",
    "Spanish (United States) - español (Estados Unidos)",
    "Sundanese",
    "Swahili - Kiswahili",
    "Swedish - svenska",
    "Tajik - тоҷикӣ",
    "Tamil - தமிழ்",
    "Tatar",
    "Telugu - తెలుగు",
    "Thai - ไทย",
    "Tigrinya - ትግርኛ",
    "Tongan - lea fakatonga",
    "Turkish - Türkçe",
    "Turkmen",
    "Twi",
    "Ukrainian - українська",
    "Urdu - اردو",
    "Uyghur",
    "Uzbek - o‘zbek",
    "Vietnamese - Tiếng Việt",
    "Walloon - wa",
    "Welsh - Cymraeg",
    "Western Frisian",
    "Xhosa",
    "Yiddish",
    "Yoruba - Èdè Yorùbá",
    "Zulu - isiZulu",
];

  const handleUID = async (UID: string) => {
    const trimmedUID = UID.trim();
    if (trimmedUID.includes(" ")) {
      console.error("UID cannot contain whitespace.");
      return false; // Indicate invalid UID due to whitespace
    }
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/check-uid`, { UID });
        return response.data.message === "UID is available";
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
            return false; // UID already exists
        }
        console.error("Error checking UID:", error);
        throw error;
    }
  };

//skills
  const handleAddSkills = (value: string) => {
    if (selectedItems.length <= 5 && !selectedItems.includes(value)) {
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

//education
  const handleAddEducation = () => {
    setEducationFields([...educationFields, ""]);
  };

  const handleEducationChange = (index: number, value: string) => {
    const newEducationFields = [...educationFields];
    newEducationFields[index] = value;
    setEducationFields(newEducationFields);
    // @ts-ignore
    form.setValue("education", newEducationFields.filter(e => e.trim() !== ""));
    form.trigger("education");
  };
  
  const handleRemoveEducation = (index: number) => {
    const newFields = educationFields.filter((_, i) => i !== index);
    setEducationFields(newFields);
    // @ts-ignore
    form.setValue("education", newFields.filter(e => e.trim() !== ""));
    form.trigger("education");
  };

//experience
  const handleAddExperience = () => {
    setExperienceFields([...experienceFields, ""]);
  };

  const handleExperienceChange = (index: number, value: string) => {
    const newExperienceFields = [...experienceFields];
    newExperienceFields[index] = value;
    setExperienceFields(newExperienceFields);
    form.setValue("experience", newExperienceFields);
  };

  const handleRemoveExperience = (experienceIndex: number) => {
    const newFields = [...experienceFields];
    newFields.splice(experienceIndex, 1); // Remove the entry at index
    setExperienceFields(newFields); 
    form.setValue("experience", newFields);
    form.trigger("experience");
  };
//portfolios 
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

//servicesList 
  const handleAddServicesList = () => {
    setServicesListFields([...servicesListFields, ""]);
  };

  const handleServicesListChange = (index: number, value: string) => {
    const newServicesListFields = [...servicesListFields];
    newServicesListFields[index] = value;
    setServicesListFields(newServicesListFields);
    form.setValue("servicesList", newServicesListFields  as [string, ...string[]]);
    form.trigger("servicesList");
  };

  const handleRemoveServicesList = (servicesListIndex: number) => {
    const newFields = [...servicesListFields];
    newFields.splice(servicesListIndex, 1); // Remove the entry at index
    setServicesListFields(newFields); 
    form.setValue("servicesList", newFields  as [string, ...string[]]);
    form.trigger("servicesList");
  };

//language
  const handleAddLanguage = (value: string) => {
    if (!selectedLanguages.includes(value)) {
      const newItems = [...selectedLanguages, value];
      setSelectedLanguages(newItems);
      form.setValue("languages", newItems);
      form.trigger("languages"); // manually trigger validation
    }
  };

  const handleRemoveLanguage = (value: string) => {
    const newLanguage  = selectedLanguages.filter((item) => item !== value);
    setSelectedLanguages(newLanguage);
    form.setValue("languages", newLanguage);
    form.trigger("languages"); // manually trigger validation
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

        <div className="mt-7 lg:mt-7">
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

                <div className=" w-full pb-6 lg:pb-8 items-center gap-1.5">
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
          : (
            <div className="mt-6 lg:mt-8 pb-8 px-4 lg:px-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full lg:w-[494px] h-auto lg:h-[81px] mx-auto lg:ml-14 space-y-0 mb-6 lg:mb-0">
                        <FormLabel className="text-gray-700 pb-2 text-xl">Bio</FormLabel>
                        <FormControl>
                          <Input
                            className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="" />
                      </FormItem>
                    )}
                  />
                  {/* Skills section */}
                  <FormField
                    control={form.control}
                    name="skills"
                    render={() => (
                      <FormItem className="w-full lg:w-[494px] h-auto mx-auto lg:ml-14 mt-6 lg:mt-9 space-y-0">
                        <FormLabel className="text-gray-700 text-lg lg:text-xl">
                          What are your skills
                        </FormLabel>
                        <FormDescription className="relative text-gray-500 mt-0 pb-2 text-sm">
                          You can select up to 5 options
                        </FormDescription>
                        <FormControl>
                          <Select onValueChange={handleAddSkills} value="">
                            <SelectTrigger className="px-4 py-2 border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-white">
                              <span className="text-gray-500">Select an option</span>
                            </SelectTrigger>
                            <SelectContent className="mt-2 border border-gray-300 rounded-md bg-white shadow-lg z-10">
                              {options.map((option) => (
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
                          {selectedItems.filter(item => item.length > 0).map(item => (
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

                  {/* Language */}
                  <FormField
                    control={form.control}
                    name="languages"
                    render={() => (
                      <FormItem className="w-full lg:w-[494px] h-auto mx-auto lg:ml-14 mt-6 lg:mt-9 space-y-0">
                        <FormLabel className="text-gray-700 text-lg lg:text-xl">
                          What languages are you proficient in
                        </FormLabel>
                        <FormDescription className="relative text-gray-500 mt-0 pb-2 text-sm">
                        </FormDescription>
                        <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild >
                          <Button
                            variant="outline"
                            aria-expanded={open}
                            className="lg:w-[494px] w-full mt-9 justify-between border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                          >
                            <p className="text-gray-500 font-normal">Select a language</p>
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[494px] p-0">
                          <Command >
                            <CommandInput placeholder="Search language..." className="h-9 " />
                            <CommandList>
                              <CommandEmpty>Not found.</CommandEmpty>
                              <CommandGroup>
                                {languageOptions.map((language) => (
                                  <CommandItem
                                    key={language}
                                    value={language}
                                    onSelect={(currentValue) => {
                                      handleAddLanguage(currentValue)
                                      setOpen(false)
                                    }}
                                  >
                                    {language}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                        </FormControl>
                        <div className="flex flex-wrap mt-2">
                          {selectedLanguages.map((language) => (
                            <div className="pt-2 pr-2" key={language}>
                              <Button
                                onClick={() => handleRemoveLanguage(language)}
                                className="text-white rounded-3xl bg-blue-600 hover:bg-blue-500"
                              >
                                <div className="flex flex-row items-center">
                                  <p>{language}</p>
                                  <div className="pt-[0.15rem] pl-2">
                                    <VscChromeClose className="w-5 h-5" />
                                  </div>
                                </div>
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="">
                          {form.formState.errors.languages && (
                            <FormMessage className=" text-red-500">
                              {form.formState.errors.languages.message}
                            </FormMessage>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Education Section */}
                  <div>
                    {educationFields.map((field, index) => (
                      <div key={index} className="w-full lg:w-[494px] py-4 lg:ml-14 space-y-2 relative">
                        <FormField
                          control={form.control}
                          name={`education.${index}`}
                          render={() => (
                            <FormItem className="flex flex-col space-y-0">
                              <FormLabel className="text-gray-700 text-xl mb-1">Education {index + 1}</FormLabel>
                              <FormDescription className="relative text-gray-500 mt-0 pb-1 md:text-sm text-[1rem]">
                                Enter degree and institution (e.g., "BSc Computer Science : XYZ University")
                              </FormDescription>
                              <FormControl>
                                <Input
                                  className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                                  value={field}
                                  onChange={(e) => handleEducationChange(index, e.target.value)}
                                  placeholder="Degree : Institution"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          {index > 0 && (
                            <Button
                              type="button"
                              className="absolute px-3 top-[1rem] right-0 bg-red-600 hover:bg-red-500"
                              onClick={() => handleRemoveEducation(index)}
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
                    <div className="lg:ml-14 mt-4 mb-6">
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0"
                        onClick={handleAddEducation}
                      >
                        + Add Education
                      </Button>
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="">
                    {experienceFields.map((_, index) => (
                      <div key={index} className="lg:w-[494px] lg:ml-14 mb-4 mt-9 space-y-2 relative">
                        <FormField
                          control={form.control}
                          name={`experience.${index}`}
                          render={() => (
                            <FormItem className="flex flex-col space-y-0">
                              <FormLabel className="text-gray-700 text-xl mb-6">Experience {index + 1}</FormLabel>
                                <Input
                                  className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                                  
                                  value={experienceFields[index]}
                                  onChange={(e) => handleExperienceChange(index, e.target.value)}
                                />
                            </FormItem>
                          )}
                        />
                        <div className="">
                          {index > 0 && (
                            <Button
                              type="button"
                              className="absolute px-3 py-1 top-0 right-0 bg-red-600 hover:bg-red-500"
                              onClick={() => handleRemoveExperience(index)}
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
                    <div className="lg:ml-14 mt-4">
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                        onClick={handleAddExperience}
                      >
                        + Add Experience
                      </Button>
                    </div>
                  </div>

                  {/* Portfolio Section */}
                  <div className="">
                    {portfolioFields.map((_, index) => (
                      <div key={index} className="lg:w-[494px] lg:ml-14 mb-4 mt-9 space-y-2 relative">
                        <FormField
                          control={form.control}
                          name={`portfolio.${index}`}
                          render={(field) => (
                            <FormItem className="flex flex-col space-y-0">
                              <FormLabel className="text-gray-700 text-xl mb-6">Portfolio {index + 1}</FormLabel>
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
                    <div className="lg:ml-14 mt-4">
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                        onClick={handleAddPortfolio}
                      >
                        + Add Portfolio
                      </Button>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="">
                    {servicesListFields.map((_, index) => (
                      <div key={index} className="lg:w-[494px] lg:ml-14 mb-4 mt-9 space-y-2 relative">
                        <FormField
                          control={form.control}
                          name={`servicesList.${index}`}
                          render={() => (
                            <FormItem className="flex flex-col space-y-0">
                              <FormLabel className="text-gray-700 text-xl mb-6">Services List {index + 1}</FormLabel>
                                <Input
                                  className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                                  
                                  value={servicesListFields[index]}
                                  onChange={(e) => handleServicesListChange(index, e.target.value)}
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
                              onClick={() => handleRemoveServicesList(index)}
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
                    <div className="lg:ml-14 mt-4">
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                        onClick={handleAddServicesList}
                      >
                        + Add Services List
                      </Button>
                    </div>
                  </div>

                  <div className="mt-9 lg:ml-14">
                    <Button
                      type="submit"
                      className="bg-blue-600 text-white rounded-md hover:bg-green-700 py focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 w-full lg:w-auto"
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

export default OnBoardFreelancer;