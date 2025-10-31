// "use client";

// import type { ReactNode } from "react";
// import TopBar from "@/components/shared/layouts/top-bar";
// import { Typography } from "@/components/shared/typography";

// type WriteLayoutProps = {
//   children: ReactNode;
// };

// const WriteLayout = ({ children }: WriteLayoutProps) => {
//   const handleRequestComplete = () => {
//     // 페이지에서 게시 확인 모달을 열 수 있도록 커스텀 이벤트 브로드캐스트
//     window.dispatchEvent(new CustomEvent("community-write:request-complete"));
//   };

//   return (
//     <>
//       <TopBar
//         title="글작성"
//         rightSlot={
//           <button
//             onClick={handleRequestComplete}
//             className="text-pink-500"
//             aria-label="완료"
//           >
//             <Typography font="noto" variant="body2M" className="text-pink-500">
//               완료
//             </Typography>
//           </button>
//         }
//       />
//       {children}
//     </>
//   );
// };

// export default WriteLayout;
