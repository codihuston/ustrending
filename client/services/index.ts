import axios from "axios";

/**
 * Determine if we are in the Next.js server or the browser. Since our
 * /api is hosted on http(s)://localhost/api in development, we need
 * to tell the Next.js server to resolve the API host to either the k8s container,
 * or thru the ingress controller.
 *
 * If the API was hosted on an external domain, this would probably be a single
 * value. I've done it this way to avoid having to configure subdomains / etc.
 * for this project.
 *
 * These server/client values are implemented as environment variables.
 *
 * Ref: https://github.com/vercel/next.js/issues/5354
 */
const baseURL =
  typeof window === "undefined"
    ? process.env.API_URI
    : process.env.NEXT_PUBLIC_API_URI;

export const http = axios.create({
  baseURL,
});
