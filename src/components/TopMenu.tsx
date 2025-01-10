import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./menu/MobileMenu";
import { DesktopMenu } from "./menu/DesktopMenu";

export const TopMenu = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        {isMobile ? <MobileMenu /> : <DesktopMenu />}
      </div>
      {!isMobile && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <DesktopMenu.Logout />
          <DesktopMenu.Settings />
        </div>
      )}
    </>
  );
};