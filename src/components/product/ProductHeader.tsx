import { useNavigate } from "react-router-dom";

interface ProductHeaderProps {
  productName: string;
}

const ProductHeader = ({ productName }: ProductHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="text-sm text-muted-foreground mb-4">
        <button onClick={() => navigate("/app")} className="story-link">Productos</button>
        <span className="mx-2">/</span>
        <span className="text-foreground">{productName}</span>
      </nav>

      {/* Product Title */}
      <header>
        <h1 className="text-xl md:text-2xl font-semibold leading-tight">{productName}</h1>
      </header>
    </>
  );
};

export default ProductHeader;