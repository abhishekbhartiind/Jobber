import {
  FC,
  lazy,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  useState
} from "react";
import Button from "src/shared/button/Button";
import { IModalProps } from "src/shared/modal/interfaces/modal.interface";

import { useCountDown } from "../hook/useCountDown";
import {
  IExtendedDateModalProps,
  IOrderDisplayModal,
  IOrderDocument
} from "../interfaces/order.interface";

const DeliverWorkModal: LazyExoticComponent<FC<IModalProps>> = lazy(
  () => import("src/shared/modal/DeliverWorkModal")
);
const ExtendDateModal: LazyExoticComponent<FC<IExtendedDateModalProps>> = lazy(
  () => import("src/shared/modal/ExtendDateModal")
);

const DeliveryTimer: FC<IModalProps> = ({ order, authUser }): ReactElement => {
  const [displayModal, setDisplayModal] = useState<IOrderDisplayModal>({
    deliverWork: false,
    extendDelivery: false
  });
  const [days, hours, minutes, seconds]: number[] = useCountDown(
    `${order?.offer.newDeliveryDate}`
  );

  return (
    <Suspense>
      {displayModal.extendDelivery && (
        <ExtendDateModal
          order={order as IOrderDocument}
          onClose={() =>
            setDisplayModal({ ...displayModal, extendDelivery: false })
          }
        />
      )}
      {displayModal.deliverWork && (
        <DeliverWorkModal
          order={order as IOrderDocument}
          onClose={() =>
            setDisplayModal({ ...displayModal, deliverWork: false })
          }
        />
      )}
      <div className="mb-6 flex flex-col gap-4 rounded-[4px] bg-white px-4 py-3">
        <div className="text-base font-bold">
          {!order?.delivered
            ? `Time left ${authUser?.username === order?.sellerUsername ? "to deliver" : "for delivery"}`
            : "Want to deliver again?"}
        </div>
        {!order?.delivered && (
          <div className="mb-1 flex justify-between text-center">
            <div className="flex flex-col text-sm font-bold md:text-base">
              {days}{" "}
              <span className="text-xs font-normal md:text-sm">days</span>
            </div>
            <div className="flex flex-col text-sm font-bold md:text-base">
              {hours}{" "}
              <span className="text-xs font-normal md:text-sm">hours</span>
            </div>
            <div className="flex flex-col text-sm font-bold md:text-base">
              {minutes}{" "}
              <span className="text-xs font-normal md:text-sm">minutes</span>
            </div>
            <div className="flex flex-col text-sm font-bold md:text-base">
              {seconds}{" "}
              <span className="text-xs font-normal md:text-sm">seconds</span>
            </div>
          </div>
        )}

        {authUser?.username === order?.sellerUsername && (
          <div className="flex w-full cursor-pointer flex-col gap-4">
            <Button
              className="w-full rounded bg-green-500 px-4 py-2 text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none md:text-base"
              label={`Deliver ${!order?.delivered ? "Now" : "Again"}`}
              onClick={() =>
                setDisplayModal({
                  ...displayModal,
                  deliverWork: !displayModal.deliverWork
                })
              }
            />
            {!order?.delivered && (
              <div
                className="mb-2 text-center text-sm underline"
                onClick={() =>
                  setDisplayModal({
                    ...displayModal,
                    extendDelivery: !displayModal.extendDelivery
                  })
                }
              >
                Extend delivery date
              </div>
            )}
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default DeliveryTimer;
