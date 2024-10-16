"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  chatbot,
  qualitative_survey,
  quantitative_qualitative_survey,
  Quantitative_survey,
  stars,
  tooltip_icon,
  User_Setting,
} from "@/assets/images";
import { useRouter, useSearchParams } from "next/navigation";
import { Tooltip } from "flowbite-react";
import {
  useCreateAiSurveyMutation,
  useGenerateTopicsMutation,
} from "@/services/survey.service";
import { toast } from "react-toastify";
import IsLoadingModal from "@/components/modals/IsLoadingModal";
import GeneratedSurvey from "./GeneratedSurvey";
import IsGenerating from "@/components/modals/IsGenerating";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  addSection,
  resetSurvey,
  saveGeneratedBy,
  updateConversationId,
  updateDescription,
  updateSurveyType,
  updateTopic,
} from "@/redux/slices/survey.slice";
import store from "@/redux/store";
import Milestones from "@/components/survey/Milestones";
import { AnimatePresence, motion } from "framer-motion";
import SenseiMaster from "@/components/sensei-master/SenseiMaster";
import ModalComponent from "@/components/ui/ModalComponent";
import { resetQuestion } from "@/redux/slices/questions.slice";

// Springy Animation Variants for the mascot
const mascotVariants = {
  hidden: { opacity: 0, scale: 0.3, y: 0 }, // Start small and slightly off-screen
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring", // Springy effect
      stiffness: 300, // Controls the "bounciness"
      damping: 20, // Controls how fast the spring comes to rest
      duration: 0.8, // Duration of the animation
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 0, // Exit with downward movement
    transition: {
      duration: 0.3, // Slightly faster exit
    },
  },
};

const CreateSurveyPage = () => {
  const [selectedDiv, setSelectedDiv] = useState(null);
  const [selectedSurveyType, setSelectedSurveyType] = useState("");
  const [isSelected, setIsSelected] = useState<number | null>(null);
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const currentState = searchParams.get("state");
  const [whatDoYouWant, setWhatDoYouWant] = useState(false);
  const [oneMoreThing, setOneMoreThing] = useState(false);
  const [promptForm, setPromptForm] = useState(false);
  const [isTopicModal, setIsTopicModal] = useState(false);
  const [manualTopic, setManualTopic] = useState("");
  const generated_by = useSelector(
    (state: RootState) => state.survey.generated_by
  );
  const dispatch = useDispatch();
  const [surveyType, setSurveyType] = useState("");
  const [surveyPrompt, setSurveyPrompt] = useState("");
  const [createAiSurvey, { data, isLoading, isSuccess, isError, error }] =
    useCreateAiSurveyMutation();
  const [
    generateTopics,
    {
      data: topics,
      isLoading: isLoadingTopics,
      isSuccess: isTopicSuccess,
      isError: isTpoicError,
      error: topicError,
    },
  ] = useGenerateTopicsMutation();
  const [generated, setGenerated] = useState(false);

  const handleDivClick = (userType: any) => {
    setSelectedDiv(userType);
  };

  const maxCharacters = 3000;

  const surveyData = useSelector((state:RootState) => state?.survey?.sections);
  const manualSurveyData = useSelector((state:RootState) => state?.question?.questions)
  // const generated_by = useSelector((state:RootState) => state?.survey?.generated_by)
  const [shouldPrompt, setShouldPrompt] = useState(false);

  useEffect(() => {
    if (surveyData && surveyData.length > 0 || manualSurveyData && manualSurveyData.length > 0) {
      setShouldPrompt(true);
    }

    return () => {
      // Ask user before clearing data on unmount
      if (shouldPrompt && window.confirm("You have unsaved survey data. Do you want to discard it?")) {
        dispatch(resetSurvey());
      }
    };
  }, [dispatch, shouldPrompt]);

  const handleUserDecision = () => {
    if (window.confirm('Do you want to continue with the old survey data?')) {
      if(generated_by === "ai"){
        navigate.push("/surveys/edit-survey")
      }else{
        navigate.push("/surveys/add-question-m")
      }
    } else {
      dispatch(resetSurvey()); 
    }
    setShouldPrompt(false); 
  };

  const handleSurveyType = (userType: any, prompt: string) => {
    setSelectedDiv(userType);
    setSelectedSurveyType(prompt);
    setSurveyType(prompt);
  };

  const handlePathClick = () => {
    if (selectedDiv) {
      setWhatDoYouWant((prev) => !prev);
      setOneMoreThing((prev) => !prev);
    }
  };

  const handleGenerateTopics = async () => {
    try {
      await generateTopics({
        user_query: surveyPrompt,
      });
    } catch (e) {
      toast.error("Failed to create survey");
      console.error(e);
    }
  };

  // const handleGenerateTopics = async () => {
  //   let retries = 3;
  //   let success = false;
  
  //   while (retries > 0 && !success) {
  //     try {
  //       await generateTopics({
  //         user_query: surveyPrompt,
  //       });
  //       success = true;
  //     } catch (e) {
  //       retries -= 1;
  //       console.error(`Attempt failed. Retries left: ${retries}`, e);
  //       if (retries === 0) {
  //         toast.error("Failed to create survey after 3 attempts");
  //       }
  //     }
  //   }
  // };  

  useEffect(() => {
    if (isTopicSuccess) {
      toast.success("Survey topic created successfully");
      setIsTopicModal((prev) => !prev);
      setPromptForm(!promptForm);
    }
    if (isTpoicError || topicError) {
      toast.error("Failed to generate survey topic");
    }
  }, [isTopicSuccess, isTpoicError, topicError]);

  const handleGenerateQuestion = async () => {
    console.log({
      user_query: surveyPrompt,
      survey_type: selectedSurveyType,
    });

    try {
      await createAiSurvey({
        user_query: surveyPrompt,
        survey_type: selectedSurveyType,
      });
    } catch (e) {
      toast.error("Failed to create survey");
      console.error(e);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const refactoredQuestions = data?.data?.response?.map((question: any) => {
        const optionType = question["Option type"]?.trim();

        return {
          question: question.Question,
          options: question.Options,
          question_type:
            optionType === "Multi-choice"
              ? "multiple_choice"
              : // ? "single_choice"
              optionType === "Comment"
              ? "long_text"
              : "matrix_checkbox",
          is_required: false,
          description: "",
        };
      });
      dispatch(addSection({ questions: refactoredQuestions }));
      dispatch(updateConversationId(data?.data?.conversation_id));
      dispatch(updateDescription(surveyPrompt));
      toast.success("Survey created successfully");
      setGenerated((prev) => !prev);
      setPromptForm(false);
    }
  }, [
    data?.data?.conversation_id,
    data?.data?.response,
    data?.data.topic,
    dispatch,
    isSuccess,
    surveyPrompt,
  ]);

  const UseAnotherPrompt = () => {
    setGenerated((prev) => !prev);
    setPromptForm(!promptForm);
  };

  const survey = store.getState().survey;
  console.log(survey);
  console.log(data);
  console.log(survey.sections);

  useEffect(() => {
    if (currentState === "whatDoYouWant" || currentState === "") {
      setWhatDoYouWant(true);
      setOneMoreThing(false);
      setPromptForm(false);
    } else if (currentState === "oneMoreThing") {
      setWhatDoYouWant(false);
      setOneMoreThing(true);
      setPromptForm(false);
    } else if (currentState === "promptForm") {
      setWhatDoYouWant(false);
      setOneMoreThing(false);
      setPromptForm(true);
    } else {
      setWhatDoYouWant(true); 
    }
  }, [currentState]);

  const navigateToState = (newState: string) => {
    const params = new URLSearchParams();
    params.set("state", newState); 
    navigate.push(`?${params.toString()}`); 
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] px-5 text-center">
          {shouldPrompt && (
        <ModalComponent
        title=""
        openModal={shouldPrompt}
        // onClose={() => setShouldPrompt((prev)=> !prev)}
        >
          <div className="flex flex-col justify-center items-center text-center">
          <p>You have unsaved survey data. Do you want to continue?</p>
          <div className="flex justify-between items-center w-full gap-4">
            
          <button className="w-full border py-2 rounded" onClick={handleUserDecision}>Yes, Continue</button>
          <button className="w-full border py-2 rounded" onClick={() =>{
            dispatch(resetSurvey())
            dispatch(resetQuestion());
            setShouldPrompt(false)
            }}>No, Start Fresh</button>
          </div>
          </div>
        </ModalComponent>
      )}
      {whatDoYouWant && (
        <div className="flex flex-col justify-center items-center gap-10 ">
          <h1 className="text-2xl mt-10 md:mt-0">
            Hello, there! What do you want to do?
          </h1>

          <div className={`md:flex justify-center gap-5 items-center`}>
            <div
              className={`flex flex-col items-center pb-20 justify-center gap-5 border rounded-md px-10 pt-10 text-center ${
                selectedDiv === 1 ? "border-[#CC9BFD] border-2" : ""
              }`}
              onClick={() => {
                handleDivClick(1);
                dispatch(saveGeneratedBy("ai"));
              }}
            >
              <Image src={chatbot} alt="Logo" className="h-8 w-auto" />
              <h1 className="text-lg">Generate with AI</h1>
              <p>
                Give us a prompt and our AI we will do the hard for{" "}
                <br className="hidden lg:block" /> you. We will create a survey
                tailored for your needs
              </p>
              <button
                className={`bg-gradient-to-r from-[#5b03b2] to-[#9d50bb] rounded-lg px-3 py-2 text-white text-[16px] font-medium text-center font-inter justify-center ${
                  selectedDiv === 1 ? "visible" : "invisible"
                }`}
                type="button"
                onClick={()=>{navigateToState("oneMoreThing")}}
                // onClick={handlePathClick}
              >
                Proceed
              </button>
            </div>
            <div
              className={`flex flex-col items-center pb-20 justify-center gap-5 border rounded-md px-10 pt-10 text-center mt-4 md:mt-0 ${
                selectedDiv === 2 ? "border-[#CC9BFD] border-2" : ""
              }`}
              onClick={() => {
                handleDivClick(2);
                dispatch(saveGeneratedBy("manually"));
              }}
            >
              <Image src={User_Setting} alt="Logo" className="h-8 w-auto" />
              <h1 className="text-lg">Create Manually</h1>
              <p>
                Create your own survey on a blank canvas and{" "}
                <br className="hidden lg:block" /> customize it according to
                your taste.
              </p>

              <button
                className={`bg-gradient-to-r from-[#5b03b2] to-[#9d50bb] rounded-lg px-3 py-2 text-white text-[1rem] font-medium text-center font-inter justify-center ${
                  selectedDiv === 2 ? "visible" : "invisible"
                }`}
                type="button"
                onClick={()=>{navigateToState("oneMoreThing")}}
                // onClick={handlePathClick}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
      {oneMoreThing && (
        <div className="flex flex-col justify-center items-center gap-10 ">
          <div>
            <h1 className="text-2xl mt-10 md:mt-0">Okay! One more thing.</h1>
            <p className="text-lg">
              Tell us the type of survey you want to create
            </p>
          </div>

          <div className={`md:flex justify-center gap-5 items-center`}>
            <div
              className={`flex flex-col items-center pb-4 justify-center gap-5 border rounded-md px-10 pt-6 text-center ${
                selectedDiv === 3 ? "border-[#CC9BFD] border-2" : ""
              }`}
              onClick={() => {
                handleSurveyType(3, "Qualitative");
              }}
            >
              <Image
                src={qualitative_survey}
                alt="Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-lg">Qualitative Survey</h1>
              <p>
                Give us a prompt and our AI we will do the hard work{" "}
                <br className="hidden lg:block" /> for you. We will create a
                survey tailored for your <br className="hidden lg:block" />{" "}
                needs
              </p>
              <Tooltip
                content={`Lorem ipsum dolor sit amet consectetur. Tempus duis viverra etiam sagittis scelerisque. Et cursus cursus sodales convallis amet. Vitae mattis quis tellus tortor quis sit. Sem nibh leo lorem mi.`}
                animation="duration-1000"
                style="light"
                className={`w-[20rem]`}
              >
                <Image
                  src={tooltip_icon}
                  alt="Logo"
                  className={`h-8 w-auto ${
                    selectedDiv === 3 ? "visible" : "invisible"
                  }`}
                />
              </Tooltip>

              <button
                className={`bg-gradient-to-r from-[#5b03b2] to-[#9d50bb] rounded-lg px-3 py-2 text-white text-[16px] font-medium text-center font-inter justify-center ${
                  selectedDiv === 3 ? "visible" : "invisible"
                }`}
                type="button"
                onClick={() => {
                  setSurveyType("Qualitative");
                  // dispatch(updateSurveyType("qualitative"))
                  dispatch(updateSurveyType(surveyType));
                  setWhatDoYouWant(false);
                  setOneMoreThing(false);
                  if (generated_by === "ai") {
                    setPromptForm(true);
                  } else {
                    navigate.push("/surveys/create-manual");
                  }
                }}
              >
                Proceed
              </button>
            </div>
            <div
              className={`flex flex-col items-center pb-4 justify-center gap-5 border rounded-md px-10 pt-10 text-center mt-4 md:mt-0 relative ${
                selectedDiv === 5 ? "border-[#CC9BFD] border-2" : ""
              }`}
              onClick={() => handleSurveyType(5, "Both")}
            >
              <Image
                src={quantitative_qualitative_survey}
                alt="Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-lg">Both (Qualitative & Quantitative)</h1>
              <p>
                Create your own survey on a blank canvas and{" "}
                <br className="hidden lg:block" /> customize it according to
                your taste.
              </p>
              <Tooltip
                content={`Lorem ipsum dolor sit amet consectetur. Tempus duis viverra etiam sagittis scelerisque. Et cursus cursus sodales convallis amet. Vitae mattis quis tellus tortor quis sit. Sem nibh leo lorem mi.`}
                animation="duration-1000"
                style="light"
                className={`w-[20rem]`}
              >
                <Image
                  src={tooltip_icon}
                  alt="Logo"
                  className={`h-8 w-auto ${
                    selectedDiv === 5 ? "visible" : "invisible"
                  }`}
                />
              </Tooltip>

              <button
                className={`bg-gradient-to-r from-[#5b03b2] to-[#9d50bb] rounded-lg px-3 py-2 text-white text-[1rem] font-medium text-center font-inter justify-center ${
                  selectedDiv === 5 ? "visible" : "invisible"
                }`}
                type="button"
                onClick={() => {
                  setSurveyType("Both");
                  // dispatch(updateSurveyType("Qualitative & Quantitative"))
                  dispatch(updateSurveyType(surveyType));
                  setWhatDoYouWant(false);
                  setOneMoreThing(false);
                  navigateToState("promptForm")
                  if (generated_by === "ai") {
                    setPromptForm(true);
                  } else {
                    navigate.push("/surveys/create-manual");
                  }
                }}
              >
                Proceed
              </button>
              <div className="bg-[#F70A0A] text-white py-2 absolute top-0 right-0 rounded-tr px-4 ">
                Not sure
              </div>
            </div>
            <div
              className={`flex flex-col items-center pb-4 justify-center gap-5 border rounded-md px-10 pt-10 text-center mt-4 md:mt-0 ${
                selectedDiv === 4 ? "border-[#CC9BFD] border-2" : ""
              }`}
              onClick={() => handleSurveyType(4, "Quantitative")}
            >
              <Image
                src={Quantitative_survey}
                alt="Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-lg">Quantitative Survey</h1>
              <p>
                Create your own survey on a blank canvas and{" "}
                <br className="hidden lg:block" /> customize it according to
                your taste.
              </p>
              <Tooltip
                content={`Lorem ipsum dolor sit amet consectetur. Tempus duis viverra etiam sagittis scelerisque. Et cursus cursus sodales convallis amet. Vitae mattis quis tellus tortor quis sit. Sem nibh leo lorem mi.`}
                animation="duration-1000"
                style="light"
                className={`w-[20rem]`}
              >
                <Image
                  src={tooltip_icon}
                  alt="Logo"
                  className={`h-8 w-auto ${
                    selectedDiv === 4 ? "visible" : "invisible"
                  }`}
                />
              </Tooltip>
              <button
                className={`bg-gradient-to-r from-[#5b03b2] to-[#9d50bb] rounded-lg px-3 py-2 text-white text-[1rem] font-medium text-center font-inter justify-center ${
                  selectedDiv === 4 ? "visible" : "invisible"
                }`}
                type="button"
                onClick={() => {
                  setSurveyType("Quantitative");
                  // dispatch(updateSurveyType("quantitative"))
                  dispatch(updateSurveyType(surveyType));
                  setWhatDoYouWant(false);
                  setOneMoreThing(false);
                  navigateToState("promptForm")
                  if (generated_by === "ai") {
                    setPromptForm(true);
                  } else {
                    navigate.push("/surveys/create-manual");
                  }
                }}
              >
                Proceed
              </button>
            </div>
          </div>

       
        </div>
      )}
      {promptForm && (
        <div className="flex flex-col justify-center items-center gap-10 ">
          <div>
            <h1 className="text-2xl mt-10 md:mt-10 font-normal">
              Write a prompt. we’ll do the rest for you
            </h1>
            <p className="text-lg">
              Tell us the survey you want to make? We will create it for you
            </p>
          </div>

          <form
            className={`flex flex-col mx-auto w-full md:w-2/3 lg:w-1/2 text-start justify-start gap-2`}
            onSubmit={(e) => {
              e.preventDefault();
              if (manualTopic.trim()) {
                dispatch(updateTopic(manualTopic));
              }
              handleGenerateTopics();
            }}
          >
            <label htmlFor="Your Prompt">Your Prompt</label>
            <div className="flex flex-col gap-2 relative">
              <textarea
                value={surveyPrompt}
                name=""
                id=""
                placeholder="Write your prompt"
                className="rounded-md py-2 px-3 border w-full h-36 border-[#BDBDBD]"
                style={{ border: "2px  solid #BDBDBD" }}
                onChange={(e) => {
                  if (e.target.value.length === 3000) {
                    toast.warning("Prompt shouldn't exceed 3000 characters");
                  }
                  setSurveyPrompt(e.target.value);
                }}
                maxLength={3000}
              ></textarea>
              <div className="text-sm text-gray-500 mt-1 absolute bottom-2 right-4">
                {surveyPrompt.length}/{maxCharacters} characters
              </div>
            </div>
            <button
              className="gradient-border gradient-text px-6 py-3 w-2/3 rounded-lg flex items-center space-x-2"
              disabled={!surveyPrompt ? true : false}
            >
              <span className={!surveyPrompt ? "text-gray-300" : ""}>
                Generate
              </span>
              <Image src={stars} alt="stars" className={``} />
            </button>
          </form>

          <div className="flex flex-col justify-center items-center gap-10 ">
            <div>
              <h1 className="text-lg mt-10">Try any of our Sample prompts.</h1>
              <p className="text-sm">
                Select one of our Pre-generated AI surveys
              </p>
            </div>

            <div className={`md:flex justify-center gap-5 pb-4 items-center`}>
              <div
                className={`flex flex-col items-center pb-4 justify-center gap-5 border border-[#CC9BFD] bg-[#FAFAFA] rounded-md px-10 pt-10 text-start mt-4 md:mt-0`}
              >
                <h1 className="text-lg text-start">
                  Student Satisfaction Survey
                </h1>

                <p className="text-start">
                  Assess learning experiences, teaching quality,{" "}
                  <br className="hidden lg:block" /> and academic support,
                  helping educational <br className="hidden lg:block" />{" "}
                  institutions improve student outcomes.
                </p>
              </div>

              <div
                className={`flex flex-col items-center pb-4 justify-center gap-5 border border-[#CC9BFD] bg-[#FAFAFA] rounded-md px-10 pt-10 text-center mt-4 md:mt-0 `}
              >
                <h1 className="text-lg text-start">
                  Employee Engagement Survey
                </h1>
                <p className="text-start">
                  Measure staff satisfaction, motivation, and{" "}
                  <br className="hidden lg:block" /> workplace culture, helping
                  organizations <br className="hidden lg:block" /> improve
                  internal dynamics.
                </p>
              </div>
              <div
                className={`flex flex-col items-center pb-4 justify-center gap-5 border border-[#CC9BFD] bg-[#FAFAFA] rounded-md px-10 pt-10 text-center mt-4 md:mt-0`}
              >
                <h1 className="text-lg text-start">Event Feedback Survey</h1>
                <p className="text-start">
                  Evaluate the success of events, conferences, or{" "}
                  <br className="hidden lg:block" /> meetings, gathering input
                  on content, <br className="hidden lg:block" /> organization,
                  and overall experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {isTopicModal && (
        <IsLoadingModal openModal={isTopicModal} modalSize="lg">
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <h2 className="text-lg font-normal ">
                Set Survey Topic and Continue
              </h2>
              <p className="text-sm">
                We have recommended suitable topic for your survey based on your
                entered prompt
              </p>
            </div>

            {topics &&
              topics?.data.topics.map((topic: string[], index: number) => (
                <div
                  className={`border ${
                    isSelected === index ? "border-2 border-red-500" : ""
                  } py-4 text-[#7A8699] border-[#CC9BFD] px-2 bg-[#FAFAFA] rounded-md `}
                  key={index}
                  onClick={(e) => {
                    // @ts-ignore
                    dispatch(updateTopic(e.target.innerHTML));
                    setIsSelected(index);
                  }}
                >
                  {topic}
                </div>
              ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsTopicModal(false);
                handleGenerateQuestion();
              }}
              className="mt-5 flex flex-col gap-3"
            >
              <label htmlFor="manual-prompt">
                Manually Enter your preferred topic below:
              </label>
              <input
                value={manualTopic}
                onChange={(e) => setManualTopic(e.target.value)}
                type="text"
                placeholder="Input your survey topic"
                className="w-full px-3 py-3 border border-[#BDBDBD] rounded-md"
              />
              <button
                className="gradient-border gradient-text px-6 py-3 w-2/3 mx-auto rounded-md flex items-center space-x-2"
                disabled={!surveyPrompt && !surveyType ? true : false}
              >
                <span
                  className={
                    !surveyPrompt && !surveyType ? "text-gray-300" : ""
                  }
                >
                  {isLoading ? "Generating..." : "Generate Survey"}
                </span>
                <Image src={stars} alt="stars" className={``} />
              </button>
            </form>
          </div>
        </IsLoadingModal>
      )}
      {isLoadingTopics && (
        <IsGenerating isGeneratingSurveyLoading={isLoadingTopics} />
      )}
      {isLoading && <IsGenerating isGeneratingSurveyLoading={isLoading} />}
      {generated && (
        <>
          <GeneratedSurvey data={survey?.sections} onClick={UseAnotherPrompt} />
        </>
      )}
    </div>
  );
};

export default CreateSurveyPage;
