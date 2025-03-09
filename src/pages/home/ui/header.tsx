import { useQuery } from "@tanstack/react-query";
import { getHomeData } from "../api";

export function Header() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await getHomeData({ homeId: 12 });
    },
  });

  console.log("mock data:", data?.data);

  return (
    <div>
      <button>Click here</button>
      {/* {data?.data} */}
      {data?.data?.map((item: { id: number; name: string }) => {
        return <div>{item?.name}</div>;
      })}
    </div>
  );
}
