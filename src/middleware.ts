import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every route except:
     *   - _next/static (static files)
     *   - _next/image (image optimization)
     *   - favicon.ico, sitemap.xml, robots.txt
     *   - any public asset with a typical extension
     * This keeps the session fresh on navigations while skipping the
     * middleware overhead for pure asset requests.
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
