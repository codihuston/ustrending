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

export async function fetchTwitterRealtimeTrends(){
  const { data } = await http.get(
    "/api/twitter/trends"
  );
  return data;
}

export async function fetchUSPlaces(){
  const { data } = await http.get(
    "/api/places/US"
  );
  return data; 
}