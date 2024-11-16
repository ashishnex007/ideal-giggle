import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import contact from "@/assets/vectors/contact.svg";
import Footer from '@/components/Footer';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setPhone(value);
            setError("");
        } else {
            setError("Phone number can only contain digits.");
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = () => {
        if (!name || !email || !phone || !message) {
            setError("All fields are required.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Invalid email address.");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            setError("Phone number must be 10 digits long.");
            return;
        }

        setError("");
        // Send the form data to the backend
        Swal.fire({
            title: "Thank you for your response!",
            text: "We will get back to you as soon as possible.",
            icon: "success"
        });

        navigate("/");        
    }

  return (
    <div>
      <Navbar />
      <div className="h-[90vh]">
        <h1 className="text-4xl font-bold tracking-tighter text-center py-4">Get In Touch</h1>
        <h1 className="text-center pb-20">We'd love to hear from you! Please fill out the form below to get in touch with us.</h1>
        
        <div className="w-full px-40 flex gap-x-20">

            <div className="w-1/2">
                <h1 className="text-center font-semibold text-4xl pb-4">Contact Form</h1>
                <div className="flex flex-col items-center gap-y-4">
                    <Input placeholder="Name" value={name} onChange={(e)=> setName(e.target.value)} className="w-[20rem]" />
                    <Input placeholder="Email" value={email} onChange={(e)=> setEmail(e.target.value)} className="w-[20rem]" />
                    <Input placeholder="Phone" className="w-[20rem]" value={phone} onChange={handlePhoneChange}/>
                    <Textarea placeholder="Message" value={message} onChange={(e)=> setMessage(e.target.value)} className="w-[20rem]" />
                    {error && <h1 className="text-red-500">{error}</h1>}
                    <Button className="bg-ccDarkBlue hover:bg-blue-700 w-[12rem]" onClick={handleSubmit}>Contact Us</Button>
                </div>
            </div>

            <div className="w-1/2">
                <img src={contact} />
            </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact
