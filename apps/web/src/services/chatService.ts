import { getSession } from "./authService";


export interface ChatResponse {
  success: boolean;
  reply: string;
  message?: string;
}


export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  createdAt?: string;
}


export interface ChatHistoryResponse {
  success: boolean;
  messages: ChatMessage[];
  message?: string;
}


const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";



/*
|--------------------------------------------------------------------------
| Authentication Headers
|--------------------------------------------------------------------------
*/

async function getAuthHeaders() {

  const session =
    await getSession();


  if (!session) {
    throw new Error(
      "You must be logged in."
    );
  }


  return {
    "Content-Type": "application/json",
    Authorization:
      `Bearer ${session.access_token}`,
  };

}



/*
|--------------------------------------------------------------------------
| Ask AI
|--------------------------------------------------------------------------
*/

export async function askAI(
  message: string
): Promise<string> {


  const headers =
    await getAuthHeaders();



  try {

    const response =
      await fetch(
        `${API_BASE}/api/chat`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
          }),
        }
      );



    const data: ChatResponse =
      await response.json();



    /*
    |--------------------------------------------------------------------------
    | OpenAI Development Fallback
    |--------------------------------------------------------------------------
    */

    if (
      response.status === 429 ||
      data.message
        ?.toLowerCase()
        .includes("quota") ||
      data.message
        ?.toLowerCase()
        .includes("billing")
    ) {

      console.warn(
        "OpenAI quota unavailable. Using development fallback."
      );


      return `
I'm currently running in development mode.

I received your message:

"${message}"

Your Resolve AI Coach interface is working correctly.
Full AI responses will activate once OpenAI API billing is enabled.
      `.trim();

    }



    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "AI request failed."
      );

    }


    return data.reply;



  } catch (error: any) {


    /*
    |--------------------------------------------------------------------------
    | Network fallback
    |--------------------------------------------------------------------------
    */

    if (
      error.message
        ?.includes("Failed to fetch")
    ) {

      return `
Resolve AI Coach is currently offline.

The chat interface is working,
but the backend server cannot be reached.
      `.trim();

    }


    throw error;

  }

}





/*
|--------------------------------------------------------------------------
| Load Chat History
|--------------------------------------------------------------------------
*/

export async function loadHistory()
: Promise<ChatMessage[]> {


  const headers =
    await getAuthHeaders();



  const response =
    await fetch(
      `${API_BASE}/api/chat/history`,
      {
        method: "GET",
        headers,
      }
    );



  const data:
    ChatHistoryResponse =
    await response.json();



  if (
    !response.ok ||
    !data.success
  ) {

    throw new Error(
      data.message ||
      "Could not load chat history."
    );

  }



  return data.messages;

}





/*
|--------------------------------------------------------------------------
| Clear Chat History
|--------------------------------------------------------------------------
*/

export async function clearHistory()
: Promise<void> {


  const headers =
    await getAuthHeaders();



  const response =
    await fetch(
      `${API_BASE}/api/chat/history`,
      {
        method: "DELETE",
        headers,
      }
    );



  const data =
    await response.json();



  if (
    !response.ok ||
    !data.success
  ) {

    throw new Error(
      data.message ||
      "Could not clear chat history."
    );

  }

}