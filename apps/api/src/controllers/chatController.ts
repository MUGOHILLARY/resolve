import { Request, Response } from "express";

import { generateAIReply } from "../services/aiService.js";

import {
  saveMessage,
  loadChatHistory,
  clearChatHistory,
} from "../services/chatService.js";



/*
|--------------------------------------------------------------------------
| Send Chat Message
|--------------------------------------------------------------------------
*/

export async function chat(
  req: Request,
  res: Response
) {

  try {

    const {
      message,
    } = req.body;



    if (!message) {

      return res.status(400).json({

        success: false,

        message:
          "Message is required.",

      });

    }



    const userId =
      req.userId!;



    /*
    |--------------------------------------------------------------------------
    | Save User Message
    |--------------------------------------------------------------------------
    */

    await saveMessage(
      userId,
      "user",
      message
    );



    /*
    |--------------------------------------------------------------------------
    | Generate AI Response
    |--------------------------------------------------------------------------
    */

    let reply: string;



    try {

      reply =
        await generateAIReply(
          userId,
          message
        );


    } catch (error: any) {


      console.warn(
        "OpenAI unavailable. Using development fallback."
      );


      reply = `
I am currently running in development mode.

I received your message:

"${message}"

Your Resolve AI Coach system is working correctly.
Full AI responses will activate once OpenAI API billing is enabled.
      `.trim();

    }




    /*
    |--------------------------------------------------------------------------
    | Save Assistant Message
    |--------------------------------------------------------------------------
    */

    await saveMessage(
      userId,
      "assistant",
      reply
    );




    return res.json({

      success: true,

      reply,

    });



  } catch (error: any) {


    console.error(
      "Chat error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Something went wrong.",

    });

  }

}





/*
|--------------------------------------------------------------------------
| Get Chat History
|--------------------------------------------------------------------------
*/

export async function getHistory(
  req: Request,
  res: Response
) {

  try {


    const history =
      await loadChatHistory(
        req.userId!
      );



    return res.json({

      success: true,

      messages:
        history,

    });



  } catch (error: any) {


    console.error(
      "History error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to load history.",

    });

  }

}





/*
|--------------------------------------------------------------------------
| Delete Chat History
|--------------------------------------------------------------------------
*/

export async function deleteHistory(
  req: Request,
  res: Response
) {

  try {


    await clearChatHistory(
      req.userId!
    );



    return res.json({

      success: true,

      message:
        "Chat history cleared.",

    });



  } catch (error: any) {


    console.error(
      "Clear history error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to clear history.",

    });

  }

}