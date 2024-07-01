import { FC, Fragment, ReactElement, useContext, useState } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { SellerContext } from "src/features/seller/context/SellerContext";
import { v4 as uuidv4 } from "uuid";

import SkillField from "./SkillField";

const Skills: FC = (): ReactElement => {
  const [showSkillAddForm, setShowSkillAddForm] = useState<boolean>(false);
  const [showSkillEditForm, setShowSkillEditForm] = useState<boolean>(false);
  const [showSkillEditIcon, setShowSkillEditIcon] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const { sellerProfile, setSellerProfile, showEditIcons } =
    useContext(SellerContext);

  const handleRemove = (selectedSkill: string) => {
    const indexFoundedSkill = sellerProfile.skills.findIndex(
      (item) => item === selectedSkill
    );

    if (indexFoundedSkill >= 0) {
      const skills = sellerProfile.skills.toSpliced(indexFoundedSkill, 1);
      setSellerProfile?.({ ...sellerProfile, skills });
    }
  };

  return (
    <div className="border-grey mt-6 border bg-white">
      <div className="mb-1 flex justify-between border-b">
        <h4 className="flex py-2.5 pl-3.5 text-sm font-bold text-[#161c2d] md:text-base">
          SKILLS
        </h4>
        {showEditIcons && !showSkillAddForm && !showSkillEditForm && (
          <span
            onClick={() => {
              setShowSkillAddForm(!showSkillAddForm);
              setShowSkillEditForm(false);
              setShowSkillEditIcon(false);
              setSelectedSkill("");
            }}
            className="flex cursor-pointer items-center pr-3.5 text-sm text-[#00698c] md:text-base"
          >
            Add New
          </span>
        )}
      </div>
      <div className="mb-0 py-1.5">
        {showSkillAddForm && (
          <SkillField type="add" setShowSkillAddForm={setShowSkillAddForm} />
        )}
        {showSkillEditForm && (
          <SkillField
            type="edit"
            selectedSkill={selectedSkill}
            setShowSkillEditForm={setShowSkillEditForm}
          />
        )}
        {!showSkillAddForm && (
          <div className="flex min-h-full flex-wrap gap-x-4 gap-y-5 px-2 py-4">
            {sellerProfile.skills.map((tag: string) => (
              <Fragment key={uuidv4()}>
                {!showSkillEditForm && (
                  <div
                    className="relative w-[130px] truncate rounded-md border bg-[#edeef3] px-3 py-2 text-center"
                    onMouseEnter={() => {
                      setShowSkillEditIcon(true);
                      setSelectedSkill(tag);
                    }}
                    onMouseLeave={() => {
                      setShowSkillEditIcon(false);
                      setSelectedSkill("");
                    }}
                  >
                    <span className="left-0 top-0 h-full w-full text-sm font-bold text-[#55545b]">
                      {tag}
                    </span>

                    {showEditIcons &&
                      showSkillEditIcon &&
                      selectedSkill === tag && (
                        <div className="absolute left-0 top-0 flex h-full w-full justify-center gap-12 bg-white px-4 py-3">
                          <span
                            onClick={() => {
                              setShowSkillAddForm(false);
                              setShowSkillEditForm(!showSkillEditForm);
                              setShowSkillEditIcon(false);
                              setSelectedSkill(tag);
                            }}
                            className="cursor-pointer"
                          >
                            <FaPencilAlt className="" size="15" />
                          </span>

                          <span
                            className="cursor-pointer"
                            onClick={() => handleRemove(tag)}
                          >
                            <FaTrashAlt className="" size="15" />
                          </span>
                        </div>
                      )}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
