import Image from "next/image";
import TopBar from "@/components/shared/layouts/top-bar";
import { Typography } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";

/**
 * @description 다운로드 방법 설명 페이지
 */
const DownloadPage = () => {
  return (
    <div className="h-screen max-h-screen overflow-y-auto">
      <TopBar />
      <div className="h-full bg-gray-100 px-5 py-6">
        <div className="flex flex-col gap-1">
          <Typography font="noto" variant="title5" className="text-gray-900">
            홈 화면에 앱 추가하기
          </Typography>
          <Typography font="noto" variant="body2R" className="text-gray-600">
            현재 화면에서 바로 다운로드할 수 있어요.
          </Typography>
        </div>
        <div className="mt-5 rounded-lg bg-white px-4 py-6">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-600"
                >
                  {"1) 브라우저 하단"}&nbsp;
                </Typography>
                <Typography
                  font="noto"
                  variant="body2B"
                  className="text-gray-900"
                >
                  {"공유버튼"}
                </Typography>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-600"
                >
                  {"을 눌러주세요"}
                </Typography>
              </div>
              <div className="relative aspect-[307/52] w-full">
                <Image
                  src={IMAGE_URL.IMG.download.share.url}
                  alt={IMAGE_URL.IMG.download.share.alt}
                  fill
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-600"
                >
                  {"2)"}&nbsp;
                </Typography>
                <Typography
                  font="noto"
                  variant="body2B"
                  className="text-gray-900"
                >
                  홈 화면에 추가
                </Typography>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-600"
                >
                  를 눌러주세요
                </Typography>
              </div>
              <div className="relative aspect-[307/52] w-full">
                <Image
                  src={IMAGE_URL.IMG.download.home.url}
                  alt={IMAGE_URL.IMG.download.home.alt}
                  fill
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-600"
                >
                  {"3) 추가된"}&nbsp;
                </Typography>
                <Typography
                  font="noto"
                  variant="body2B"
                  className="text-gray-900"
                >
                  앱을 실행
                </Typography>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-600"
                >
                  하면 끝이에요
                </Typography>
              </div>
              <div className="relative aspect-[303/58] w-full">
                <Image
                  src={IMAGE_URL.IMG.download.excute.url}
                  alt={IMAGE_URL.IMG.download.excute.alt}
                  fill
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[45px] flex flex-col items-center gap-1">
          <Typography font="noto" variant="body2M" className="text-gray-500">
            지금 바로 시도해보세요!
          </Typography>
          <Image
            src={IMAGE_URL.ICON.chevron.double.down.url}
            alt={IMAGE_URL.ICON.chevron.double.down.alt}
            width={24}
            height={24}
          />
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
