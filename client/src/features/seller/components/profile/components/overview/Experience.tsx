import { FC, ReactElement, useContext, useState } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { SellerContext } from "src/features/seller/context/SellerContext";
import { IExperience } from "src/features/seller/interfaces/seller.interface";
import { v4 as uuidv4 } from "uuid";

import ExperienceFields from "./ExperienceFields";
import isEqual from "react-fast-compare";

const Experience: FC = (): ReactElement => {
  const [showExperienceAddForm, setShowExperienceAddForm] =
    useState<boolean>(false);
  const [showExperienceEditForm, setShowExperienceEditForm] =
    useState<boolean>(false);
  const [selectedExperience, setSelectedExperience] = useState<IExperience>();
  const { showEditIcons, setSellerProfile, sellerProfile } =
    useContext(SellerContext);

  const handleRemove = (experience: IExperience) => {
    const indexFoundedExperience = sellerProfile.experience.findIndex(
      (item: IExperience) => isEqual(item, experience)
    );

    if (indexFoundedExperience >= 0) {
      const experience = sellerProfile.experience.toSpliced(
        indexFoundedExperience,
        1
      );
      setSellerProfile?.({ ...sellerProfile, experience });
    }
  };

  return (
    <div className="border-grey mt-6 border bg-white">
      <div className="mb-1 flex justify-between border-b">
        <h4 className="flex py-2.5 pl-3.5 text-sm font-bold text-[#161c2d] md:text-base">
          EXPERIENCE
        </h4>
        {showEditIcons && !showExperienceAddForm && !showExperienceEditForm && (
          <span
            className="flex cursor-pointer items-center pr-3.5 text-sm text-[#00698c] md:text-base"
            onClick={() => {
              setShowExperienceAddForm(!showExperienceAddForm);
            }}
          >
            Add New
          </span>
        )}
      </div>
      <ul className="mb-0 list-none pt-1.5">
        {showExperienceAddForm && (
          <li className="flex justify-between">
            <ExperienceFields
              type="add"
              setShowExperienceAddForm={setShowExperienceAddForm}
            />
          </li>
        )}
        {!showExperienceAddForm && (
          <>
            {sellerProfile?.experience.map(
              (experience: IExperience, index: number) => {
                return (
                  <li
                    key={uuidv4()}
                    className={`mb-1 flex justify-between ${index + 1 !== sellerProfile.experience.length ? "border-b-2" : ""}`}
                  >
                    {!showExperienceEditForm && (
                      <div className="col-span-3 ml-4 flex flex-col pb-3 text-sm md:text-base">
                        <div className="mr-3 font-bold ">
                          {experience.title}
                        </div>
                        <div className="mr-3 font-normal">
                          {experience.company}
                        </div>
                        <div className="mr-3 font-normal">
                          {experience.startDate} - {experience.endDate}
                        </div>
                      </div>
                    )}
                    {showExperienceEditForm &&
                      isEqual(selectedExperience, experience) && (
                        <ExperienceFields
                          type="edit"
                          selectedExperience={selectedExperience}
                          setShowExperienceEditForm={setShowExperienceEditForm}
                        />
                      )}
                    {!showExperienceEditForm && showEditIcons && (
                      <div className="mr-4 flex gap-4 mt-1">
                        <FaPencilAlt
                          size="12"
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedExperience(experience);
                            setShowExperienceEditForm(!showExperienceEditForm);
                            setShowExperienceAddForm(false);
                          }}
                        />

                        <FaTrashAlt
                          onClick={() => handleRemove(experience)}
                          className="cursor-pointer"
                          size="12"
                        />
                      </div>
                    )}
                  </li>
                );
              }
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default Experience;
