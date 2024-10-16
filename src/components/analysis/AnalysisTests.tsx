"use client";

import React, { Fragment, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";
import { Checkbox } from "../ui/shadcn-checkbox";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn, extractMongoId, getUniqueVariables } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createTests,
  getSurveyTestsLibrary,
  getSurveyVariableNames,
  runTest,
} from "@/services/analysis";
import { usePathname } from "next/navigation";
import AnalysisLoadingScreen, {
  LoadingOverlay,
} from "../loaders/page-loaders/AnalysisPageLoader";
import AnalysisErrorComponent from "../loaders/page-loaders/AnalysisError";
import Loading from "../primitives/Loader";
import { toast } from "react-toastify";
import AnalysisReport from "./AnalysisReport";

export interface Variable {
  id: string;
  name: string;
}

export interface Test {
  id: string;
  name: string;
  variables: Variable[];
  category: String;
}

export interface TVariableType {
  question: string;
  slug: string;
  display_name: string;
  type: string;
}

export interface TestLibraryFormatted {
  survey_id: string;
  data: {
    test_name: string;
    test_variables: string[];
  }[];
}

const VARIABLE_TYPE = "VARIABLE";
const initialVariables: Variable[] = [
  { id: "1", name: "Population" },
  { id: "2", name: "Land Mass" },
  { id: "3", name: "Age distribution" },
  { id: "4", name: "Work Experience" },
  { id: "5", name: "Accommodation type" },
  { id: "6", name: "Gender" },
  { id: "7", name: "Profession" },
  { id: "8", name: "Marital Status" },
  { id: "9", name: "Educational Status" },
  { id: "10", name: "Region" },
  { id: "11", name: "Ethnicity" },
  { id: "12", name: "Industry" },
  { id: "13", name: "Income" },
  { id: "14", name: "Health Status" },
  { id: "15", name: "Employment Status" },
];

const hasVariablesInTestsLibrary = (testsLibrary: Test[]) => {
  return (
    testsLibrary.length > 0 &&
    testsLibrary.some((test) => test.variables.length > 0)
  );
};

const formatTestsLibrary = (
  testsLibrary: Test[],
  surveyId: string
): TestLibraryFormatted => {
  return {
    survey_id: surveyId,
    data: testsLibrary.map((test) => ({
      test_name: test.name,
      test_variables: test.variables.map((variable) => variable.id), // Assuming each variable has a 'name' field
    })),
  };
};

// const testLibrary: Test[] = [
//   { id: "tTest", name: "T-Tests", variables: [], category: "Parametric Test" },
//   {
//     id: "oneSampleTTest",
//     name: "One-sample t-test",
//     variables: [],
//     category: "Parametric Test",
//   },
//   {
//     id: "independentTTest",
//     name: "Independent t-test (two-sample t-test)",
//     variables: [],
//     category: "Parametric Test",
//   },
//   {
//     id: "pairedTTest",
//     name: "Paired T-Test",
//     variables: [],
//     category: "Parametric Test",
//   },
//   {
//     id: "oneWayANOVA",
//     name: "One-way ANOVA",
//     variables: [],
//     category: "ANOVA (Analysis of Variance)",
//   },
//   {
//     id: "twoWayANOVA",
//     name: "Two-way ANOVA",
//     variables: [],
//     category: "ANOVA (Analysis of Variance)",
//   },
//   {
//     id: "manova",
//     name: "MANOVA (Multivariate Analysis of Variance)",
//     variables: [],
//     category: "ANOVA (Analysis of Variance)",
//   },
//   {
//     id: "ancova",
//     name: "ANCOVA (Analysis of Covariance)",
//     variables: [],
//     category: "ANOVA (Analysis of Variance)",
//   },
//   {
//     id: "simpleLinearRegression",
//     name: "Simple Linear Regression",
//     variables: [],
//     category: "Regression Analysis",
//   },
//   {
//     id: "multipleLinearRegression",
//     name: "Multiple Linear Regression",
//     variables: [],
//     category: "Regression Analysis",
//   },
//   {
//     id: "polynomialRegression",
//     name: "Polynomial Regression",
//     variables: [],
//     category: "Regression Analysis",
//   },
//   {
//     id: "chiSquareTest",
//     name: "Chi-Square Tests*",
//     variables: [],
//     category: "Non-Parametric Tests",
//   },
//   {
//     id: "testForIndependence",
//     name: "Test for Independence",
//     variables: [],
//     category: "Non-Parametric Tests",
//   },
//   {
//     id: "goodnessOfFitTest",
//     name: "Goodness of Fit Test",
//     variables: [],
//     category: "Non-Parametric Tests",
//   },
// ];

// Utility function to convert a test name to camelCase (for the 'id' field)
const toCamelCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^./, (chr) => chr.toLowerCase());
};

export default function DragAndDropPage() {
  const path = usePathname();
  const [variables, setVariables] = useState(initialVariables);
  const [testsLibrary, setTestsLibrary] = useState<Test[]>([]);
  const [testLibrary, setTestLibrary] = useState<Test[]>([]);
  const [showReport, setShowReport] = useState<boolean>(false);

  // AnalysisLoadingScreen

  // Extract surveyId regardless of path
  const surveyId = extractMongoId(path);

  const variablesQuery = useQuery({
    queryKey: ["survey-variables"],
    queryFn: () => getSurveyVariableNames({ surveyId: surveyId! }),
    enabled: surveyId !== undefined,
  });

  const testsLibraryQuery = useQuery({
    queryKey: ["tests-library"],
    queryFn: () => getSurveyTestsLibrary(),
    enabled: variablesQuery.isSuccess,
  });

  const createTestsQuery = useQuery({
    queryKey: ["create-test"],
    queryFn: () => createTests({ surveyId: surveyId! }),
    enabled: testsLibraryQuery.isSuccess,
  });

  const runTestMutation = useMutation({
    mutationKey: ["create-test"],
    mutationFn: () =>
      runTest({ testData: formatTestsLibrary(testsLibrary, surveyId!) }),
    onSuccess: (data) => {
      console.log(data);
      toast.success("Analysis conducted successfully");
      setShowReport(true);
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error conducting analysis");
      setShowReport(true);
    },
  });

  // Drag and Drop Handlers
  const handleDrop = (variable: Variable, testId: string) => {
    const test = testsLibrary.find((t) => t.id === testId);
    if (test && !test.variables.some((v) => v.id === variable.id)) {
      setTestsLibrary(
        update(testsLibrary, {
          [testsLibrary.findIndex((t) => t.id === testId)]: {
            variables: { $push: [variable] },
          },
        })
      );
    }
  };

  const handleRemoveVariable = (testId: string, variableId: string) => {
    const testIndex = testsLibrary.findIndex((test) => test.id === testId);
    const updatedVariables = testsLibrary[testIndex].variables.filter(
      (v) => v.id !== variableId
    );
    setTestsLibrary(
      update(testsLibrary, {
        [testIndex]: {
          variables: { $set: updatedVariables },
        },
      })
    );
  };

  const toggleTest = (testId: string) => {
    // console.log(testId);
    const test = testLibrary.find((t) => t.id === testId);
    if (!test) return;

    setTestsLibrary((prev) => {
      const isSelected = prev.some((t) => t.id === testId);
      if (isSelected) {
        const removedTest = prev.find((t) => t.id === testId);
        if (removedTest) {
          setVariables((prevVariables) => {
            const newVariables = removedTest.variables.filter(
              (newVar) =>
                !prevVariables.some((prevVar) => prevVar.id === newVar.id)
            );
            return [...prevVariables, ...newVariables];
          });
        }
        return prev.filter((t) => t.id !== testId);
      } else {
        return [...prev, { ...test, variables: [] }];
      }
    });
  };

  useEffect(() => {
    if (variablesQuery.isSuccess) {
      setVariables(
        variablesQuery.data?.data.map((v: TVariableType) => ({
          id: v.slug,
          name: v.display_name,
        }))
      );
    }
  }, [variablesQuery.isSuccess]);

  useEffect(() => {
    if (testsLibraryQuery.isSuccess) {
      // Function to format the data
      const formatTests = () => {
        const formattedData: Test[] = [];

        for (const category in testsLibraryQuery.data) {
          const tests = testsLibraryQuery.data[category];
          tests.forEach((testName: string) => {
            const formattedTest = {
              id: toCamelCase(testName),
              name: testName,
              variables: [],
              category,
            };
            formattedData.push(formattedTest);
          });
        }

        // Set the formatted data into the state
        setTestLibrary(formattedData);
      };

      // Call the function on component mount
      formatTests();
    }
  }, [testsLibraryQuery.isSuccess]);

  // useEffect(() => {
  //   if (createTestsQuery.isSuccess) {
  //     console.log(createTestsQuery.data);
  //     const value = createTestsQuery.data.data.map((tC: any) => ({
  //       id: toCamelCase(Object.keys(tC)[0]),
  //       name: toCamelCase(Object.keys(tC)[0]),
  //       variables: Object.values(tC).map((c) => ({
  //         id: c,
  //         name: c,
  //       })),
  //       category: testLibrary.find((item) => item.id === Object.keys(tC)[0])
  //         ?.category,
  //     }));

  //     setTestLibrary(value);
  //   }
  // }, [createTestsQuery.isSuccess]);

  return !showReport ? (
    <Fragment>
      {variablesQuery.isLoading && <AnalysisLoadingScreen />}
      {variablesQuery.isError && <AnalysisErrorComponent />}
      {variablesQuery.isSuccess && (
        <>
          {runTestMutation.isPending && (
            <>
              <LoadingOverlay
                title="Analyzing Survey"
                subtitle="Hold on! Let PollSensei cook."
              />
            </>
          )}
          <DndProvider backend={HTML5Backend}>
            <div className="p-4">
              <div className="px-6">
                <div className="flex border border-border rounded-lg p-4 gap-10">
                  <div className="bg-[#F5EDF8] rounded-md p-4">
                    <p className="text-4xl text-center font-bold">
                      {variables.length}
                    </p>
                    <p className="text-center mt-2 text-sm">
                      Total variables found
                    </p>
                  </div>
                  <div className="block">
                    <h2 className="text-xl font-semibold">Variables Found</h2>
                    <div className="flex flex-wrap mb-4 gap-2 gap-x-2 mt-2">
                      {variables.map((variable) => (
                        <VariableItem
                          key={variable.id}
                          variable={variable}
                          testsLibrary={testsLibrary}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 flex gap-4 items-center mt-8">
                <h2 className="text-xl font-semibold">Possible Tests</h2>
                <Button
                  disabled={!hasVariablesInTestsLibrary(testsLibrary)}
                  className="auth-btn !rounded-md"
                  onClick={() => runTestMutation.mutate()}
                >
                  {" "}
                  Start Analysis
                </Button>
              </div>
              <div className="flex gap-4 justify-between p-6 flex-1">
                <div className="grid grid-cols-2 gap-6 space-x-4 mb-4 p-8 bg-[#F6F3F7] flex-[0.9] min-h-screen border rounded-lg border-dashed border-[#5B03B2]">
                  {testsLibrary.map((test) => (
                    <TestZone
                      key={test.id}
                      test={test}
                      onDrop={(variable: Variable) =>
                        handleDrop(variable, test.id)
                      }
                      onRemoveVariable={handleRemoveVariable}
                      toggleTest={toggleTest}
                      // onRemoveTest={removeTest}
                    />
                  ))}
                </div>
                <div className="bg-white border border-border rounded-lg max-w-[280px] min-w-[280px] max-h-fit">
                  <h2 className="text-xl font-bold p-4 border-b border-border">
                    Tests Library
                  </h2>
                  {testsLibraryQuery.isLoading && (
                    <div className="flex items-center py-10 flex-col gap-2">
                      <Loading size={20} />
                      <p className="px-4">Fetching tests library</p>
                    </div>
                  )}
                  {Object.entries(
                    testLibrary.reduce((acc, test) => {
                      if (!acc[test.category as any])
                        acc[test.category as any] = [];
                      acc[test.category as any].push(test);
                      return acc;
                    }, {} as Record<string, typeof testLibrary>)
                  ).map(([category, tests], i, arr) => (
                    <div
                      key={category}
                      className={cn(
                        "pt-4 pb-2 px-4",
                        i !== arr.length - 1 && "border-b border-border"
                      )}
                    >
                      <h3 className="font-bold mb-2">{category}</h3>
                      {tests.map((test) => (
                        <div key={test.id} className="flex items-start mb-2">
                          <Checkbox
                            id={test.id}
                            checked={testsLibrary.some((t) => t.id === test.id)}
                            onCheckedChange={() => {
                              toggleTest(test.id);
                            }}
                            className="mr-2 mt-1 data-[state='checked']:bg-purple-800 data-[state='checked']:border-purple-800 border-gray-400"
                          />
                          <label htmlFor={test.id} className="text-[0.925rem]">
                            {test.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DndProvider>
        </>
      )}
    </Fragment>
  ) : (
    <AnalysisReport testData={runTestMutation?.data?.data ?? []} />
  );
}

// Variable Item Component (Draggable)
function VariableItem({
  variable,
  testsLibrary,
}: {
  variable: Variable;
  testsLibrary: Test[];
}) {
  const [, drag] = useDrag({
    type: VARIABLE_TYPE,
    item: variable,
  });

  return (
    <div
      ref={drag as any}
      className={cn(
        "px-4 py-1 bg-purple-500 text-[#5B03B2] text-sm cursor-pointer rounded-full bg-[#7D83981F] hover:bg-[#7D83982F]",
        getUniqueVariables(testsLibrary).includes(variable)
          ? "bg-[#5B03B2] hover:bg-[#490390] text-white"
          : "bg-[#7D83981F] hover:bg-[#7D83982F]"
      )}
    >
      {variable.name}
    </div>
  );
}

// Test Zone Component (Droppable)
function TestZone({
  test,
  onDrop,
  onRemoveVariable,
  toggleTest,
}: {
  test: Test;
  onDrop: (variable: Variable) => void;
  onRemoveVariable: (testId: string, variableId: string) => void;
  toggleTest: (testId: string) => void;
}) {
  const [, drop] = useDrop({
    accept: VARIABLE_TYPE,
    drop: (item: Variable) => onDrop(item),
  });

  return (
    <div
      ref={drop as any}
      className="p-4 rounded-lg border border-[#BDBDBD] bg-white max-h-[370px] min-h-[240px] sm:min-h-[370px]"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{test.name}</h3>
        <button onClick={() => toggleTest(test.id)}>
          <X strokeWidth={3} className="size-4" />
        </button>
      </div>
      <div className="mt-8 flex gap-2 flex-wrap">
        {test.variables.map((variable) => (
          <div
            key={variable.id}
            className="flex justify-between items-center py-0.5 h-7 bg-[#5B03B2] rounded-full text-white px-4 w-fit gap-2"
          >
            <span className="text-sm">{variable.name}</span>
            <button
              onClick={() => onRemoveVariable(test.id, variable.id)}
              className="text-white"
            >
              <X strokeWidth={3} className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
