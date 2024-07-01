import React from "react";
import Index from "./index/Index";
import { IReduxState } from "src/store/store.interface";
import { NavigateFunction, useNavigate } from "react-router-dom";
import {
  applicationLogout,
  getDataFromLocalStorage,
  saveToSessionStorage
} from "src/shared/utils/util.service";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { useCheckCurrentUserQuery } from "./auth/service/auth.service";
import { addAuthUser } from "./auth/reducers/auth.reducer";
import CircularPageLoader from "src/shared/page-loader/CircularPageLoader";
import { IHomeHeaderProps } from "src/shared/header/interfaces/header.interface";
import { useGetCurrentBuyerByUsernameQuery } from "./buyer/service/buyer.service";
import { addBuyer } from "./buyer/reducer/buyer.reducer";
import { useGetSellerByUsernameQuery } from "./seller/service/seller.service";
import { addSeller } from "./seller/reducer/seller.reducer";
import { socket } from "src/sockets/socket.service";

const HomeHeader: React.LazyExoticComponent<React.FC<IHomeHeaderProps>> =
  React.lazy(() => import("src/shared/header/components/HomeHeader"));
const Home: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("src/features/home/components/Home")
);

const AppPage: React.FC = (): React.ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const appLogout = useAppSelector((state: IReduxState) => state.logout);
  const showCategoryContainer = useAppSelector(
    (state: IReduxState) => state.showCategoryContainer
  );
  const [tokenIsValid, setTokenIsValid] = React.useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const { data: currentUserData, isError } = useCheckCurrentUserQuery(
    undefined,
    {
      skip: authUser.id === null
    }
  );
  const { data: buyerData, isLoading: isBuyerLoading } =
    useGetCurrentBuyerByUsernameQuery(undefined, {
      skip: authUser.id === null
    });
  const { data: sellerData, isLoading: isSellerLoading } =
    useGetSellerByUsernameQuery(`${authUser.username}`, {
      skip: authUser.id === null
    });

  const checkUser = React.useCallback(() => {
    try {
      if (currentUserData?.user && !appLogout) {
        setTokenIsValid(true);
        dispatch(addAuthUser({ authInfo: currentUserData.user }));
        // dispatch buyer info
        dispatch(addBuyer(buyerData?.buyer));
        // dispatch seller info
        dispatch(addSeller(sellerData?.seller));

        saveToSessionStorage(
          JSON.stringify(true),
          JSON.stringify(authUser.username)
        );

        const becomeASeller = getDataFromLocalStorage(
          "becomeASeller"
        ) as boolean;

        if (becomeASeller) {
          navigate("/seller_onboarding");
        }

        if (authUser.username) {
          socket.emit("loggedInUsers", authUser.username);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    currentUserData,
    dispatch,
    navigate,
    appLogout,
    authUser.username,
    buyerData,
    sellerData
  ]);

  const logoutUser = React.useCallback(() => {
    if ((!currentUserData && appLogout) || isError) {
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [currentUserData, dispatch, navigate, appLogout, isError]);

  React.useEffect(() => {
    checkUser();
    logoutUser();
  }, [checkUser, logoutUser]);

  if (authUser) {
    return (
      <React.Suspense>
        {!tokenIsValid && !authUser.id ? (
          <Index />
        ) : (
          <>
            {isBuyerLoading && isSellerLoading ? (
              <CircularPageLoader />
            ) : (
              <>
                <HomeHeader showCategoryContainer={showCategoryContainer} />
                <Home />
              </>
            )}
          </>
        )}
      </React.Suspense>
    );
  } else {
    return (
      <React.Suspense>
        <Index />
      </React.Suspense>
    );
  }
};

export default AppPage;
