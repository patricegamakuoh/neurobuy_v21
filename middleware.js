import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/shop",
  "/api/products/public",
  "/auth/login",
  "/auth/signup",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/stores(.*)",
  "/api/user/sync(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
