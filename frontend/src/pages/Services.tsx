import Navbar from '@/components/Navbar';
import services from "@/assets/photos/services.jpg";
import { Button } from '@/components/ui/button';

import { graphic_design, script_writing, social_media, video_editing } from '@/assets/photos';
import Footer from '@/components/Footer';

const Services = () => {
  return (
    <div>
      <Navbar />

      <div className="relative h-[95vh] bg-cover bg-center" style={{backgroundImage: `url(${services})`}}>
        <div className="absolute inset-0 bg-black opacity-60"></div>

        <div className="relative z-10 flex flex-col w-full">

            <div className="pt-[40vh] px-[10rem]">
                <h1 className="text-white text-[5rem] font-bold tracking-tight drop-shadow-xl">Our Services</h1>
                <h1 className="text-white text-[1.5rem] tracking-tighter drop-shadow-xl pb-8">Innovative solutions to elevate your creative projects</h1>
                <Button className="bg-ccDarkBlue hover:bg-blue-700 drop-shadow-xl">Explore Now</Button>
            </div>

        </div>

      </div>

      <div>

        <div className="h-screen flex flex-col justify-evenly">
            <div className="flex items-center w-full">
                <div className="relative w-1/3 ml-40">
                    <img src={video_editing} className="relative w-[30rem] max-h-[12rem] object-contain" />
                </div>
                <div className="w-2/3 mx-40">
                    <h1 className="text-[2rem] font-bold flex justify-end px-4 leading-tight tracking-tighter">
                        Video Editing
                    </h1>
                    <p className="text-[1.2rem] flex text-right text-ccSecondary pl-12 pt-8 pb-16">
                        Our video editing service transforms  your raw footage into captivating stories with our expert video editors. Unlike traditional employees, our freelancers leverage cutting-edge technology and AI tools for faster, more creative editing, ensuring your content stands out in a crowded digital space.
                    </p>
                </div>
            </div>

            <div className="flex items-center w-full">
                <div className="w-2/3 ml-40">
                    <h1 className="text-[2rem] font-bold leading-tight tracking-tighter">
                        Graphic Designing
                    </h1>
                    <p className="text-[1.2rem] text-ccSecondary pr-12 pt-8 pb-16">
                        Our graphic designers bring your vision to life with stunning visuals that captivate and engage. Compared to traditional designers, our freelancers use advanced design software and AI-driven insights to deliver high-quality, on-trend graphics that resonate with your audience.                
                    </p>
                </div>
                <div className="relative w-1/3 mr-40">
                    <img src={graphic_design} className="relative w-[30rem] max-h-[12rem] object-contain" />
                </div>
            </div>
        </div>

        <div className="h-screen flex flex-col justify-evenly">
            <div className="flex items-center w-full">
                <div className="relative w-1/3 ml-40">
                    <img src={script_writing} className="relative w-[30rem] max-h-[12rem] object-contain" />
                </div>
                <div className="w-2/3 mx-40">
                    <h1 className="text-[2rem] font-bold flex justify-end px-4 leading-tight tracking-tighter">
                        Content Writing Service
                    </h1>
                    <p className="text-[1.2rem] flex text-right text-ccSecondary pl-12 pt-8 pb-16">
                        Our Content Writers harness AI and technology to produce well-researched, engaging content quickly, offering a modern edge over traditional writing services that may lack the same efficiency and relevance.
                    </p>
                </div>
            </div>

            <div className="flex items-center w-full">
                <div className="w-2/3 ml-40">
                    <h1 className="text-[2rem] font-bold leading-tight tracking-tighter">
                        Social Media Management
                    </h1>
                    <p className="text-[1.2rem] text-ccSecondary pr-12 pt-8 pb-16">
                        Boost your brand’s online presence with our proactive social media managers. By utilizing the latest AI tools and analytics, our freelancers provide strategic insights and real-time engagement, outpacing traditional management methods with dynamic, data-driven strategies.        
                    </p>
                </div>
                <div className="relative w-1/3 mr-40">
                    <img src={social_media} className="relative w-[30rem] max-h-[12rem] object-contain" />
                </div>
            </div>
        </div>

      </div>

      <div className="w-full bg-slate-100">
        <h1 className="text-4xl py-8 text-center font-bold">Ready to transform your brand?</h1>
        <h1 className="text-xl text-center text-ccSecondary px-[30vw]">
            Partner with us to elevate your brand's identity and make a lasting impact in the market. Let's create something extraordinary together.
        </h1>
        <div className="flex justify-center py-8">
            <Button className="bg-ccDarkBlue hover:bg-blue-700 drop-shadow-xl">Get in touch</Button>
        </div>
      </div>

      <Footer />

    </div>
  )
}

export default Services
