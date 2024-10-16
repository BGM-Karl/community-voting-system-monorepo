import { AccountRole } from "@community-voting-system/shared";

export const ACCESS_TOKEN_HEADER_KEY = 'authorization';

export interface JwtPayload {
  id: string;
  role: AccountRole;
}

/** 被 passport 嵌入 request 中的 user 物件 */
export type RequestUser = JwtPayload;
