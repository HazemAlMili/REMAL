import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/lib/providers/query-provider";
import SmoothScrollProvider from "@/lib/providers/smooth-scroll-provider";
import { GsapProvider } from "@/lib/providers/gsap-provider";
import { ViewTransitions } from "next-view-transitions";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Rental Platform",
  description: "Discover luxury rental properties on the Egyptian coast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className="bg-background text-foreground font-sans">
          <QueryProvider>
            <SmoothScrollProvider>
              <GsapProvider>{children}</GsapProvider>
            </SmoothScrollProvider>
          </QueryProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "rounded-lg",
            }}
          />
        {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
      </html>
    </ViewTransitions>
  );
}
