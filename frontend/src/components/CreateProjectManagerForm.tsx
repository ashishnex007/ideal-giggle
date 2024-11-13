import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
const domains = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science', 'DevOps'];

const CreateProjectManagerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    primaryLanguage: '',
    languages: [],
    domains: [],
  });
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prevData => ({ ...prevData, primaryLanguage: value }));
  };

  const handleCheckboxChange = (id, value) => {
    setFormData(prevData => {
      const updatedArray = prevData[id].includes(value)
        ? prevData[id].filter(item => item !== value)
        : [...prevData[id], value];
      return { ...prevData, [id]: updatedArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/create-project-manager', {
        ...formData,
        languages: [formData.primaryLanguage, ...formData.languages]
      });
      toast({
        title: "Success",
        description: "Project manager created successfully",
      });
      setIsOpen(false);
      // Reset form or perform any other necessary actions
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-ccDarkBlue hover:bg-blue-700">Create new PM +</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project Manager</DialogTitle>
          <DialogDescription>
            Enter details of the project manager you want to create
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Phone Number</Label>
              <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input id="address" value={formData.address} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryLanguage" className="text-right">Primary Language</Label>
              <Select onValueChange={handleSelectChange} value={formData.primaryLanguage}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Additional Languages</Label>
              <div className="col-span-3">
                {languages.map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`lang-${lang}`} 
                      checked={formData.languages.includes(lang)}
                      onCheckedChange={(checked) => handleCheckboxChange('languages', lang)}
                    />
                    <label htmlFor={`lang-${lang}`}>{lang}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Domains</Label>
              <div className="col-span-3">
                {domains.map((domain) => (
                  <div key={domain} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`domain-${domain}`} 
                      checked={formData.domains.includes(domain)}
                      onCheckedChange={(checked) => handleCheckboxChange('domains', domain)}
                    />
                    <label htmlFor={`domain-${domain}`}>{domain}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Project Manager</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectManagerForm;