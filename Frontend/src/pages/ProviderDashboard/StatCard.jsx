export default function StatCard({ title, value, subtitle, icon: Icon, accent }) {
    return (
        <div
            className="relative rounded-xl p-5 bg-white overflow-hidden"
            style={{ border: "1px solid #E7E2D4", boxShadow: "0 1px 2px rgba(32,38,31,0.06)" }}
        >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />

            <div className="flex items-start justify-between">
                <Icon size={20} style={{ color: accent }} />
            </div>

            <div className="font-display text-3xl font-semibold mt-3" style={{ color: "#20261F" }}>
                {value}
            </div>

            <p className="text-sm mt-1" style={{ color: "#6B6B63" }}>
                {title}
            </p>

            {subtitle && (
                <p className="text-xs mt-2 font-medium" style={{ color: accent }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}