/* 
Matrix Question Component Design Explanation:
------------------------------------------
This component creates a grid-based question format where users can select one answer
per row from multiple columns. The design follows the same pattern as other question types,
with consistent styling and behavior.

Visual representation:

[Component Container - Gray bg, rounded corners, shadow on hover]
┌──────────────────────────────────────────────────────────────┐
│ ⋮ [Grip Handle - Only visible in create mode]                │
│                                                              │
│ 1. Question Text Here                                     *  │
│    [AI Rephrase Button - Shows on hover]                     │
│                                                              │
│    [Matrix Table - White bg, rounded corners, light shadow]  │
│    ┌──────────────────────────────────────────────────────┐  │
│    │           Col 1     Col 2     Col 3     Col 4        │  │
│    │ Row 1      ○         ○         ○         ○          │  │
│    │ Row 2      ○         ○         ○         ○          │  │
│    │ Row 3      ○         ○         ○         ○          │  │
│    └──────────────────────────────────────────────────────┘  │
│                                                              │
│    [Edit/Delete Buttons - If in edit mode]                   │
│    [Required Switch - If in edit mode]                       │
│                                                              │
│    [Question Type Badge]                                     │
│    Matrix Question                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Key Features:
- Consistent container styling with other question types
- Responsive grid layout
- Clear visual hierarchy
- Interactive elements properly positioned
- Maintains spacing patterns from other components
- Supports multiple selections per row for matrix_multiple_choice type
*/

import { draggable, stars } from "@/assets/images";
import { RootState } from "@/redux/store";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { BsExclamation } from "react-icons/bs";
import { Check, GripVertical, Grid, SquareMousePointer } from "lucide-react";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import PollsenseiTriggerButton from "../ui/pollsensei-trigger-button";
import ActionButtons from "./ActionButtons";
import { SurveyData } from "@/subpages/survey/EditSubmittedSurvey";
import { cn } from "@/lib/utils";

interface MatrixAnswer {
  row: string;
  column: string;
  _id: string;
}

interface MatrixQuestionProps {
  question: string;
  questionType: string;
  rows?: string[];
  columns?: string[];
  onChange?: (rowIndex: number, columnIndex: number) => void;
  EditQuestion?: () => void;
  DeleteQuestion?: () => void;
  index: number;
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
  isEdit?: boolean;
  surveyData?: SurveyData;
  response?: { [key: string]: string };
  matrix_answers?: MatrixAnswer[];
}

const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  question,
  rows,
  columns,
  questionType,
  EditQuestion,
  index,
  onChange,
  DeleteQuestion,
  onSave,
  setEditId,
  status,
  is_required,
  setIsRequired,
  isEdit = false,
  surveyData,
  response,
  matrix_answers,
}) => {
  const pathname = usePathname();
  const questionText = useSelector(
    (state: RootState) => state?.survey?.question_text
  );
  const colorTheme = useSelector(
    (state: RootState) => state?.survey?.color_theme
  );

  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: string;
  }>(response || {});

  useEffect(() => {
    if (matrix_answers) {
      const prefilled: { [key: string]: string } = {};
      matrix_answers.forEach((answer) => {
        const rowIndex = rows?.findIndex((r) => r === answer.row);
        if (rowIndex !== undefined && rowIndex !== -1) {
          prefilled[rowIndex] = answer.column;
        }
      });
      setSelectedItems(prefilled);
    }
  }, [matrix_answers, rows]);

  const handleMatrixItemSelect = (rowIndex: number, value: string) => {
    if (response || matrix_answers) return; // Prevent changes if response or matrix_answers exists

    const newSelectedItems = { ...selectedItems };
    newSelectedItems[rowIndex] = value;
    setSelectedItems(newSelectedItems);

    if (onChange) {
      onChange(rowIndex, columns?.indexOf(value) || 0);
    }
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

  const headerBgStyle = {
    backgroundColor: colorTheme ? `${colorTheme}15` : "#F5F0FF",
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
                      options={{ rows: rows!, columns: columns! }}
                      setEditId={setEditId}
                      onSave={onSave!}
                      index={index}
                    />
                  )}
                </div>
              </h3>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                  <thead>
                    <tr>
                      <th
                        className="border-b border-gray-200 text-start p-2"
                        style={headerBgStyle}
                      ></th>
                      {columns?.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className="border-b border-gray-200 text-center p-2 text-gray-700 font-medium"
                          style={headerBgStyle}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows?.map((rowLabel, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        <td
                          className="border-b border-gray-200 text-start p-2 text-gray-700 font-medium"
                          style={headerBgStyle}
                        >
                          {rowLabel}
                        </td>
                        <td
                          colSpan={columns?.length}
                          className="border-b border-gray-200 p-2"
                        >
                          <RadioGroup
                            value={selectedItems[rowIndex]}
                            onValueChange={(value) =>
                              handleMatrixItemSelect(rowIndex, value)
                            }
                            className="flex justify-around"
                            disabled={!!response || !!matrix_answers}
                          >
                            {columns?.map((col) => (
                              <div
                                key={col}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={col}
                                  id={`${rowIndex}-${col}`}
                                  className={
                                    response || matrix_answers
                                      ? "cursor-not-allowed opacity-50"
                                      : ""
                                  }
                                />
                              </div>
                            ))}
                          </RadioGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {(pathname === "/surveys/edit-survey" ||
            pathname.includes("/edit-submitted-survey") ||
            pathname.includes("/edit-draft-survey")) && (
            <ActionButtons onDelete={DeleteQuestion} onEdit={EditQuestion} />
          )}

          {pathname === "/surveys/add-question-m" && (
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2 text-red-500 border border-red-500 rounded-full hover:bg-red-50 transition-colors"
                onClick={DeleteQuestion}
              >
                Delete
              </button>
            </div>
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
        </div>

        {pathname.includes("survey-response-upload") && status && (
          <div>{getStatus(status)}</div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <p className="text-sm font-medium bg-gradient-to-r from-[#F5F0FF] to-[#F8F4FF] text-[#5B03B2] px-4 py-1.5 rounded-full shadow-sm border border-[#E5D5FF]">
          <span className="flex items-center gap-1 text-xs">
            <Grid className="text-[#9D50BB] w-3 h-3" />
            Matrix Question
          </span>
        </p>
      </div>
    </div>
  );
};

export default MatrixQuestion;
