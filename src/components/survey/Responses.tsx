import React, { useEffect, useState, Suspense } from "react";
import ResponseHeader from "./ResponseHeader";
import RespondentDetails from "./RespondentDetails";
import UserResponses from "./UserResponses";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  useGetRespondentNameQuery,
  useGetSurveySummaryQuery,
  useGetUserSurveyResponseQuery,
  useValidateIndividualResponseQuery,
  useValidateSurveyResponseQuery,
} from "@/services/survey.service";
import Summary from "./Summary";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { resetAnswers } from "@/redux/slices/answer.slice";
import { useDispatch } from "react-redux";
import { resetName } from "@/redux/slices/name.slice";
import FeatureComing from "../common/FeatureComing";
import { resetFilters } from "@/redux/slices/filter.slice";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/shadcn-input";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";

interface PathParamsProps {
  name?: string;
  question?: string;
  question_type?: string;
  answer?: string;
}

const calculateValidationCounts = (data: any) => {
  let validCount = 0;
  let invalidCount = 0;

  data?.forEach((response: any) => {
    response.answers.forEach((answer: any) => {
      if (answer.validation_result?.status === "passed") {
        validCount += 1;
      } else if (answer.validation_result?.status === "failed") {
        invalidCount += 1;
      }
    });
  });

  return { validCount, invalidCount };
};

const calculateValidationCounts2 = (survey: any) => {
  let validCount = 0;
  let invalidCount = 0;

  survey?.answers?.forEach((answer: any) => {
    if (answer.validation_result?.status === "passed") {
      validCount += 1;
    } else if (answer.validation_result?.status === "failed") {
      invalidCount += 1;
    }
  });

  return { validCount, invalidCount };
};

const Responses: React.FC<{ data: any }> = ({ data }) => {
  const name = useSelector((state: RootState) => state?.name?.name);
  const question = useSelector((state: RootState) => state?.filter.question);
  const questionType = useSelector(
    (state: RootState) => state?.filter.questionType
  );
  const answer = useSelector((state: RootState) => state?.filter.answer);
  const params = useParams();
  const userRoles = useSelector(
    (state: RootState) => state.user.user?.roles[0].role || []
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const tabs = ["Summary", "Individual Responses", "Deleted"];
  const [activeTab, setActiveTab] = useState(() => {
    const urlTab = searchParams.get("tab");
    return urlTab ? urlTab : "Individual Responses";
  });
  const [currentUserResponse, setCurrentUserResponse] = useState(0);
  const [pagesNumber, setPagesNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [tempPageSize, setTempPageSize] = useState(20);
  const debouncedPageSize = useDebounce(tempPageSize, 500);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: response_ } = useGetUserSurveyResponseQuery(params.id);
  const { data: summary_ } = useGetSurveySummaryQuery(params.id, {
    skip: activeTab !== "Summary",
  });

  const path_params: PathParamsProps = {};
  if (name) path_params.name = name;
  if (answer) path_params.answer = answer;
  if (question) path_params.question = question;
  if (questionType) path_params.question_type = questionType;

  const { data: respondent_name } = useGetRespondentNameQuery(params.id);
  const { data: validate_ } = useValidateSurveyResponseQuery(params.id);

  const queryArgs = {
    id: params.id,
    pagesNumber: currentPage,
    pageSize: pageSize,
    ...(Object.keys(path_params).length >= 3 ? path_params : {}),
  };

  const respondentName = useSelector((state: RootState) => state.name.name);

  const {
    data: validate_individual_response,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["validateIndividualResponse", queryArgs, name],
    queryFn: () =>
      axiosInstance.get(
        `/response/validate/individual/${
          params.id
        }?page=${currentPage}&page_size=${pageSize}${
          Object.keys(path_params).length
            ? `&${new URLSearchParams(path_params as Record<string, string>)}`
            : ""
        }`
      ),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const validateSource =
    validate_individual_response?.data?.data &&
    validate_individual_response?.data?.data?.length > 0
      ? validate_individual_response?.data?.data[currentUserResponse]
      : validate_individual_response?.data;

  const { validCount, invalidCount } =
    calculateValidationCounts2(validateSource);
  const totalResponses = validate_individual_response?.data?.total || 0;

  const deleteResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const response = await axiosInstance.delete(
        `/response/delete/${responseId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Response deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["validateIndividualResponse"],
      });
      if (currentUserResponse > 0) {
        setCurrentUserResponse((prev) => prev - 1);
      }
    },
    onError: (error) => {
      toast.error("Failed to delete response");
      console.error("Delete error:", error);
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("tab", activeTab);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    router.replace(newUrl);
  }, [activeTab, router]);

  useEffect(() => {
    if (name) {
      refetch();
    }
  }, [name, refetch]);

  useEffect(() => {
    if (answer && question && questionType) {
      refetch();
    }
  }, [answer, question, questionType, refetch]);

  useEffect(() => {
    if (debouncedPageSize !== pageSize) {
      setPageSize(debouncedPageSize);
      setCurrentPage(1);
      setCurrentUserResponse(0);
    }
  }, [debouncedPageSize]);

  const handleNext = () => {
    if (currentUserResponse < totalResponses - 1) {
      setCurrentUserResponse((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentUserResponse > 0) {
      setCurrentUserResponse((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(
      (validate_individual_response?.data?.total || 0) / pageSize
    );
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      setCurrentUserResponse(0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setCurrentUserResponse(0);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value) || 20;
    setTempPageSize(newSize);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(resetName());
      dispatch(resetFilters());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleDeleteAResponse = async () => {
    if (validateSource?._id) {
      deleteResponseMutation.mutate(validateSource._id);
    }
  };

  const renderPagination = () => {
    const totalResponses = validate_individual_response?.data?.total || 0;
    const totalPages = Math.ceil(totalResponses / pageSize);

    return (
      <Card className="p-2 sm:p-4 mt-6 w-full">
        <div className="flex flex-col gap-4 max-w-full">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col xs:flex-row items-center gap-2 w-full">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center gap-2 w-full xs:w-auto text-xs sm:text-sm min-w-0"
              >
                {isLoading && (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                )}
                <span className="whitespace-nowrap">Previous Page</span>
              </Button>
              <span className="hidden xs:inline text-xs sm:text-sm truncate">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="flex items-center gap-2 w-full xs:w-auto text-xs sm:text-sm min-w-0"
              >
                {isLoading && (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                )}
                <span className="whitespace-nowrap">Next Page</span>
              </Button>
            </div>
            <span className="xs:hidden text-center text-xs truncate">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full justify-center text-xs sm:text-sm">
            <span className="whitespace-nowrap">Responses per page:</span>
            <Input
              type="number"
              min="1"
              value={tempPageSize}
              onChange={handlePageSizeChange}
              className="w-16 sm:w-20 text-xs sm:text-sm"
              disabled={isLoading}
            />
            {isLoading && (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="lg:px-10 space-y-6 max-w-full overflow-x-hidden"
    >
      <Card>
        <ResponseHeader
          data={validate_individual_response?.data?.data?.length}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          curerentSurvey={currentUserResponse + 1}
          handleNext={handleNext}
          handlePrev={handlePrev}
          respondent_data={respondent_name?.data}
          valid_response={validCount}
          invalid_response={invalidCount}
          deleteAResponse={handleDeleteAResponse}
          response_id={validateSource?._id}
          surveyData={validateSource}
          isLoading={isLoading}
          isDeletingResponse={deleteResponseMutation.isPending}
        />
      </Card>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <Skeleton className="w-full h-[140px] rounded-lg" />
            </Card>

            <Card className="bg-white p-6">
              <div className="space-y-6">
                <Skeleton className="w-full h-[100px] rounded-lg" />
                <Skeleton className="w-full h-[100px] rounded-lg" />
                <Skeleton className="w-full h-[100px] rounded-lg" />
                <Skeleton className="w-full h-[100px] rounded-lg" />
              </div>
            </Card>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading response details. Please try again.
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6">
              <RespondentDetails
                data={validateSource}
                validCount={validCount}
                isLoading={isLoading}
              />
            </Card>

            {activeTab === "Individual Responses" && !isLoading && (
              <Card className="p-2 sm:p-6 mt-6">
                <UserResponses
                  data={validateSource}
                  index={currentUserResponse}
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                  error={isError}
                />
              </Card>
            )}

            {userRoles.includes("Admin") && activeTab === "Summary" && (
              <Card className="p-6 mt-6 min-h-[50vh]">
                <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
                  <Summary result={summary_?.data} />
                </Suspense>
              </Card>
            )}

            {activeTab === "Deleted" && (
              <Card className="p-6 mt-6 min-h-[50vh]">
                <FeatureComing height="min-h-[20vh]" />
              </Card>
            )}

            {!isLoading &&
              !isError &&
              activeTab === "Individual Responses" &&
              renderPagination()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Responses;
