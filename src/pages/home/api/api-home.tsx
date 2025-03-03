import api from "../../../utils/use-axios";

export async function getHomeData({ homeId }: { homeId: number }) {
  const response = await api.get(
    `/api/user/all-users?pageNumber=0&pageSize=10`
  );
  return response;
}
