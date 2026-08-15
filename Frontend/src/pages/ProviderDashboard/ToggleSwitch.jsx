export default function ToggleSwitch({
    checked,
    onChange,
    activeColor = "#3E7C59",
    inactiveColor = "#E3DECF",
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className="relative w-12 h-7 rounded-full shrink-0 transition-colors"
            style={{ background: checked ? activeColor : inactiveColor }}
        >
            <span
                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
            />
        </button>
    );
}