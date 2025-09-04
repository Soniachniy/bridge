import { ReactNode } from "react";

interface Section {
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  introduction: string;
  sections: Section[];
}

export const LegalPage = ({
  title,
  lastUpdated,
  introduction,
  sections,
}: LegalPageProps) => {
  return (
    <div className="flex flex-col items-center w-full gap-2 flex-1 relative">
      <div className="w-full md:w-[644px] px-6 py-6 inline-flex flex-col justify-start  gap-12">
        <div className="size- flex flex-col justify-start items-center gap-4">
          <div className="w-full text-center justify-start text-main_white text-4xl font-bold font-['Inter']">
            {title}
          </div>
        </div>
        <div className="size- flex flex-col justify-start items-start gap-6">
          <div className="w-full justify-start">
            <span className="text-main_white text-xl font-bold font-['Inter'] leading-normal">
              Last Updated:
            </span>
            <span className="text-main_white text-xl font-normal font-['Inter'] leading-normal">
              {" "}
              {lastUpdated}
            </span>
          </div>
          <div className="w-full justify-start text-main_white text-base font-normal font-['Inter'] leading-normal">
            {introduction}
          </div>
        </div>

        {sections.map((section, index) => (
          <div
            key={index}
            className="size- flex flex-col justify-start items-start gap-6"
          >
            <div className="w-full justify-start text-main_white text-xl font-bold font-['Inter'] leading-normal">
              {`${index + 1}. ${section.title}`}
            </div>
            <div className="w-full justify-start text-main_white text-base font-normal font-['Inter'] leading-normal">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
