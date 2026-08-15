export default function AuthBackground({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-200">

      {/* Left Glow */}
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-600 rounded-full opacity-80 blur-3xl"></div>

      {/* Right Glow */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-300 rounded-full opacity-40 blur-3xl"></div>

      {/* Center Glow */}
      <div className="absolute w-[700px] h-[700px] bg-blue-200 rounded-full opacity-20 blur-3xl"></div>

      <div className="relative w-full flex justify-center px-4">
        {children}
      </div>
    </div>
  );
}