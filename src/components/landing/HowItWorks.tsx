import React from "react";

const items = [
  {
    id: "detectamos",
    title: "Detectamos los Productos Virales",
    desc:
      "Nuestro algoritmo identifica los productos más virales y populares del mercado, seleccionados para tu ecommerce.",
    img: "/lovable-uploads/8cb01fb7-beef-4a95-a941-e5ed10e7d8c7.png", // estrellas
    alt: "Detectamos productos virales para ecommerce",
  },
  {
    id: "compra",
    title: "Compra Inmediata con Precios Finales",
    desc:
      "Compra al instante con precios ya puestos en destino. Sin cotizaciones, sin confirmaciones, sin sorpresas.",
    img: "/lovable-uploads/2ec2ba29-f14b-4407-ab69-d91bb5679bbf.png", // lupa
    alt: "Compra inmediata con precios finales",
  },
  {
    id: "vende",
    title: "Vende sin Trámites ni Complicaciones",
    desc:
      "Nosotros gestionamos todo: importación, nacionalización y entrega puerta a puerta. Tú solo recibes y vendes.",
    img: "/lovable-uploads/0e1d714c-94eb-4bd3-aea1-c05e984f322a.png", // caja
    alt: "Vende sin trámites ni complicaciones",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section
      className="container mx-auto mt-8 md:mt-10 animate-fade-in"
      aria-labelledby="como-funciona-title"
    >
      <header className="sr-only">
        <h2 id="como-funciona-title">Cómo funciona B2BOX</h2>
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : ""} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl bg-card text-card-foreground border border-border p-5 md:p-6 flex items-start gap-4 hover-scale shadow-sm"
          >
            <div className="shrink-0 rounded-xl bg-muted/40 border border-border p-3">
              <img
                src={item.img}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 object-contain"
                width={40}
                height={40}
              />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold leading-snug">{item.title}</h3>
              <p className="mt-1 text-sm md:text-base text-muted-foreground">{item.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
