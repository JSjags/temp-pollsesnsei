import Image from "next/image";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { draggable, stars } from "@/assets/images";
import PollsenseiTriggerButton from "../ui/pollsensei-trigger-button";
import { Check, GripVertical, Pencil, Star, Trash2 } from "lucide-react";
import { BsExclamation } from "react-icons/bs";
import { Switch } from "../ui/switch";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ActionButtons from "./ActionButtons";
import { cn } from "@/lib/utils";
import { SurveyData } from "@/subpages/survey/EditSubmittedSurvey";

interface StarRatingQuestionProps {
  question: string;
  questionType: string;
  options?: string[];
  currentRating?: number;
  onRate?: (value: number) => void;
  EditQuestion?: () => void;
  DeleteQuestion?: () => void;
  index?: number;
  canUseAI?: boolean;
  status?: string;
  is_required?: boolean;
  isEdit?: boolean;
  setIsRequired?: (value: boolean) => void;
  setEditId?: React.Dispatch<React.SetStateAction<number | null>>;
  onSave?: (
    updatedQuestion: string,
    updatedOptions: string[],
    updatedQuestionType: string,
    aiEditIndex?: number
  ) => void;
  surveyData?: SurveyData;
}

const StarRatingQuestion: React.FC<StarRatingQuestionProps> = ({
  question,
  options = ["1 star", "2 star", "3 star", "4 star", "5 star"],
  questionType,
  currentRating = 0,
  onRate,
  EditQuestion,
  DeleteQuestion,
  index,
  setEditId,
  onSave,
  canUseAI = false,
  status,
  is_required,
  isEdit = false,
  setIsRequired,
  surveyData,
}) => {
  const pathname = usePathname();
  const questionText = useSelector(
    (state: RootState) => state?.survey?.question_text
  );
  const colorTheme = useSelector(
    (state: RootState) => state?.survey?.color_theme
  );
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(currentRating);

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    if (onRate) onRate(rating);
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <div className="bg-green-500 rounded-full p-1.5 mr-3">
            <Check strokeWidth={1.5} className="text-white w-4 h-4" />
          </div>
        );
      case "failed":
        return (
          <div className="bg-red-500 rounded-full p-1.5 mr-3">
            <BsExclamation className="text-white w-4 h-4" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "mb-6 bg-gray-50 shadow-sm hover:shadow-md rounded-xl p-6 transition-all duration-300",
        {
          [`font-${questionText?.name
            ?.split(" ")
            .join("-")
            .toLowerCase()
            .replace(/\s+/g, "-")}`]: questionText?.name,
        }
      )}
      style={{
        fontSize: `${questionText?.size}px`,
      }}
    >
      <div className="flex gap-4">
        <GripVertical
          className={`w-5 h-5 text-gray-400 mt-1 ${
            pathname === "/surveys/create-survey" ? "visible" : "hidden"
          }`}
        />

        <div className="flex-1 space-y-4">
          <div className="flex items-start">
            <span className="font-semibold min-w-[24px]">{index}.</span>
            <div className="flex-1">
              <h3 className="group font-semibold">
                <div className="flex items-start gap-2">
                  <span className="text-left">{question}</span>
                  {is_required && (
                    <span className="text-2xl text-red-500">*</span>
                  )}

                  {!pathname.includes("survey-public-response") && isEdit && (
                    <PollsenseiTriggerButton
                      key={index}
                      imageUrl={stars}
                      tooltipText="Rephrase question"
                      className="hidden group-hover:inline-block transition transform hover:scale-110"
                      triggerType="rephrase"
                      question={question}
                      optionType={questionType}
                      options={options}
                      setEditId={setEditId}
                      onSave={onSave!}
                      index={index!}
                    />
                  )}
                </div>
              </h3>

              <div className="flex items-center gap-2 mt-4">
                {options.map((_, idx) => (
                  <Star
                    key={idx}
                    size={24}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      (hoveredRating !== null
                        ? hoveredRating
                        : selectedRating) > idx
                        ? "text-amber-400 fill-amber-400"
                        : "text-[#5B03B2] stroke-[#5B03B2]"
                    }`}
                    strokeWidth={1}
                    onMouseEnter={() => setHoveredRating(idx + 1)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => handleRate(idx + 1)}
                  />
                ))}
                {/* <span className="ml-2 text-sm text-gray-600">
                  {hoveredRating || selectedRating || 0} out of {options.length}{" "}
                  stars
                </span> */}
              </div>
            </div>
          </div>

          {(pathname === "/surveys/edit-survey" ||
            pathname.includes("/edit-submitted-survey") ||
            pathname.includes("/edit-draft-survey")) && (
            <ActionButtons onDelete={DeleteQuestion} onEdit={EditQuestion} />
          )}

          {(pathname === "/surveys/edit-survey" ||
            pathname.includes("/edit-submitted-survey") ||
            pathname.includes("/edit-draft-survey")) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Required</span>
              <Switch
                checked={is_required}
                onCheckedChange={
                  setIsRequired && ((checked) => setIsRequired(checked))
                }
                className="bg-gradient-to-r from-[#5B03B2] to-[#9D50BB] scale-90"
              />
            </div>
          )}

          <div className="flex justify-end">
            {!pathname.includes("edit-survey") &&
              !pathname.includes("surveys/question") && (
                <p className="text-sm font-medium bg-gradient-to-r from-[#F5F0FF] to-[#F8F4FF] text-[#5B03B2] px-4 py-1.5 rounded-full shadow-sm border border-[#E5D5FF]">
                  {questionType === "star_rating" && (
                    <span className="flex items-center gap-1 text-xs">
                      <FaStar className="text-[#9D50BB]" />
                      Star Rating
                    </span>
                  )}
                </p>
              )}
          </div>
        </div>

        {pathname.includes("survey-response-upload") && status && (
          <div>{getStatus(status)}</div>
        )}
      </div>
    </div>
  );
};

export default StarRatingQuestion;
