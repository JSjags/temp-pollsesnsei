"use client";

import { useGetTutorials } from "@/hooks/useGetRequests";
import { TUTORIAL_ENUM } from "@/services/api/constants.api";
import Image from "next/image";
import { useState } from "react";
import { formatDate } from "@/lib/helpers";
import { FadeLoader } from "react-spinners";
import PageControl from "../common/PageControl";
import { DEFAULT_API_PAGE_SIZE } from "@/services/api/tutorial";
import { ChatBotIcon } from "../icons";
import Link from "next/link";
import routes from "@/config/routes";

const TextTutorial = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useGetTutorials({
    page: currentPage,
    filter: TUTORIAL_ENUM.text,
  });

  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / DEFAULT_API_PAGE_SIZE);

  const navigatePage = (direction: "next" | "prev") => {
    setCurrentPage((prevIndex) => {
      if (direction === "next") {
        return prevIndex < totalPages ? prevIndex + 1 : prevIndex;
      } else {
        return prevIndex > 1 ? prevIndex - 1 : prevIndex;
      }
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <tr>
            <td className="text-center ">
              <span className="flex justify-center items-center">
                <FadeLoader height={10} radius={1} className="mt-3" />
              </span>
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td className="text-center ">
              <span className="flex justify-center items-center text-xs text-red-500">
                Something went wrong
              </span>
            </td>
          </tr>
        ) : (
          data?.data?.map((article: any, index: any) => (
            <Link
              href={routes.SINGLE_ARTICLE_PAGE(article?.slug)}
              key={index}
              className="bg-white flex flex-col rounded-lg shadow-lg overflow-hidden border border-gray-200"
            >
              <div
                className={`w-full aspect-video flex justify-center items-center`}
              >
                {article?.media?.[0]?.type === "image/jpeg" ||
                article?.media?.[0]?.type === "png" ||
                article?.media?.[0]?.type === "image/png" ? (
                  <Image
                    className="dark:invert w-full h-40 object-cover aspect-auto"
                    src={article?.media[0]?.url}
                    alt="Next.js logo"
                    width={180}
                    height={38}
                    priority
                  />
                ) : article?.media?.[0]?.type.includes("video") ? (
                  <video loop muted autoPlay className="w-full">
                    <source src={article?.media[0]?.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full text-3xl md:text-4xl lg:text-5xl aspect-video flex items-center justify-center">
                    <ChatBotIcon />
                  </div>
                )}
              </div>
              {/* <Image src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" /> */}
              <div className="p-4 flex flex-col ">
                <h2 className=" text-base sm:text-lg line-clamp-1 custom-break-characters text-center font-semibold text-gray-900">
                  {article?.title}
                </h2>
                <h3 className="text-sm line-clamp-3 custom-break-characters text-center">
                  {article?.description}
                </h3>
                {/* <p className="text-gray-600 text-sm mt-2">{article.description}</p> */}
                {/* <p className="text-purple-600 font-semibold text-sm mt-4">
                  {formatDate(article.createdAt)}
                </p> */}
              </div>
            </Link>
          ))
        )}
      </div>
      <div className="mt-6 sm:mt-8 flex justify-between items-center">
        <p className="text-xs font-medium">
          {totalItems > 0
            ? `Showing ${(currentPage - 1) * 20 + 1}-${Math.min(
                currentPage * 20,
                totalItems
              )} of ${totalItems}`
            : "No items to display"}
        </p>
        <PageControl
          currentPage={currentPage}
          totalPages={totalPages}
          onNavigate={navigatePage}
        />
      </div>
    </div>
  );
};

export default TextTutorial;
