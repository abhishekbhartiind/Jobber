import { Transition } from "@headlessui/react";
import React, { useEffect } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaBars,
  FaRegBell,
  FaRegEnvelope,
  FaTimes
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Button from "src/shared/button/Button";
import useDetectOutsideClick from "src/shared/hook/useDetectOutsideClick";
import {
  categories,
  replaceSpacesWithDash,
  showErrorToast,
  showSuccessToast
} from "src/shared/utils/util.service";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import { v4 as uuidv4 } from "uuid";
import {
  IHeaderSideBarProps,
  IHomeHeaderProps
} from "../interfaces/header.interface";
import { IBannerProps, IResponse } from "src/shared/shared.interface";
import { useResendVerificationEmailMutation } from "src/features/auth/service/auth.service";
import { addAuthUser } from "src/features/auth/reducers/auth.reducer";
import { updateHeader } from "../reducer/header.reducer";
import { updateCategoryContainer } from "../reducer/category.reducer";
import HeaderSearchInput from "./HeaderSearchInput";
import MessageDropdown from "./MessageDropdown";
import { socket } from "src/sockets/socket.service";
import { IMessageDocument } from "src/features/chat/service/interfaces/chat.interface";
import { updateNotification } from "../reducer/notification.reducer";
import { IOrderNotifcation } from "src/features/order/interfaces/order.interface";
import { filter, find } from "lodash";
import NotificationDropdown from "./NotificationDropdown";
import OrderDropdown from "./OrderDropdown";
import { useGetNotificationsByIdQuery } from "src/features/order/service/notification.service";

const Banner: React.LazyExoticComponent<React.FC<IBannerProps>> = React.lazy(
  () => import("src/shared/banner/Banner")
);
const SettingsDropdown: React.LazyExoticComponent<React.FC<IHomeHeaderProps>> =
  React.lazy(() => import("./SettingsDropdown"));
const MobileHeaderSearchInput: React.LazyExoticComponent<
  React.FC<IHeaderSideBarProps>
> = React.lazy(() => import("./mobile/MobileHeaderSearchInput"));
const HomeHeaderSidebar: React.LazyExoticComponent<
  React.FC<IHeaderSideBarProps>
> = React.lazy(() => import("./mobile/HomeHeaderSidebar"));

const HomeHeader: React.FC<IHomeHeaderProps> = ({
  showCategoryContainer
}): React.ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const logout = useAppSelector((state: IReduxState) => state.logout);
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
  const notification = useAppSelector(
    (state: IReduxState) => state.notification
  );
  const settingsDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const messageDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const notificationDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const orderDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const navElement = React.useRef<HTMLDivElement | null>(null);
  const [openSidebar, setOpenSidebar] = React.useState<boolean>(false);
  const [authUsername, setAuthUsername] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useGetNotificationsByIdQuery(
    authUser.username ?? "",
    { refetchOnMountOrArgChange: true }
  );
  const [resendEmail] = useResendVerificationEmailMutation();

  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] =
    useDetectOutsideClick(settingsDropdownRef, false);
  const [isMessageDropdownOpen, setIsMessageDropdownOpen] =
    useDetectOutsideClick(messageDropdownRef, false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useDetectOutsideClick(notificationDropdownRef, false);
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useDetectOutsideClick(
    orderDropdownRef,
    false
  );

  const onResendEmail = async (): Promise<void> => {
    try {
      const result: IResponse = await resendEmail({
        userId: authUser.id as number,
        email: `${authUser.email}`
      }).unwrap();
      dispatch(addAuthUser({ authInfo: result.user }));
      showSuccessToast("Email sent successfully.");
    } catch (error) {
      console.log(error);
      showErrorToast("Error sending email.");
    }
  };

  const toggleSettingsDropdown = (): void => {
    setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
    setIsMessageDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
    setIsOrderDropdownOpen(false);
  };

  const toggleMessageDropdown = (): void => {
    setIsMessageDropdownOpen(!isMessageDropdownOpen);
    setIsNotificationDropdownOpen(false);
    setIsOrderDropdownOpen(false);
    setIsSettingsDropdownOpen(false);
    dispatch(updateHeader("home"));
    dispatch(updateCategoryContainer(true));
  };

  const toggleOrdersDropdown = (): void => {
    setIsOrderDropdownOpen(!isOrderDropdownOpen);
    setIsMessageDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
    setIsSettingsDropdownOpen(false);
    dispatch(updateHeader("home"));
    dispatch(updateCategoryContainer(true));
  };

  const toggleNotificationDropdown = (): void => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsOrderDropdownOpen(false);
    setIsMessageDropdownOpen(false);
    setIsSettingsDropdownOpen(false);
    dispatch(updateHeader("home"));
    dispatch(updateCategoryContainer(true));
  };

  const slideLeft = (): void => {
    if (navElement.current) {
      const maxScrollLeft =
        navElement.current.scrollWidth + navElement.current.clientWidth; // maximum scroll position
      navElement.current.scrollLeft =
        navElement.current.scrollLeft < maxScrollLeft
          ? navElement.current.scrollLeft - 1000
          : maxScrollLeft;
    }
  };

  const slideRight = (): void => {
    if (navElement.current) {
      const maxScrollLeft =
        navElement.current.scrollWidth - navElement.current.clientWidth; // maximum scroll position
      navElement.current.scrollLeft =
        navElement.current.scrollLeft < maxScrollLeft
          ? navElement.current.scrollLeft + 1000
          : maxScrollLeft;
    }
  };

  useEffect(() => {
    // socketService.setupSocketConnection();
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
    socket.on("message_received", (data: IMessageDocument) => {
      // only for receiver
      if (data.receiverUsername === authUser.username && !data.isRead) {
        dispatch(updateNotification({ hasUnreadMessage: true }));
      }
    });

    socket.on("order_notification", (data: IOrderNotifcation) => {
      // only for receiver
      if (data.receiverUsername === authUser.username && !data.isRead) {
        dispatch(updateNotification({ hasUnreadNotification: true }));
      }
    });

    socket.on("online", (data: string[]) => {
      const userName = find(data, (name: string) => name === authUser.username);

      if (userName) {
        setAuthUsername(userName);
      }
    });
  }, [authUser.username, dispatch]);

  return (
    <React.Suspense>
      {openSidebar && <HomeHeaderSidebar setOpenSidebar={setOpenSidebar} />}

      <header>
        <nav className="navbar peer-checked:navbar-active relative z-[120] w-full border-b bg-white shadow-2xl shadow-gray-600/5 backdrop-blur">
          {!logout && !authUser?.emailVerified && (
            <Banner
              bgColor="bg-warning"
              showLink={true}
              linkText="Resend email"
              text="Please verify your email before you proceed."
              onClick={onResendEmail}
            />
          )}
          <div className="m-auto px-6 xl:container md:px-12 lg:px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 md:gap-0 md:py-3 lg:py-5">
              <div className="flex w-full gap-x-4 lg:w-1/2">
                <div className="hidden w-full md:flex">
                  <label
                    htmlFor="hbr"
                    className="peer-checked:hamburger relative z-20 -ml-4 block cursor-pointer p-6 lg:hidden"
                  >
                    <Button
                      className="m-auto flex h-0.5 w-5 items-center rounded transition duration-300"
                      onClick={() => setOpenSidebar(!openSidebar)}
                      label={
                        <>
                          {openSidebar ? (
                            <FaTimes className="h-6 w-6 text-sky-500" />
                          ) : (
                            <FaBars className="h-6 w-6 text-sky-500" />
                          )}
                        </>
                      }
                    />
                  </label>
                  <div className="w-full gap-x-4 md:flex">
                    <Link
                      to="/"
                      onClick={() => {
                        dispatch(updateHeader("home"));
                        dispatch(updateCategoryContainer(true));
                      }}
                      className="relative z-10 flex cursor-pointer justify-center self-center text-2xl font-semibold text-black lg:text-3xl"
                    >
                      Jobber
                    </Link>
                    <HeaderSearchInput />
                  </div>
                </div>
                <MobileHeaderSearchInput setOpenSidebar={setOpenSidebar} />
              </div>
              <div className="navmenu mb-16 hidden w-full cursor-pointer flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-300/20 dark:border-gray-700  dark:shadow-none md:flex-nowrap lg:m-0 lg:flex lg:w-6/12 lg:space-y-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                <div className="text-[#74767e] lg:pr-4">
                  <ul className="flex text-base font-medium">
                    <li className="relative z-50 flex cursor-pointer items-center">
                      <Button
                        className="px-4"
                        onClick={toggleNotificationDropdown}
                        label={
                          <>
                            <FaRegBell />
                            {notification &&
                              notification.hasUnreadNotification && (
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
                        <div className="absolute right-0 mt-5 w-96">
                          <NotificationDropdown
                            setIsNotificationDropdownOpen={
                              setIsNotificationDropdownOpen
                            }
                          />
                        </div>
                      </Transition>
                    </li>
                    <li className="relative z-50 flex cursor-pointer items-center">
                      <Button
                        className="relative px-4"
                        onClick={toggleMessageDropdown}
                        label={
                          <>
                            <FaRegEnvelope />
                            {notification.hasUnreadMessage && (
                              <span className="absolute -top-1 right-0 mr-2 inline-flex h-[6px] w-[6px] items-center justify-center rounded-full bg-[#ff62ab]"></span>
                            )}
                          </>
                        }
                      />
                      <Transition
                        ref={messageDropdownRef}
                        show={isMessageDropdownOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <div className="absolute right-0 mt-5 w-96">
                          <MessageDropdown />
                        </div>
                      </Transition>
                    </li>
                    <li
                      className="relative z-50 flex cursor-pointer items-center"
                      onClick={toggleOrdersDropdown}
                    >
                      <Button
                        className="px-3"
                        label={
                          <>
                            <span>Orders</span>
                          </>
                        }
                      />
                      <Transition
                        ref={orderDropdownRef}
                        show={isOrderDropdownOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <div className="absolute right-0 mt-5 w-96">
                          {authUsername === seller.username ? (
                            <OrderDropdown
                              seller={seller}
                              setIsOrderDropdownOpen={setIsOrderDropdownOpen}
                            />
                          ) : (
                            <OrderDropdown
                              buyer={buyer}
                              setIsOrderDropdownOpen={setIsOrderDropdownOpen}
                            />
                          )}
                        </div>
                      </Transition>
                    </li>
                    {!buyer?.isSeller && (
                      <li className="relative flex items-center">
                        <Link
                          to="/seller_onboarding"
                          className="relative ml-auto flex h-9 items-center justify-center rounded-full bg-sky-500 text-white font-bold sm:px-6 hover:bg-sky-400"
                        >
                          <span>Become a Seller</span>
                        </Link>
                      </li>
                    )}
                    <li className="relative z-50 flex cursor-pointer items-center">
                      <Button
                        className="relative flex gap-2 px-3 text-base font-medium"
                        type="button"
                        onClick={toggleSettingsDropdown}
                        label={
                          <>
                            <img
                              src={authUser.profilePicture ?? ""}
                              alt="profile"
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            {authUsername === authUser.username && (
                              <span className="absolute bottom-0 left-8 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400"></span>
                            )}
                            <span className="flex self-center">
                              {authUser.username}
                            </span>
                          </>
                        }
                      />
                      <Transition
                        ref={settingsDropdownRef}
                        show={isSettingsDropdownOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <div className="absolute z-50 mt-5 -right-16">
                          <SettingsDropdown
                            buyer={buyer}
                            seller={seller}
                            authUser={authUser}
                            type={buyer.isSeller ? "seller" : "buyer"}
                            setIsDropdownOpen={setIsSettingsDropdownOpen}
                          />
                        </div>
                      </Transition>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {showCategoryContainer && (
            <div className="border-grey z-40 hidden w-full border border-x-0 border-b-0 sm:flex">
              <div className="justify-left md:justify-left container mx-auto flex px-6 lg:justify-center">
                <span
                  className="flex w-auto cursor-pointer self-center pr-1 xl:hidden"
                  onClick={slideLeft}
                >
                  <FaAngleLeft size={20} />
                </span>
                <div
                  ref={navElement}
                  className="relative inline-block h-full w-full items-center gap-6 overflow-x-auto scroll-smooth whitespace-nowrap py-2 text-sm font-medium lg:flex lg:justify-between"
                >
                  {categories().map((category: string) => (
                    <span
                      key={uuidv4()}
                      className="mx-4 cursor-pointer first:ml-0 hover:text-sky-400 lg:mx-0"
                    >
                      <Link
                        to={`/categories/${replaceSpacesWithDash(category)}`}
                      >
                        {category}
                      </Link>
                    </span>
                  ))}
                </div>
                <span
                  className="flex w-auto cursor-pointer self-center pl-1 xl:hidden"
                  onClick={slideRight}
                >
                  <FaAngleRight size={20} />
                </span>
              </div>
            </div>
          )}
        </nav>
      </header>
    </React.Suspense>
  );
};

export default HomeHeader;
