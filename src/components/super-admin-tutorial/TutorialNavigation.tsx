"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useState } from "react";
import { Field, Form } from "react-final-form";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import validate from "validate.js";

import { useCreateTutorialMutation } from "@/services/superadmin.service";
import FileInput from "../ui/FileInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/shadcn-textarea";
import { Input } from "../ui/shadcn-input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import TextArea from "../ui/TextArea";
import { handleApiErrors, isValidResponse } from "@/lib/utils";
import AppReactQuill from "../common/forms/AppReactQuill";
import {
  apiConstantOptions,
  apiConstants,
  queryKeys,
  TUTORIAL_ENUM,
} from "@/services/api/constants.api";
import { useQueryClient } from "@tanstack/react-query";
import AppCollapse from "../custom/AppCollapse";

interface Tab {
  label: string;
  value: string;
}

const slugify = (tab: string) => {
  return tab.toLowerCase().replace(/\s+/g, "-");
};

const constraints = {
  type: {
    presence: true,
  },
  title: {
    presence: true,
  },
  description: {
    presence: true,
  },
  file: {
    presence: false,
  },
  links: {
    presence: false,
  },
};

const TutorialNavigation: React.FC = () => {
  const [createTutorial, { isLoading, isSuccess, error }] =
    useCreateTutorialMutation();
  const [quilValue, setQuilValue] = useState("");
  const queryClient = useQueryClient();
  const [isSheetOpened, setIsSheetOpened] = useState(false);

  const tabs: Tab[] = [
    { label: "All Resources", value: "/tutorials" },
    { label: "Video Tutorials", value: "/tutorials/video-tutorial" },
    { label: "Web articles", value: "/tutorials/web-articles" },
    { label: "Text Tutorials", value: "/tutorials/text-tutorials" },
  ];

  const pathname = usePathname();

  const onSubmit = async (values: {
    type: string;
    title: string;
    description: string;
    links: string;
    file: any;
  }) => {
    if (!values?.type) {
      return toast.error("Tutorial type is required.");
    }

    if (!values?.title) {
      return toast.error("Title is required.");
    }

    if (values?.title?.length < 5) {
      return toast.error("Title must be at least 5 characters.");
    }

    if (!values?.description) {
      return toast.error("Description is required.");
    }
    if (values?.description?.length < 10) {
      return toast.error("Description must be at least 10 characters.");
    }
    if (!quilValue) {
      return toast.error("Tutorial content is required.");
    }

    const formData = new FormData();
    formData.append("type", values.type);
    formData.append("title", values.title);
    formData.append("description", values.description);
    if (values.links) {
      formData.append("links", values.links);
    }

    if (values?.type != TUTORIAL_ENUM.text) {
      if (values.file && values.file.length > 0) {
        formData.append("file", values.file[0]);
      } else {
        toast.error("Please upload a file to proceed.");
        return;
      }
    }

    if (quilValue) {
      formData.append("content", quilValue);
    }

    try {
      const response = await createTutorial(formData).unwrap();

      if (isValidResponse(response)) {
        setIsSheetOpened(false);
        toast.success(response?.message ?? "Tutorial created successfully");
        queryClient?.invalidateQueries({ queryKey: [queryKeys.TUTORIALS] });
      } else handleApiErrors(response?.message);
    } catch (err: any) {
      toast.error(
        "Failed to create tutorial " + (err?.data?.message || err.message)
      );
      console.error("Failed to create tutorial", err);
    }
  };

  // const validateForm = (values: any) => {
  //   return validate(values, constraints) || {};
  // };

  return (
    <div>
      <div></div>
      <div className="flex items-center justify-between w-full  p-4">
        {/* Tabs */}
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              href={tab.value}
              key={tab.value}
              className={`text-sm font-medium pb-2 ${
                pathname === tab.value
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <Sheet
          onOpenChange={(value) => setIsSheetOpened(value)}
          open={isSheetOpened}
        >
          <SheetTrigger>
            <button className="px-4 py-2 bg-gradient-to-r from-[#5B03B2] to-[#9D50BB] text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg focus:outline-none">
              Add New Tutorial
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="  sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] bg-white overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Create New Tutorial</SheetTitle>
            </SheetHeader>

            <Form
              onSubmit={onSubmit}
              // validate={validateForm}
              render={({ handleSubmit, form, values, submitting }) => (
                <form
                  onSubmit={handleSubmit}
                  className="w-full mt-6 flex flex-col gap-y-5"
                >
                  <Field name="type">
                    {({ input, meta }) => (
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          onValueChange={input.onChange}
                          defaultValue={input.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Tutorial type" />
                          </SelectTrigger>
                          <SelectContent>
                            {apiConstantOptions?.TUTORIAL_TYPES.map(
                              (option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </Field>

                  <Field name="title">
                    {({ input, meta }) => (
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter Title"
                          {...input}
                        />
                      </div>
                    )}
                  </Field>

                  <Field name="description">
                    {({ input, meta }) => (
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Type brief description"
                          {...input}
                        />
                      </div>
                    )}
                  </Field>

                  <AppCollapse isVisible={values.type != TUTORIAL_ENUM.text}>
                    <div className="pt-2 pb-4">
                      <Field name="file">
                        {({ input, meta }) => (
                          <FileInput form={form as any} {...input} />
                        )}
                      </Field>
                    </div>
                  </AppCollapse>

                  <Field name="links">
                    {({ input, meta }) => (
                      <div className="space-y-2">
                        <Label htmlFor="links">Add Links to resources</Label>
                        <Input id="links" placeholder="..." {...input} />
                      </div>
                    )}
                  </Field>

                  <div className="py-8">
                    <AppReactQuill
                      quilValue={quilValue}
                      setQuilValue={setQuilValue}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 w-full">
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={submitting || isLoading}
                        type="reset"
                      >
                        Cancel
                      </Button>
                    </SheetTrigger>
                    <Button
                      disabled={submitting || isLoading}
                      type="submit"
                      className="bg-gradient-to-r from-[#5B03B2] to-[#9D50BB]"
                    >
                      {submitting || isLoading ? (
                        <ClipLoader size={20} />
                      ) : (
                        "Save and Continue"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            />
          </SheetContent>
        </Sheet>
      </div>{" "}
    </div>
  );
};

export default TutorialNavigation;
