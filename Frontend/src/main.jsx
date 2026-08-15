import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./main.css";
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <LocationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LocationProvider>
  </AuthProvider>
);