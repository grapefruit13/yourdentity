/**
 * @description 한국 지역 데이터 (시/도, 구/군)
 * @note 이 파일은 API 실패 시 fallback으로 사용됩니다.
 * API 응답이 있으면 API 데이터를 우선 사용하고, 이 파일의 데이터는 보조적으로 사용됩니다.
 *
 * 이 파일은 scripts/update-regions-fallback.ts 스크립트로 자동 업데이트됩니다.
 * API 응답이 변경되면 해당 스크립트를 실행하여 fallback 데이터를 업데이트하세요.
 */

export interface Region {
  code: string;
  name: string;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
}

/**
 * @description Fallback 지역 데이터
 * API 실패 시 사용되며, API 응답이 있으면 API 데이터로 업데이트됩니다.
 */
export const KOREAN_REGIONS_FALLBACK: Region[] = [
  {
    code: "11",
    name: "서울특별시",
    districts: [
      {
        code: "11230",
        name: "강남구",
      },
      {
        code: "11250",
        name: "강동구",
      },
      {
        code: "11090",
        name: "강북구",
      },
      {
        code: "11160",
        name: "강서구",
      },
      {
        code: "11210",
        name: "관악구",
      },
      {
        code: "11050",
        name: "광진구",
      },
      {
        code: "11170",
        name: "구로구",
      },
      {
        code: "11180",
        name: "금천구",
      },
      {
        code: "11110",
        name: "노원구",
      },
      {
        code: "11100",
        name: "도봉구",
      },
      {
        code: "11060",
        name: "동대문구",
      },
      {
        code: "11200",
        name: "동작구",
      },
      {
        code: "11140",
        name: "마포구",
      },
      {
        code: "11130",
        name: "서대문구",
      },
      {
        code: "11220",
        name: "서초구",
      },
      {
        code: "11040",
        name: "성동구",
      },
      {
        code: "11080",
        name: "성북구",
      },
      {
        code: "11240",
        name: "송파구",
      },
      {
        code: "11150",
        name: "양천구",
      },
      {
        code: "11190",
        name: "영등포구",
      },
      {
        code: "11030",
        name: "용산구",
      },
      {
        code: "11120",
        name: "은평구",
      },
      {
        code: "11010",
        name: "종로구",
      },
      {
        code: "11020",
        name: "중구",
      },
      {
        code: "11070",
        name: "중랑구",
      },
    ],
  },
  {
    code: "21",
    name: "부산광역시",
    districts: [
      {
        code: "21120",
        name: "강서구",
      },
      {
        code: "21110",
        name: "금정구",
      },
      {
        code: "21510",
        name: "기장군",
      },
      {
        code: "21070",
        name: "남구",
      },
      {
        code: "21030",
        name: "동구",
      },
      {
        code: "21060",
        name: "동래구",
      },
      {
        code: "21050",
        name: "부산진구",
      },
      {
        code: "21080",
        name: "북구",
      },
      {
        code: "21150",
        name: "사상구",
      },
      {
        code: "21100",
        name: "사하구",
      },
      {
        code: "21020",
        name: "서구",
      },
      {
        code: "21140",
        name: "수영구",
      },
      {
        code: "21130",
        name: "연제구",
      },
      {
        code: "21040",
        name: "영도구",
      },
      {
        code: "21010",
        name: "중구",
      },
      {
        code: "21090",
        name: "해운대구",
      },
    ],
  },
  {
    code: "22",
    name: "대구광역시",
    districts: [
      {
        code: "22520",
        name: "군위군",
      },
      {
        code: "22040",
        name: "남구",
      },
      {
        code: "22070",
        name: "달서구",
      },
      {
        code: "22510",
        name: "달성군",
      },
      {
        code: "22020",
        name: "동구",
      },
      {
        code: "22050",
        name: "북구",
      },
      {
        code: "22030",
        name: "서구",
      },
      {
        code: "22060",
        name: "수성구",
      },
      {
        code: "22010",
        name: "중구",
      },
    ],
  },
  {
    code: "23",
    name: "인천광역시",
    districts: [
      {
        code: "23510",
        name: "강화군",
      },
      {
        code: "23070",
        name: "계양구",
      },
      {
        code: "23050",
        name: "남동구",
      },
      {
        code: "23020",
        name: "동구",
      },
      {
        code: "23090",
        name: "미추홀구",
      },
      {
        code: "23060",
        name: "부평구",
      },
      {
        code: "23080",
        name: "서구",
      },
      {
        code: "23040",
        name: "연수구",
      },
      {
        code: "23520",
        name: "옹진군",
      },
      {
        code: "23010",
        name: "중구",
      },
    ],
  },
  {
    code: "24",
    name: "광주광역시",
    districts: [
      {
        code: "24050",
        name: "광산구",
      },
      {
        code: "24030",
        name: "남구",
      },
      {
        code: "24010",
        name: "동구",
      },
      {
        code: "24040",
        name: "북구",
      },
      {
        code: "24020",
        name: "서구",
      },
    ],
  },
  {
    code: "25",
    name: "대전광역시",
    districts: [
      {
        code: "25050",
        name: "대덕구",
      },
      {
        code: "25010",
        name: "동구",
      },
      {
        code: "25030",
        name: "서구",
      },
      {
        code: "25040",
        name: "유성구",
      },
      {
        code: "25020",
        name: "중구",
      },
    ],
  },
  {
    code: "26",
    name: "울산광역시",
    districts: [
      {
        code: "26020",
        name: "남구",
      },
      {
        code: "26030",
        name: "동구",
      },
      {
        code: "26040",
        name: "북구",
      },
      {
        code: "26510",
        name: "울주군",
      },
      {
        code: "26010",
        name: "중구",
      },
    ],
  },
  {
    code: "29",
    name: "세종특별자치시",
    districts: [
      {
        code: "29010",
        name: "세종시",
      },
    ],
  },
  {
    code: "31",
    name: "경기도",
    districts: [
      {
        code: "31570",
        name: "가평군",
      },
      {
        code: "31101",
        name: "고양시 덕양구",
      },
      {
        code: "31103",
        name: "고양시 일산동구",
      },
      {
        code: "31104",
        name: "고양시 일산서구",
      },
      {
        code: "31110",
        name: "과천시",
      },
      {
        code: "31060",
        name: "광명시",
      },
      {
        code: "31250",
        name: "광주시",
      },
      {
        code: "31120",
        name: "구리시",
      },
      {
        code: "31160",
        name: "군포시",
      },
      {
        code: "31230",
        name: "김포시",
      },
      {
        code: "31130",
        name: "남양주시",
      },
      {
        code: "31080",
        name: "동두천시",
      },
      {
        code: "31052",
        name: "부천시 소사구",
      },
      {
        code: "31053",
        name: "부천시 오정구",
      },
      {
        code: "31051",
        name: "부천시 원미구",
      },
      {
        code: "31023",
        name: "성남시 분당구",
      },
      {
        code: "31021",
        name: "성남시 수정구",
      },
      {
        code: "31022",
        name: "성남시 중원구",
      },
      {
        code: "31012",
        name: "수원시 권선구",
      },
      {
        code: "31014",
        name: "수원시 영통구",
      },
      {
        code: "31011",
        name: "수원시 장안구",
      },
      {
        code: "31013",
        name: "수원시 팔달구",
      },
      {
        code: "31150",
        name: "시흥시",
      },
      {
        code: "31092",
        name: "안산시 단원구",
      },
      {
        code: "31091",
        name: "안산시 상록구",
      },
      {
        code: "31220",
        name: "안성시",
      },
      {
        code: "31042",
        name: "안양시 동안구",
      },
      {
        code: "31041",
        name: "안양시 만안구",
      },
      {
        code: "31260",
        name: "양주시",
      },
      {
        code: "31580",
        name: "양평군",
      },
      {
        code: "31280",
        name: "여주시",
      },
      {
        code: "31550",
        name: "연천군",
      },
      {
        code: "31140",
        name: "오산시",
      },
      {
        code: "31192",
        name: "용인시 기흥구",
      },
      {
        code: "31193",
        name: "용인시 수지구",
      },
      {
        code: "31191",
        name: "용인시 처인구",
      },
      {
        code: "31170",
        name: "의왕시",
      },
      {
        code: "31030",
        name: "의정부시",
      },
      {
        code: "31210",
        name: "이천시",
      },
      {
        code: "31200",
        name: "파주시",
      },
      {
        code: "31070",
        name: "평택시",
      },
      {
        code: "31270",
        name: "포천시",
      },
      {
        code: "31180",
        name: "하남시",
      },
      {
        code: "31240",
        name: "화성시",
      },
    ],
  },
  {
    code: "32",
    name: "강원특별자치도",
    districts: [
      {
        code: "32030",
        name: "강릉시",
      },
      {
        code: "32600",
        name: "고성군",
      },
      {
        code: "32040",
        name: "동해시",
      },
      {
        code: "32070",
        name: "삼척시",
      },
      {
        code: "32060",
        name: "속초시",
      },
      {
        code: "32580",
        name: "양구군",
      },
      {
        code: "32610",
        name: "양양군",
      },
      {
        code: "32530",
        name: "영월군",
      },
      {
        code: "32020",
        name: "원주시",
      },
      {
        code: "32590",
        name: "인제군",
      },
      {
        code: "32550",
        name: "정선군",
      },
      {
        code: "32560",
        name: "철원군",
      },
      {
        code: "32010",
        name: "춘천시",
      },
      {
        code: "32050",
        name: "태백시",
      },
      {
        code: "32540",
        name: "평창군",
      },
      {
        code: "32510",
        name: "홍천군",
      },
      {
        code: "32570",
        name: "화천군",
      },
      {
        code: "32520",
        name: "횡성군",
      },
    ],
  },
  {
    code: "33",
    name: "충청북도",
    districts: [
      {
        code: "33560",
        name: "괴산군",
      },
      {
        code: "33580",
        name: "단양군",
      },
      {
        code: "33520",
        name: "보은군",
      },
      {
        code: "33540",
        name: "영동군",
      },
      {
        code: "33530",
        name: "옥천군",
      },
      {
        code: "33570",
        name: "음성군",
      },
      {
        code: "33030",
        name: "제천시",
      },
      {
        code: "33590",
        name: "증평군",
      },
      {
        code: "33550",
        name: "진천군",
      },
      {
        code: "33041",
        name: "청주시 상당구",
      },
      {
        code: "33042",
        name: "청주시 서원구",
      },
      {
        code: "33044",
        name: "청주시 청원구",
      },
      {
        code: "33043",
        name: "청주시 흥덕구",
      },
      {
        code: "33020",
        name: "충주시",
      },
    ],
  },
  {
    code: "34",
    name: "충청남도",
    districts: [
      {
        code: "34070",
        name: "계룡시",
      },
      {
        code: "34020",
        name: "공주시",
      },
      {
        code: "34510",
        name: "금산군",
      },
      {
        code: "34060",
        name: "논산시",
      },
      {
        code: "34080",
        name: "당진시",
      },
      {
        code: "34030",
        name: "보령시",
      },
      {
        code: "34530",
        name: "부여군",
      },
      {
        code: "34050",
        name: "서산시",
      },
      {
        code: "34540",
        name: "서천군",
      },
      {
        code: "34040",
        name: "아산시",
      },
      {
        code: "34570",
        name: "예산군",
      },
      {
        code: "34011",
        name: "천안시 동남구",
      },
      {
        code: "34012",
        name: "천안시 서북구",
      },
      {
        code: "34550",
        name: "청양군",
      },
      {
        code: "34580",
        name: "태안군",
      },
      {
        code: "34560",
        name: "홍성군",
      },
    ],
  },
  {
    code: "35",
    name: "전북특별자치도",
    districts: [
      {
        code: "35570",
        name: "고창군",
      },
      {
        code: "35020",
        name: "군산시",
      },
      {
        code: "35060",
        name: "김제시",
      },
      {
        code: "35050",
        name: "남원시",
      },
      {
        code: "35530",
        name: "무주군",
      },
      {
        code: "35580",
        name: "부안군",
      },
      {
        code: "35560",
        name: "순창군",
      },
      {
        code: "35510",
        name: "완주군",
      },
      {
        code: "35030",
        name: "익산시",
      },
      {
        code: "35550",
        name: "임실군",
      },
      {
        code: "35540",
        name: "장수군",
      },
      {
        code: "35012",
        name: "전주시 덕진구",
      },
      {
        code: "35011",
        name: "전주시 완산구",
      },
      {
        code: "35040",
        name: "정읍시",
      },
      {
        code: "35520",
        name: "진안군",
      },
    ],
  },
  {
    code: "36",
    name: "전라남도",
    districts: [
      {
        code: "36590",
        name: "강진군",
      },
      {
        code: "36550",
        name: "고흥군",
      },
      {
        code: "36520",
        name: "곡성군",
      },
      {
        code: "36060",
        name: "광양시",
      },
      {
        code: "36530",
        name: "구례군",
      },
      {
        code: "36040",
        name: "나주시",
      },
      {
        code: "36510",
        name: "담양군",
      },
      {
        code: "36010",
        name: "목포시",
      },
      {
        code: "36620",
        name: "무안군",
      },
      {
        code: "36560",
        name: "보성군",
      },
      {
        code: "36030",
        name: "순천시",
      },
      {
        code: "36680",
        name: "신안군",
      },
      {
        code: "36020",
        name: "여수시",
      },
      {
        code: "36640",
        name: "영광군",
      },
      {
        code: "36610",
        name: "영암군",
      },
      {
        code: "36660",
        name: "완도군",
      },
      {
        code: "36650",
        name: "장성군",
      },
      {
        code: "36580",
        name: "장흥군",
      },
      {
        code: "36670",
        name: "진도군",
      },
      {
        code: "36630",
        name: "함평군",
      },
      {
        code: "36600",
        name: "해남군",
      },
      {
        code: "36570",
        name: "화순군",
      },
    ],
  },
  {
    code: "37",
    name: "경상북도",
    districts: [
      {
        code: "37100",
        name: "경산시",
      },
      {
        code: "37020",
        name: "경주시",
      },
      {
        code: "37570",
        name: "고령군",
      },
      {
        code: "37050",
        name: "구미시",
      },
      {
        code: "37030",
        name: "김천시",
      },
      {
        code: "37090",
        name: "문경시",
      },
      {
        code: "37610",
        name: "봉화군",
      },
      {
        code: "37080",
        name: "상주시",
      },
      {
        code: "37580",
        name: "성주군",
      },
      {
        code: "37040",
        name: "안동시",
      },
      {
        code: "37550",
        name: "영덕군",
      },
      {
        code: "37540",
        name: "영양군",
      },
      {
        code: "37060",
        name: "영주시",
      },
      {
        code: "37070",
        name: "영천시",
      },
      {
        code: "37600",
        name: "예천군",
      },
      {
        code: "37630",
        name: "울릉군",
      },
      {
        code: "37620",
        name: "울진군",
      },
      {
        code: "37520",
        name: "의성군",
      },
      {
        code: "37560",
        name: "청도군",
      },
      {
        code: "37530",
        name: "청송군",
      },
      {
        code: "37590",
        name: "칠곡군",
      },
      {
        code: "37011",
        name: "포항시 남구",
      },
      {
        code: "37012",
        name: "포항시 북구",
      },
    ],
  },
  {
    code: "38",
    name: "경상남도",
    districts: [
      {
        code: "38090",
        name: "거제시",
      },
      {
        code: "38590",
        name: "거창군",
      },
      {
        code: "38540",
        name: "고성군",
      },
      {
        code: "38070",
        name: "김해시",
      },
      {
        code: "38550",
        name: "남해군",
      },
      {
        code: "38080",
        name: "밀양시",
      },
      {
        code: "38060",
        name: "사천시",
      },
      {
        code: "38570",
        name: "산청군",
      },
      {
        code: "38100",
        name: "양산시",
      },
      {
        code: "38510",
        name: "의령군",
      },
      {
        code: "38030",
        name: "진주시",
      },
      {
        code: "38530",
        name: "창녕군",
      },
      {
        code: "38113",
        name: "창원시 마산합포구",
      },
      {
        code: "38114",
        name: "창원시 마산회원구",
      },
      {
        code: "38112",
        name: "창원시 성산구",
      },
      {
        code: "38111",
        name: "창원시 의창구",
      },
      {
        code: "38115",
        name: "창원시 진해구",
      },
      {
        code: "38050",
        name: "통영시",
      },
      {
        code: "38560",
        name: "하동군",
      },
      {
        code: "38520",
        name: "함안군",
      },
      {
        code: "38580",
        name: "함양군",
      },
      {
        code: "38600",
        name: "합천군",
      },
    ],
  },
  {
    code: "39",
    name: "제주특별자치도",
    districts: [
      {
        code: "39020",
        name: "서귀포시",
      },
      {
        code: "39010",
        name: "제주시",
      },
    ],
  },
];
