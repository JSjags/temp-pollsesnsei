import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { draggable, stars } from "@/assets/images";
import PollsenseiTriggerButton from "../ui/pollsensei-trigger-button";
import { Check } from "lucide-react";
import { BsExclamation } from "react-icons/bs";
import { Switch } from "../ui/switch";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface StarRatingQuestionProps {
  question: string;
  questionType: string;
  options?: string[];
  scale_value?: string; // Scale value represented as a string like "3 Stars"
  onRate?: (value: number) => void;
  EditQuestion?: () => void;
  DeleteQuestion?: () => void;
  index?: number;
  canUseAI?: boolean;
  status?: string;
  is_required?: boolean;
  setIsRequired?: (value: boolean) => void;
  setEditId?: React.Dispatch<React.SetStateAction<number | null>>;
  onSave?: (
    updatedQuestion: string,
    updatedOptions: string[],
    updatedQuestionType: string,
    aiEditIndex?: number
  ) => void;
}

const StarRatingQuestion: React.FC<StarRatingQuestionProps> = ({
  question,
  options = ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"],
  questionType,
  scale_value = [],
  onRate,
  EditQuestion,
  DeleteQuestion,
  index,
  setEditId,
  onSave,
  canUseAI = false,
  status,
  is_required,
  setIsRequired,
}) => {
  const pathname = usePathname();
  const questionText = useSelector(
    (state: RootState) => state?.survey?.question_text
  );
  const colorTheme = useSelector(
    (state: RootState) => state?.survey?.color_theme
  );

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  // Sync scale_value with the selectedRating
  useEffect(() => {
    if (Array.isArray(scale_value) && scale_value.length > 0) {
      const valueIndex = options.findIndex(
        
        (opt) => opt.toLowerCase() === (scale_value[0] as any)?.toLowerCase()
      );
      if (valueIndex !== -1) {
        setSelectedRating(valueIndex + 1); // Convert to 1-based index
      }
    }
  }, [scale_value, options]);

  // Handle rating selection
  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    if (onRate) {
      onRate(rating); // Trigger onRate callback with the selected rating
    }
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <div className="bg-green-500 rounded-full p-1 mr-3">
            <Check strokeWidth={1} className="text-xs text-white" />
          </div>
        );
      case "failed":
        return (
          <div className="bg-red-500 rounded-full text-white p-2 mr-3">
            <BsExclamation />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="mb-4 bg-[#FAFAFA] flex items-center w-full p-3 gap-3"
      style={{
        fontFamily: `${questionText?.name}`,
        fontSize: `${questionText?.size}px`,
      }}
    >
      <Image
        src={draggable}
        alt="draggable icon"
        className={
          pathname === "/surveys/create-survey" ? "visible" : "invisible"
        }
      />
      <div className="w-full">
        <div className="flex justify-between w-full items-center">
          <h3 className="group text-lg font-semibold text-start">
            <p>
              <span>{index}. </span> {question}
              {is_required && (
                <span className="text-2xl ml-2 text-red-500">*</span>
              )}
            </p>
            {!pathname.includes("survey-public-response") && (
              <PollsenseiTriggerButton
                key={index}
                imageUrl={stars}
                tooltipText="Rephrase question"
                className={"group-hover:inline-block hidden"}
                triggerType="rephrase"
                question={question}
                optionType={questionType}
                options={options}
                setEditId={setEditId}
                onSave={onSave!}
                index={index!}
              />
            )}
          </h3>
        </div>
        <div className="flex items-center my-2">
          {options.map((_, idx) => (
            <FaStar
              key={idx}
              size={24}
              className={`mr-1 cursor-pointer ${
                (hoveredRating !== null ? hoveredRating : selectedRating) > idx
                  ? "text-[#5B03B2]"
                  : "text-gray-300"
              }`}
              onMouseEnter={() => setHoveredRating(idx + 1)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => handleRate(idx + 1)} // Trigger rating selection
            />
          ))}
        </div>
        {pathname === "/surveys/edit-survey" ||
          (pathname.includes("/edit-submitted-survey") && (
            <div className="flex justify-end gap-4">
              <button
                className="bg-transparent border text-[#828282] border-[#828282] px-5 py-1 rounded-full"
                onClick={EditQuestion}
              >
                Edit
              </button>
              <button
                className="text-red-500 bg-white px-5 border border-red-500 py-1 rounded-full"
                onClick={DeleteQuestion}
              >
                Delete
              </button>
            </div>
          ))}
        {pathname.includes("edit-survey") && (
          <div className="flex items-center gap-4">
            <span>Required</span>
            <Switch
              checked={is_required}
              onCheckedChange={
                setIsRequired
                  ? (checked: boolean) => setIsRequired(checked)
                  : undefined
              }
              className="bg-[#9D50BB] "
            />
          </div>
        )}
        <div className="flex justify-end">
          {pathname === "/surveys/edit-survey" ||
          pathname.includes("surveys/question") ? (
            ""
          ) : (
            <p>{questionType === "star_rating" ? "Star Rating" : ""}</p>
          )}
        </div>
      </div>
      {pathname.includes("survey-response-upload") && status && (
        <div>{getStatus(status)}</div>
      )}
    </div>
  );
};

export default StarRatingQuestion;

