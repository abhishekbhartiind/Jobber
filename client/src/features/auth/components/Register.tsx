import React from "react";
import {
  FaCamera,
  FaChevronLeft,
  FaEye,
  FaEyeSlash,
  FaTimes
} from "react-icons/fa";
import Button from "src/shared/button/Button";
import TextInput from "src/shared/input/TextInput";
import ModalBg from "src/shared/modal/ModalBg";
import { IModalBgProps } from "src/shared/modal/interfaces/modal.interface";
import { ISignUpPayload } from "../interfaces/auth.interface";
import Dropdown from "src/shared/dropdown/Dropdown";
import {
  countriesList,
  saveToSessionStorage
} from "src/shared/utils/util.service";
import { checkImage, readAsBase64 } from "src/shared/utils/image-util.service";
import { IAlertProps, IResponse } from "src/shared/shared.interface";
import { useAppDispatch } from "src/store/store";
import { useSignUpMutation } from "../service/auth.service";
import { registerUserSchema } from "../schema/auth.schema";
import { useAuthSchema } from "../hook/useAuthSchema";
import { addAuthUser } from "../reducers/auth.reducer";
import { updateLogout } from "../reducers/logout.reducer";
import { updateHeader } from "src/shared/header/reducer/header.reducer";
import { updateCategoryContainer } from "src/shared/header/reducer/category.reducer";

const Alert: React.LazyExoticComponent<React.FC<IAlertProps>> = React.lazy(
  () => import("src/shared/alert/Alert")
);

const RegisterModal: React.FC<IModalBgProps> = ({
  onClose,
  onToggle
}): React.ReactElement => {
  const [alertMessage, setAlertMessage] = React.useState<string>("");
  const [step, setStep] = React.useState<number>(1);
  const [country, setCountry] = React.useState<string>("Select Country");
  const [passwordType, setPasswordType] = React.useState<string>("password");
  const [profileImage, setProfileImage] = React.useState<string>(
    "https://placehold.co/330x220?text=Profile+Image"
  );
  const [showImageSelect, setShowImageSelect] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userInfo, setUserInfo] = React.useState<ISignUpPayload>({
    username: "",
    email: "",
    password: "",
    country: "",
    profilePicture: ""
  });

  const dispatch = useAppDispatch();
  const [signUp, { isLoading }] = useSignUpMutation();
  const [schemaValidation] = useAuthSchema({
    schema: registerUserSchema,
    userInfo
  });

  const canContinue =
    userInfo.username.length > 0 &&
    userInfo.email.length > 0 &&
    userInfo.password.length > 0;

  const handleFileChange = async (event: React.ChangeEvent): Promise<void> => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files) {
      const file: File = target.files[0];
      const isValid = checkImage(file, "image");
      if (isValid) {
        const dataImage: string | ArrayBuffer | null = await readAsBase64(file);
        setProfileImage(`${dataImage}`);
        setUserInfo({
          ...userInfo,
          profilePicture: `${dataImage}`
        });
      }
      setShowImageSelect(false);
    }
  };

  const onRegisterUser = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const [isValid, validationErrors] = await schemaValidation();

      if (!isValid) {
        setAlertMessage(validationErrors);
        return;
      }

      const result: IResponse = await signUp(userInfo).unwrap();

      setAlertMessage("");
      dispatch(addAuthUser({ authInfo: result.user }));
      dispatch(updateLogout(false));
      dispatch(updateHeader("home"));
      dispatch(updateCategoryContainer(true));
      saveToSessionStorage(
        JSON.stringify(true),
        JSON.stringify(result.user?.username)
      );
    } catch (error) {
      setAlertMessage(error?.data?.message);
    }
  };

  return (
    <ModalBg>
      <form
        className="relative top-[10%] mx-auto w-11/12 max-w-md rounded bg-white md:w-2/3"
        onSubmit={onRegisterUser}
      >
        <div className="relative px-5 py-5">
          <div className="flex justify-between text-2xl font-bold text-gray-600">
            {step > 1 && (
              <Button
                className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
                role="button"
                label={
                  <FaChevronLeft className="icon icon-tabler icon-tabler-x" />
                }
                onClick={() => setStep(step - 1)}
              />
            )}
            <h1 className="flex w-full justify-center">Join Jobber</h1>
            <Button
              className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
              role="button"
              label={<FaTimes className="icon icon-tabler icon-tabler-x" />}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-5 py-5">
          <ol className="flex w-full">
            <li className="flex w-full items-center text-white after:inline-block after:h-1 after:w-full after:border-4 after:border-b after:border-sky-500 after:content-[''] dark:after:border-sky-500">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 font-bold dark:bg-sky-500 lg:h-12 lg:w-12">
                1
              </span>
            </li>
            <li className="flex items-center">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white lg:h-12 lg:w-12 ${step == 2 ? "bg-sky-500 dark:bg-sky-500" : "bg-sky-300/50 dark:bg-sky-300/50"}`}
              >
                2
              </span>
            </li>
          </ol>
        </div>
        <div className="px-5">
          {alertMessage && <Alert type="error" message={alertMessage} />}
        </div>

        {/* step 1 */}
        {step === 1 && (
          <div className="relative px-5 py-5">
            <div>
              <label
                htmlFor="username"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Username
              </label>
              <TextInput
                id="username"
                name="username"
                type="text"
                className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                placeholder="Enter username"
                value={userInfo.username}
                onChange={(event: React.ChangeEvent) =>
                  setUserInfo({
                    ...userInfo,
                    username: (event.target as HTMLInputElement).value
                  })
                }
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Email
              </label>
              <TextInput
                id="email"
                name="email"
                type="email"
                className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                placeholder="Enter email"
                value={userInfo.email}
                onChange={(event: React.ChangeEvent) =>
                  setUserInfo({
                    ...userInfo,
                    email: (event.target as HTMLInputElement).value
                  })
                }
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Password
              </label>
              <div className="relative mb-5 mt-2">
                <div className="absolute right-0 flex h-full cursor-pointer items-center pr-3 text-gray-600">
                  {passwordType === "password" ? (
                    <FaEye
                      className="icon icon-tabler icon-tabler-info-circle"
                      onClick={() => setPasswordType("text")}
                    />
                  ) : (
                    <FaEyeSlash
                      className="icon icon-tabler icon-tabler-info-circle"
                      onClick={() => setPasswordType("password")}
                    />
                  )}
                </div>
                <TextInput
                  id="password"
                  name="password"
                  type={passwordType}
                  className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                  placeholder="Enter password"
                  value={userInfo.password}
                  onChange={(event: React.ChangeEvent) =>
                    setUserInfo({
                      ...userInfo,
                      password: (event.target as HTMLInputElement).value
                    })
                  }
                />
              </div>
            </div>
            <Button
              disabled={!canContinue}
              className={`text-md block w-full rounded bg-sky-500 px-8 py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none ${
                canContinue ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              label="Continue"
              onClick={() => setStep(step + 1)}
              type="button"
            />
          </div>
        )}

        {/* step 2 */}
        {step !== 1 && (
          <>
            <div className="relative px-5 py-5">
              <div className="h-24">
                <label
                  htmlFor="country"
                  className="text-sm font-bold leading-tight tracking-normal text-gray-800"
                >
                  Country
                </label>
                <div id="country" className="relative mb-5 mt-2">
                  <Dropdown
                    text={country}
                    maxHeight="200"
                    mainClassNames="absolute bg-white z-50"
                    showSearchInput={true}
                    values={countriesList()}
                    setValue={setCountry}
                    onClick={(item: string) => {
                      setCountry(item);
                      setUserInfo({
                        ...userInfo,
                        country: item
                      });
                    }}
                  />
                </div>
              </div>
              <div className="relative">
                <label
                  htmlFor="profilePicture"
                  className="text-sm font-bold leading-tight tracking-normal text-gray-800"
                >
                  Profile Picture
                </label>
                <div
                  className="relative mb-5 mt-2 w-[20%] cursor-pointer"
                  onMouseEnter={() => setShowImageSelect(true)}
                  onMouseLeave={() => setShowImageSelect(false)}
                >
                  {profileImage && (
                    <img
                      id="profilePicture"
                      src={profileImage}
                      alt="Profile Picture"
                      className="left-0 top-0 h-20 w-20 rounded-full bg-white object-cover"
                    />
                  )}

                  {!profileImage && (
                    <div className="left-0 top-0 flex h-20 w-20 cursor-pointer justify-center rounded-full bg-[#dee1e7]"></div>
                  )}

                  {showImageSelect && (
                    <div
                      className="absolute left-0 top-0 flex h-20 w-20 cursor-pointer justify-center rounded-full bg-[#dee1e7]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaCamera className="flex self-center" />
                    </div>
                  )}

                  <TextInput
                    name="image"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <Button
                disabled={
                  !userInfo.country || !userInfo.profilePicture || isLoading
                }
                className={`text-md block w-full rounded bg-sky-500 px-8 py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none ${
                  !userInfo.country || !userInfo.profilePicture || isLoading
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                label={`${isLoading ? "SIGNUP IN PROGRESS" : "SIGNUP"}`}
                // onClick={onRegisterUser}
                type="submit"
              />
            </div>
          </>
        )}

        <hr />
        <div className="px-5 py-4">
          <div className="ml-2 flex w-full justify-center text-sm font-medium">
            <div className="flex justify-center">
              Already a member?{" "}
              <p
                className="ml-2 flex cursor-pointer text-blue-600 hover:underline"
                onClick={() => onToggle?.(true)}
              >
                Sign In
              </p>
            </div>
          </div>
        </div>
      </form>
    </ModalBg>
  );
};

export default RegisterModal;
