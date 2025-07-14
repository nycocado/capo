import { cookies } from 'next/headers';
import { AssemblyListDto, UserDto } from '@/dtos';
import ky from 'ky';
import { API_ROUTES } from '@/routes';
import AssemblyClient from '@/app/(factory)/assembly/AssemblyClient';

export default async function AssemblyPage() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;
  let items: AssemblyListDto[] = [];
  let currentUser: UserDto | null = null;
  let fetchError: string | undefined;

  // Fetch current user information
  try {
    currentUser = await ky
      .get<UserDto>(API_ROUTES.users.me, {
        headers: {
          Cookie: `token=${token}`,
        },
      })
      .json();
  } catch (err) {
    console.error('Failed to fetch user info:', err);
  }

  // Fetch assembly lists
  try {
    items = await ky
      .get<AssemblyListDto[]>(API_ROUTES.assemblyLists.toDo, {
        headers: {
          Cookie: `token=${token}`,
        },
      })
      .json();
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : 'Unexpected error while fetching data.';
  }

  return (
    <AssemblyClient
      initialItems={items}
      currentUser={currentUser}
      fetchError={fetchError}
    />
  );
}
