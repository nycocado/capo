import { cookies } from "next/headers";
import { AssemblyListDto, UserDto } from "@/dtos";
import { getCurrentUser, getToDoAssemblyLists } from "@/lib/api";
import AssemblyClient from "@/app/(factory)/assembly/AssemblyClient";

export default async function AssemblyPage() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;
  let items: AssemblyListDto[] = [];
  let currentUser: UserDto | null = null;
  let fetchError: string | undefined;

  try {
    currentUser = await getCurrentUser(token);
  } catch (err) {
    console.error("Failed to fetch user info:", err);
  }

  try {
    items = await getToDoAssemblyLists(token);
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : "Unexpected error while fetching data.";
  }

  return (
    <AssemblyClient
      initialItems={items}
      currentUser={currentUser}
      fetchError={fetchError}
    />
  );
}
