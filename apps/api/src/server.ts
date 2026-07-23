import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { supabase } from "./lib/supabase.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (_req, res) => {
  res.json({
    message: "Resolve API is running 🚀",
  });
});

/*
|--------------------------------------------------------------------------
| CREATE JOURNAL ENTRY
|--------------------------------------------------------------------------
*/

app.post("/api/journal", async (req, res) => {
  try {
    const { mood, title, content } = req.body;

    if (!mood || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Mood, title and content are required.",
      });
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        mood,
        title,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      journal: data,
    });

  } catch (error: any) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

/*
|--------------------------------------------------------------------------
| GET ALL JOURNAL ENTRIES
|--------------------------------------------------------------------------
*/

app.get("/api/journal", async (_req, res) => {

  try {

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

    return res.json({
      success: true,
      journals: data,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

});

/*
|--------------------------------------------------------------------------
| AI CHAT
|--------------------------------------------------------------------------
*/

app.post("/api/chat", async (req, res) => {
  try {

    const { message } = req.body;

    if (!message) {

      return res.status(400).json({
        error: "Message is required.",
      });

    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "You are Resolve AI, a supportive recovery coach.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return res.json({
      reply: response.output_text,
    });

  } catch (error: any) {

    console.error(error);

    return res.status(500).json({
      error: error.message,
    });

  }

});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});