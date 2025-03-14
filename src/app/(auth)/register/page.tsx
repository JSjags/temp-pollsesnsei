"use client";

import { useIsLoggedIn } from "@/lib/helpers";
import { RootState } from "@/redux/store";
import RegisterPage from "@/subpages/auth/RegisterPage";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

type Props = {};

const Page = (props: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoggedIn } = useIsLoggedIn({ message: "", dispatch: dispatch });
  const state = useSelector((state: RootState) => state.user);
  const userToken = useSelector(
    (state: RootState) => state.user?.access_token || state.user.token
  );

  if (state.user) {
    router.push(`/dashboard`);
  }
  return <RegisterPage />;
};

export default Page;
