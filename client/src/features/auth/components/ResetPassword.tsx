import {
  ChangeEvent,
  FC,
  FormEvent,
  ReactElement,
  Suspense,
  lazy,
  useState
} from "react";
import { useSearchParams } from "react-router-dom";
import Button from "src/shared/button/Button";
import Header from "src/shared/header/components/Header";
import TextInput from "src/shared/input/TextInput";
import { IAlertProps, IResponse } from "src/shared/shared.interface";

import { useAuthSchema } from "../hook/useAuthSchema";
import {
  AUTH_FETCH_STATUS,
  IResetPassword
} from "../interfaces/auth.interface";
import { resetPasswordSchema } from "../schema/auth.schema";
import { useResetPasswordMutation } from "../service/auth.service";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Alert: React.LazyExoticComponent<React.FC<IAlertProps>> = lazy(
  () => import("src/shared/alert/Alert")
);

const ResetPassword: FC = (): ReactElement => {
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [userInfo, setUserInfo] = useState<IResetPassword>({
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState<string>(AUTH_FETCH_STATUS.IDLE);
  const [schemaValidation] = useAuthSchema({
    schema: resetPasswordSchema,
    userInfo
  });
  const [searchParams] = useSearchParams({});
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [passwordType, setPasswordType] = useState<string>("password");
  const [confirmPasswordType, setConfirmPasswordType] =
    useState<string>("password");

  const onResetPassword = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const [isValid, validationErrors] = await schemaValidation();
      if (!isValid) {
        setAlertMessage(validationErrors);
        return;
      }

      const result: IResponse = await resetPassword({
        password: userInfo.password,
        confirmPassword: userInfo.confirmPassword,
        token: `${searchParams.get("token")}`
      }).unwrap();
      setAlertMessage(`${result.message}`);
      setStatus(AUTH_FETCH_STATUS.SUCCESS);
      setUserInfo({ password: "", confirmPassword: "" });
    } catch (error) {
      setStatus(AUTH_FETCH_STATUS.ERROR);
      setAlertMessage(error?.data.message);
    }
  };

  return (
    <>
      <Header navClass="navbar peer-checked:navbar-active fixed z-20 w-full border-b border-gray-100 bg-white/90 shadow-2xl shadow-gray-600/5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none" />
      <div className="relative mt-24 mx-auto w-11/12 max-w-md rounded-lg bg-white md:w-2/3">
        <div className="relative px-5 py-5">
          <h2 className="text-center text-xl font-bold leading-tight tracking-tight dark:text-black md:text-2xl mb-2">
            Reset Password
          </h2>

          <Suspense>
            {alertMessage && <Alert type={status} message={alertMessage} />}
          </Suspense>

          <form
            className="mt-4 space-y-2 md:space-y-5 lg:mt-5"
            onSubmit={onResetPassword}
          >
            <div>
              <label
                htmlFor="password"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Password
              </label>
              <div className="relative mb-2 mt-1">
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
                  value={userInfo.password}
                  placeholder="Enter password"
                  onChange={(event: ChangeEvent) => {
                    setUserInfo({
                      ...userInfo,
                      password: (event.target as HTMLInputElement).value
                    });
                  }}
                />
              </div>
            </div>

            <div className="mt-0">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-bold leading-tight tracking-normal text-gray-800"
              >
                Confirm Password
              </label>
              <div className="relative mb-2 mt-1">
                <div className="absolute right-0 flex h-full cursor-pointer items-center pr-3 text-gray-600">
                  {confirmPasswordType === "password" ? (
                    <FaEyeSlash
                      onClick={() => setConfirmPasswordType("text")}
                      className="icon icon-tabler icon-tabler-info-circle"
                    />
                  ) : (
                    <FaEye
                      onClick={() => setConfirmPasswordType("password")}
                      className="icon icon-tabler icon-tabler-info-circle"
                    />
                  )}
                </div>
                <TextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmPasswordType}
                  className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                  value={userInfo.confirmPassword}
                  placeholder="Enter confirm password"
                  onChange={(event: ChangeEvent) => {
                    setUserInfo({
                      ...userInfo,
                      confirmPassword: (event.target as HTMLInputElement).value
                    });
                  }}
                />
              </div>
            </div>

            <Button
              disabled={
                !userInfo.password || !userInfo.confirmPassword || isLoading
              }
              className={`text-md block w-full cursor-pointer rounded bg-sky-500 px-8 py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none ${
                !userInfo.password || !userInfo.confirmPassword || isLoading
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              type="submit"
              label={`${isLoading ? "RESET PASSWORD IN PROGRESS..." : "RESET PASSWORD"}`}
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
