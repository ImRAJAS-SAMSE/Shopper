import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [authMode, setAuthMode] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAuth = async (endpoint) => {
    if (!formData.email || !formData.password || (authMode === "Sign Up" && !formData.username)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/${endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        window.location.replace("/");
      } else {
        alert(data.errors || "Authentication failed.");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Server error. Please try again later.");
    }
  };

  const handleSubmit = () => {
    handleAuth(authMode === "Login" ? "login" : "signup");
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{authMode}</h1>
        <div className="loginsignup-fields">
          {authMode === "Sign Up" && (
            <input
              type="text"
              placeholder="Your name"
              name="username"
              value={formData.username}
              onChange={changeHandler}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={changeHandler}
          />
        </div>

        <button onClick={handleSubmit}>Continue</button>

        <p className="loginsignup-login">
          {authMode === "Login" ? (
            <>
              Don't have an account?{" "}
              <span onClick={() => setAuthMode("Sign Up")}>Sign up here</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setAuthMode("Login")}>Login here</span>
            </>
          )}
        </p>

        <div className="loginsignup-agree">
          <input type="checkbox" id="agree" />
          <label htmlFor="agree">
            By continuing, I agree to the terms of use & privacy policy.
          </label>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
