import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGeolocation } from "@/hooks/useGeolocation";

const GeolocationRedirect = () => {
  const { detectedMarket, isLoading } = useGeolocation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && detectedMarket && location.pathname === "/") {
      const savedMarket = localStorage.getItem("market");
      
      // Only redirect if user hasn't manually set a market preference
      if (!savedMarket || savedMarket === detectedMarket) {
        if (detectedMarket === "AR") {
          navigate("/ar", { replace: true });
        } else if (detectedMarket === "CO") {
          navigate("/co", { replace: true });
        }
        // For CN (China/Global), stay on "/"
      }
    }
  }, [detectedMarket, isLoading, navigate, location.pathname]);

  return null; // This component only handles redirection, no UI
};

export default GeolocationRedirect;