import { getAccessToken } from "./auth";

export const createGoogleTask = async (title: string, notes: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('User is not authenticated with Google or missing token');
  }

  // Find the @default tasklist
  const resList = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!resList.ok) {
    throw new Error('Failed to fetch Google Tasks lists');
  }
  
  const lists = await resList.json();
  const defaultList = lists.items?.[0]?.id || '@default';

  // Create task in default list
  const payload = {
    title,
    notes
  };

  const resCreate = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${defaultList}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resCreate.ok) {
    throw new Error('Failed to create Google Task');
  }
};
