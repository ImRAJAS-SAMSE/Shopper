import React, { useContext, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import nav_dropdown from '../Assets/nav_dropdown.png';

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const location = useLocation();

  const dropdownToggle = (e) => {
    menuRef.current?.classList.toggle('nav-menu-visible');
    e.currentTarget.classList.toggle('open');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    window.location.replace("/");
  };

  const menuItems = [
    { label: "Shop", path: "/", key: "shop" },
    { label: "Men", path: "/mens", key: "mens" },
    { label: "Women", path: "/womens", key: "womens" },
    { label: "Kids", path: "/kids", key: "kids" },
  ];

  return (
    <div className="nav">
      <Link to="/" onClick={() => setMenu("shop")} className="nav-logo" style={{ textDecoration: 'none' }}>
        <img src={logo} alt="logo" />
        <p>SHOPPER</p>
      </Link>

      <img
        onClick={dropdownToggle}
        className="nav-dropdown"
        src={nav_dropdown}
        alt="menu"
      />

      <ul ref={menuRef} className="nav-menu">
        {menuItems.map(({ label, path, key }) => (
          <li key={key} onClick={() => setMenu(key)}>
            <Link to={path} style={{ textDecoration: 'none' }}>{label}</Link>
            {menu === key && <hr />}
          </li>
        ))}
      </ul>

      <div className="nav-login-cart">
        {localStorage.getItem('auth-token') ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button>Login</button>
          </Link>
        )}
        <Link to="/cart">
          <img src={cart_icon} alt="cart" />
        </Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
