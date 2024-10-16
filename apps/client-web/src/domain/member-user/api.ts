import { userContract } from "@community-voting-system/shared";
import { useClient } from "../../common/api";
import { MemberUser } from "./type";


export const memberUserClient = useClient(userContract)
