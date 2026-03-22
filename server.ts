import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  /**
   * GET /api/proxy-image?url=<encoded-url>
   * Server-side image proxy. Fetches the remote image using a browser-like
   * User-Agent to bypass hotlinking restrictions (e.g. Wikia) that block
   * direct browser requests. Streams the image body to the client and caches
   * the response for 24 hours.
   */
  app.get("/api/proxy-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Missing url parameter");
    }

    try {
      // Validate URL
      let urlObj;
      try {
        urlObj = new URL(imageUrl);
      } catch (e) {
        console.error("Invalid URL passed to proxy:", imageUrl);
        return res.status(400).send("Invalid URL parameter");
      }

      console.log(`Proxying request for: ${imageUrl}`);

      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });

      if (!response.ok) {
        console.error(`Proxy fetch failed for ${imageUrl}: ${response.status} ${response.statusText}`);
        return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      
      // Cache for 1 day
      res.setHeader("Cache-Control", "public, max-age=86400");
      
      if (response.body) {
        response.body.pipe(res);
      } else {
        res.status(500).send("Empty response body from remote server");
      }
    } catch (error) {
      console.error("Proxy error for URL:", imageUrl, error);
      res.status(500).send("Error proxying image");
    }
  });

  /**
   * GET /api/validate-image?url=<encoded-url>
   * Checks whether a URL points to a supported image before it is saved.
   * Uses a HEAD request to avoid downloading the full image body.
   * Returns JSON: { valid: boolean, error?: string }
   * Accepted MIME types: JPEG, PNG, GIF, WebP, SVG, AVIF.
   */
  app.get("/api/validate-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).json({ valid: false, error: "Missing url parameter" });
    }

    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD', // Only fetch headers to save bandwidth
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });

      if (!response.ok) {
        return res.json({ valid: false, error: `URL returned status ${response.status}` });
      }

      const contentType = response.headers.get("content-type");
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif"];
      
      if (contentType && validTypes.some(type => contentType.toLowerCase().includes(type))) {
        return res.json({ valid: true });
      } else {
        return res.json({ valid: false, error: `Invalid content type: ${contentType}` });
      }
    } catch (error) {
      console.error("Validation error:", error);
      return res.status(500).json({ valid: false, error: "Failed to reach the image URL" });
    }
  });

  // In development, delegate all non-API requests to Vite's dev server so
  // HMR and module serving work correctly. In production, serve the built
  // static files from dist/ and fall back to index.html for client-side routing.
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
