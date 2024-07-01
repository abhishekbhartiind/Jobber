import {
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
  useState
} from "react";
import { TimeAgo } from "src/shared/utils/timeago.util";

import { OrderContext } from "../../context/OrderContext";
import {
  DivElementRefType,
  IOrderActivitiesProps
} from "../../interfaces/order.interface";
import OrderDelivered from "./components/OrderDelivered";
import OrderExtension from "./components/OrderExtension";
import OrderPlaced from "./components/OrderPlaced";
import OrderReview from "./components/OrderReview";
import ChatBox from "src/features/chat/components/chatBox/ChatBox";
import {
  IChatSellerProps,
  IChatBuyerProps
} from "src/features/chat/service/interfaces/chat.interface";
import { useGetSellerByIdQuery } from "src/features/seller/service/seller.service";

const OrderActivities: ForwardRefExoticComponent<
  Omit<IOrderActivitiesProps, "ref"> & RefAttributes<HTMLDivElement>
> = forwardRef<DivElementRefType, IOrderActivitiesProps>((props, ref) => {
  const { order, authUser, viewDeliveryBtnClicked } = props;
  const { data } = useGetSellerByIdQuery(order.sellerId);
  const [showChatBox, setShowChatBox] = useState<boolean>(false);
  const chatSeller: IChatSellerProps = {
    username: `${order.sellerUsername}`,
    _id: `${order.sellerId}`,
    profilePicture: `${order.sellerImage}`,
    responseTime: data?.seller?.responseTime ?? 0
  };
  const chatBuyer: IChatBuyerProps = {
    username: `${order.buyerUsername}`,
    _id: `${order.buyerId}`,
    profilePicture: `${order.buyerImage}`
  };

  return (
    <div className="mb-3 mt-4 rounded-[4px] bg-white p-3">
      <div className="flex">
        <div className="my-5 rounded-full bg-[#e8e8e8] px-4 py-2 text-center text-sm font-bold">
          {TimeAgo.chatMessageTransform(`${order.dateOrdered}`)}
        </div>
      </div>
      <OrderContext.Provider
        value={{ order, authUser, viewDeliveryBtnClicked }}
      >
        <OrderPlaced />
        <OrderExtension />
        <OrderDelivered ref={ref} />
        <OrderReview />
      </OrderContext.Provider>
      <div className="px-3 pt-2 flex">
        If you need to contact the{" "}
        {order.buyerUsername === authUser.username ? "seller" : "buyer"},
        <div
          onClick={() => setShowChatBox((item: boolean) => !item)}
          className="px-2 text-blue-500 cursor-pointer hover:underline"
        >
          Go to Inbox
        </div>
      </div>
      {showChatBox && (
        <ChatBox
          seller={chatSeller}
          buyer={chatBuyer}
          gigId={order.gigId}
          onClose={() => setShowChatBox(false)}
        />
      )}
    </div>
  );
});

export default OrderActivities;
