import React, { useState } from "react";
import { EmailSent } from "./components/EmailSent";
import { Login } from "./components/Login";
import { MyAccount } from "./components/MyAccount";
import { MyOrders } from "./components/MyOrders";
import { Navbar } from "./components/Navbar";
import { ProductList } from "./components/ProductList";
import { ShoppingCart } from "./components/ShoppingCart";
import { SignUp } from "./components/SignUp";
import { HeroHome } from "./components/HeroHome";
import { CheckoutReviewItems } from "./components/CheckoutReviewItems";
import { CheckoutPaymentSimulation } from "./components/CheckoutPaymentSimulation";
import { ForgotPassword } from "./components/ForgotPassword";
import { authApi, ordersApi } from "./utils/api";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

const App: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<
    "HOME" | "ACCOUNT" | "ORDERS" | "LOGIN" | "SIGNUP" | "EMAILSENT" | "EMAIL_SENT" | "FORGOT_PASSWORD" | "CHECKOUT_STEP1" | "CHECKOUT_STEP2"
  >("HOME");

  // Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem("userEmail") || "");
  const [userName, setUserName] = useState<string>(() => localStorage.getItem("userName") || "");

  // Category State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Checkout State
  const [orderId, setOrderId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
  };

  const handleRemoveFromCart = (id: string | number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    const data = await authApi.login(credentials.email, credentials.password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userEmail", credentials.email);
    setToken(data.token);
    setUserEmail(credentials.email);
    setIsLoggedIn(true);

    if (data.name) {
      localStorage.setItem("userName", data.name);
      setUserName(data.name);
    } else {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    }

    setCurrentView("HOME");
  };

  const handleCreateAccount = async (credentials: { name: string; email: string; password: string }) => {
    await authApi.register(credentials.name, credentials.email, credentials.password);
    const data = await authApi.login(credentials.email, credentials.password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userEmail", credentials.email);
    localStorage.setItem("userName", credentials.name);
    setToken(data.token);
    setUserEmail(credentials.email);
    setUserName(credentials.name);
    setIsLoggedIn(true);
    setCurrentView("LOGIN");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setToken(null);
    setUserEmail("");
    setUserName("");
    setIsLoggedIn(false);
    setCurrentView("HOME");
    setCartItems([]);
  };

  // Checkout Handlers
  const handleCheckoutStart = (id: number) => {
    setOrderId(id);
    setIsCartOpen(false);
    setCurrentView("CHECKOUT_STEP1");
  };

  const handleCheckoutStep1Next = () => {
    setCurrentView("CHECKOUT_STEP2");
  };

  const handleCheckoutStep1Cancel = async () => {
    if (orderId && token) {
      try {
        await ordersApi.cancelOrder(token, orderId);
        showToast("Order cancelled successfully, items returned to catalog", "info");
      } catch (err) {
        console.error("Failed to cancel order during Step 1", err);
      }
    }
    setOrderId(null);
    setCurrentView("HOME");
  };

  const handlePaymentSuccess = () => {
    setCartItems([]); // Clear local shopping cart state entirely
    setOrderId(null);
    showToast("Order placed successfully!", "success");
    setCurrentView("HOME");
  };

  const handleCancelSuccess = (message: string) => {
    setOrderId(null);
    showToast(message, "info");
    setCurrentView("HOME");
  };

  return (
    <div className="min-h-screen bg-white font-['Quicksand'] relative overflow-x-hidden flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-xl text-white text-sm font-bold z-50 animate-fadeIn transition-all flex items-center gap-2 border ${
          notification.type === "success" 
            ? "bg-[#acd982] border-green-300" 
            : notification.type === "error" 
              ? "bg-red-500 border-red-400" 
              : "bg-gray-800 border-gray-700"
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      <Navbar
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        userName={userName}
        onToggleCart={() => setIsCartOpen(true)}
        onNavigate={(view) => {
          // If we navigate away from checkout, cancel the order if it exists
          if ((currentView === "CHECKOUT_STEP1" || currentView === "CHECKOUT_STEP2") && orderId && token) {
            ordersApi.cancelOrder(token, orderId).catch((err) => console.error("Cancel failed on navigation", err));
            setOrderId(null);
          }
          setCurrentView(view as any);
        }}
        cartCount={cartItems.length}
        onLogout={handleLogout}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {currentView === "HOME" && (
        isLoggedIn ? (
          <ProductList
            token={token}
            onAddToCart={handleAddToCart}
            selectedCategory={selectedCategory}
          />
        ) : (
          <HeroHome onExplore={() => setCurrentView("LOGIN")} />
        )
      )}

      {currentView === "ACCOUNT" && (
        <MyAccount
          token={token || ""}
          initialUserData={{ name: userName, email: userEmail }}
          onLogout={handleLogout}
          onBack={() => setCurrentView("HOME")}
        />
      )}

      {currentView === "ORDERS" && (
        <MyOrders onBack={() => setCurrentView("HOME")} />
      )}

      {currentView === "LOGIN" && (
        <Login
          onLogin={handleLogin}
          onNavigateToSignUp={() => setCurrentView("SIGNUP")}
          onNavigateToForgotPassword={() => setCurrentView("FORGOT_PASSWORD")}
        />
      )}

      {currentView === "SIGNUP" && (
        <SignUp
          onCreateAccount={handleCreateAccount}
        />
      )}

      {currentView === "FORGOT_PASSWORD" && (
        <ForgotPassword
          onNavigateToLogin={() => setCurrentView("LOGIN")}
          onEmailSent={() => setCurrentView("EMAIL_SENT")}
        />
      )}

      {(currentView === "EMAILSENT" || currentView === "EMAIL_SENT") && (
        <EmailSent
          onNavigateToLogin={() => {
            setCurrentView("LOGIN");
          }}
        />
      )}

      {currentView === "CHECKOUT_STEP1" && orderId !== null && (
        <CheckoutReviewItems
          token={token}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onRemoveItem={handleRemoveFromCart}
          onNext={handleCheckoutStep1Next}
          onCancel={handleCheckoutStep1Cancel}
          orderId={orderId}
        />
      )}

      {currentView === "CHECKOUT_STEP2" && orderId !== null && (
        <CheckoutPaymentSimulation
          token={token}
          orderId={orderId}
          orderTotal={cartItems.reduce((sum, item) => sum + item.price, 0)}
          onPaymentSuccess={handlePaymentSuccess}
          onCancelSuccess={handleCancelSuccess}
        />
      )}

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        token={token}
        onCheckoutStart={handleCheckoutStart}
      />
    </div>
  );
};

export default App;

