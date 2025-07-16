// Import necessary modules
import { cookies } from "next/headers";
import { CutListDto, UserDto } from "@/dtos";
import ky from "ky";
import { API_ROUTES } from "@/routes";
import CutClient from "@/app/(factory)/cut/CutClient";

// Main page component for cut
export default async function CutPage() {
  // Get cookies
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;
  let items: CutListDto[] = [];
  let currentUser: UserDto | null = null;
  let fetchError: string | undefined;

  // Fetch current user
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

  // Fetch cut lists
  try {
    items = await ky
      .get<CutListDto[]>(API_ROUTES.cutLists.toDo, {
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
  // Render client component
  return (
    <CutClient
      initialItems={items}
      currentUser={currentUser}
      fetchError={fetchError}
    />
  );
}
