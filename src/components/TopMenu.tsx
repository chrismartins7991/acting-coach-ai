import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionBadge } from "./subscription/SubscriptionBadge";

export const TopMenu = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Only keep the subscription badge in a fixed position */}
      <div className="fixed top-4 left-4 z-50">
        <SubscriptionBadge />
      </div>
    </>
  );
};
