import { draggable, stars } from "@/assets/images";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import PollsenseiTriggerButton from "../ui/pollsensei-trigger-button";

interface LikertScaleQuestionProps {
  question: string;
  options: string[];
  questionType?: string;
  onChange?: (value: string) => void;
  EditQuestion?: () => void;
  DeleteQuestion?: () => void;
  index?: number;
  setEditId?: React.Dispatch<React.SetStateAction<number | null>>;
  onSave?: (
    updatedQuestion: string,
    updatedOptions: string[],
    updatedQuestionType: string,
    aiEditIndex?: number
  ) => void;
}

const LikertScaleQuestion: React.FC<LikertScaleQuestionProps> = ({
  question,
  options,
  questionType,
  EditQuestion,
  onChange,
  index,
  DeleteQuestion,
  setEditId,
  onSave,
}) => {
  const pathname = usePathname();

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="mb-4 bg-[#FAFAFA] flex items-center w-full p-3 gap-3">
      <Image
        src={draggable}
        alt="draggable icon"
        className={
          pathname === "/surveys/edit-survey" ||
          pathname === "surveys/preview-survey"
            ? "invisible"
            : "visible"
        }
      />
      <div className="w-full">
        <div className="flex justify-between w-full items-center">
          <h3 className="group text-lg font-semibold text-start">
            {question}
            <PollsenseiTriggerButton
              key={index}
              imageUrl={stars}
              tooltipText="Rephrase question"
              className={"group-hover:inline-block hidden"}
              triggerType="rephrase"
              question={question}
              optionType={questionType!}
              options={options}
              setEditId={setEditId}
              onSave={onSave!}
              index={index!}
            />
          </h3>
          {pathname === "/surveys/edit-survey" ? "" : <p>{questionType}</p>}
        </div>
        <div className="flex justify-between my-2">
          {options?.map((option, index) => (
            <div key={index} className="flex flex-col items-center">
              <input
                type="radio"
                id={`likert-${index}`}
                name={question}
                className="text-[#5B03B2]"
                onChange={handleScaleChange}
              />
              <label htmlFor={`likert-${index}`} className="mt-1">
                {option}
              </label>
            </div>
          ))}
        </div>
        {pathname === "/surveys/edit-survey" && (
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
        )}
      </div>
    </div>
  );
};

export default LikertScaleQuestion;
