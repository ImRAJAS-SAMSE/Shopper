import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from "../Components/Assets/dropdown_icon.png";
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";

const ShopCategory = ({ banner, category }) => {
  const [allProducts, setAllProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/allproducts");
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = allProducts.filter(
    (item) => item.category === category
  );

  return (
    <div className="shopcategory">
      <img src={banner} className="shopcategory-banner" alt={`${category} banner`} />

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1 - {filteredProducts.length}</span> out of {allProducts.length} Products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="Sort dropdown" />
        </div>
      </div>

      <div className="shopcategory-products">
        {filteredProducts.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>

      <div className="shopcategory-loadmore">
        <Link to="/" style={{ textDecoration: "none" }}>
          Explore More
        </Link>
      </div>
    </div>
  );
};

export default ShopCategory;

