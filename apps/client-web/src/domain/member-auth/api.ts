import { authContract } from "@community-voting-system/shared";
import { useClient } from "../../common/api";
import { MemberAuth } from "./type";


export const memberAuthClient = useClient(authContract)

