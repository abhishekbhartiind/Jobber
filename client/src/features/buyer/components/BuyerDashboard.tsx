import React from "react";
import { useParams } from "react-router-dom";
import {
  IOrderDocument,
  IOrderTableProps
} from "src/features/order/interfaces/order.interface";
import { useGetOrdersByBuyerIdQuery } from "src/features/order/service/order.service";
import { orderTypes, shortenLargeNumbers } from "src/shared/utils/util.service";
import { socket, socketService } from "src/sockets/socket.service";

const BUYER_GIG_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  IN_PROGRESS: "in progress",
  DELIVERED: "delivered"
};

const BuyerTable: React.LazyExoticComponent<React.FC<IOrderTableProps>> =
  React.lazy(() => import("./BuyerTable"));

const BuyerDashboard: React.FC = (): React.ReactElement => {
  const [type, setType] = React.useState<string>(BUYER_GIG_STATUS.ACTIVE);
  const { buyerId } = useParams<string>();
  const { data, isSuccess } = useGetOrdersByBuyerIdQuery(`${buyerId}`);
  let orders: IOrderDocument[] = [];

  if (isSuccess) {
    orders = data.orders as IOrderDocument[];
  }

  React.useEffect(() => {
    //  socketService.setupSocketConnection();
    socket.emit("getLoggedInUsers", "");
  }, []);

  return (
    <div className="container mx-auto mt-8 px-6 md:px-12 lg:px-6">
      <div className="flex flex-col flex-wrap">
        <div className="mb-8 px-4 text-xl font-semibold text-black md:px-0 md:text-2xl lg:text-4xl">
          Manage Orders
        </div>
        <div className="p-0">
          <ul className="flex w-full cursor-pointer list-none flex-col flex-wrap rounded-[2px] sm:flex-none sm:flex-row">
            <li
              className="inline-block py-3 uppercase"
              onClick={() => setType(BUYER_GIG_STATUS.ACTIVE)}
            >
              <a
                href="#activeorders"
                className={`px-4 py-3 text-xs text-[#555555] no-underline sm:text-sm md:text-base ${type === BUYER_GIG_STATUS.ACTIVE ? "pb-[15px] outline outline-1 outline-[#e8e8e8] sm:rounded-t-lg" : ""}`}
              >
                Active
                {orderTypes(BUYER_GIG_STATUS.IN_PROGRESS, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {shortenLargeNumbers(
                      orderTypes(BUYER_GIG_STATUS.IN_PROGRESS, orders)
                    )}
                  </span>
                )}
              </a>
            </li>
            <li
              className="inline-block py-3 uppercase"
              onClick={() => setType(BUYER_GIG_STATUS.COMPLETED)}
            >
              <a
                href="#completedorders"
                className={`px-4 py-3 text-xs text-[#555555] no-underline sm:text-sm md:text-base ${type === BUYER_GIG_STATUS.COMPLETED ? "pb-[15px] outline outline-1 outline-[#e8e8e8] sm:rounded-t-lg" : ""}`}
              >
                Completed
                {orderTypes(BUYER_GIG_STATUS.COMPLETED, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {shortenLargeNumbers(
                      orderTypes(BUYER_GIG_STATUS.COMPLETED, orders)
                    )}
                  </span>
                )}
              </a>
            </li>
            <li
              className="inline-block py-3 uppercase"
              onClick={() => setType(BUYER_GIG_STATUS.CANCELLED)}
            >
              <a
                href="#cancelledorders"
                className={`px-4 py-3 text-xs text-[#555555] no-underline sm:text-sm md:text-base ${type === BUYER_GIG_STATUS.CANCELLED ? "pb-[15px] outline outline-1 outline-[#e8e8e8] sm:rounded-t-lg" : ""}`}
              >
                Cancelled
                {orderTypes(BUYER_GIG_STATUS.CANCELLED, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {shortenLargeNumbers(
                      orderTypes(BUYER_GIG_STATUS.CANCELLED, orders)
                    )}
                  </span>
                )}
              </a>
            </li>
          </ul>
        </div>

        <React.Suspense>
          {type === BUYER_GIG_STATUS.ACTIVE && (
            <BuyerTable
              type="in progress"
              orders={orders}
              orderTypes={orderTypes(BUYER_GIG_STATUS.IN_PROGRESS, orders)}
            />
          )}
          {type === BUYER_GIG_STATUS.COMPLETED && (
            <BuyerTable
              type="completed"
              orders={orders}
              orderTypes={orderTypes(BUYER_GIG_STATUS.COMPLETED, orders)}
            />
          )}
          {type === BUYER_GIG_STATUS.CANCELLED && (
            <BuyerTable
              type="cancelled"
              orders={orders}
              orderTypes={orderTypes(BUYER_GIG_STATUS.CANCELLED, orders)}
            />
          )}
        </React.Suspense>
      </div>
    </div>
  );
};

export default BuyerDashboard;
