import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| CREATE JOURNAL
|--------------------------------------------------------------------------
*/

router.post("/", requireAuth, async (req, res) => {
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
        user_id: req.userId,
      })
      .select()
      .single();

    if (error) {
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET JOURNALS
|--------------------------------------------------------------------------
*/

router.get("/", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", {
        ascending: false,
      });

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
| DELETE JOURNAL
|--------------------------------------------------------------------------
*/

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", req.userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Journal deleted successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;