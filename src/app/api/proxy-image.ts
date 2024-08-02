// pages/api/proxy-image.ts
import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD"]
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
// eslint-disable-next-line @typescript-eslint/ban-types
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error proxying image:", error);
    res.status(500).json({ error: "Failed to proxy image" });
  }
}

export const config = {
  api: {
    responseLimit: false
  }
};
