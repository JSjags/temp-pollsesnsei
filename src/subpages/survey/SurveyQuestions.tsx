import CommentQuestion from "@/components/survey/CommentQuestion";
import LikertScaleQuestion from "@/components/survey/LikertScaleQuestion";
import MultiChoiceQuestion from "@/components/survey/MultiChoiceQuestion";
import StarRatingQuestion from "@/components/survey/StarRatingQuestion";
import React, { useState } from "react";

import Image from "next/image";
import { pollsensei_new_logo } from "@/assets/images";
import MatrixQuestion from "@/components/survey/MatrixQuestion";

import PaginationBtn from "@/components/common/PaginationBtn";
import { useFetchASurveyQuery } from "@/services/survey.service";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import SliderQuestion from "@/components/survey/SliderQuestion";
import ShortTextQuestion from "@/components/survey/LongTextQuestion";
import BooleanQuestion from "@/components/survey/BooleanQuestion";
import SingleChoiceQuestion from "@/components/survey/SingleChoiceQuestion";
import NumberQuestion from "@/components/survey/NumberQuestion";
import CheckboxQuestion from "@/components/survey/CheckboxQuestion";
import DropdownQuestion from "@/components/survey/DropdownQuestion";
import RatingScaleQuestion from "@/components/survey/RatingScaleQuestion";
import MediaQuestion from "@/components/survey/MediaQuestion";

const SurveyQuestions = () => {
  const params = useParams();
  const { data, isLoading } = useFetchASurveyQuery(params.id);
  const [currentSection, setCurrentSection] = useState(0);
  // const [isSettings, setIsSettings] = useState(true);
  const isSettings = useSelector(
    (state: RootState) => state.survey_settings.isSettings
  );
  console.log(data);
  const navigatePage = (direction: any) => {
    setCurrentSection((prevIndex) => {
      if (direction === "next") {
        return prevIndex < data?.data?.sections?.length - 1
          ? prevIndex + 1
          : prevIndex;
      } else {
        return prevIndex > 0 ? prevIndex - 1 : prevIndex;
      }
    });
  };

  return (
    <div className={` flex flex-col gap-5 lg:px-16 w-full`}>
      {data && data?.data && (
        <div
          className={`${data?.data?.theme} flex justify-center items-center px-5 mx-auto gap-10 lg:w-[80%]`}
        >
          <div
            className={` w-full flex flex-col overflow-y-auto max-h-screen custom-scrollbar`}
          >
            {data && !isLoading && data?.data?.logo_url && (
              <div className="bg-[#9D50BB]  w-16 my-3 text-white flex items-center flex-col ">
                <Image
                  src={data?.data?.logo_url}
                  alt=""
                  className="w-full object-cover bg-no-repeat h-16 "
                  width={"100"}
                  height={"200"}
                />
              </div>
            )}
              {
                data && !isLoading && data?.data?.header_url && (
            <div className="bg-[#9D50BB]  w-full my-2 text-white h-24 flex items-center flex-col ">
              <Image
                src={data && !isLoading && data?.data?.header_url}
                alt=""
                className="w-full object-cover bg-no-repeat h-24 "
                width={"100"}
                height={"200"}
              />
            </div>
                )
              }

            <div className="bg-white rounded-lg w-full my-4 flex gap-2 px-11 py-4 flex-col ">
              <h2
                className="text-[1.5rem] font-normal"
                style={{
                  fontSize: `${data?.data?.header_text?.size}px`,
                  fontFamily: `${data?.data?.header_text?.name}`,
                }}
              >
                {data?.data?.topic}
              </h2>
              <p    style={{
                  fontSize: `${data?.data?.body_text?.size}px`,
                  fontFamily: `${data?.data?.body_text?.name}`,
                }}>{data?.data?.description}</p>
            </div>
            {data?.data &&
              data?.data?.sections[currentSection]?.questions?.map(
                (item: any, index: number) => (
                  <div key={index} className="mb-4" 
                  style={{
                    fontFamily: `${data?.data?.question_text?.name}`,
                    fontSize: `${data?.data?.question_text?.size}px`,
                  }}
                  >
                    {item.question_type &&
                    item.question_type === "multiple_choice" ? (
                      <MultiChoiceQuestion
                        question={item.question}
                        options={item.options}
                        questionType={item.question_type}
                        index={index + 1}
                        is_required={item.is_required}
                      />
                    ) : item.question_type === "long_text" ? (
                      <CommentQuestion
                        key={index}
                        index={index + 1}
                        questionType={item.question_type}
                        question={item.question}
                        is_required={item.is_required}
                      />
                    ): item.question_type === "media" ? (
                      <MediaQuestion
                        key={index}
                        index={index + 1}
                        questionType={item.question_type}
                        question={item.question}
                        is_required={item.is_required}
                      />
                    )
                     : item.question_type === "slider" ? (
                      <SliderQuestion
                      question={item.question}
                      options={item.options}
                      // step={item.options.length}
                      questionType={item.question_type}
                      index={index + 1}
                      is_required={item.is_required}
                      />
                    )
                    : item.question_type === "likert_scale" ? (
                      <LikertScaleQuestion
                        question={item.question}
                        options={item.options}
                        questionType={item.question_type}
                        key={index}
                        index={index + 1}
                        is_required={item.is_required}

                      />
                    ) : item.question_type === "star_rating" ? (
                      <StarRatingQuestion
                        question={item.question}
                      // maxRating={5}
                        index={index + 1}
                        questionType={item.question_type}
                        is_required={item.is_required}
                      />
                    ) : item.question_type === "matrix_checkbox" ? (
                      <MatrixQuestion
                        key={index}
                        index={index + 1}
                        // options={item.options}
                        rows={item.rows}
                        columns={item.columns}
                        questionType={item.question_type}
                        question={item.question}
                        is_required={item.is_required}

                      />
                    ) : item.question_type === "short_text" ? (
                      <ShortTextQuestion
                        key={index}
                        index={index + 1}
                        question={item.question}
                        questionType={item.question_type}
                        is_required={item.is_required}
                       
                      />
                    ) : item.question_type === "boolean" ? (
                      <BooleanQuestion
                        key={index}
                        index={index + 1}
                        question={item.question}
                        options={item.options}
                        questionType={item.question_type}
                       
                      />
                    )  :  item.question_type === "single_choice" ? (
                      <SingleChoiceQuestion
                        index={index + 1}
                        key={index}
                        question={item.question}
                        options={item.options}
                        questionType={item.question_type}
                        
                      />
                    ) : item.question_type === "number" ? (
                      <NumberQuestion
                        key={index}
                        index={index + 1}
                        question={item.question}
                        questionType={item.question_type}
                        // EditQuestion={() => EditQuestion(index)}
                      />
                    ) :  item.question_type === "checkbox" ? (
                      <CheckboxQuestion
                      key={index} 
                      index={index + 1}
                      question={item.question}
                      options={item.options}
                      questionType={item.question_type}
                     
                    />
                    )  :  item.question_type === "checkbox" ? (
                      <CheckboxQuestion
                      key={index} 
                      index={index + 1}
                      question={item.question}
                      options={item.options}
                      questionType={item.question_type}
                     
                    />
                    ) : item.question_type === "rating_scale" ? (
                      <RatingScaleQuestion
                        key={index} 
                        index={index + 1}
                        question={item.question}
                        options={item.options}
                        questionType={item.question_type}
                     
                      />
                    )
                    :  item.question_type === "drop_down" ? (
                      <DropdownQuestion
                        index={index + 1}
                        key={index}
                        question={item.question}
                        options={item.options}
                        questionType={item.question_type}
                       
                      />
                    )
                     : item.question_type === "number" ? (
                      <NumberQuestion
                        key={index}
                        index={index + 1}
                        question={item.question}
                        questionType={item.question_type}
                       
                      />
                    )
                     : null}
                  </div>
                )
              )}

            {data?.data?.sections?.length > 1 && (
              <div className="flex justify-end items-center pb-10">
                <PaginationBtn
                  currentSection={currentSection}
                  totalSections={data?.data?.sections?.length}
                  onNavigate={navigatePage}
                />
              </div>
            )}

            <div className="bg-[#5B03B21A] rounded-md flex flex-col justify-center items-center mb-10 py-5 text-center relative">
              <div className="flex flex-col">
                <p>Form created by</p>
                <Image src={pollsensei_new_logo} alt="Logo" />
              </div>
              <span className="absolute bottom-2 right-4 text-[#828282]">
                Remove watermark
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyQuestions;
