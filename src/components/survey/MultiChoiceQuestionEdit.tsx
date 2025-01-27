import { draggable } from "@/assets/images";
import {
  setActionMessage,
  setCurrentQuestion,
  setCurrentQuestionType,
  setIsCollapsed,
} from "@/redux/slices/sensei-master.slice";
import { Switch } from "@radix-ui/react-switch";
import Image from "next/image";
import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import Select from "react-select";

interface MultiChoiceQuestionEditProps {
  question: string;
  questionType: string;
  options: string[] | undefined;
  onSave?: (
    updatedQuestion: string,
    updatedOptions: string[],
    editedQuestionType: string,
    is_required: boolean
  ) => void;
  onCancel?: () => void;
  setIsRequired?: (value: boolean) => void;
  is_required: boolean;
  index?: number;
}

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    paddingLeft: "1.3rem",
    border: "none",
    backgroundColor: "#fff",
    color: "#8A7575",
    outline: "none",
  }),
  option: (provided: any) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
  }),
};

const MultiChoiceQuestionEdit: React.FC<MultiChoiceQuestionEditProps> = ({
  question,
  options,
  questionType,
  onSave,
  onCancel,
  is_required,
  setIsRequired,
  index,
}) => {
  const dispatch = useDispatch();
  const [editedQuestion, setEditedQuestion] = useState<string>(question);
  const [editedQuestionType, setEditedQuestionType] =
    useState<string>(questionType);
  const [editedOptions, setEditedOptions] = useState<string[]>(options || [""]);
  const [rows, setRows] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedOptions];
    newOptions[index] = value;
    setEditedOptions(newOptions);
  };

  const handleAddOption = () => {
    dispatch(
      setActionMessage(`Can you suggest an extra option for question ${index}`)
    );
    dispatch(setIsCollapsed(false));
    dispatch(
      setCurrentQuestion({
        question: {
          Question: question,
          "Option type": questionType,
          Options: options,
        },
      })
    );
    setEditedOptions([...editedOptions, ""]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...editedOptions];
    newOptions.splice(index, 1);
    setEditedOptions(newOptions);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedQuestion, editedOptions, editedQuestionType, is_required);
    }
  };


  const handleAddRow = () => setRows([...rows, ""]);
  const handleRemoveRow = (index: number) =>
    setRows(rows.filter((_, i) => i !== index));
  const handleRowChange = (index: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index] = value;
    setRows(updatedRows);
  };

  const handleAddColumn = () => setColumns([...columns, ""]);
  const handleRemoveColumn = (index: number) =>
    setColumns(columns.filter((_, i) => i !== index));
  const handleColumnChange = (index: number, value: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = value;
    setColumns(updatedColumns);
  };

  // const handleQuestionTypeChange = (selectedOption: any) => {
  //   setEditedQuestionType(selectedOption.value);
  //   switch (selectedOption.value) {
  //     case "likert_scale":
  //       setEditedOptions([
  //         "Strongly Disagree",
  //         "Disagree",
  //         "Neutral",
  //         "Agree",
  //         "Strongly Agree",
  //       ]);
  //       break;
  //     case "Multi-choice":
  //       setEditedOptions([""]);
  //       break;
  //     case "Comment":
  //       setEditedOptions([]);
  //       break;
  //     default:
  //       setEditedOptions([""]);
  //   }
  //   dispatch(setCurrentQuestionType(selectedOption.value));
  //   dispatch(
  //     setActionMessage(
  //       `Check the compatibility of the question type for question ${index}`
  //     )
  //   );
  //   dispatch(setIsCollapsed(false));
  //   dispatch(
  //     setCurrentQuestion({
  //       question: {
  //         Question: question,
  //         "Option type": questionType,
  //         Options: options,
  //       },
  //     })
  //   );
  // };

  const handleQuestionTypeChange = (selectedOption: any) => {
    const newQuestionType = selectedOption.value;
  
    // List of question types that require options
    const optionBasedTypes = [
      "multiple_choice",
      "single_choice",
      "checkbox",
      "drop_down",
      "likert_scale",
    ];
  
    setEditedQuestionType(newQuestionType);
  
    // Check if the new question type requires options
    if (optionBasedTypes.includes(newQuestionType)) {
      // If options already exist, retain them
      if (editedOptions.length > 0) {
        setEditedOptions([...editedOptions]);
      } else {
        // Otherwise, set default options for specific question types
        switch (newQuestionType) {
          case "likert_scale":
            setEditedOptions([
              "Strongly Disagree",
              "Disagree",
              "Neutral",
              "Agree",
              "Strongly Agree",
            ]);
            break;
            case "matrix_checkbox":
            case "matrix_multiple_choice":
              setRows([]);
              setColumns([]);
            break;
          default:
            setEditedOptions([""]);
            break;
        }
      }
    } else {
      // For question types that do not require options, clear options
      setEditedOptions([]);
    }
  
    // Dispatch actions (optional, for external state handling)
    dispatch(setCurrentQuestionType(newQuestionType));
    dispatch(
      setActionMessage(
        `Check the compatibility of the question type for question ${index}`
      )
    );
    dispatch(setIsCollapsed(false));
    dispatch(
      setCurrentQuestion({
        question: {
          Question: question,
          "Option type": questionType,
          Options: options,
        },
      })
    );
  };
  

  const selectOptions = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "single_choice", label: "Single Choice" },
    { value: "long_text", label: "Comment" },
    { value: "likert_scale", label: "Likert Scale" },
    { value: "short_text", label: "Short Text" },
    { value: "checkbox", label: "Checkbox" },
    { value: "star_rating", label: "Star Rating" },
    { value: "rating_scale", label: "Rating Scale" },
    { value: "boolean", label: "Boolean" },
    { value: "slider", label: "Slider" },
    { value: "number", label: "Number" },
    { value: "drop_down", label: "Dropdown" },
    { value: "matrix_checkbox", label: "Matrix Checkbox" },
    { value: "matrix_multiple_choice", label: "Matrix Multiple Choice" },
  ];

  return (
    <div className="mb-4 bg-[#FAFAFA] flex items-center w-full p-3 gap-3 rounded">
      <Image src={draggable} alt="draggable icon" />
      <div className="w-full flex flex-col">
        <div className="flex justify-between w-full items-center">
          <input
            type="text"
            value={editedQuestion}
            onChange={(e) => setEditedQuestion(e.target.value)}
            className="text-lg font-semibold text-start w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-between py-4 items-center">
          <small>Option Type</small>
          <Select
            className="select-container border-2 rounded mx-4 my-4"
            classNamePrefix="questionType"
            defaultValue={selectOptions.find(
              (opt) => opt.value === questionType
            )}
            value={selectOptions.find(
              (opt) => opt.value === editedQuestionType
            )}
            name="questionType"
            options={selectOptions}
            styles={customStyles}
            onChange={handleQuestionTypeChange}
          />
        </div>

        {editedQuestionType !== "long_text" && (
          <div>
            {editedOptions.map((option, index) => (
              <div key={index} className="flex items-center my-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="mr-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
                {editedOptions.length > 1 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 ml-2"
                  >
                    <MdDeleteOutline />
                  </button>
                )}
              </div>
            ))}
            {editedQuestionType === "multiple_choice" || editedQuestionType === "single_choice" || editedQuestionType === "checkbox" && (
              <button
                onClick={handleAddOption}
                className="text-blue-500 mt-2 text-start"
              >
                Add Option
              </button>
            )}

              {editedQuestionType === "long_text" ||
              editedQuestionType === "short_text" ||
              editedQuestionType === "boolean" ||
              editedQuestionType === "slider" ||
              editedQuestionType === "number" ? (
                ""
              ) : (
                <button
                  onClick={handleAddOption}
                  className="text-blue-500 mt-2 border py-2 px-4 rounded-full text-start"
                >
                  Add Option
                </button>
              )}
          </div>
        )}

           {editedQuestionType === "matrix_multiple_choice" && (
                <div className="mt-4">
                  <div className="mb-4">
                    <label>Body</label>
                    {rows.map((row, index) => (
                      <div key={index} className="flex items-center my-2">
                        <input
                          type="text"
                          value={row}
                          onChange={(e) => handleRowChange(index, e.target.value)}
                          placeholder="Enter row option"
                          className="mr-2 w-full bg-transparent border-b py-2 border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        {rows.length > 1 && (
                          <button onClick={() => handleRemoveRow(index)} className="text-red-500 ml-2">
                            <MdDeleteOutline />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={handleAddRow} className="text-blue-500 mt-2 border py-2 px-4 rounded-full text-start">
                      Add Matrix body
                    </button>
                  </div>
                  <div className="mb-4">
                    <label>Head</label>
                    {columns.map((column, index) => (
                      <div key={index} className="flex items-center my-2">
                        <input
                          type="text"
                          value={column}
                          onChange={(e) => handleColumnChange(index, e.target.value)}
                          placeholder="Enter column option"
                          className="mr-2 w-full bg-transparent border-b py-2 border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        {columns.length > 1 && (
                          <button onClick={() => handleRemoveColumn(index)} className="text-red-500 ml-2">
                            <MdDeleteOutline />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={handleAddColumn} className="text-blue-500 mt-2 border py-2 px-4 rounded-full text-start">
                      Add Matrix head
                    </button>
                  </div>
                </div>
              )}

        <div className="flex justify-end gap-4 mt-4">
          <button
            className="bg-transparent border text-[#828282] border-[#828282] px-5 py-1 rounded-full"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="text-blue-500 bg-white px-5 border border-blue-500 py-1 rounded-full"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span>Required</span>
          <Switch
            checked={is_required}
            onCheckedChange={
              setIsRequired
                ? (checked: boolean) => setIsRequired(checked)
                : undefined
            }
            className="bg-[#9D50BB]"
          />
        </div>
      </div>
    </div>
  );
};

export default MultiChoiceQuestionEdit;
