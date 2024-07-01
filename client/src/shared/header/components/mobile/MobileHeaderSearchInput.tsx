import { FC, ReactElement, useEffect, useRef } from "react";
import { FaBars, FaRegBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import Button from "src/shared/button/Button";
import { useAppDispatch, useAppSelector } from "src/store/store";

import { IHeaderSideBarProps } from "../../interfaces/header.interface";
import { updateCategoryContainer } from "../../reducer/category.reducer";
import { updateHeader } from "../../reducer/header.reducer";
import HeaderSearchInput from "../HeaderSearchInput";
import { IReduxState } from "src/store/store.interface";
import useDetectOutsideClick from "src/shared/hook/useDetectOutsideClick";
import { Transition } from "@headlessui/react";
import { filter } from "lodash";
import { IOrderNotifcation } from "src/features/order/interfaces/order.interface";
import { socket } from "src/sockets/socket.service";
import NotificationDropdown from "../NotificationDropdown";
import { useGetNotificationsByIdQuery } from "src/features/order/service/notification.service";
import { updateNotification } from "../../reducer/notification.reducer";

const MobileHeaderSearchInput: FC<IHeaderSideBarProps> = ({
  setOpenSidebar
}): ReactElement => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector(
    (state: IReduxState) => state.notification
  );
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { data, isSuccess } = useGetNotificationsByIdQuery(
    authUser.username ?? "",
    { refetchOnMountOrArgChange: true }
  );
  const notificationDropdownRef = useRef<HTMLDivElement | null>(null);

  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useDetectOutsideClick(notificationDropdownRef, false);

  const toggleNotificationDropdown = (): void => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    dispatch(updateHeader("home"));
    dispatch(updateCategoryContainer(true));
  };

  useEffect(() => {
    socket.emit("getLoggedInUsers", "");
    if (isSuccess) {
      const list: IOrderNotifcation[] = filter(
        data.notifications,
        (item: IOrderNotifcation) =>
          !item.isRead && item.userTo === authUser?.username
      );
      dispatch(updateNotification({ hasUnreadNotification: list.length > 0 }));
    }
  }, [isSuccess, authUser.username, data?.notifications, dispatch]);

  useEffect(() => {
    socket.on("order_notification", (data: IOrderNotifcation) => {
      // only for receiver
      if (data.receiverUsername === authUser.username && !data.isRead) {
        dispatch(updateNotification({ hasUnreadNotification: true }));
      }
    });
  }, [authUser.username, dispatch]);

  return (
    <div className="flex w-full flex-col gap-y-3 md:hidden z-50">
      <div className="flex items-center w-full">
        <div className="flex w-full">
          <label
            htmlFor="hbr"
            className="peer-checked:hamburger relatives z-20 -ml-4 cursor-pointer px-4 py-6"
          >
            <Button
              className="m-auto flex h-0.5 w-5 items-center rounded transition duration-300"
              onClick={() => {
                if (setOpenSidebar) {
                  setOpenSidebar(true);
                }
              }}
              label={<FaBars className="h-6 w-6 text-sky-500" />}
            />
          </label>
          <Link
            to="/"
            onClick={() => {
              dispatch(updateHeader("home"));
              dispatch(updateCategoryContainer(true));
            }}
            className="relative z-10 flex w-full cursor-pointer justify-center self-center pr-12 text-2xl font-bold text-black lg:text-3xl"
          >
            Jobber
          </Link>
        </div>
        <div className="relative">
          <Button
            className="px-4"
            onClick={toggleNotificationDropdown}
            label={
              <>
                <FaRegBell />
                {notification && notification.hasUnreadNotification && (
                  <span className="absolute -top-0 right-0 mr-3 inline-flex h-[6px] w-[6px] items-center justify-center rounded-full bg-[#ff62ab]"></span>
                )}
              </>
            }
          />
          <Transition
            ref={notificationDropdownRef}
            show={isNotificationDropdownOpen}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <div className="absolute right-0 mt-5 w-80">
              <NotificationDropdown
                setIsNotificationDropdownOpen={setIsNotificationDropdownOpen}
              />
            </div>
          </Transition>
        </div>
      </div>
      <HeaderSearchInput />
    </div>
  );
};

export default MobileHeaderSearchInput;
