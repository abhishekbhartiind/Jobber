import React from "react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import Button from "src/shared/button/Button";
import TextInput from "src/shared/input/TextInput";
import ModalBg from "src/shared/modal/ModalBg";
import { IModalBgProps } from "src/shared/modal/interfaces/modal.interface";
import { updateLogout } from "../reducers/logout.reducer";
import { addAuthUser } from "../reducers/auth.reducer";
import { IAlertProps, IResponse } from "src/shared/shared.interface";
import {
  deleteFromLocalStorage,
  getDataFromLocalStorage,
  saveToSessionStorage
} from "src/shared/utils/util.service";
import { useSignInMutation } from "../service/auth.service";
import { useAuthSchema } from "../hook/useAuthSchema";
import { useAppDispatch } from "src/store/store";
import { loginUserSchema } from "../schema/auth.schema";
import { ISignInPayload } from "../interfaces/auth.interface";
import { updateHeader } from "src/shared/header/reducer/header.reducer";
import { updateCategoryContainer } from "src/shared/header/reducer/category.reducer";
import {
  createSearchParams,
  NavigateFunction,
  useNavigate
} from "react-router-dom";
import { IOffer } from "src/features/order/interfaces/order.interface";

const Alert: React.LazyExoticComponent<React.FC<IAlertProps>> = React.lazy(
  () => import("src/shared/alert/Alert")
);

const LoginModal: React.FC<IModalBgProps> = ({
  onClose,
  onToggle,
  onTogglePassword
}): React.ReactElement => {
  const [alertMessage, setAlertMessage] = React.useState<string>("");
  const [passwordType, setPasswordType] = React.useState<string>("password");
  const navigate: NavigateFunction = useNavigate();
  const [userInfo, setUserInfo] = React.useState<ISignInPayload>({
    username: "",
    password: ""
  });
  const dispatch = useAppDispatch();
  const [schemaValidation] = useAuthSchema({
    schema: loginUserSchema,
    userInfo
  });
  const [signIn, { isLoading }] = useSignInMutation();

  const onLoginUser = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const [isValid, validationErrors] = await schemaValidation();
      if (!isValid) {
        setAlertMessage(validationErrors);
        return;
      }

      const result: IResponse = await signIn(userInfo).unwrap();
      setAlertMessage("");
      dispatch(addAuthUser({ authInfo: result.user }));
      dispatch(updateLogout(false));
      dispatch(updateHeader("home"));
      dispatch(updateCategoryContainer(true));
      saveToSessionStorage(
        JSON.stringify(true),
        JSON.stringify(result.user?.username)
      );

      const upgoingPurchasingGig = getDataFromLocalStorage(
        "upgoingPurchasingGig"
      );

      if (upgoingPurchasingGig) {
        deleteFromLocalStorage("upgoingPurchasingGig");

        const deliveryInDays: number = parseInt(
          upgoingPurchasingGig.expectedDelivery.split(" ")[0]
        );
        const newDate: Date = new Date();

        newDate.setDate(newDate.getDate() + deliveryInDays);
        const offerParams: IOffer = {
          gigTitle: upgoingPurchasingGig.title,
          description: upgoingPurchasingGig.basicDescription,
          price: upgoingPurchasingGig.price,
          deliveryInDays,
          oldDeliveryDate: newDate.toString(),
          newDeliveryDate: newDate.toString(),
          accepted: false,
          cancelled: false
        };

        navigate(
          `/gig/checkout/${upgoingPurchasingGig.id}?${createSearchParams({ offer: JSON.stringify(offerParams) })}`,
          { state: upgoingPurchasingGig }
        );
      }
    } catch (error) {
      setAlertMessage(error?.data?.message);
    }
  };

  return (
    <ModalBg>
      <div className="relative top-[20%] mx-auto w-11/12 max-w-md rounded-lg bg-white md:w-2/3">
        <form className="relative px-5 py-5" onSubmit={onLoginUser}>
          <div className="mb-5 flex justify-between text-2xl font-bold text-gray-600">
            <h1 className="flex w-full justify-center">Sign In to Jobber</h1>
            <Button
              testId="closeModal"
              className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
              role="button"
              label={<FaTimes className="icon icon-tabler icon-tabler-x" />}
              onClick={onClose}
              type="button"
            />
          </div>
          {alertMessage && <Alert type="error" message={alertMessage} />}
          <div>
            <label
              htmlFor="email or username"
              className="text-sm font-bold leading-tight tracking-normal text-gray-800"
            >
              Email or username
            </label>
            <TextInput
              id="username"
              name="username"
              type="text"
              className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
              placeholder="Enter username"
              value={userInfo.username}
              onChange={(event: React.ChangeEvent) => {
                setUserInfo({
                  ...userInfo,
                  username: (event.target as HTMLInputElement).value
                });
              }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold leading-tight tracking-normal text-gray-800"
            >
              Password
            </label>
            <div className="relative mb-2 mt-2">
              <div className="absolute right-0 flex h-full cursor-pointer items-center pr-3 text-gray-600">
                {passwordType === "password" ? (
                  <FaEyeSlash
                    onClick={() => setPasswordType("text")}
                    className="icon icon-tabler icon-tabler-info-circle"
                  />
                ) : (
                  <FaEye
                    onClick={() => setPasswordType("password")}
                    className="icon icon-tabler icon-tabler-info-circle"
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
                onChange={(event: React.ChangeEvent) => {
                  setUserInfo({
                    ...userInfo,
                    password: (event.target as HTMLInputElement).value
                  });
                }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div
              className="mb-6 ml-2 cursor-pointer text-sm text-blue-600 hover:underline dark:text-blue-500"
              onClick={() => onTogglePassword?.(true)}
            >
              Forgot Password?
            </div>
          </div>
          <div className="flex w-full items-center justify-center">
            <Button
              testId="submit"
              disabled={!userInfo.username || !userInfo.password || isLoading}
              className={`text-md block w-full cursor-pointer rounded bg-sky-500 px-8 py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none ${
                !userInfo.username || !userInfo.password || isLoading
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              label={`${isLoading ? "LOGIN IN PROGRESS..." : "LOGIN"}`}
              type="submit"
            />
          </div>
        </form>
        <hr />
        <div className="px-5 py-4">
          <div className="ml-2 flex w-full justify-center text-sm font-medium">
            <div className="flex justify-center">
              Not yet a member?{" "}
              <p
                className="ml-2 flex cursor-pointer text-blue-600 hover:underline"
                onClick={() => onToggle?.(true)}
              >
                Join Now
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalBg>
  );
};

export default LoginModal;
