import WeldClient from "./WeldClient";
import { cookies } from "next/headers";
import { API_ROUTES } from "@/routes";
import { UserDto, WeldListDto } from "@/dtos";
import ky from "ky";

export default async function WeldPage() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;
  let items: WeldListDto[] = [];
  let currentUser: UserDto | null = null;
  let fetchError: string | undefined;

  try {
    currentUser = await ky
      .get<UserDto>(API_ROUTES.users.me, {
        headers: {
          Cookie: `token=${token}`,
        },
      })
      .json();
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    fetchError = "Failed to fetch user information";
  }

  try {
    items = await ky
      .get<WeldListDto[]>(API_ROUTES.weldLists.toDo, {
        headers: {
          Cookie: `token=${token}`,
        },
      })
      .json();
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : "Unexpected error while fetching data.";
  }

  return (
    <WeldClient
      initialItems={items}
      currentUser={currentUser}
      fetchError={fetchError}
    />
  );
}
