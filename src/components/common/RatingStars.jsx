import { Star } from "lucide-react";

export const RatingStars = ({
  rating = 5,
  max = 5,
  size = "sm",
  interactive = false,
  onChange = () => {},
}) => {
  const sizeClasses = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const starSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => {
        const starNumber = idx + 1;
        const isFilled = starNumber <= Math.round(rating);

        return (
          <button
            type="button"
            key={idx}
            disabled={!interactive}
            onClick={() => interactive && onChange(starNumber)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 fill-gray-100"
              }`}
            />
          </button>
        );
      })}
      {!interactive && rating > 0 && (
        <span className="text-xs font-semibold text-gray-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
