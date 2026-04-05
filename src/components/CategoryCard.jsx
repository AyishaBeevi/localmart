import { motion } from "framer-motion";
import { useState } from "react";

function CategoryCard({ icon: Icon, name, onClick, active }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * 10;
    const rotateY = ((x / rect.width) - 0.5) * -10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onClick={() => onClick(name)}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      }}
      className={`
        group cursor-pointer
        flex flex-col items-center justify-center
        w-40 h-40
        rounded-2xl
        border transition-all duration-300

        backdrop-blur-xl

        ${
          active === name
            ? "bg-white border-purple-400 shadow-[0_10px_30px_rgba(124,58,237,0.25)] scale-105"
            : "bg-white/80 border-gray-200 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1"
        }
      `}
    >
      {/* ICON */}
      <div
        className={`
          w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300

          ${
            active === name
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white scale-110"
              : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-blue-500"
          }
        `}
      >
        <Icon
          className={`
            w-7 h-7 transition-all duration-300

            ${
              active === name
                ? "text-white"
                : "text-gray-500 group-hover:text-white"
            }
          `}
        />
      </div>

      {/* LABEL */}
      <p
        className={`
          mt-4 text-sm font-semibold text-center transition-all duration-300

          ${
            active === name
              ? "text-purple-600"
              : "text-gray-700 group-hover:text-purple-600"
          }
        `}
      >
        {name}
      </p>
    </motion.div>
  );
}

export default CategoryCard;