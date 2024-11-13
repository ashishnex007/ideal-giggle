import axios from "axios";
import { RootState } from '@/hooks/store';
import { useSelector } from 'react-redux';
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,  AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

import { AiOutlinePlus, AiOutlineClose} from "react-icons/ai";
import { MdOutlineFileUpload } from "react-icons/md";
import createproject from "@/assets/vectors/create_project.svg";
import { ScrollArea } from "./ui/scroll-area";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const FormSchema = z.object({
  projectTitle: z.string().min(10, {
    message: "Project Title must be at least 10 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  domain: z.string().min(1, {
    message: "Domain must be selected.",
  }),
  complexity: z.string().min(1, {
    message: "Complexity must be selected.",
  }),
  deadline: z.date({
    required_error: "Please select a deadline.",
  }),
  addImage: z
    .array(z.instanceof(File))
    .max(10, "You can upload up to 10 images.")
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      "Max image size is 5MB."
    )
    .refine(
      (files) => files.every((file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

// Define the types for prices
type PriceType = {
  category: string;
  difficulty: string;
  price: number;
};

// Define domain and complexity options with value and label
const domainOptions = [
  { value: "photoEditing", label: "Photo Editing" },
  { value: "graphicDesign", label: "Graphic Design" },
  { value: "videoEditing", label: "Video Editing" },
];

const complexityOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

// Define a mapping for categories
const categoryMapping: { [key: string]: string } = {
  "Photo Editing": "photoEditing",
  "Graphic Design": "graphicDesign",
  "Video Editing": "videoEditing",
};

const FlashProjects = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const[ credits, setCredits ] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    shouldUnregister: false,
    defaultValues: {
      description: "",
      projectTitle: "",
      domain: "",
      complexity: "",
      deadline: new Date(),
      addImage: [],
    },
  });

  const [prices, setPrices] = useState<PriceType[]>([]);

  const getClientDetails = async() => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/client/${currentUser?._id}`);
    if(response.data){
      setCredits(response.data.credits);
    }
  }

  useEffect(()=> {
    if(currentUser?.role === "client"){
      getClientDetails();
    }
  }, [currentUser?._id]);

  const domain = form.watch("domain");
  const complexity = form.watch("complexity");
  const budget = prices.find(
    (p) => p.category === domain && p.difficulty === complexity
  )?.price || null;

  //  useEffect for fetching prices only when domain or complexity changes
  useEffect(() => {
    if (domain && complexity) {
      const fetchPrice = async () => {
        try {
          const formattedCategory = domain;
          const formattedDifficulty = complexity;
          
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/prices/${formattedCategory}/${formattedDifficulty}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data && response.data.price) {
            setPrices(prev => [...prev, {
              category: formattedCategory,
              difficulty: formattedDifficulty,
              price: response.data.price,
            }]);
          }
        } catch (error) {
          console.error("Failed to fetch price:", error);
        }
      };

      fetchPrice();
    }
  }, [domain, complexity, token]);

  const handleAddDomain = (value: string) => {
    form.setValue("domain", value);
    form.trigger("domain");
  };

  const handleAddComplexity = (value: string) => {
    form.setValue("complexity", value);
    form.trigger("complexity");
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    form.clearErrors("addImage");
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        form.setError("addImage", { type: "manual", message: "File size exceeds the maximum limit of 5MB." });
        return false;
      } else if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) {
        form.setError("addImage", { type: "manual", message: "Unsupported file type. Only .jpg, .jpeg, .png, and .webp formats are supported." });
        return false;
      }
      return true;
    });

    const newSelectedImages = [...selectedImages, ...validFiles];
    if (newSelectedImages.length <= 10) {
      setSelectedImages(newSelectedImages);
      form.setValue("addImage", newSelectedImages);
    } else {
      form.setError("addImage", { type: "manual", message: "You can upload up to 10 images." });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    form.setValue("addImage", updatedImages);
    form.trigger("addImage");
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const submissionData  = {
      title: data.projectTitle,
      description: data.description,
      skills: [data.domain],
      budget: budget,
      deadline:  format(data.deadline, "yyyy-MM-dd"),
    };
    // console.log("Form Data:", data);

    if(budget && budget > credits){
      setIsDialogOpen(false);
      setCreditDialogOpen(true);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/create`, submissionData , {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure 'token' is defined and accessible
        },
      });
      // console.log(response.data); // Handle the response data as needed
      setIsDialogOpen(false);
      setIsAlertOpen(true);
      window.location.reload();
    } catch (error) {
      console.error("Failed to post project details", error);
    }
  };

  return (
    <div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Successfully created a project</AlertDialogTitle>
            <AlertDialogDescription>
              Await for the project manager to approve your project
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notice</AlertDialogTitle>
            <AlertDialogDescription>
              You don't have enough credits to create a project. Please add credits to your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={()=> {navigate("/payments"); window.location.reload();}}>Add credits</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
            variant="outline"
          >
            <AiOutlinePlus className="w-5 h-5 text-white mr-2" />
            <p className="text-white">New Project</p>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[70rem] h-[43.5rem]">
          <Form {...form}>
            <div className="flex w-full items-center justify-center">
              <Label className="text-gray-700 pb-2 text-xl">Create a new Project</Label>
            </div>
            <div className="flex flex-col md:flex-row justify-between">
              <form className="w-full md:w-1/2" onSubmit={form.handleSubmit(onSubmit)}>
                <ScrollArea className="h-[35rem] w-full md:w-[37rem]">
                  <FormField
                    control={form.control}
                    name="projectTitle"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full md:w-[31rem] h-[81px] ml-4 md:ml-14 space-y-0">
                        <FormLabel className="text-gray-700 pb-2 text-xl">Project Title</FormLabel>
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
                    name="description"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full md:w-[31rem] h-[8rem] ml-4 md:ml-14 mt-4 space-y-0">
                        <FormLabel className="text-gray-700 pb-2 text-xl">Give a brief description</FormLabel>
                        <FormControl>
                          <Textarea
                            className="border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col md:flex-row justify-between w-full md:w-[31rem] ml-4 md:ml-14 mt-4">
                    <FormField
                      control={form.control}
                      name="domain"
                      render={() => (
                        <FormItem className="mt-3 space-y-0">
                          <FormLabel className="text-gray-700 text-xl">Select your domain</FormLabel>
                          <FormControl>
                            <Select onValueChange={handleAddDomain}>
                              <SelectTrigger className="w-full md:w-[12rem] px-4 py-2 border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-white">
                                <SelectValue placeholder="Domain" />
                              </SelectTrigger>
                              <SelectContent>
                                {domainOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-gray-100">
                                    <span>{option.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="complexity"
                      render={() => (
                        <FormItem className="mt-3 space-y-0">
                          <FormLabel className="text-gray-700 text-xl">Set your complexity</FormLabel>
                          <FormControl>
                            <Select onValueChange={handleAddComplexity}>
                              <SelectTrigger className="w-full md:w-[12rem] px-4 py-2 border-gray-500 border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-white">
                                <SelectValue placeholder="Complexity" />
                              </SelectTrigger>
                              <SelectContent>
                                {complexityOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-gray-100">
                                    <span>{option.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col md:flex-row justify-between w-full md:w-[31rem] ml-4 md:ml-14 mt-4">
                    <div className="flex flex-col">
                      <FormLabel className="text-gray-700 pb-1 text-xl">Budget</FormLabel>
                      <FormDescription className="relative text-gray-500 pb-2 text-sm">Budget based on the domain and complexity</FormDescription>
                      <div className="flex flex-row">
                        {budget !== null && (
                          <p className="text-gray-700 text-xl">₹{budget}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="my-4 ml-4 md:ml-14 flex flex-col">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-gray-700 pb-1 text-xl">Select Deadline</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                field.onChange(date);
                              }}
                              className="border-gray-500 w-full md:w-[30rem] border-2 rounded focus-visible:ring-offset-0 focus-visible:ring-0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex hidden flex-col ml-4 md:ml-14 mt-4 space-y-0">
                    <FormLabel className="text-gray-700 pb-1 text-xl">Upload resources</FormLabel>
                    <FormDescription className="relative text-gray-500 pb-2 text-sm">You can upload up to 10 images each of size 5MB</FormDescription>
                    <FormField
                      control={form.control}
                      name="addImage"
                      render={() => (
                        <FormItem className="mt-2 space-y-0">
                          <FormControl>
                            <div>
                              <div className="flex mb-2">
                                <Button
                                  type="button"
                                  className="bg-blue-600 hover:bg-blue-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <MdOutlineFileUpload className="w-5 h-5 text-white mr-2" />
                                  <p className="text-white">Browse Files</p>
                                </Button>
                              </div>
                              <Input
                                type="file"
                                accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
                                multiple
                                onChange={handleImageUpload}
                                ref={fileInputRef}
                                className="hidden"
                              />
                              <div className="flex flex-row flex-wrap">
                                {selectedImages.map((image, index) => (
                                  <div key={index} className="relative mr-1">
                                    <Button
                                      type="button"
                                      variant="default"
                                      className="w-24 h-24 bg-transparent hover:bg-gray-50 relative"
                                      onClick={() => removeImage(index)}
                                    >
                                      <div className="relative w-24 h-24">
                                        <img
                                          src={URL.createObjectURL(image)}
                                          alt="Selected"
                                          className="w-24 h-24 object-contain"
                                        />
                                        <AiOutlineClose className="text-red-400 w-7 h-7 absolute top-0 right-0" />
                                      </div>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end mr-4 md:mr-12 mt-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 w-full md:w-36 hover:bg-green-500 rounded-md focus-visible:ring-offset-0 focus-visible:ring-0 focus:ring-0 focus:ring-offset-0"
                      variant="outline"
                    >
                      <AiOutlinePlus className="w-5 h-5 text-white mr-2" />
                      <p className="text-white">Create Project</p>
                    </Button>
                  </div>
                </ScrollArea>
              </form>
              {/* {right side} */}
              <div className="hidden md:block w-full md:w-[28rem]">
                <img src={createproject} className="w-full" />
              </div>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashProjects;