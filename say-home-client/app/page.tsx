// import Image from "next/image";
import ChatBubble from "./chatbot/components/chatbotBubble";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LatestProperties from './components/LatestProperties';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';


export default function HomePage() {
  return (
    <main>
      <Navbar 
        onHero={true} />
      
      <Hero />
      <LatestProperties />
      <AboutSection />
      <ContactSection />
      <ChatBubble/>
      <Footer />
    </main>
  );
}
