import { GsapProvider } from "@/lib/providers/gsap-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GsapProvider>{children}</GsapProvider>;
}
