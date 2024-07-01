import React from "react";
import HomeSlider from "./HomeSlider";
import { IReduxState } from "src/store/store.interface";
import { ISellerDocument } from "src/features/seller/interfaces/seller.interface";
import {
  IGigTopProps,
  ISellerGig
} from "src/features/gigs/interfaces/gig.interface";
import FeaturedExperts from "./FeaturedExperts";
import { useAppSelector } from "src/store/store";
import { IHomeProps } from "../interfaces/home.interface";
import { useGetRandomSellersQuery } from "src/features/seller/service/seller.service";
import {
  useGetGigsByCategoryQuery,
  useGetTopRatedGigsByCategoryQuery
} from "src/features/gigs/service/gig.service";
import { lowerCase } from "lodash";
import { socketService } from "src/sockets/socket.service";

const HomeGigsView: React.LazyExoticComponent<React.FC<IHomeProps>> =
  React.lazy(() => import("./HomeGigsView"));
const TopGigsView: React.LazyExoticComponent<React.FC<IGigTopProps>> =
  React.lazy(() => import("src/shared/gigs/TopGigsView"));

const Home: React.FC = (): React.ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { data, isSuccess } = useGetRandomSellersQuery("10");
  const { data: categoryData, isSuccess: isCategorySuccess } =
    useGetGigsByCategoryQuery(authUser.username?.toString() ?? "", {
      refetchOnMountOrArgChange: true
    });
  const { data: topGigsData, isSuccess: isTopGigsSuccess } =
    useGetTopRatedGigsByCategoryQuery(authUser.username?.toString() ?? "");
  let sellers: ISellerDocument[] = [];
  let categoryGigs: ISellerGig[] = [];
  let topGigs: ISellerGig[] = [];

  if (isSuccess) {
    sellers = data.sellers as ISellerDocument[];
  }

  if (isCategorySuccess) {
    categoryGigs = categoryData.gigs as ISellerGig[];
  }

  if (isTopGigsSuccess) {
    topGigs = topGigsData.gigs as ISellerGig[];
  }

  React.useEffect(() => {
    // socketService.setupSocketConnection();
  }, []);

  return (
    <React.Suspense>
      <div className="m-auto px-6 w-screen relative min-h-screen xl:container md:px-12 lg:px-6">
        <HomeSlider />
        {topGigs.length > 0 && (
          <TopGigsView
            gigs={topGigs}
            title="Top rated services in"
            subTitle={`Highest rated talents for all your ${lowerCase(topGigs[0].categories)} needs.`}
            category={topGigs[0].categories}
            width="w-72"
            type="home"
          />
        )}
        {categoryGigs.length > 0 && (
          <HomeGigsView
            gigs={categoryGigs}
            title="Because you viewed a gig on"
            subTitle=""
            category={categoryGigs[0].categories}
          />
        )}
        {/* <HomeGigsView
          gigs={categoryGigs}
          title="Because you viewed a gig on"
          subTitle=""
          category="Programming & Tech"
        /> */}
        <FeaturedExperts sellers={sellers} />
      </div>
    </React.Suspense>
  );
};

export default Home;
