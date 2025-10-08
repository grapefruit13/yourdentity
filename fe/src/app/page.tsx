import BottomNavigation from "@/components/shared/layouts/bottom-navigation";
import TopBar from "@/components/shared/layouts/top-bar";

/**
 * @description 홈페이지
 */
const HomePage = () => {
  return (
    <>
      <TopBar />
      <div className="flex h-screen w-full flex-col bg-white">
        <h1>홈페이지</h1>
      </div>
      <BottomNavigation />
    </>
  );
};

export default HomePage;
