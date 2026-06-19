import { cookies } from "next/headers";
import { CutListDto, UserDto } from "@/dtos";
import { getCutLists, getMe } from "@/lib/api";
import CutClient from "@/app/(factory)/cut/CutClient";

export default async function CutPage() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;
  let items: CutListDto[] = [];
  let currentUser: UserDto | null = null;
  let fetchError: string | undefined;

  try {
    currentUser = await getMe(token);
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    fetchError = "Failed to fetch user information";
  }

  try {
    items = await getCutLists(token);
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : "Unexpected error while fetching data.";
  }

  return (
    <CutClient
      initialItems={items}
      currentUser={currentUser}
      fetchError={fetchError}
    />
  );
}
