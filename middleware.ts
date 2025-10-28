import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/jobs',
  '/jobs/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Bas itna hi rakho, protect() hata do!
  if (!isPublicRoute(req)) {
    auth(); // Ye line sirf call karni hai, protect() use mat karo
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
