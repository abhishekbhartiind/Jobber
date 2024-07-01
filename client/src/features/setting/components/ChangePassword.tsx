import {
  ChangeEvent,
  FC,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  lazy,
  useState
} from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Button from "src/shared/button/Button";
import TextInput from "src/shared/input/TextInput";
import { PASSWORD_TYPE } from "src/shared/utils/static-data";
import {
  applicationLogout,
  isFetchBaseQueryError,
  showErrorToast,
  showSuccessToast
} from "src/shared/utils/util.service";
import { useAppDispatch } from "src/store/store";

import { useChangePasswordMutation } from "../services/settings.service";
import { IAlertProps } from "src/shared/shared.interface";

interface IPasswordItem {
  currentPassword: string;
  newPassword: string;
  passwordType: string;
}

const Alert: LazyExoticComponent<FC<IAlertProps>> = lazy(
  () => import("src/shared/alert/Alert")
);

const ChangePassword: FC = (): ReactElement => {
  const [passwordItem, setPasswordItem] = useState<IPasswordItem>({
    currentPassword: "",
    newPassword: "",
    passwordType: PASSWORD_TYPE.PASSWORD
  });
  const [currentPasswordType, setCurrentPasswordType] = useState<string>(
    PASSWORD_TYPE.PASSWORD
  );
  const [alertMessage, setAlertMessage] = useState<string>("");
  const navigate: NavigateFunction = useNavigate();
  const dispatch = useAppDispatch();
  const [changePassword] = useChangePasswordMutation();

  const updatePassword = async (): Promise<void> => {
    try {
      const response = await changePassword({
        currentPassword: passwordItem.currentPassword,
        newPassword: passwordItem.newPassword
      }).unwrap();
      showSuccessToast("Password updated successfully.");
      setTimeout(() => {
        applicationLogout(dispatch, navigate);
      }, 3000);

      if (isFetchBaseQueryError(response)) {
        setAlertMessage((response as any).error?.data?.message);
        showErrorToast((response as any).error?.data?.message);
      }
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        setAlertMessage(error?.data?.message);
        showErrorToast(error?.data?.message);
      }
    }
  };

  return (
    <div>
      <Suspense>
        {alertMessage && <Alert type="error" message={alertMessage} />}
      </Suspense>
      <>
        <label
          htmlFor="currentPassword"
          className="text-sm font-bold leading-tight tracking-normal text-gray-800"
        >
          Current Password
        </label>
        <div className="relative flex gap-4">
          <TextInput
            id="currentPassword"
            name="currentPassword"
            type={currentPasswordType}
            value={passwordItem.currentPassword}
            className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
            placeholder="Enter current password"
            onChange={(event: ChangeEvent) => {
              setPasswordItem({
                ...passwordItem,
                currentPassword: (event.target as HTMLInputElement).value
              });
            }}
          />
          <div className="absolute right-0  flex h-full cursor-pointer items-center pr-3 text-gray-600">
            {currentPasswordType === PASSWORD_TYPE.PASSWORD ? (
              <FaEyeSlash
                className="mb-2"
                onClick={() => setCurrentPasswordType(PASSWORD_TYPE.TEXT)}
              />
            ) : (
              <FaEye
                className="mb-2"
                onClick={() => setCurrentPasswordType(PASSWORD_TYPE.PASSWORD)}
              />
            )}
          </div>
        </div>
      </>
      <>
        <label
          htmlFor="newPassword"
          className="text-sm font-bold leading-tight tracking-normal text-gray-800"
        >
          New Password
        </label>
        <div className="relative flex gap-4">
          <TextInput
            id="newPassword"
            name="newPassword"
            type={passwordItem.passwordType}
            value={passwordItem.newPassword}
            className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
            placeholder="Enter new password"
            onChange={(event: ChangeEvent) => {
              setPasswordItem({
                ...passwordItem,
                newPassword: (event.target as HTMLInputElement).value
              });
            }}
          />
          <div className="absolute right-0  flex h-full cursor-pointer items-center pr-3 text-gray-600">
            {passwordItem.passwordType === PASSWORD_TYPE.PASSWORD ? (
              <FaEyeSlash
                className="mb-2"
                onClick={() =>
                  setPasswordItem({
                    ...passwordItem,
                    passwordType: PASSWORD_TYPE.TEXT
                  })
                }
              />
            ) : (
              <FaEye
                className="mb-2"
                onClick={() =>
                  setPasswordItem({
                    ...passwordItem,
                    passwordType: PASSWORD_TYPE.PASSWORD
                  })
                }
              />
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          <Button
            className={`text-md block w-full cursor-pointer rounded  px-8 py-2 text-center font-bold text-white focus:outline-none ${
              !passwordItem.currentPassword || !passwordItem.newPassword
                ? "cursor-not-allowed bg-sky-200"
                : "bg-sky-500 cursor-pointer"
            }`}
            label="Save Changes"
            onClick={updatePassword}
          />
        </div>
      </>
    </div>
  );
};

export default ChangePassword;
