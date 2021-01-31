import { http } from "../services";

export async function fetchGoogleDailyTrends() {
  const { data } = await http.get(
    "/api/google/trends/daily"
  );
  return data;
}


export async function fetchGoogleRealtimeTrends(){
  const { data } = await http.get(
    "/api/google/trends/realtime"
  );
  return data;
}