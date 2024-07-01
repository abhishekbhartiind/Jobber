import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRoutes";
import { ToastContainer } from "react-toastify";
import useBeforeWindowUnload from "./shared/hook/useBeforeWindowUnload";
import { socketService } from "./sockets/socket.service";

function App(): React.ReactElement {
  React.useEffect(() => {
    socketService.setupSocketConnection();
  }, []);

  useBeforeWindowUnload();

  return (
    <>
      <BrowserRouter>
        <div className="w-fit sm:w-full min-h-screen flex flex-col relative">
          <AppRouter />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
