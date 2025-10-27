import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import login from "../assets/login.webp";

import { loginUser } from "../redux/slices/authSlice";
import { mergeCart } from "../redux/slices/cartSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, guestId ,loading} = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const redirectParam = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirectParam.includes("checkout");

  useEffect(() => {
    if (user) {
      if (cart?.products?.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
    console.log("User Login:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center bg-gray-50 -mt-20">
      {/* Left: Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 md:p-12 -mt-16">
        <div className="w-full max-w-md bg-white text-black p-8 rounded-lg shadow-lg">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">Tech-Mart</h2>
            <h3 className="text-xl font-semibold mt-2">Hey there! 👋</h3>
            <p className="text-sm text-gray-600 mt-1">
              Enter your email and password to login
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
            >
              {loading ? "loading...":"Login"}
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirectParam)}`}
                className="text-blue-500 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden md:block w-1/2">
        <img
          src={login}
          alt="Login to Account"
          className="h-screen w-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
