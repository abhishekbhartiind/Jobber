import { FC, ReactElement, useContext, useState } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { SellerContext } from "src/features/seller/context/SellerContext";
import { ILanguage } from "src/features/seller/interfaces/seller.interface";
import { v4 as uuidv4 } from "uuid";

import LanguageFields from "./LanguageFields";
import isEqual from "react-fast-compare";

const Language: FC = (): ReactElement => {
  const [showLanguageAddForm, setShowLanguageAddForm] =
    useState<boolean>(false);
  const [showLanguageEditForm, setShowLanguageEditForm] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage>();
  const { sellerProfile, setSellerProfile, showEditIcons } =
    useContext(SellerContext);

  const handleRemove = (language: ILanguage) => {
    const indexFoundedLanguage = sellerProfile.languages.findIndex(
      (item: ILanguage) => isEqual(item, language)
    );

    if (indexFoundedLanguage >= 0) {
      const languages = sellerProfile.languages.toSpliced(
        indexFoundedLanguage,
        1
      );
      setSellerProfile?.({ ...sellerProfile, languages });
    }
  };

  return (
    <div className="border-grey border bg-white">
      <div className="mb-1 flex justify-between border-b">
        <h4 className="flex py-2.5 pl-3.5 text-sm font-bold text-[#161c2d] md:text-base">
          LANGUAGE SKILLS
        </h4>
        {showEditIcons && !showLanguageAddForm && !showLanguageEditForm && (
          <span
            onClick={() => {
              setShowLanguageAddForm(!showLanguageAddForm);
              setShowLanguageEditForm(false);
            }}
            className="flex cursor-pointer items-center pr-3.5 text-sm text-[#00698c] md:text-base"
          >
            Add New
          </span>
        )}
      </div>
      <ul className="mb-0 list-none pt-1.5">
        {showLanguageAddForm && (
          <li className="flex justify-between">
            <LanguageFields
              type="add"
              setShowLanguageAddForm={setShowLanguageAddForm}
            />
          </li>
        )}
        {!showLanguageAddForm && (
          <>
            {sellerProfile?.languages.map((lang: ILanguage) => (
              <li key={uuidv4()} className="mb-2 flex justify-between">
                {!showLanguageEditForm && (
                  <div className="col-span-3 ml-4 flex pb-3 text-sm md:text-base">
                    <div className="mr-3 font-bold">{lang.language}</div>
                    <div className="mr-3">-</div>
                    <div>{lang.level}</div>
                  </div>
                )}
                {showLanguageEditForm && isEqual(selectedLanguage, lang) && (
                  <LanguageFields
                    type="edit"
                    selectedLanguage={lang}
                    setShowLanguageEditForm={setShowLanguageEditForm}
                  />
                )}
                {!showLanguageEditForm && showEditIcons && (
                  <div className="mr-4 flex gap-4 mt-[7px]">
                    <FaPencilAlt
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowLanguageEditForm(!showLanguageEditForm);
                        setShowLanguageAddForm(false);
                      }}
                      size="12"
                      className="cursor-pointer"
                    />

                    <FaTrashAlt
                      onClick={() => handleRemove(lang)}
                      size="12"
                      className="cursor-pointer"
                    />
                  </div>
                )}
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default Language;
