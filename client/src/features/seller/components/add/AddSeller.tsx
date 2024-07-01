import { filter } from "lodash";
import {
  FC,
  FormEvent,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  lazy,
  useEffect,
  useState
} from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { IBuyerDocument } from "src/features/buyer/interfaces/buyer.interface";
import { addBuyer } from "src/features/buyer/reducer/buyer.reducer";
import { addSeller } from "src/features/seller/reducer/seller.reducer";
import Breadcrumb from "src/shared/breadcrumb/Breadcrumb";
import Button from "src/shared/button/Button";
import { IResponse } from "src/shared/shared.interface";
import {
  deleteFromLocalStorage,
  lowerCase,
  showErrorToast
} from "src/shared/utils/util.service";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";

import {
  ICertificate,
  IEducation,
  IExperience,
  ILanguage,
  IPersonalInfoData,
  ISellerDocument
} from "../../interfaces/seller.interface";

import SellerCertificateFields from "./components/SellerCertificateFields";
import SellerEducationFields from "./components/SellerEducationFields";
import SellerExperienceFields from "./components/SellerExperienceFields";
import SellerLanguageFields from "./components/SellerLanguagesFields";
import SellerSkillField from "./components/SellerSkillField";
import SellerSocialLinksFields from "./components/SellerSocialLinksFields";
import { useSellerSchema } from "../../hook/useSellerSchema";
import { useCreateSellerMutation } from "../../service/seller.service";
import PersonalInfo from "./components/PersonalInfo";

const CircularPageLoader: LazyExoticComponent<FC> = lazy(
  () => import("src/shared/page-loader/CircularPageLoader")
);

const AddSeller: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
  const [personalInfo, setPersonalInfo] = useState<IPersonalInfoData>({
    fullName: "",
    profilePicture: `${authUser.profilePicture}`,
    description: "",
    responseTime: "",
    oneliner: ""
  });
  const [experienceFields, setExperienceFields] = useState<IExperience[]>([
    {
      title: "",
      company: "",
      startDate: "Start Year",
      endDate: "End Year",
      currentlyWorkingHere: false,
      description: ""
    }
  ]);
  const [educationFields, setEducationFields] = useState<IEducation[]>([
    {
      country: "Country",
      university: "",
      title: "Title",
      major: "",
      year: "Year"
    }
  ]);
  const [skillsFields, setSkillsFields] = useState<string[]>([""]);
  const [languageFields, setLanguageFields] = useState<ILanguage[]>([
    {
      language: "",
      level: "Level"
    }
  ]);
  const [certificateFields, setCertificateFields] = useState<ICertificate[]>([
    {
      name: "",
      from: "",
      year: "Year"
    }
  ]);
  const [socialFields, setSocialFields] = useState<string[]>([""]);
  const [
    schemaValidation,
    personalInfoErrors,
    experienceErrors,
    educationErrors,
    skillsErrors,
    languagesErrors
  ] = useSellerSchema({
    personalInfo,
    experienceFields,
    educationFields,
    skillsFields,
    languageFields
  });
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const [createSeller, { isLoading }] = useCreateSellerMutation();

  const errors = [
    ...personalInfoErrors,
    ...experienceErrors,
    ...educationErrors,
    ...skillsErrors,
    ...languagesErrors
  ];

  const onCreateSeller = async (): Promise<void> => {
    // event.preventDefault();
    try {
      const isValid: boolean = await schemaValidation();
      if (!isValid) {
        showErrorToast("Error creating seller profile.");
        return;
      }

      const skills: string[] = filter(
        skillsFields,
        (skill: string) => skill !== ""
      ) as string[];
      const socialLinks: string[] = filter(
        socialFields,
        (item: string) => item !== ""
      ) as string[];
      const certificates: ICertificate[] = filter(
        certificateFields,
        (item: ICertificate) =>
          item.name !== "" && item.from !== "" && item.year !== ""
      ) as ICertificate[];

      const sellerData: ISellerDocument = {
        email: `${authUser.email}`,
        profilePublicId: `${authUser.profilePublicId}`,
        profilePicture: `${authUser.profilePicture}`,
        username: `${authUser.username}`,
        fullName: personalInfo.fullName,
        description: personalInfo.description,
        country: `${authUser.country}`,
        skills,
        oneliner: personalInfo.oneliner,
        languages: languageFields,
        responseTime: parseInt(personalInfo.responseTime, 10),
        experience: experienceFields,
        education: educationFields,
        socialLinks,
        certificates
      };
      const updateBuyer: IBuyerDocument = { ...buyer, isSeller: true };
      const response: IResponse = await createSeller(sellerData).unwrap();
      dispatch(addSeller(response.seller));
      dispatch(addBuyer(updateBuyer));
      navigate(
        `/seller_profile/${lowerCase(`${authUser.username}`)}/${response.seller?._id}/edit`
      );
    } catch (error) {
      showErrorToast("Error creating seller profile.");
    }
  };

  useEffect(() => {
    return () => {
      // delete becomeASeller from localStorage when user leaves this page
      deleteFromLocalStorage("becomeASeller");
    };
  }, []);

  return (
    <Suspense>
      <div className="relative w-full">
        <Breadcrumb breadCrumbItems={["Seller", "Create Profile"]} />
        <div className="container mx-auto my-5 overflow-hidden px-2 pb-12 md:px-0">
          {isLoading && <CircularPageLoader />}
          {authUser && !authUser.emailVerified && (
            <div className="absolute left-0 top-0 z-50 flex h-full w-full justify-center bg-white/[0.8] text-sm font-bold md:text-base lg:text-xl">
              <span className="mt-20">Please verify your email.</span>
            </div>
          )}

          <div className="left-0 top-0 z-10 mt-4 block h-full bg-white">
            {errors.length > 0 && (
              <div className="text-red-400">
                <h3 className="text-center">{`You have ${errors.length} error${errors.length > 1 ? "s" : ""}`}</h3>
                <ul className="list-disc ms-6">
                  {errors.map((error, index) => (
                    <li key={index}>
                      {typeof error === "object"
                        ? Object.values(error)[0]
                        : error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <PersonalInfo
              personalInfo={personalInfo}
              setPersonalInfo={setPersonalInfo}
              personalInfoErrors={personalInfoErrors}
            />

            <SellerExperienceFields
              experienceFields={experienceFields}
              setExperienceFields={setExperienceFields}
              experienceErrors={experienceErrors}
            />

            <SellerEducationFields
              educationFields={educationFields}
              setEducationFields={setEducationFields}
              educationErrors={educationErrors}
            />

            <SellerSkillField
              skillsFields={skillsFields}
              setSkillsFields={setSkillsFields}
              skillsErrors={skillsErrors}
            />

            <SellerLanguageFields
              languageFields={languageFields}
              setLanguageFields={setLanguageFields}
              languagesErrors={languagesErrors}
            />

            <SellerCertificateFields
              certificatesFields={certificateFields}
              setCertificatesFields={setCertificateFields}
            />

            <SellerSocialLinksFields
              socialFields={socialFields}
              setSocialFields={setSocialFields}
            />

            <div className="flex justify-end p-6">
              <Button
                disabled={isLoading}
                onClick={onCreateSeller}
                className="rounded bg-sky-500 px-8 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-3 md:text-base"
                label={`${isLoading ? "Creating Profile Progressing" : "Create Profile"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default AddSeller;
