import {
  FC,
  lazy,
  LazyExoticComponent,
  ReactElement,
  Suspense,
  useEffect,
  useRef,
  useState
} from "react";
import ChatList from "./chatList/ChatList";
import {
  IChatWindowProps,
  IMessageDocument
} from "../service/interfaces/chat.interface";
import { useParams } from "react-router-dom";
import { useGetUserMessagesQuery } from "../service/chat.service";
import { chatMessageReceived } from "../service/chat.util";

const ChatWindow: LazyExoticComponent<FC<IChatWindowProps>> = lazy(
  () => import("./chatWindow/ChatWindow")
);

const Chat: FC = (): ReactElement => {
  const { conversationId } = useParams<string>();
  const chatMessages = useRef<IMessageDocument[]>([]);
  const [chatMessagesData, setChatMessagesData] = useState<IMessageDocument[]>(
    []
  );
  const [skip, setSkip] = useState<boolean>(false);
  const { data, isSuccess, isLoading, isError } = useGetUserMessagesQuery(
    conversationId!,
    { skip }
  );

  useEffect(() => {
    if (isSuccess) {
      setChatMessagesData(data?.messages as IMessageDocument[]);
    }
  }, [isSuccess, data?.messages]);

  useEffect(() => {
    chatMessageReceived(
      conversationId!,
      chatMessagesData,
      chatMessages.current,
      setChatMessagesData
    );
  }, [chatMessagesData, conversationId]);

  return (
    <Suspense>
      <div className="border-grey mx-2 my-5 flex max-h-[90%] flex-wrap border lg:container lg:mx-auto">
        <div className="lg:border-grey relative w-full overflow-hidden lg:w-1/3 lg:border-r">
          <ChatList />
        </div>

        <div className="relative hidden w-full overflow-hidden md:w-2/3 lg:flex">
          {conversationId ? (
            <ChatWindow
              setSkip={setSkip}
              chatMessages={chatMessagesData}
              isLoading={isLoading}
              isError={isError}
            />
          ) : (
            <div className="flex w-full items-center justify-center">
              Select a user to chat with.
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default Chat;
