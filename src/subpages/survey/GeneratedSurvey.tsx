import React, { useEffect, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import Image from "next/image";
import { stars } from "@/assets/images";
import CommentQuestion from "@/components/survey/CommentQuestion";
import MultiChoiceQuestion from "@/components/survey/MultiChoiceQuestion";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { setQuestionObject } from "@/redux/slices/questions.slice";
import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import PaginationControls from "@/components/common/PaginationControls";
import MatrixQuestion from "@/components/survey/MatrixQuestion";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";

interface GeneratedSurveyProps {
  data: any;
  onClick: () => void;
}

const GeneratedSurvey: React.FC<GeneratedSurveyProps> = ({ data, onClick }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(0);
  const [questions, setQuestions] = useState(data);
  const router = useRouter();
  const dispatch = useDispatch();
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const surveyTitle = useSelector((state: RootState) => state?.survey.topic);
  const headerText = useSelector(
    (state: RootState) => state?.survey?.header_text
  );
  const surveyDescription = useSelector(
    (state: RootState) => state?.survey?.description
  );
  const survey = useSelector((state: RootState) => state?.survey);
  const totalPages = questions.length

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestions(items);
  };

  const EditQuestion = async (id: any) => {
    const questionIndex = questions?.findIndex(
      (_question: any, index: any) => index === id
    );
    setEditIndex(questionIndex);
    setIsEdit(true);
    console.log(questions[questionIndex]);
  };

  const handleEdit = () => {
    dispatch(
      setQuestionObject({
        title: surveyTitle,
        conversation_id: data?.data?.conversation_id,
        questions: questions,
        description: surveyDescription,
      })
    );
    router.push("/surveys/edit-survey");
  };



  console.log(questions);

  return (
    <div className="py-10 px-2 w-full">
      <div className="flex justify-between items-center">
        <div className="flex flex-col text-start">
          <h2 className="text-[1.5rem] font-normal">
            <IoArrowBackOutline className="inline-block" /> Generated Survey
          </h2>
          <p className="font-normal">
            Here’s your survey. You can choose to continue or use another prompt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="button-primary" onClick={handleEdit}>
            <FiEdit2 className="inline-block" /> Edit Survey
          </button>
          <button
            className="gradient-border gradient-text px-6 py-2 rounded-lg flex items-center space-x-2"
            onClick={onClick}
          >
            Use another prompt
            <Image src={stars} alt="stars" className={`inline-block`} />
          </button>
        </div>
      </div>
      <hr />
      <div className="py-10 w-full flex gap-10 ">
        <div className="pb-10 w-2/3 flex flex-col">
          <div className="text-start pb-5">
            <p className="font-bold text-[#7A8699]">Survey Topic</p>
            <h2
              className="text-[1.5rem] font-normal"
              style={{
                fontSize: `${headerText?.size}px`,
                fontFamily: `${headerText?.name}`,
              }}
            >
              {surveyTitle}
            </h2>
          </div>
          <div className="text-start">
            <p className="font-bold text-[#7A8699]">Survey description</p>
            <h2>{surveyDescription}</h2>
          </div>
          <div className="flex justify-between items-center pt-8 pb-5">
            <p className="text-sm">Question</p>
            <p className="text-sm">Question Type</p>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <StrictModeDroppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions[0]?.questions.map((item: any, index: any) => (
                    <Draggable
                      key={index + 1}
                      draggableId={index.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-4"
                        >
                          {item.question_type === "multiple_choice" || item.question_type === "multi_choice"  ? (
                            <MultiChoiceQuestion
                              index={index + 1}
                              question={item.question}
                              options={item.options}
                              questionType={item.question_type}
                              EditQuestion={() => EditQuestion(index)}
                            />
                          ) : item.question_type === "comment" ||  item.question_type === "long_text" ? (
                            <CommentQuestion
                              key={index}
                              index={index + 1}
                              question={item.question}
                              questionType={item.question_type}
                            />
                          ) : item.question_type === "matrix_checkbox" ? (
                            <MatrixQuestion
                              key={index}
                              index={index + 1}
                              options={item.options}
                              question={item.question}
                              questionType={item.question_type}
                            />
                          ) : null}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>

          <div className="flex justify-between items-center pt-5 pb-10">
            <div className="">
              <button
                className="bg-gradient-to-r from-[#5b03b2] to-[#9d50bb] rounded-lg px-8 py-2 text-white text-[16px] font-medium leading-6 text-center font-inter justify-center"
                type="button"
                onClick={handleEdit}
              >
                <FaEye className="inline-block mr-2" />
                Continue
              </button>
            </div>
            <div className="mt-6 sm:mt-8">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                setItemsPerPage={setItemsPerPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedSurvey;
