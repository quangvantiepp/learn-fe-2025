import { useQuery } from "@tanstack/react-query";
import { getHomeData } from "../api";

export function Header() {
  const { data } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      return await getHomeData({ homeId: 12 });
    },
  });

  return (
    <div>
      <button>Click here</button>
      {/* {data?.data} */}
    </div>
  );
}
