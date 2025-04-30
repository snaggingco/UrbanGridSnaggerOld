import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { importReraBudgetItems } from "./rera-budget-importer";
import { storage } from "./storage";
import compression from "compression";

const app = express();

// Enable compression for all routes to improve performance (potential savings of 766 KiB identified)
app.use(compression({
  level: 9, // Maximum compression level for best reduction
  threshold: 0, // Compress all responses
  memLevel: 9, // Use maximum memory for compression
  strategy: 2, // Use optimal compression strategy (Z_HUFFMAN_ONLY)
  filter: (req, res) => {
    // Don't compress responses with this header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Always compress text-based resources (JS, CSS, HTML, JSON)
    const contentType = res.getHeader('Content-Type') as string || '';
    if (contentType.includes('text') || 
        contentType.includes('javascript') || 
        contentType.includes('json') || 
        contentType.includes('css') ||
        contentType.includes('html')) {
      return true;
    }
    // For other content types, use the default filter
    return compression.filter(req, res);
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced caching policy for static assets
app.use((req, res, next) => {
  // Add cache control headers for common static asset extensions
  const url = req.url;
  if (url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$/)) {
    const maxAge = url.match(/\.(css|js)$/) ? 86400 : 2592000; // 1 day for CSS/JS, 30 days for images/fonts
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
  }
  next();
});

// Static assets serving with improved caching
app.use(express.static('public', {
  maxAge: '30d', // Default max age of 30 days
  immutable: true, // Indicates the resource will not change
  etag: true, // Enable ETag for conditional requests
  lastModified: true // Enable Last-Modified for conditional requests
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database with RERA budget items if needed
  try {
    const budgetItemCount = await storage.getReraBudgetItemCount();
    if (budgetItemCount === 0) {
      log('No RERA budget items found in database, importing from Excel file...');
      const importedCount = await importReraBudgetItems();
      log(`Successfully imported ${importedCount} RERA budget items`);
    } else {
      log(`Found ${budgetItemCount} RERA budget items in database`);
    }
  } catch (error) {
    log(`Error initializing RERA budget items: ${error}`);
  }

  const server = await registerRoutes(app);

  // Handle 404 errors for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    log(`404 API route not found: ${req.originalUrl}`);
    return res.status(404).json({
      message: "API Route not found",
      status: 404,
    });
  });

  // Handle general errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
