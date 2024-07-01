import {
  FC,
  lazy,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  useState
} from "react";
import { useParams } from "react-router-dom";
import {
  IGigViewReviewsProps,
  ISellerGig
} from "src/features/gigs/interfaces/gig.interface";
import { IReviewDocument } from "src/features/order/interfaces/review.interface";
import Breadcrumb from "src/shared/breadcrumb/Breadcrumb";
import CircularPageLoader from "src/shared/page-loader/CircularPageLoader";
import { v4 as uuidv4 } from "uuid";

import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import { useGetSellerByIdQuery } from "../../service/seller.service";
import { useGetGigsBySellerIdQuery } from "src/features/gigs/service/gig.service";
import GigCardDisplayItem from "src/shared/gigs/GigCardDisplayItem";
import { useGetReviewsBySellerIdQuery } from "src/features/order/service/review.service";
import { IProfileHeaderProps } from "../../interfaces/seller.interface";

const GigViewReviews: LazyExoticComponent<FC<IGigViewReviewsProps>> = lazy(
  () =>
    import(
      "src/features/gigs/components/view/components/GigViewLeft/GigViewReviews"
    )
);
const SellerOverview: LazyExoticComponent<FC<IProfileHeaderProps>> = lazy(
  () => import("./components/SellerOverview")
);

const SellerProfile: FC = (): ReactElement => {
  const [type, setType] = useState<string>("Overview");
  const { sellerId } = useParams();
  const {
    data: sellerData,
    isLoading: isSellerLoading,
    isSuccess: isSellerSuccess
  } = useGetSellerByIdQuery(`${sellerId}`);
  const {
    data: gigData,
    isSuccess: isSellerGigSuccess,
    isLoading: isSellerGigLoading
  } = useGetGigsBySellerIdQuery(`${sellerId}`);
  const {
    data: sellerReviewsData,
    isSuccess: isGigReviewSuccess,
    isLoading: isGigReviewLoading
  } = useGetReviewsBySellerIdQuery(`${sellerId}`);
  let reviews: IReviewDocument[] = [];
  if (isGigReviewSuccess) {
    reviews = sellerReviewsData.reviews as IReviewDocument[];
  }

  const isLoading: boolean =
    isSellerGigLoading &&
    isSellerLoading &&
    isGigReviewLoading &&
    !isSellerSuccess &&
    !isSellerGigSuccess &&
    !isGigReviewSuccess;

  return (
    <Suspense>
      <div className="relative w-full pb-6">
        <Breadcrumb
          breadCrumbItems={[
            "Seller",
            `${sellerData && sellerData.seller ? sellerData.seller.username : ""}`
          ]}
        />
        {isLoading ? (
          <CircularPageLoader />
        ) : (
          <div className="container mx-auto px-2 md:px-0">
            <ProfileHeader
              sellerProfile={sellerData?.seller}
              showHeaderInfo={true}
              showEditIcons={false}
            />
            <div className="my-4 cursor-pointer">
              <ProfileTabs type={type} setType={setType} />
            </div>

            <div className="flex flex-wrap bg-white">
              {type === "Overview" && (
                <SellerOverview
                  sellerProfile={sellerData?.seller}
                  showEditIcons={false}
                />
              )}
              {type === "Active Gigs" && (
                <div className="grid gap-x-6 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {gigData?.gigs?.map((gig: ISellerGig) => (
                    <GigCardDisplayItem
                      key={uuidv4()}
                      gig={gig}
                      linkTarget={false}
                      showEditIcon={false}
                    />
                  ))}
                </div>
              )}
              {type === "Ratings & Reviews" && (
                <GigViewReviews
                  showRatings={false}
                  reviews={reviews}
                  hasFetchedReviews={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default SellerProfile;
