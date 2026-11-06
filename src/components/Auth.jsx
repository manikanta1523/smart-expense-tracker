
import { useState } from "react";

export default function Auth({ onLogin }) {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (email === "admin@expense.com" && password === "admin123") {
      onLogin({ name: "Admin", email, role: "admin" });
      return;
    }

    if (signup) {
      if (users.some(user => user.email === email)) {
        alert("Email already registered!");
        return;
      }

      const newUser = { name, email, password, role: "user" };
      localStorage.setItem("users", JSON.stringify([...users, newUser]));

      alert("Signup successful! Please login.");
      setSignup(false);
      setPassword("");
      return;
    }

    const user = users.find(
      user => user.email === email && user.password === password
    );

    if (!user) {
      alert("Invalid email or password!");
      return;
    }

    onLogin(user);
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>₹ SmartTrack</h1>
        <p>Personal Finance Management</p>

        <h2>{signup ? "Create Account" : "Welcome Back"}</h2>

        {signup && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button type="submit">
          {signup ? "Create Account" : "Login"}
        </button>

        <p>
          {signup ? "Already registered?" : "New user?"}
          <span onClick={() => setSignup(!signup)}>
            {signup ? " Login" : " Sign Up"}
          </span>
        </p>

        <div className="admin-info">
          <b>Demo Admin Account</b>
          <br />Email: admin@expense.com
          <br />Password: admin123
        </div>
      </form>
    </div>
  );
}
