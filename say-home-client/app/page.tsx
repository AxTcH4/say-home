// import Image from "next/image";
"use client";
import ChatBubble from "../features/chatbot/components/chatbotBubble";
import Navbar from '../shared/components/Navbar';
import Hero from '../features/home/components/Hero';
import LatestProperties from '../features/home/components/LatestProperties';
import AboutSection from '../features/home/components/AboutSection';
import HomeHighlights from "../features/home/components/HomeHighlights";
import Footer from '../shared/components/Footer';
import { useAuth } from "@/features/auth/hooks/useAuth";



export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <Navbar 
        onHero={true}
        />
      
      <Hero />
      <LatestProperties />
      <HomeHighlights />
      <AboutSection />
      {
        isAuthenticated && (
      <ChatBubble/>

        )
      }
      <Footer />
    </main>
  );
}
