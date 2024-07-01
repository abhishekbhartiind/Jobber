import React from "react";
import { IHomeHeaderProps } from "../interfaces/header.interface";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { applicationLogout, lowerCase } from "src/shared/utils/util.service";
import { updateCategoryContainer } from "../reducer/category.reducer";
import { updateHeader } from "../reducer/header.reducer";
import { IReduxState } from "src/store/store.interface";

const SettingsDropdown: React.FC<IHomeHeaderProps> = ({
  seller,
  authUser,
  buyer,
  type,
  setIsDropdownOpen
}): React.ReactElement => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const header = useAppSelector((state: IReduxState) => state.header);

  const onLogout = (): void => {
    setIsDropdownOpen?.(false);

    applicationLogout(dispatch, navigate);
  };

  return (
    <div className="border-grey w-44 divide-y divide-gray-100 rounded border bg-white shadow-md">
      <ul
        className="text-gray-700s py-2 text-sm"
        aria-labelledby="avatarButton"
      >
        {buyer?.isSeller && (
          <li className="mx-3 mb-1">
            <Link
              to={`${header === "home" ? `/${lowerCase(`${authUser?.username}`)}/${seller?._id}/seller_dashboard` : "/"}`}
              className="block w-full cursor-pointer rounded bg-sky-500 px-4s py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none"
              onClick={() => {
                setIsDropdownOpen?.(false);
                dispatch(
                  updateHeader(header === "home" ? "sellerDashboard" : "home")
                );
                dispatch(updateCategoryContainer(header === "sellerDashboard"));
              }}
            >
              {header === "home" ? "Switch to Selling" : "Switch to Buying"}
            </Link>
          </li>
        )}

        {buyer?.isSeller && type === "seller" && (
          <li>
            <Link
              to={`/manage_gigs/new/${seller?._id}`}
              className="block px-4 py-2 hover:text-sky-400"
              onClick={() => {
                setIsDropdownOpen?.(false);
                dispatch(updateHeader("home"));
                dispatch(updateCategoryContainer(true));
              }}
            >
              Add a new gig
            </Link>
          </li>
        )}

        {!buyer?.isSeller && type === "buyer" && (
          <li>
            <Link
              to={`/users/${buyer?.username}/${buyer?._id}/orders`}
              className="block px-4 py-2 hover:text-sky-400"
              onClick={() => {
                setIsDropdownOpen?.(false);
                dispatch(updateHeader("home"));
                dispatch(updateCategoryContainer(true));
              }}
            >
              Dashboard
            </Link>
          </li>
        )}

        {buyer?.isSeller && type === "seller" && (
          <li>
            <Link
              to={`/seller_profile/${lowerCase(`${seller?.username}`)}/${seller?._id}/edit`}
              className="block px-4 py-2 hover:text-sky-400"
              onClick={() => {
                setIsDropdownOpen?.(false);
                dispatch(updateHeader("home"));
                dispatch(updateCategoryContainer(true));
              }}
            >
              Profile
            </Link>
          </li>
        )}

        <li>
          <Link
            to={`/${lowerCase(`${buyer?.username}/edit`)}`}
            className="block px-4 py-2 hover:text-sky-400"
            onClick={() => {
              setIsDropdownOpen?.(false);
              dispatch(updateHeader("home"));
              dispatch(updateCategoryContainer(false));
            }}
          >
            Settings
          </Link>
        </li>
      </ul>
      <div className="py-1">
        <div
          className="block px-4 py-2 text-sm hover:text-sky-400"
          onClick={() => onLogout()}
        >
          Sign out
        </div>
      </div>
    </div>
  );
};

export default SettingsDropdown;
