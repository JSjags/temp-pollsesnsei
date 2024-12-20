"use client";

import { Form, Field } from "react-final-form";
import validate from "validate.js";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import steps from "../../assets/auth/steps2.svg";
import logo from "../../assets/auth/logo.svg";
import google from "../../assets/auth/goggle.svg";
import facebook from "../../assets/auth/facebook.svg";
import chat from "../../assets/auth/chat.svg";
import { toast } from "react-toastify";
import { useState } from "react";
import {
  useCompleteInvitedMemberSetupMutation,
  useRegisterUserMutation,
} from "../../services/user.service";
import PasswordField from "../../components/ui/PasswordField";
import Input from "@/components/ui/Input";
import { FaTimesCircle } from "react-icons/fa";
import { IoCheckmarkCircle } from "react-icons/io5";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/user.slice";
import StateLoader from "@/components/common/StateLoader";
import StateLoader2 from "@/components/common/StateLoader2";

const constraints = {
  password: {
    presence: true,
    length: {
      minimum: 8,
    },
    format: {
      pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      message:
        "^Password must be between 8 and 20 characters long, contain at least one uppercase letter, one number, and one special character",
    },
  },
  confirmPassword: {
    presence: true,
    equality: {
      attribute: "password",
      message: "^Passwords do not match",
    },
  },
  terms: {
    presence: {
      message: "Must be accepted",
    },
    inclusion: {
      within: [true],
      message: "^Must be accepted",
    },
  },
};

const CompleteInvitedMemberSetupPage = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [completeInvitation, { isSuccess, isError, error, isLoading }] =
    useCompleteInvitedMemberSetupMutation();

  const [completeSetupState, setCompleteSetupState] = useState(true);
  const [state, setState] = useState(false);

  const token = searchParams.get("token");

  const [eyeState, setEyeState] = useState({
    password: false,
    confirmPassword: false,
  });
  const [pwdFocus, setPwdFocus] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

  const toggleEye = (field: "password" | "confirmPassword") => {
    setEyeState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const onSubmit = async (values: any) => {
    try {
      const userData = await completeInvitation({ ...values, token }).unwrap();
      console.log(userData);

      dispatch(updateUser(userData.data));
      toast.success("Invitation accepted, login successful.");
      setState(true);
      setCompleteSetupState(false);
      // Navigate to login page
      console.log("Invitation completed successfully");
    } catch (err: any) {
      //   toast.error(
      //     "Failed to complete invitation " + (err?.data?.message || err.message)
      //   );
      console.error("Failed to complete invitation", err);
    }
  };

  const validateForm = (values: any) => {
    return validate(values, constraints) || {};
  };

  return (
    <section className="min-h-screen flex flex-col md:flex-row max-h-screen">
      <div className="auth-bg md:hidden flex items-center justify-center p-4">
        <div className="flex items-center justify-center gap-3">
          <Image src={logo} alt="Logo" width={32} height={32} />
          <h1 className="auth-head">PollSensei</h1>
        </div>
      </div>
      <div className="auth-bg hidden md:flex md:w-1/2 flex-col justify-center items-center p-8">
        <div className="flex flex-col items-center max-w-md w-full">
          <div className="flex items-center justify-center gap-3 pb-10">
            <Image src={logo} alt="Logo" width={32} height={32} />
            <h1 className="auth-head">PollSensei</h1>
          </div>

          <Image
            src={steps}
            alt="Steps"
            className="pb-4 w-full max-w-[400px] h-auto"
            width={300}
            height={200}
          />

          <h3 className="auth-heading pb-5 text-center">
            Create End-to-End <br /> Surveys with our AI tool
          </h3>
          <h5 className="auth-subtitle text-center">
            PollSensei helps you to Create suggest questions, <br /> formats,
            methodologies
          </h5>
        </div>
      </div>
      {completeSetupState && (
        <div className="w-full md:w-1/2 flex flex-col items-center px-4 md:px-8 py-6 md:py-0 max-h-screen overflow-scroll">
          <div className="flex justify-center flex-col max-w-[516px] w-full">
            <div className="flex-col flex pb-6 md:pb-8 pt-6 md:pt-10">
              <h2 className="auth-header font-sans text-center md:text-left">
                Welcome to PollSensei
              </h2>
              <p className="auth-title font-sans pt-3 text-center md:text-left">
                Finish setting up your account by creating your password.
              </p>
            </div>

            <Form
              onSubmit={onSubmit}
              validate={validateForm}
              render={({ handleSubmit, form, submitting, values }) => (
                <form onSubmit={handleSubmit} className="w-full">
                  <Field name="password">
                    {({ input, meta }) => (
                      <PasswordField
                        id="password"
                        eyeState={eyeState.password}
                        toggleEye={() => toggleEye("password")}
                        placeholder="*******"
                        label="Password"
                        form={form}
                        {...input}
                        //   error={meta.touched && meta.error}
                        onFocus={() => setPwdFocus(true)}
                        onBlur={() => setPwdFocus(false)}
                        eye={
                          (
                            <small className="icon-container">
                              {!meta.active && !pattern.test(input.value) ? (
                                ""
                              ) : pattern.test(input.value) ? (
                                <IoCheckmarkCircle
                                  className="text-green-600"
                                  size={20}
                                />
                              ) : (
                                <FaTimesCircle
                                  className="text-red-600"
                                  size={20}
                                />
                              )}
                            </small>
                          ) as any
                        }
                      />
                    )}
                  </Field>

                  <Field name="confirmPassword">
                    {({ input, meta }) => (
                      <PasswordField
                        id="confirmPassword"
                        eyeState={eyeState.confirmPassword}
                        toggleEye={() => toggleEye("confirmPassword")}
                        placeholder="*******"
                        label="Confirm Password"
                        form={form}
                        {...input}
                        //   error={meta.touched && meta.error}
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                        eye={
                          (
                            <small className="icon-container">
                              {!meta.active ? (
                                ""
                              ) : input.value === values.password ? (
                                <IoCheckmarkCircle
                                  className="text-green-600"
                                  size={20}
                                />
                              ) : (
                                <FaTimesCircle
                                  className="text-red-600"
                                  size={20}
                                />
                              )}
                            </small>
                          ) as any
                        }
                      />
                    )}
                  </Field>

                  <div className="flex justify-start items-center pt-3 gap-2">
                    <Field name="terms" type="checkbox">
                      {({ input, meta }) => (
                        <div>
                          <input {...input} type="checkbox" id="terms" />
                          <label htmlFor="terms" className="ml-2">
                            I agree to the terms and conditions
                          </label>
                          {meta.error && meta.touched && (
                            <span className="text-red-600 block text-[0.8rem]">
                              {meta.error}
                            </span>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  <button
                    className="auth-btn w-full justify-center mt-4"
                    type="submit"
                    disabled={submitting || isLoading}
                  >
                    {submitting || isLoading ? (
                      <ClipLoader size={20} />
                    ) : (
                      "Sign Up"
                    )}
                  </button>

                  {isSuccess && (
                    <p className="text-green-600 mt-2">
                      Password created successfully!
                    </p>
                  )}
                  {isError && (
                    <p className="text-red-600 mt-2">
                      Failed to register user:{" "}
                      {error && typeof error === "object" && "data" in error
                        ? (error.data as { message?: string })?.message
                        : error instanceof Error
                        ? error.message
                        : "An unknown error occurred"}
                    </p>
                  )}
                </form>
              )}
            />

            <div className="flex justify-end items-center mt-4">
              <p className="mr-2">Need Help?</p>
              <Image
                src={chat}
                alt="Chat"
                className="object-cover size-20"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>
      )}
      {state && <StateLoader2 defaultGoto="/login" />}
    </section>
  );
};

export default CompleteInvitedMemberSetupPage;
