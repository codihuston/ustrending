import axios from "axios";
import { http } from "../services";

export async function fetchGoogleDailyTrends() {
  const { data } = await http.get(
    "/api/google/trends/daily"
  );
  return data;
}
