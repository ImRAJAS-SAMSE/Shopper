import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});

  const fetchWithAuth = (url, body) => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    return fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  };

  useEffect(() => {
    const fetchProductsAndCart = async () => {
      try {
        const productRes = await fetch("http://localhost:4000/allproducts");
        const productData = await productRes.json();
        setProducts(productData);

        // Initialize cart with 0s
        const initialCart = {};
        productData.forEach((item) => {
          initialCart[item.id] = 0;
        });
        setCartItems(initialCart);

        const token = localStorage.getItem("auth-token");
        if (token) {
          const cartData = await fetchWithAuth("http://localhost:4000/getcart", {});
          if (cartData) setCartItems(cartData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProductsAndCart();
  }, []);

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const product = products.find((p) => p.id === Number(itemId));
      return product ? total + quantity * product.new_price : total;
    }, 0);
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
  };

  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    fetchWithAuth("http://localhost:4000/addtocart", { itemId }).then((data) =>
      console.log("Add to cart:", data)
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));

    fetchWithAuth("http://localhost:4000/removefromcart", { itemId }).then((data) =>
      console.log("Remove from cart:", data)
    );
  };

  const contextValue = {
    products,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartItems,
    getTotalCartAmount,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
