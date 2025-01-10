import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./menu/MobileMenu";
import { DesktopMenu } from "./menu/DesktopMenu";

export const TopMenu = () => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </div>
  );
};