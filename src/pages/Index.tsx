import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import SaleBanner from "@/components/SaleBanner";
import NewArrivals from "@/components/NewArrivals";
import CustomDesignBanner from "@/components/CustomDesignBanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <SaleBanner />
      <NewArrivals />
      <CustomDesignBanner />
      <Footer />
    </div>
  );
};

export default Index;
