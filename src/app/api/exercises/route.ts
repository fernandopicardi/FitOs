
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.API_NINJAS_KEY;

  if (!apiKey) {
    console.error("API_NINJAS_KEY is not set in environment variables.");
    return NextResponse.json({ error: 'API key is missing. Configure API_NINJAS_KEY in .env.local' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');
  const muscle = searchParams.get('muscle');
  // const type = searchParams.get('type'); // Example for future extension
  // const difficulty = searchParams.get('difficulty'); // Example for future extension

  let apiUrl = 'https://api.api-ninjas.com/v1/exercises';
  const queryParams = new URLSearchParams();

  if (name) {
    queryParams.append('name', name);
  }
  // Ensure muscle is appended only if it's a valid value (not 'All' or empty)
  if (muscle && muscle.toLowerCase() !== 'all' && muscle.trim() !== '') {
    queryParams.append('muscle', muscle.toLowerCase()); // API Ninjas muscle groups are lowercase
  }
  
  // If you want to limit results, the API Ninjas endpoint returns up to 10 by default if no params,
  // or up to 5 if name/muscle is specified. You can add 'limit=X' if needed.

  if (queryParams.toString()) {
    apiUrl += `?${queryParams.toString()}`;
  }
  // If no queryParams, the API will return a general list of exercises (up to 10).

  try {
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'X-Api-Key': apiKey,
      },
      cache: 'no-store', // Disable caching for API route during development to see fresh data
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text(); // Get error text for better debugging
      console.error(`API Ninjas request failed with status ${apiResponse.status}: ${errorText}`);
      return NextResponse.json({ error: `Failed to fetch exercises from API Ninjas. Status: ${apiResponse.status}`, details: errorText }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    // Log the full error for server-side debugging
    if (error instanceof Error) {
      console.error('Error in /api/exercises route:', error.message, error.stack);
    } else {
      console.error('Unknown error in /api/exercises route:', error);
    }
    return NextResponse.json({ error: 'Internal Server Error occurred while fetching exercises.' }, { status: 500 });
  }
}
