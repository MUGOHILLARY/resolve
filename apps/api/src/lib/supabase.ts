import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("Supabase URL:", supabaseUrl);
console.log(
  "Service Role Key starts with:",
  supabaseServiceRoleKey.substring(0, 20)
);

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);