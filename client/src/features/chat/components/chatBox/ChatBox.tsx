import {
  ChangeEvent,
  FC,
  FormEvent,
  lazy,
  LazyExoticComponent,
  ReactElement,
  RefObject,
  Suspense,
  useEffect,
  useRef,
  useState
} from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import Button from "src/shared/button/Button";
import TextInput from "src/shared/input/TextInput";
import { IResponse } from "src/shared/shared.interface";
import {
  convertDateTimeHourAndMinutes,
  generateRandomNumber,
  showErrorToast
} from "src/shared/utils/util.service";
import { useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import { v4 as uuidv4 } from "uuid";

import useChatScrollToBottom from "../../hook/useChatScrollToBottom";
import {
  IChatBoxProps,
  IConversationDocument,
  IMessageDocument
} from "../../service/interfaces/chat.interface";
import {
  useGetConversationQuery,
  useGetMessagesQuery,
  useSaveChatMessageMutation
} from "../../service/chat.service";
import { TimeAgo } from "src/shared/utils/timeago.util";
import { chatMessageReceived } from "../../service/chat.util";
import { Link } from "react-router-dom";

const ChatBoxSkeleton: LazyExoticComponent<FC> = lazy(
  () => import("./ChatBoxSkeleton")
);

const ChatBox: FC<IChatBoxProps> = ({
  seller,
  buyer,
  gigId,
  onClose
}): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [message, setMessage] = useState<string>("");
  const chatMessages = useRef<IMessageDocument[]>([]);
  const [chatMessagesData, setChatMessagesData] = useState<IMessageDocument[]>(
    []
  );
  const conversationIdRef = useRef<string>(generateRandomNumber(15).toString());
  const { data: conversationData, isSuccess: isConversationSuccess } =
    useGetConversationQuery({
      senderUsername: seller.username,
      receiverUsername: buyer.username
    });
  const {
    data: messageData,
    isLoading: isMessageLoading,
    isSuccess: isMessageSuccess
  } = useGetMessagesQuery(
    { senderUsername: seller.username, receiverUsername: buyer.username },
    { refetchOnMountOrArgChange: true }
  );

  if (
    isConversationSuccess &&
    conversationData.conversations &&
    conversationData.conversations.length
  ) {
    conversationIdRef.current = (
      conversationData.conversations[0] as IConversationDocument
    ).conversationId;
  }

  const scrollRef: RefObject<HTMLDivElement> =
    useChatScrollToBottom(chatMessagesData);
  const [saveChatMessage] = useSaveChatMessageMutation();

  const sendMessage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!message) {
      return;
    }
    try {
      const messageBody: IMessageDocument = {
        conversationId: conversationIdRef.current,
        hasConversationId:
          conversationData?.conversations &&
          conversationData?.conversations.length > 0,
        body: message,
        gigId,
        sellerId: seller._id,
        buyerId: buyer._id,
        senderUsername:
          authUser.username === seller.username
            ? seller.username
            : buyer.username,
        senderPicture:
          authUser.username === seller.username
            ? seller.profilePicture
            : buyer.profilePicture,
        receiverUsername:
          authUser.username !== seller.username
            ? seller.username
            : buyer.username,
        receiverPicture:
          authUser.username !== seller.username
            ? seller.profilePicture
            : buyer.profilePicture,
        isRead: false,
        hasOffer: false
      };
      const response: IResponse = await saveChatMessage(messageBody).unwrap();
      setMessage("");
      conversationIdRef.current = response.conversationId ?? "";
    } catch (error) {
      showErrorToast("Error sending message.");
    }
  };

  useEffect(() => {
    if (isMessageSuccess) {
      setChatMessagesData(messageData?.messages as IMessageDocument[]);
    }
  }, [isMessageSuccess, messageData?.messages]);

  useEffect(() => {
    chatMessageReceived(
      conversationIdRef.current,
      chatMessagesData,
      chatMessages.current,
      setChatMessagesData
    );
  }, [chatMessagesData, conversationIdRef]);

  return (
    <Suspense>
      {isMessageLoading && !chatMessages ? (
        <ChatBoxSkeleton />
      ) : (
        <div className="border-grey fixed bottom-0 left-2 right-2 h-[400px] max-h-[500px] w-auto border bg-white md:left-8 md:h-96 md:max-h-[500px] md:w-96">
          <div className="border-grey flex items-center space-x-4 border-b px-5 py-2">
            <img
              src={
                authUser.username !== seller.username
                  ? seller.profilePicture
                  : buyer.profilePicture
              }
              className="h-10 w-10 rounded-full"
              alt="profile image"
            />
            <div className="w-full font-medium text-[#777d74]">
              <div className="flex w-full cursor-pointer justify-between text-sm font-bold text-[#777d74] md:text-base">
                <span>
                  {authUser.username !== seller.username
                    ? seller.username
                    : buyer.username}
                </span>
                <FaTimes className="flex self-center" onClick={onClose} />
              </div>
              <div className="text-xs text-gray-500">
                Avg. response time:
                {seller.responseTime === 0
                  ? " unknown"
                  : ` ${seller.responseTime} hour ${seller.responseTime === 1 ? "" : "s"}`}
              </div>
            </div>
          </div>

          <div className="h-[500px] overflow-y-scroll md:h-full">
            <div
              className="my-2 flex h-[280px] flex-col overflow-y-scroll px-2 md:h-[72%]"
              ref={scrollRef}
            >
              {chatMessagesData.map((msg: IMessageDocument) => (
                <div
                  key={uuidv4()}
                  className={`my-2 flex max-w-[300px] gap-y-6 text-sm ${
                    msg.senderUsername === authUser.username
                      ? "flex-row-reverse self-end"
                      : ""
                  }`}
                >
                  <div className="flex-col">
                    {msg.body === "Here's your custom offer" ? (
                      <Link
                        className={`max-w-[200px] rounded-[10px] bg-[#e4e6eb] px-4 py-1 text-start text-sm font-normal md:max-w-[220px] text-sky-500 underline block ${
                          msg.senderUsername === authUser.username
                            ? "bg-sky-500 text-white"
                            : ""
                        }`}
                        to={`/inbox/${seller.username}/${msg.conversationId}`}
                      >
                        {msg.body}
                      </Link>
                    ) : (
                      <p
                        className={`max-w-[200px] rounded-[10px] bg-[#e4e6eb] px-4 py-1 text-start text-sm font-normal md:max-w-[220px] ${
                          msg.senderUsername === authUser.username
                            ? "bg-sky-500 text-white"
                            : ""
                        }`}
                      >
                        {msg.body}
                      </p>
                    )}

                    <span className="ml-1 text-[10px]">
                      {TimeAgo.transform(msg.createdAt!.toString())}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={sendMessage}
            className="absolute bottom-0 left-0 right-0 mb-1 flex px-2 "
          >
            <TextInput
              type="text"
              name="message"
              value={message}
              placeholder="Enter your message..."
              className="border-grey mb-0 w-full rounded-l-lg border p-2 text-sm font-normal text-gray-600 focus:outline-none"
              onChange={(event: ChangeEvent) =>
                setMessage((event.target as HTMLInputElement).value)
              }
            />
            <Button
              className="rounded-r-lg bg-sky-500 px-6 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-3 md:text-base"
              label={<FaPaperPlane className="self-center" />}
              type="submit"
            />
          </form>
        </div>
      )}
    </Suspense>
  );
};

export default ChatBox;
