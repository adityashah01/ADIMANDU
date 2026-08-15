import { useState } from "react";

export default function RegisterProvider() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "",
    experience: "",
    address: "",
    city: "",
    description: "",
    hourlyRate: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log(formData);

    alert("Provider Registered Successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">
            Become a Service Provider
          </h1>

          <p className="text-gray-500 mt-2">
            Register your profile and start getting bookings.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="font-semibold">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter Full Name"
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="98XXXXXXXX"
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold">
                Service Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Category</option>
                <option>Electrician</option>
                <option>Plumber</option>
                <option>Painter</option>
                <option>Carpenter</option>
                <option>Cleaner</option>
                <option>Tutor</option>
                <option>Mechanic</option>
              </select>
            </div>

            <div>
              <label className="font-semibold">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-semibold">
                Experience
              </label>

              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Experience</option>
                <option>1 Year</option>
                <option>2 Years</option>
                <option>3 Years</option>
                <option>5 Years</option>
                <option>10+ Years</option>
              </select>
            </div>

            <div>
              <label className="font-semibold">
                Hourly Rate (Rs.)
              </label>

              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="500"
                className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

          </div>
                    {/* Address */}
          <div className="mt-6">
            <label className="font-semibold">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* City */}
          <div className="mt-6">
            <label className="font-semibold">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="font-semibold">Description</label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your skills and services..."
              className="w-full mt-2 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          {/* Profile Image */}
          <div className="mt-6">
            <label className="font-semibold">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          {/* Citizenship Upload */}
          <div className="mt-6">
            <label className="font-semibold">Citizenship / ID Proof</label>
            <input
              type="file"
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          {/* Portfolio */}
          <div className="mt-6">
            <label className="font-semibold">Portfolio Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          {/* Availability */}
          <div className="mt-6">
            <label className="font-semibold block mb-3">
              Availability
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input type="checkbox" />
                  {day}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-10 text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition"
            >
              Register as Provider
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}