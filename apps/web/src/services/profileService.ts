import {
  getProfile as apiGetProfile,
  createProfile as apiCreateProfile,
  updateProfile as apiUpdateProfile,
} from "../lib/api";

export type { RecoveryProfile } from "../lib/api";

/*
|--------------------------------------------------------------------------
| Load Profile
|--------------------------------------------------------------------------
*/

export async function getProfile() {
  return await apiGetProfile();
}

/*
|--------------------------------------------------------------------------
| Create Profile
|--------------------------------------------------------------------------
*/

export async function createProfile(profile: any) {
  return await apiCreateProfile(profile);
}

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

export async function updateProfile(profile: any) {
  return await apiUpdateProfile(profile);
}