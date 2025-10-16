export interface GETCommunityListReq {
  type?: string;
  page: number;
  size: number;
}

export interface GETCommunityPostListReq {
  page: number;
  size: number;
  filter: string;
}
