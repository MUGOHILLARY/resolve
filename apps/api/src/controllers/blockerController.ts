import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

export async function getBlockerSettings(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    const { data, error } = await supabase
      .from("blocker_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    return res.json(data);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}