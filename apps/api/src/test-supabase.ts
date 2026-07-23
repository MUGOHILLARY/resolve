import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      mood: "good",
      title: "First Journal Entry",
      content: "Testing Supabase from Resolve."
    })
    .select();

  if (error) {
    console.error("Insert Error:");
    console.error(error);
    return;
  }

  console.log("✅ Insert Successful");
  console.log(data);
}

test();