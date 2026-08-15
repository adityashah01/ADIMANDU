import { useState } from "react";
import { CalendarCheck2 } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const schedule = [
  { day: "Sunday", time: "9:00 AM - 5:00 PM" },
  { day: "Monday", time: "9:00 AM - 5:00 PM" },
  { day: "Tuesday", time: "9:00 AM - 5:00 PM" },
  { day: "Wednesday", time: "9:00 AM - 5:00 PM" },
  { day: "Thursday", time: "9:00 AM - 5:00 PM" },
  { day: "Friday", time: "9:00 AM - 5:00 PM" },
  { day: "Saturday", time: "Holiday" },
];

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long" });

export default function Availability() {
  const [available, setAvailable] = useState(true);

  return (
    <div className="p-6 md:p-10 font-body" style={{ color: "#20261F" }}>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest" style={{ color: "#8A8A78" }}>
          Schedule
        </span>
        <h1 className="font-display text-3xl font-semibold mt-1">Availability</h1>
        <p className="mt-1" style={{ color: "#6B6B63" }}>
          Set your hours and let customers know when you're on call.
        </p>
      </div>

      {/* Status Card */}
      <div
        className="rounded-xl bg-white p-6 mb-6 flex items-center justify-between gap-4 flex-wrap"
        style={{ border: "1px solid #E7E2D4" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            style={{ background: available ? "#E4EEE8" : "#F6E9E6" }}
          >
            <CalendarCheck2 size={20} style={{ color: available ? "#3E7C59" : "#B24C3C" }} />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Current status</h2>
            <p className="text-sm" style={{ color: "#6B6B63" }}>
              Let customers know whether you're available.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold"
            style={{ color: available ? "#3E7C59" : "#B24C3C" }}
          >
            {available ? "Available" : "Unavailable"}
          </span>
          <ToggleSwitch
            checked={available}
            onChange={() => setAvailable(!available)}
            activeColor="#3E7C59"
            inactiveColor="#E3CFC9"
          />
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E7E2D4" }}>
        <h2 className="font-display text-xl font-semibold mb-5">Weekly schedule</h2>

        <div className="divide-y" style={{ borderColor: "#EFEBDF" }}>
          {schedule.map((item) => {
            const isToday = item.day === TODAY;
            const isHoliday = item.time === "Holiday";

            return (
              <div
                key={item.day}
                className="flex items-center justify-between py-3.5 px-3 -mx-3 rounded-lg"
                style={isToday ? { background: "#FBFAF6" } : undefined}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.day}</span>
                  {isToday && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#F1EEE3", color: "#8A5A15" }}
                    >
                      Today
                    </span>
                  )}
                </div>

                {isHoliday ? (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "#F6E9E6", color: "#B24C3C" }}
                  >
                    Holiday
                  </span>
                ) : (
                  <span className="text-sm" style={{ color: "#6B6B63" }}>
                    {item.time}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}