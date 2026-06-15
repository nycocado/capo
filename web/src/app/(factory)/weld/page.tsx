import WeldClient from "./WeldClient";
import { cookies } from "next/headers";
import { UserDto, WeldListDto } from "@/dtos";
import { getCurrentUser, getToDoWeldLists } from "@/lib/api";

export default async function WeldPage() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;
  let items: WeldListDto[] = [];
  let currentUser: UserDto | null = null;
  let fetchError: string | undefined;

  try {
    currentUser = await getCurrentUser(token);
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    fetchError = "Failed to fetch user information";
  }

  try {
    items = await getToDoWeldLists(token);
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
