
function Button({ variant = "primary", text, onClick, className = "", children, type = "button" }) {
    const style = {
        primary: "bg-stone-900 text-white hover:bg-stone-800 font-bold uppercase tracking-wider transition-colors border border-stone-900",
        secondary: "bg-stone-100 text-stone-800 font-bold uppercase tracking-wider hover:bg-stone-200 border border-stone-200 transition-colors",
        outline: "border border-stone-200 text-stone-700 font-bold uppercase tracking-wider bg-white hover:border-stone-900 hover:text-stone-900 transition-all",
        gold: "bg-red-700 text-white font-bold uppercase tracking-wider hover:bg-red-800 transition-colors",
    };
    const commonStyle = "px-4.5 py-3 rounded-lg text-[11px] cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors";
    
    return (
        <button
            type={type}
            className={`${style[variant] || style.primary} ${commonStyle} ${className}`}
            onClick={onClick}
        >
            {children || text}
        </button>
    );
}

export default Button;
