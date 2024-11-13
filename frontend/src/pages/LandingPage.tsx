import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { dots, landing1, landing2 } from "../assets/photos/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { dots1, social_media, script_writing, thumbnails, video_editing } from "../assets/photos/index";
import mission from "@/assets/vectors/mission.svg";
import vision from "@/assets/vectors/vision.svg";
import transform from "@/assets/photos/transform.jpg";

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <div className="p-8">
        <Hero />
      </div>

      <div>
        <div className="flex flex-col md:flex-row w-full py-24 px-4 md:px-0">
          <div className="relative w-full md:w-1/2 md:ml-40">
            <img src={dots} className="absolute top-10 left-[-5rem] w-[15rem] md:w-[25rem] h-[15rem] md:h-[23rem] object-cover opacity-50" />
            <img src={mission} className="relative w-[20rem] md:w-[30rem]" />
          </div>
          <div className="w-full md:w-1/2 md:mr-40 mt-8 md:mt-0">
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-tight">
              Mission
            </h1>
            <p className="text-[0.9rem] text-ccTertiary pt-8 pb-16">
              To revolutionize the content creation landscape by providing businesses and creators with the tools and talent they need to succeed. We strive to make high-quality content accessible to all, enhancing productivity and creativity through expert project management and AI-driven solutions.
            </p>
            <Button className="bg-ccDarkBlue px-8 py-4">Learn More</Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full py-24 px-4 md:px-0">
          <div className="w-full md:w-1/2 md:ml-40">
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-tight">
              Vision
            </h1>
            <p className="text-[0.9rem] text-ccTertiary pt-8 pb-16">
              To become the leading platform for content creation, where creativity meets technology, and every idea has the power to transform into impactful content. We aim to build a future where businesses of all sizes can thrive in the digital space, supported by a global network of creative professionals.
            </p>
            <Button className="bg-ccDarkBlue px-8 py-4">Learn More</Button>
          </div>
          <div className="relative w-full md:w-1/2 md:mr-40 mt-8 md:mt-0">
            <img src={dots} className="absolute top-[-4rem] right-[-2rem] w-[15rem] md:w-[25rem] h-[15rem] md:h-[23rem] object-cover opacity-50" />
            <img src={vision} className="relative w-[20rem] md:w-[30rem]" />
          </div>
        </div>
      </div>

      <div className="pt-12">
        <div className="flex items-center justify-center">
          <div className="relative w-full">
            <img src={dots1} className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] md:w-[80rem] h-[15rem] md:h-[23rem] object-cover opacity-50" />
            <img src={transform} className="relative left-1/2 top-[5rem] transform -translate-x-1/2 w-[20rem] md:w-[30rem]" />
          </div>
        </div>
        <div className="flex flex-col items-center py-32 px-4 md:px-0">
          <h1 className="text-lg md:text-xl font-bold leading-tight tracking-wide">
            Ready to transform your content?
          </h1>
          <p className="text-[0.9rem] md:text-[1rem] text-ccTertiary py-4 px-4 md:px-80 text-center">
            Partner with us to elevate your brand to the next level. Our team of experts is here to bring your vision to life.
          </p>
          <Button className="bg-ccDarkBlue py-4">More Stories</Button>
        </div>
      </div>

      <div className="pb-28">
        <h1 className="text-[2rem] md:text-[3.5rem] font-bold tracking-wide ml-4 md:ml-40">
          Our Services
        </h1>
        <div className="flex justify-center py-4">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-[80rem]"
          >
            <CarouselContent>
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="w-full md:w-[20rem]">
                    <CardContent className="flex flex-col aspect-square p-6">
                      <img className="h-[10rem] object-contain" src={script_writing} />
                      <h1 className="pt-4 text-lg">Compelling Scriptwriting</h1>
                      <p className="text-sm text-ccSecondary py-4">Words that captivate, stories that resonate.</p>
                      <Separator />
                      <Button className="bg-ccDarkBlue py-4">Learn More</Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="w-full md:w-[20rem]">
                    <CardContent className="flex flex-col aspect-square p-6">
                      <img className="h-[10rem] object-contain" src={thumbnails} />
                      <h1 className="pt-4 text-lg">Eye-Catching Thumbnails</h1>
                      <p className="text-sm text-ccSecondary py-4">Thumbnails that stop the scroll and spark curiosity.</p>
                      <Separator />
                      <Button className="bg-ccDarkBlue py-4">Learn More</Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="w-full md:w-[20rem]">
                    <CardContent className="flex flex-col aspect-square p-6">
                      <img className="h-[10rem] object-contain" src={video_editing} />
                      <h1 className="pt-4 text-lg">Stunning Video Edits</h1>
                      <p className="text-sm text-ccSecondary py-4">Transforming footage into visual masterpieces.</p>
                      <Separator />
                      <Button className="bg-ccDarkBlue py-4">Learn More</Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="w-full md:w-[20rem]">
                    <CardContent className="flex flex-col aspect-square p-6">
                      <img className="h-[10rem] object-contain" src={social_media} />
                      <h1 className="pt-4 text-lg">Social Media Management</h1>
                      <p className="text-sm text-ccSecondary py-4">Crafting social strategies that drive engagement and growth.</p>
                      <Separator />
                      <Button className="bg-ccDarkBlue py-4">Learn More</Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default LandingPage;