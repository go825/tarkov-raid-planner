/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const requests=new Map<string,{count:number;reset:number}>();
function limited(request:Request){const pathname=new URL(request.url).pathname;if(!pathname.startsWith("/api/")||request.method==="GET")return false;const ip=request.headers.get("cf-connecting-ip")??"unknown",now=Date.now(),key=`${ip}:${pathname}`,current=requests.get(key);if(requests.size>10_000)for(const [entry,value] of requests)if(value.reset<now)requests.delete(entry);if(!current||current.reset<now){requests.set(key,{count:1,reset:now+60_000});return false}current.count++;return current.count>120}
function secure(response:Response){const next=new Response(response.body,response);next.headers.set("X-Content-Type-Options","nosniff");next.headers.set("X-Frame-Options","DENY");next.headers.set("Referrer-Policy","strict-origin-when-cross-origin");next.headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");next.headers.set("Content-Security-Policy","default-src 'self'; connect-src 'self' https://json.tarkov.dev https://cdn.jsdelivr.net; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");return next}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if(limited(request))return secure(Response.json({error:"Too many requests"},{status:429,headers:{"retry-after":"60"}}));

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return secure(await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths));
    }

    return secure(await handler.fetch(request, env, ctx));
  },
};

export default worker;
