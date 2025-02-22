import { useGetPlanQuery } from "@/services/subscribtion.service";
import Link from "next/link";
import React from "react";

interface PricingProps{
  currency?:boolean;
}

const Pricing:React.FC<PricingProps> = ({currency}) => {
  const { data, isLoading } =useGetPlanQuery(null);
  console.log(data)
  const plans = [
    {
      name: "Basic",
      price: "$0",
      price2: "$0",
      description:
        "Perfect for individuals and small teams just getting started.",
      features: [
        "Free Forever",
        "1 Account",
        "200 monthly responses",
        "AI survey/Poll generation",
        "Data Export (pdf)",
      ],
    },
    {
      name: "Pro",
      price: "$65",
      price2: "$60",
      description:
        "Ideal for growing businesses that need more power and flexibility.",
      features: [
       
        "Add Contributors (Up to 4)",
        "Unlimited Polls and Surveys",
        "10,000 monthly responses",
        "Account Customization",
        "Offline data collection and analytics",
        "AI survey assistant",
        "Automatic AI survey reporting",
        "Speech to text feature",
        "Data Export (xls, pdf, ppt)",
        "Priority Email support",
      ],
    },
    {
      name: "Team",
      price: "$90",
      price2: "$85",
      description:
        "Tailored solutions for large organizations with complex needs.",
      features: [
        "Multiple accounts",
        "Unlimited contributors",
        "Unlimited responses",
        "A/B testing & randomization",
        "Skip Logic",
        "Multilingual Survey",
        "Advanced Data Export (xls, pdf, ppt, Power BI)",
        "Dedicated customer success manager",
      ],
    },
  ];
  return (
    <div className="lg:flex justify-between items-start gap-8 w-full">
    {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 "> */}
      {plans.map((plan, index) => (
        <div
          key={index}
          data-aos="fade-up"
          data-aos-delay={index * 100}
          className={`
            ${  plan.name === "Pro"
              ? "border border-purple-500 "
              : ""}
             bg-[#FAFAFB] rounded-xl flex-1 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col w-full border`}
        >
          <div className="flex-grow w-full">
            {/* <div className="flex justify-center">{plan.icon}</div> */}
            <h2 className="text-2xl font-semibold mb-4  text-start">
              {plan.name}
            </h2>
            <p className="text-4xl font-bold mb-4 text-[#171725] text-start">
              {currency ? plan.price : plan.price2} 
              {plan.name === "Team" ? (<small className="text-sm">/user Starting at 3</small>) : ""}
              {
                !currency  && 
               <small className="text-sm font-normal text-gray-500"> Monthly</small>
              }
            </p>
            <hr />

            <Link
              href="/register"
              className={` ${
                plan.name === "Pro"
                  ? "bg-gradient-to-r from-[#5B03B2] to-[#9D50BB] text-white"
                  : plan.name === "Basic"? "text-purple-500 border border-purple-500" : "text-purple border border-purple-500 "
              } block w-full my-5  text-center py-3 rounded-md hover:bg-opacity-80 transition-colors duration-300 `}
            >
              {plan.name === "Basic" ? "Get PollSensei for Free" : "Start Trial"}
            </Link>
            <ul className="mb-8 space-y-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 bg-[] rounded-full text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            {index > 0 && (
              <p className="text-sm text-gray-600 mb-4 text-center">
                Includes all features from {plans[index - 1].name} plan
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Pricing;
