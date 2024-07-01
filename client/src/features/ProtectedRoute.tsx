import {
  FC,
  ReactElement,
  ReactNode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useState
} from "react";
import { Navigate, NavigateFunction, useNavigate } from "react-router-dom";
import {
  applicationLogout,
  saveToSessionStorage
} from "src/shared/utils/util.service";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";

import { addAuthUser } from "./auth/reducers/auth.reducer";
import { useCheckCurrentUserQuery } from "./auth/service/auth.service";
import { IHomeHeaderProps } from "src/shared/header/interfaces/header.interface";

export interface IProtectedRouteProps {
  children: ReactNode;
}

const HomeHeader: React.LazyExoticComponent<FC<IHomeHeaderProps>> = lazy(
  () => import("src/shared/header/components/HomeHeader")
);

const ProtectedRoute: FC<IProtectedRouteProps> = ({
  children
}): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const showCategoryContainer = useAppSelector(
    (state: IReduxState) => state.showCategoryContainer
  );
  const header = useAppSelector((state: IReduxState) => state.header);
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const { data, isError } = useCheckCurrentUserQuery();

  const checkUser = useCallback(async () => {
    if (data && data.user) {
      setTokenIsValid(true);
      dispatch(addAuthUser({ authInfo: data.user }));
      saveToSessionStorage(
        JSON.stringify(true),
        JSON.stringify(authUser.username)
      );
    }

    if (isError) {
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [data, dispatch, navigate, isError, authUser.username]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (data?.user || authUser) {
    if (tokenIsValid) {
      return (
        <Suspense>
          {/* && header == "home" */}
          {header && header == "home" && (
            <HomeHeader showCategoryContainer={showCategoryContainer} />
          )}
          {children}
        </Suspense>
      );
    } else {
      return <></>;
    }
  } else {
    return <>{<Navigate to="/" />}</>;
  }
};

export default ProtectedRoute;
