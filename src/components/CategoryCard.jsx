function CategoryCard({ icon: Icon, name, onClick, active }) {
return (
  <div
    onClick={() => onClick(name)}
    className={`
      group cursor-pointer
      flex flex-col items-center justify-center
      w-40 h-40
      rounded-2xl
      border transition-all duration-300

      ${
        active === name
          ? "bg-brand/10 border-brand shadow-lg scale-105"
          : "bg-white border-border hover:border-brand hover:shadow-xl hover:-translate-y-1"
      }
    `}
  >
    {/* ICON */}
    <div
      className={`
        w-14 h-14 flex items-center justify-center rounded-full transition

        ${
          active === name
            ? "bg-brand text-white"
            : "bg-bg group-hover:bg-brand"
        }
      `}
    >
      <Icon
        className={`
          w-7 h-7 transition

          ${
            active === name
              ? "text-white"
              : "text-textMuted group-hover:text-white"
          }
        `}
      />
    </div>

    {/* LABEL */}
    <p
      className={`
        mt-4 text-sm font-semibold text-center transition

        ${
          active === name
            ? "text-brand"
            : "text-textDark group-hover:text-brand"
        }
      `}
    >
      {name}
    </p>
  </div>
);
}

export default CategoryCard;