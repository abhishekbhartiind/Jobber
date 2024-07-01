import React from "react";
import {
  IHeader,
  IHeaderModalProps,
  IHeaderSideBarProps
} from "../interfaces/header.interface";
import { Link } from "react-router-dom";
import { IButtonProps } from "src/shared/shared.interface";
import { FaBars, FaTimes } from "react-icons/fa";
import { IModalBgProps } from "src/shared/modal/interfaces/modal.interface";
import { saveToLocalStorage } from "src/shared/utils/util.service";

const Button: React.LazyExoticComponent<React.FC<IButtonProps>> = React.lazy(
  () => import("src/shared/button/Button")
);
const LoginModal: React.LazyExoticComponent<React.FC<IModalBgProps>> =
  React.lazy(() => import("src/features/auth/components/Login"));
const RegisterModal: React.LazyExoticComponent<React.FC<IModalBgProps>> =
  React.lazy(() => import("src/features/auth/components/Register"));
const ForgotPasswordModal: React.LazyExoticComponent<React.FC<IModalBgProps>> =
  React.lazy(() => import("src/features/auth/components/ForgotPassword"));
const HeaderSidebar: React.LazyExoticComponent<React.FC<IHeaderSideBarProps>> =
  React.lazy(() => import("../mobile/HeaderSidebar"));

const Header: React.FC<IHeader> = ({ navClass }): React.ReactElement => {
  const [showModal, setShowModal] = React.useState<IHeaderModalProps>({
    login: false,
    register: false,
    forgotPassword: false
  });

  const [openSidebar, setOpenSidebar] = React.useState<boolean>(false);

  return (
    <React.Suspense>
      {showModal.login && (
        <LoginModal
          onClose={() =>
            setShowModal((item: IHeaderModalProps) => ({
              ...item,
              login: false
            }))
          }
          onToggle={() =>
            setShowModal((item: IHeaderModalProps) => ({
              ...item,
              login: false,
              register: true
            }))
          }
          onTogglePassword={() =>
            setShowModal((item: IHeaderModalProps) => ({
              ...item,
              login: false,
              forgotPassword: true
            }))
          }
        />
      )}
      {showModal.register && (
        <RegisterModal
          onClose={() =>
            setShowModal((item: IHeaderModalProps) => ({
              ...item,
              register: false
            }))
          }
          onToggle={() =>
            setShowModal((item: IHeaderModalProps) => ({
              ...item,
              login: true,
              register: false
            }))
          }
        />
      )}
      {showModal.forgotPassword && (
        <ForgotPasswordModal
          onClose={() =>
            setShowModal((item: IHeaderModalProps) => ({
              ...item,
              forgotPassword: false
            }))
          }
          onToggle={() =>
            setShowModal((item: IHeaderModalProps) => ({
              ...item,
              login: true,
              forgotPassword: false
            }))
          }
        />
      )}
      {openSidebar && (
        <HeaderSidebar
          setShowLoginModal={setShowModal}
          setShowRegisterModal={setShowModal}
          setOpenSidebar={setOpenSidebar}
        />
      )}
      <header>
        <nav className={navClass}>
          <div className="m-auto px-6 xl:container md:px-12 lg:px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 md:gap-0 md:py-3 lg:py-5">
              <div className="flex w-full items-center justify-between lg:w-auto">
                <Link
                  to="/"
                  className="relative z-10 cursor-pointer text-3xl font-semibold text-white"
                >
                  Jobber
                </Link>
                <div className="peer-checked:hamburger relative z-20 -mr-6 block cursor-pointer p-6 lg:hidden">
                  <Button
                    className="m-auto h-0.5 w-5 rounded transition duration-300"
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
                </div>
              </div>
              <div className="navmenu mb-16 hidden w-full cursor-pointer flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-300/20 dark:border-gray-700  dark:shadow-none md:flex-nowrap lg:m-0 lg:flex lg:w-4/12 lg:space-y-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                <div className="text-gray-600 dark:text-gray-300 lg:pr-4">
                  <ul className="space-y-6 text-base font-medium tracking-wide lg:flex lg:space-y-0 lg:text-sm">
                    <li>
                      <div
                        className="hover:text-primary dark:hover:text-primaryLight block transition md:px-4"
                        onClick={() =>
                          setShowModal((item: IHeaderModalProps) => {
                            saveToLocalStorage(
                              "becomeASeller",
                              JSON.stringify(true)
                            );

                            return {
                              ...item,
                              register: true
                            };
                          })
                        }
                      >
                        <span>Become a Seller</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="border-primary/10 -ml-1 flex w-full flex-col space-y-2 dark:border-gray-700 sm:flex-row md:w-max lg:space-y-0 lg:border-l">
                  <div
                    className="relative ml-auto flex h-9 items-center justify-center before:absolute
                            before:inset-0 before:rounded-full before:transition before:duration-300
                            hover:before:scale-105 focus:before:bg-sky-600/10 active:duration-75 active:before:scale-95
                            dark:focus:before:bg-sky-400/10 sm:px-6"
                    onClick={() =>
                      setShowModal((item: IHeaderModalProps) => ({
                        ...item,
                        login: true
                      }))
                    }
                  >
                    <span className="relative text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Sign In
                    </span>
                  </div>
                  <div
                    className="relative ml-auto flex h-9 items-center justify-center rounded-full bg-sky-500
                            text-white font-bold sm:px-6 hover:bg-sky-400"
                    onClick={() =>
                      setShowModal((item: IHeaderModalProps) => ({
                        ...item,
                        register: true
                      }))
                    }
                  >
                    <span className="relative text-sm font-semibold text-white">
                      Sign Up
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </React.Suspense>
  );
};

export default Header;
