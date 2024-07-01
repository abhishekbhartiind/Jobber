import { find } from "lodash";
import {
  FC,
  LazyExoticComponent,
  Suspense,
  lazy,
  useRef,
  useState
} from "react";
import {
  Location,
  useLocation,
  useParams,
  useSearchParams
} from "react-router-dom";
import {
  categories,
  getDataFromLocalStorage,
  lowerCase,
  replaceAmpersandAndDashWithSpace,
  replaceDashWithSpaces,
  replaceSpacesWithDash,
  saveToLocalStorage
} from "src/shared/utils/util.service";
import { v4 as uuidv4 } from "uuid";

import {
  IGigCardItems,
  IGigPaginateProps,
  IGigsProps,
  ISellerGig
} from "../../interfaces/gig.interface";
import { useSearchGigsQuery } from "../../service/search.service";
import { IPageMessageProps } from "src/shared/shared.interface";

const ITEMS_PER_PAGE = 8;
const PageMessage: LazyExoticComponent<FC<IPageMessageProps>> = lazy(
  () => import("src/shared/page-message/PageMessage")
);
const CircularPageLoader: LazyExoticComponent<FC> = lazy(
  () => import("src/shared/page-loader/CircularPageLoader")
);
const BudgetDropdown: LazyExoticComponent<FC> = lazy(
  () => import("./components/BudgetDropdown")
);
const DeliveryTimeDropdown: LazyExoticComponent<FC> = lazy(
  () => import("./components/DeliveryTimeDropdown")
);
const GigCardDisplayItem: LazyExoticComponent<FC<IGigCardItems>> = lazy(
  () => import("src/shared/gigs/GigCardDisplayItem")
);
const GigPaginate: LazyExoticComponent<FC<IGigPaginateProps>> = lazy(
  () => import("src/shared/gigs/GigPaginate")
);

const Gigs: FC<IGigsProps> = ({ type }) => {
  const [itemFrom, setItemFrom] = useState<string>("0");
  const [paginationType, setPaginationType] = useState<string>("forward");
  const [searchParams] = useSearchParams();
  const { category } = useParams<string>();
  const location: Location = useLocation();
  const updatedSearchParams: URLSearchParams = new URLSearchParams(
    searchParams.toString()
  );

  const gigs = useRef<ISellerGig[]>([]);
  let totalGigs = 0;
  const filterApplied = getDataFromLocalStorage("filterApplied");
  const categoryName = find(categories(), (item: string) =>
    location.pathname.includes(replaceSpacesWithDash(`${lowerCase(`${item}`)}`))
  );
  const gigCategories = categoryName ?? searchParams.get("query");

  const queryType: string =
    type === "search"
      ? replaceDashWithSpaces(updatedSearchParams.toString())
      : `query=${replaceAmpersandAndDashWithSpace(`${lowerCase(category ?? "")}&${updatedSearchParams.toString()}`)}`;

  const { data, isSuccess, isLoading, isError } = useSearchGigsQuery({
    query: queryType,
    from: itemFrom,
    size: "8",
    type: paginationType
  });

  if (isSuccess) {
    gigs.current = data?.gigs!;
    totalGigs = data?.total ?? 0;
    saveToLocalStorage("filterApplied", JSON.stringify(false));
  }

  return (
    <Suspense>
      {isLoading && isSuccess ? (
        <CircularPageLoader />
      ) : (
        <div className="container mx-auto items-center p-5">
          {!isLoading && data?.gigs && data?.gigs.length > 0 ? (
            <>
              <h3 className="mb-5 flex gap-3 text-4xl">
                {type === "search" && (
                  <span className="text-black">Results for</span>
                )}
                <strong className="text-black">{gigCategories}</strong>
              </h3>
              <div className="mb-4 flex gap-4">
                <BudgetDropdown />
                <DeliveryTimeDropdown />
              </div>
              <div className="my-5">
                <div className="">
                  <span className="font-medium text-[#74767e]">
                    {data.total} services are available
                  </span>
                </div>
                {filterApplied ? (
                  <CircularPageLoader />
                ) : (
                  <div className="grid gap-x-6 pt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data?.gigs?.map((gig: ISellerGig) => (
                      <GigCardDisplayItem
                        key={uuidv4()}
                        gig={gig}
                        linkTarget={true}
                        showEditIcon={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <PageMessage
              header="No services found for your search"
              body="Try a new search or get a free quote for your project from our commnunity of freelancers."
            />
          )}
          {isError && (
            <PageMessage
              header="Services issue"
              body="A network issue occured. Try agin later."
            />
          )}
          {isSuccess &&
            !filterApplied &&
            data?.gigs &&
            data?.gigs.length > 0 && (
              <GigPaginate
                gigs={gigs.current}
                totalGigs={totalGigs}
                showNumbers={true}
                itemsPerPage={8}
                setItemFrom={setItemFrom}
                setPaginationType={setPaginationType}
              />
            )}
        </div>
      )}
    </Suspense>
  );
};

export default Gigs;
