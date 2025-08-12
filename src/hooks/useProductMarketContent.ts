import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export type Market = "AR" | "CO" | "CN";

interface MarketContent {
  currency: string;
  currencySymbol: string;
  trendBanner: {
    text: string;
    platform: {
      name: string;
      logo: string;
    };
  };
  trendsButton: {
    text: string;
    logo: string;
  };
  minOrderText: string;
  cartButtonText: string;
  features: {
    shipping: {
      title: string;
      description: string;
    };
    customization: {
      title: string;
      description: string;
    };
    payment: {
      title: string;
      description: string;
    };
    quality: {
      title: string;
      description: string;
    };
  };
  pricingTiers: {
    inicial: {
      name: string;
      range: string;
    };
    mayorista: {
      name: string;
      range: string;
      badge: string;
    };
    distribuidor: {
      name: string;
      range: string;
    };
  };
  tableHeaders: {
    product: string;
    units: string;
    unitPrice: string;
    labeling: string;
    barcode: string;
    photos: string;
    packaging: string;
    total: string;
  };
  complementPricing: {
    labelingUnit: string;
    packagingUnit: string;
    unitsText: string;
  };
}

const marketContent: Record<Market, MarketContent> = {
  AR: {
    currency: "ARS",
    currencySymbol: "$",
    trendBanner: {
      text: "Producto en tendencia en",
      platform: {
        name: "Mercado Libre Argentina",
        logo: "/lovable-uploads/45cfca5f-c2c1-4176-810b-ed7640362022.png"
      }
    },
    trendsButton: {
      text: "Ver más en",
      logo: "/lovable-uploads/5e29948e-f7fe-4970-b62d-37787f06dabb.png"
    },
    minOrderText: "Orden mínima $2.500 ARS",
    cartButtonText: "Añadir al carrito",
    features: {
      shipping: {
        title: "Método de envío",
        description: "Envíos aéreos y marítimos a Argentina. Tiempos de 15-25 días según el método elegido."
      },
      customization: {
        title: "Personalizar producto",
        description: "Incluye branding, empaques personalizados y especificaciones según tu marca argentina."
      },
      payment: {
        title: "Pago diferido",
        description: "Pagá solo el 30% hoy. El resto lo pagás cuando confirmemos todo desde China."
      },
      quality: {
        title: "Control de calidad",
        description: "Control de calidad en fábrica con estándares internacionales para el mercado argentino."
      }
    },
    pricingTiers: {
      inicial: {
        name: "Inicial",
        range: "50 – 499 unidades"
      },
      mayorista: {
        name: "Mayorista",
        range: "500 – 1250 unidades",
        badge: "Recomendado"
      },
      distribuidor: {
        name: "Distribuidor",
        range: "+1250 unidades"
      }
    },
    tableHeaders: {
      product: "Producto",
      units: "Unidades",
      unitPrice: "Precio Unitario",
      labeling: "Etiquetado para Mercado Libre",
      barcode: "Registro de Código ANMAT",
      photos: "Fotografías Comerciales",
      packaging: "Empaque Argentina",
      total: "Precio Total"
    },
    complementPricing: {
      labelingUnit: "/U",
      packagingUnit: "/U",
      unitsText: "unidades"
    }
  },
  CO: {
    currency: "COP",
    currencySymbol: "$",
    trendBanner: {
      text: "Producto en tendencia en",
      platform: {
        name: "Mercado Libre Colombia",
        logo: "/lovable-uploads/45cfca5f-c2c1-4176-810b-ed7640362022.png"
      }
    },
    trendsButton: {
      text: "Ver más en",
      logo: "/lovable-uploads/5e29948e-f7fe-4970-b62d-37787f06dabb.png"
    },
    minOrderText: "Orden mínima $400.000 COP",
    cartButtonText: "Añadir al carrito",
    features: {
      shipping: {
        title: "Método de envío",
        description: "Envíos aéreos y marítimos a Colombia. Tiempos de 12-20 días según el método elegido."
      },
      customization: {
        title: "Personalizar producto",
        description: "Incluye branding, empaques personalizados y especificaciones según tu marca colombiana."
      },
      payment: {
        title: "Pago diferido",
        description: "Pagá solo el 30% hoy. El resto lo pagás cuando confirmemos todo desde China."
      },
      quality: {
        title: "Control de calidad",
        description: "Control de calidad en fábrica con estándares internacionales para el mercado colombiano."
      }
    },
    pricingTiers: {
      inicial: {
        name: "Inicial",
        range: "50 – 499 unidades"
      },
      mayorista: {
        name: "Mayorista",
        range: "500 – 1250 unidades",
        badge: "Recomendado"
      },
      distribuidor: {
        name: "Distribuidor",
        range: "+1250 unidades"
      }
    },
    tableHeaders: {
      product: "Producto",
      units: "Unidades",
      unitPrice: "Precio Unitario",
      labeling: "Etiquetado para Mercado Libre",
      barcode: "Registro de Código INVIMA",
      photos: "Fotografías Comerciales",
      packaging: "Empaque Colombia",
      total: "Precio Total"
    },
    complementPricing: {
      labelingUnit: "/U",
      packagingUnit: "/U",
      unitsText: "unidades"
    }
  },
  CN: {
    currency: "USD",
    currencySymbol: "$",
    trendBanner: {
      text: "Trending product on",
      platform: {
        name: "Amazon Global",
        logo: "/lovable-uploads/45cfca5f-c2c1-4176-810b-ed7640362022.png"
      }
    },
    trendsButton: {
      text: "See more on",
      logo: "/lovable-uploads/5e29948e-f7fe-4970-b62d-37787f06dabb.png"
    },
    minOrderText: "Minimum order $100 USD",
    cartButtonText: "Add to cart",
    features: {
      shipping: {
        title: "Shipping method",
        description: "Air and sea freight worldwide. Times and costs vary by destination and volume."
      },
      customization: {
        title: "Product customization",
        description: "Includes branding, custom packaging and specifications according to your brand."
      },
      payment: {
        title: "Deferred payment",
        description: "Pay only 30% today. Pay the rest when we confirm everything from China."
      },
      quality: {
        title: "Quality control",
        description: "Factory quality control with international standards."
      }
    },
    pricingTiers: {
      inicial: {
        name: "Starter",
        range: "50 – 499 units"
      },
      mayorista: {
        name: "Wholesale",
        range: "500 – 1250 units",
        badge: "Recommended"
      },
      distribuidor: {
        name: "Distributor",
        range: "+1250 units"
      }
    },
    tableHeaders: {
      product: "Product",
      units: "Units",
      unitPrice: "Unit Price",
      labeling: "Marketplace Labeling",
      barcode: "Barcode Registration",
      photos: "Commercial Photography",
      packaging: "Packaging",
      total: "Total Price"
    },
    complementPricing: {
      labelingUnit: "/U",
      packagingUnit: "/U",
      unitsText: "units"
    }
  }
};

export function useProductMarketContent() {
  const location = useLocation();
  
  const market: Market = useMemo(() => {
    if (location.pathname.includes("/app/ar")) return "AR";
    if (location.pathname.includes("/app/co")) return "CO";
    if (location.pathname.includes("/ar")) return "AR";
    if (location.pathname.includes("/co")) return "CO";
    return "CN";
  }, [location.pathname]);

  return {
    market,
    content: marketContent[market]
  };
}