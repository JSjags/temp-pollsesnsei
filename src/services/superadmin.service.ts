// /superadmin/users?page=1&page_size=20
import apiSlice from "./config/apiSlice";

export const surveyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    userRegistry: builder.query({
      query: ({ pagesNumber, subscription_type, account_type, location, email }) => {
        const params = new URLSearchParams();
        if (subscription_type)
          params.append("subscription_type", subscription_type);
        if (account_type)
          params.append("account_type", account_type);
        if (location)
          params.append("location", location);
        if (email)
          params.append("email", email);

        return {
          url: `superadmin/users?page=${pagesNumber}&page_size=20${params.toString()}`,
          method: "GET",
        };
      },
    }),
    superadminOverview: builder.query({
      query: () => ({
        url: `/superadmin/overview`, //
        method: "GET",
      }),
    }),
    surveyCreationDistribution: builder.query({
      query: ({ month, year }) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        if (year) params.append("&year", year);
        return {
          url: `superadmin/survey-creation-distribution?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    surveyTypeDistribution: builder.query({
      query: ({ month, year }) => {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        if (year) params.append("&year", year);
        return {
          url: `superadmin/survey-type-distribution?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    allFAQs: builder.query({
      query: ({ pagesNumber, filter_by }) => {
        const params = new URLSearchParams();
        if (filter_by) params.append("filter_by", filter_by);
        return {
          url: `superadmin/faq?page=${pagesNumber}&page_size=20&${params.toString()}`,
          method: "GET",
        };
      }, //
    }),
    createFAQs: builder.mutation({
      query: (body) => ({
        url: "superadmin/faq",
        method: "POST",
        body: body,
      }),
    }), // /?page=1&page_size=20

    createReview: builder.mutation({
      query: (body) => ({
        url: "survey/review",
        method: "POST",
        body: body,
      }),
    }),
    unpublishFAQs: builder.mutation({
      query: ({ id, body }) => ({
        url: `superadmin/faq-status/${id}?status=unpublish`,
        method: "PATCH",
        body: body,
      }),
    }),
    publishFAQs: builder.mutation({
      query: ({ id, body }) => ({
        url: `superadmin/faq-status/${id}?status=publish`,
        method: "PATCH",
        body: body,
      }),
    }),
    singleFAQs: builder.query({
      query: (id) => ({
        url: `superadmin/faq/${id}`,
        method: "GET",
      }),
    }),
    editFAQs: builder.mutation({
      query: ({ id, body }) => ({
        url: `superadmin/faq/${id}`,
        method: "PATCH",
        body: body,
      }),
    }),
    deleteFAQs: builder.mutation({
      query: (id) => ({
        url: `/superadmin/faq/${id}`,
        method: "DELETE",
      }),
    }),
    allTutorials: builder.query({
      query: ({ pagesNumber, filter_by }) => {
        const params = new URLSearchParams();
        if (filter_by) params.append("filter_by", filter_by);
        return {
          url: `superadmin/tutorial?page=${pagesNumber}&page_size=20&${params.toString()}`,
          method: "GET",
        };
      },
    }),
    validateIndividualResponse: builder.query({
      query: ({ id, pagesNumber, path_params = "" }) => ({
        url: `response/validate/individual/${id}?page=${pagesNumber}&page_size=20${
          path_params ? `&${path_params}` : ""
        }`,
        method: "GET",
      }),
    }),
    getReviewQuestion: builder.query({
      query: () => ({
        url: `survey/review-questions`,
        method: "GET",
      }),
    }),
    getReview: builder.query({
      query: (pagesNumber) => ({
        url: `superadmin/review?page=${pagesNumber}&page_size=20`, // {{base_url}}/superadmin/review?page=1&page_size=10
        method: "GET",
      }),
    }),
    downloadSingleResponse: builder.query({
      query: ({ response_id, format }) => ({
        url: `response/export?response_id=${response_id}&format=${format}`, //
        method: "GET",
      }),
    }),
  }),
});

export const {
  useUserRegistryQuery,
  useSuperadminOverviewQuery,
  useSurveyCreationDistributionQuery,
  useAllFAQsQuery,
  useSurveyTypeDistributionQuery,
  useDeleteFAQsMutation,
  useEditFAQsMutation,
  useCreateFAQsMutation,
  usePublishFAQsMutation,
  useUnpublishFAQsMutation,
  useCreateReviewMutation,
  useGetReviewQuery,
  useSingleFAQsQuery,
  useGetReviewQuestionQuery,
  useAllTutorialsQuery,
  useValidateIndividualResponseQuery,
  useDownloadSingleResponseQuery,
  useLazyDownloadSingleResponseQuery,
} = surveyApiSlice;
