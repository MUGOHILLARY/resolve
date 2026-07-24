import type {
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

/*
|--------------------------------------------------------------------------
| Sign Up
|--------------------------------------------------------------------------
*/

export async function signUp(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Sign In
|--------------------------------------------------------------------------
*/

export async function signIn(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Sign Out
|--------------------------------------------------------------------------
*/

export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Get Current Session
|--------------------------------------------------------------------------
*/

export async function getSession(): Promise<
  Session | null
> {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

export async function getCurrentUser() {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

/*
|--------------------------------------------------------------------------
| Listen For Auth Changes
|--------------------------------------------------------------------------
*/

export function onAuthStateChange(
  callback: (
    event: AuthChangeEvent,
    session: Session | null
  ) => void
) {
  return supabase.auth.onAuthStateChange(
    callback
  );
}