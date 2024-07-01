import {
  FC,
  lazy,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  useEffect,
  useState
} from "react";
import equal from "react-fast-compare";
import { useParams } from "react-router-dom";
import {
  IGigViewReviewsProps,
  ISellerGig
} from "src/features/gigs/interfaces/gig.interface";
import { IReviewDocument } from "src/features/order/interfaces/review.interface";
import Breadcrumb from "src/shared/breadcrumb/Breadcrumb";
import Button from "src/shared/button/Button";
import CircularPageLoader from "src/shared/page-loader/CircularPageLoader";
import { IResponse } from "src/shared/shared.interface";

import { IReduxState } from "src/store/store.interface";
import { v4 as uuidv4 } from "uuid";

import {
  IProfileHeaderProps,
  ISellerDocument
} from "../../interfaces/seller.interface";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import { useAppDispatch, useAppSelector } from "src/store/store";
import { useUpdateSellerMutation } from "../../service/seller.service";
import {
  showErrorToast,
  showSuccessToast
} from "src/shared/utils/util.service";
import { addSeller } from "../../reducer/seller.reducer";
import { useGetGigsBySellerIdQuery } from "src/features/gigs/service/gig.service";
import GigCardDisplayItem from "src/shared/gigs/GigCardDisplayItem";
import { useGetReviewsBySellerIdQuery } from "src/features/order/service/review.service";

const GigViewReviews: LazyExoticComponent<FC<IGigViewReviewsProps>> = lazy(
  () =>
    import(
      "src/features/gigs/components/view/components/GigViewLeft/GigViewReviews"
    )
);
const SellerOverview: LazyExoticComponent<FC<IProfileHeaderProps>> = lazy(
  () => import("./components/SellerOverview")
);

const CurrentSellerProfile: FC = (): ReactElement => {
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const [sellerProfile, setSellerProfile] = useState<ISellerDocument>(seller);
  const [showEdit, setShowEdit] = useState<boolean>(true);
  const [type, setType] = useState<string>("Overview");
  const { sellerId } = useParams();
  const dispatch = useAppDispatch();
  const {
    data,
    isSuccess: isSellerGigSuccess,
    isLoading: isSellerGigLoading
  } = useGetGigsBySellerIdQuery(`${sellerId}`);
  const {
    data: sellerData,
    isSuccess: isGigReviewSuccess,
    isLoading: isGigReviewLoading
  } = useGetReviewsBySellerIdQuery(`${sellerId}`);
  const [updateSeller, { isLoading }] = useUpdateSellerMutation();
  let reviews: IReviewDocument[] = [];

  if (isGigReviewSuccess) {
    reviews = sellerData.reviews as IReviewDocument[];
  }

  const isDataLoading: boolean =
    isSellerGigLoading &&
    isGigReviewLoading &&
    !isSellerGigSuccess &&
    !isGigReviewSuccess;

  const onUpdateSeller = async (): Promise<void> => {
    try {
      const response: IResponse = await updateSeller({
        sellerId: `${sellerId}`,
        seller: sellerProfile
      }).unwrap();
      dispatch(addSeller(response.seller));
      setSellerProfile(response.seller as ISellerDocument);
      setShowEdit(false);
      showSuccessToast("Seller profile updated successfully.");
    } catch (error) {
      showErrorToast("Error updating profile.");
    }
  };

  useEffect(() => {
    const isEqual: boolean = equal(sellerProfile, seller);
    setShowEdit(isEqual);
  }, [seller, sellerProfile]);

  return (
    <Suspense>
      <div className="relative w-full pb-6">
        <Breadcrumb breadCrumbItems={["Seller", `${seller.username}`]} />
        {isLoading || isDataLoading ? (
          <CircularPageLoader />
        ) : (
          <div className="container mx-auto px-2 md:px-0">
            <div className="my-2 flex h-8 justify-end md:h-10">
              {!showEdit && (
                <div>
                  <Button
                    className="md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-2"
                    label="Submit Update"
                    onClick={onUpdateSeller}
                  />
                  &nbsp;&nbsp;
                  <Button
                    className="md:text-md rounded bg-red-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-red-500 focus:outline-none md:py-2"
                    label="Cancel"
                    onClick={() => {
                      setShowEdit(false);
                      setSellerProfile(seller);
                      dispatch(addSeller(seller));
                    }}
                  />
                </div>
              )}
            </div>
            <ProfileHeader
              sellerProfile={sellerProfile}
              setSellerProfile={setSellerProfile}
              showHeaderInfo={true}
              showEditIcons={true}
            />
            <div className="my-4 cursor-pointer">
              <ProfileTabs type={type} setType={setType} />
            </div>

            <div className="flex flex-wrap bg-white">
              {type === "Overview" && (
                <SellerOverview
                  sellerProfile={sellerProfile}
                  setSellerProfile={setSellerProfile}
                  showEditIcons={true}
                />
              )}
              {type === "Active Gigs" && (
                <div className="grid gap-x-6 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {data?.gigs?.map((gig: ISellerGig) => (
                    <GigCardDisplayItem
                      key={uuidv4()}
                      gig={gig}
                      linkTarget={false}
                      showEditIcon={true}
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

export default CurrentSellerProfile;
