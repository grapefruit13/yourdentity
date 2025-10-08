import { redirect } from "next/navigation";
import { LINK_URL } from "@/constants/shared/_link-url";

/**
 * @description 홈페이지
 */
const HomePage = () => {
  redirect(LINK_URL.HOME);
};

export default HomePage;
