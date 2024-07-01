import {
  FC,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  lazy,
  useState
} from "react";
import {
  FaEllipsisH,
  FaPauseCircle,
  FaPencilAlt,
  FaPlayCircle,
  FaRegStar,
  FaStar,
  FaTrashAlt
} from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import {
  IGigsProps,
  ISellerGig
} from "src/features/gigs/interfaces/gig.interface";
import {
  useDeleteGigMutation,
  useUpdateActiveGigMutation
} from "src/features/gigs/service/gig.service";
import {
  lowerCase,
  rating,
  replaceSpacesWithDash,
  showErrorToast,
  showSuccessToast
} from "src/shared/utils/util.service";
import { useAppDispatch } from "src/store/store";

import { updateHeader } from "../header/reducer/header.reducer";
import { IGigCardItemModal } from "../shared.interface";
import {
  IApprovalModalContent,
  IModalProps
} from "../modal/interfaces/modal.interface";

const ApprovalModal: LazyExoticComponent<FC<IModalProps>> = lazy(
  () => import("src/shared/modal/ApprovalModal")
);

const GigCardItem: FC<IGigsProps> = ({
  gig: gigData,
  setFlag
}): ReactElement => {
  const gig = gigData!;
  const [gigCardItemModal, setGigCardItemModal] = useState<IGigCardItemModal>({
    overlay: false,
    deleteApproval: false
  });
  const [approvalModalContent, setApprovalModalContent] =
    useState<IApprovalModalContent>();
  const navigate: NavigateFunction = useNavigate();
  const dispatch = useAppDispatch();
  const title: string = replaceSpacesWithDash(gig.title);
  const [updateActiveGig] = useUpdateActiveGigMutation();
  const [deleteGig] = useDeleteGigMutation();

  const navigateToEditGig = (gigId: string): void => {
    setGigCardItemModal({ ...gigCardItemModal, overlay: false });
    dispatch(updateHeader("home"));
    navigate(`/manage_gigs/edit/${gigId}`, { state: gig });
  };

  const onToggleGig = async (active: boolean): Promise<void> => {
    try {
      await updateActiveGig({ gigId: gig.id!, active }).unwrap();
      setGigCardItemModal({ ...gigCardItemModal, overlay: false });
      showSuccessToast("Gig status updated successfully.");
    } catch (error) {
      showErrorToast("Error setting gig status.");
    }
  };

  const onDeleteGig = async (): Promise<void> => {
    try {
      await deleteGig({
        gigId: gig.id ?? "",
        sellerId: gig.sellerId ?? ""
      }).unwrap();
      setGigCardItemModal({ deleteApproval: false, overlay: false });
      showSuccessToast("Gig deleted successfully.");
      setFlag?.((prev) => !prev);
    } catch (error) {
      showErrorToast("Error deleting gig.");
    }
  };

  return (
    <Suspense>
      {gigCardItemModal.deleteApproval && (
        <ApprovalModal
          approvalModalContent={approvalModalContent}
          onClick={onDeleteGig}
          onClose={() =>
            setGigCardItemModal({ ...gigCardItemModal, deleteApproval: false })
          }
        />
      )}
      <div className="relative">
        {gigCardItemModal.overlay && (
          <div className="border-grey absolute bottom-0 top-0 mb-8 w-full cursor-pointer border bg-white z-30">
            <div
              onClick={() =>
                setGigCardItemModal({ ...gigCardItemModal, overlay: false })
              }
              className="absolute -right-[12px] -top-[12px] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-sky-500 bg-white text-sm font-bold leading-[0] text-sky-500"
            >
              X
            </div>
            <ul className="list-none pl-0">
              <li className="bg-slate-200 py-1">
                <div
                  onClick={() => navigateToEditGig(`${gig.id}`)}
                  className="my-1 flex w-full cursor-pointer gap-4 px-4"
                >
                  <FaPencilAlt size={13} className="flex self-center" />
                  <span className="">Edit</span>
                </div>
              </li>
              <li className="bg-white py-1">
                <div
                  onClick={() => onToggleGig(!gig.active)}
                  className="my-1 flex w-full cursor-pointer gap-4 px-4"
                >
                  {!gig.active ? (
                    <FaPlayCircle size={13} className="flex self-center" />
                  ) : (
                    <FaPauseCircle size={13} className="flex self-center" />
                  )}
                  <span>{!gig.active ? "Activate" : "Inactive"}</span>
                </div>
              </li>
              <li className="bg-slate-200 py-1">
                <div
                  onClick={() => {
                    setApprovalModalContent({
                      header: "Delete this Gig",
                      body: "Are you sure you want to permanently delete this gig?",
                      btnText: "Delete",
                      btnColor: "bg-red-500"
                    });
                    setGigCardItemModal({
                      ...gigCardItemModal,
                      deleteApproval: true
                    });
                  }}
                  className="my-1 flex w-full cursor-pointer gap-4 px-4"
                >
                  <FaTrashAlt size={13} className="flex self-center" />
                  <span className="">Delete</span>
                </div>
              </li>
            </ul>
          </div>
        )}
        <div className="border-grey mb-8 flex cursor-pointer flex-col gap-2 border">
          <Link
            onClick={() => dispatch(updateHeader("home"))}
            to={`/gig/${lowerCase(`${gig.username}`)}/${title}/${gig.sellerId}/${gig.id}/view`}
            className="m-auto"
          >
            <LazyLoadImage
              src={gig.coverImage}
              alt="Gig cover image"
              className="w-52 h-28"
              wrapperClassName=""
              placeholderSrc="https://placehold.co/330x220?text=Profile+Image"
              effect="blur"
            />
          </Link>
          <div className="px-2">
            <Link
              onClick={() => dispatch(updateHeader("home"))}
              to={`/gig/${lowerCase(`${gig.username}`)}/${title}/${gig.sellerId}/${gig.id}/view`}
            >
              <p className="line-clamp-2 text-[#404145] hover:text-sky-500">
                {gig.basicDescription}
              </p>
            </Link>
          </div>
          <div className="flex gap-2 px-2 text-orange-400">
            {parseInt(`${gig.ratingsCount}`) > 0 ? (
              <FaStar color="orange" className="mt-1" />
            ) : (
              <FaRegStar className="mt-1" />
            )}
            (
            {rating(
              parseInt(`${gig.ratingSum}`) / parseInt(`${gig.ratingsCount}`)
            )}
            )
          </div>
          <div className="flex justify-between px-2 pb-2">
            <FaEllipsisH
              size={14}
              className="self-center"
              onClick={() =>
                setGigCardItemModal({ ...gigCardItemModal, overlay: true })
              }
            />
            <strong className="text-base font-normal">${gig.price}</strong>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default GigCardItem;
