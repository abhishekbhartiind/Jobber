import React from "react";
import { useRoutes, RouteObject } from "react-router-dom";
import { IProtectedRouteProps } from "./features/ProtectedRoute";
import AppPage from "./features/AppPage";
import { IGigsProps } from "./features/gigs/interfaces/gig.interface";

const ResetPassword: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/auth/components/ResetPassword")
);
const ConfirmEmail: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/auth/components/ConfirmEmail")
);
const Home: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/home/components/Home")
);
const Error: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/error/Error")
);
const ProtectedRoute: React.LazyExoticComponent<
  React.FC<IProtectedRouteProps>
> = React.lazy(() => import("./features/ProtectedRoute"));
const BuyerDashboard: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/buyer/components/BuyerDashboard")
);
const Settings: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/setting/components/Settings")
);
const CurrentSellerProfile: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/seller/components/profile/CurrentSellerProfile")
);
const SellerProfile: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/seller/components/profile/SellerProfile")
);
const AddSeller: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/seller/components/add/AddSeller")
);
const Seller: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/seller/components/dashboard/Seller")
);
const SellerDashboard: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/seller/components/dashboard/SellerDashboard")
);
const ManageOrders: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/seller/components/dashboard/ManageOrders")
);
const ManageEarnings: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/seller/components/dashboard/ManageEarnings")
);
const Gigs: React.LazyExoticComponent<React.FC<IGigsProps>> = React.lazy(
  () => import("./features/gigs/components/gigs/Gigs")
);
const GigsIndexDisplay: React.LazyExoticComponent<React.FC<IGigsProps>> =
  React.lazy(() => import("./features/index/gig-tabs/GigsIndexDisplay"));
const GigInfoDisplay: React.LazyExoticComponent<React.FC<IGigsProps>> =
  React.lazy(() => import("./features/index/gig-tabs/GigInfoDisplay"));
const AddGig: React.LazyExoticComponent<React.FC<IGigsProps>> = React.lazy(
  () => import("./features/gigs/components/gig/AddGig")
);
const EditGig: React.LazyExoticComponent<React.FC<IGigsProps>> = React.lazy(
  () => import("./features/gigs/components/gig/EditGig")
);
const GigView: React.LazyExoticComponent<React.FC<IGigsProps>> = React.lazy(
  () => import("./features/gigs/components/view/GigView")
);
const Chat: React.LazyExoticComponent<React.FC<IGigsProps>> = React.lazy(
  () => import("./features/chat/components/Chat")
);
const Checkout: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/order/components/Checkout")
);
const Requirement: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./features/order/components/Requirement")
);
const Order: React.LazyExoticComponent<React.FC<IGigsProps>> = React.lazy(
  () => import("./features/order/components/Order")
);

const Layout = ({
  backgroundColor = "#fff",
  children
}: {
  backgroundColor: string;
  children: React.ReactNode;
}): JSX.Element => (
  <div style={{ backgroundColor }} className="flex flex-grow">
    {children}
  </div>
);

const AppRouter: React.FC = () => {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: <AppPage />
    },
    {
      path: "/",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Home />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/reset_password",
      element: (
        <React.Suspense>
          <ResetPassword />
        </React.Suspense>
      )
    },
    {
      path: "/confirm_email",
      element: (
        <React.Suspense>
          <ConfirmEmail />
        </React.Suspense>
      )
    },
    {
      path: "/users/:username/:buyerId/orders",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <BuyerDashboard />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/:username/edit",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Settings />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/search/categories/:category",
      element: (
        <React.Suspense>
          <Layout backgroundColor="#ffffff">
            <GigsIndexDisplay type="categories" />
          </Layout>
        </React.Suspense>
      )
    },
    {
      path: "/gigs/search",
      element: (
        <React.Suspense>
          <Layout backgroundColor="#ffffff">
            <GigsIndexDisplay type="search" />
          </Layout>
        </React.Suspense>
      )
    },
    {
      path: "/gig/:gigId/:title",
      element: (
        <React.Suspense>
          <Layout backgroundColor="#ffffff">
            <GigInfoDisplay />
          </Layout>
        </React.Suspense>
      )
    },
    {
      path: "/manage_gigs/new/:sellerId",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <AddGig />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/manage_gigs/edit/:gigId",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <EditGig />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/gig/:username/:title/:sellerId/:gigId/view",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <GigView />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/categories/:category",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Gigs type="categories" />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/search/gigs",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Gigs type="search" />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/seller_onboarding",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <AddSeller />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/seller_profile/:username/:sellerId/edit",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <CurrentSellerProfile />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/seller_profile/:username/:sellerId/view",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <SellerProfile />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/:username/:sellerId",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Seller />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      ),
      children: [
        {
          path: "seller_dashboard",
          element: <SellerDashboard />
        },
        {
          path: "manage_orders",
          element: <ManageOrders />
        },
        {
          path: "manage_earnings",
          element: <ManageEarnings />
        }
      ]
    },
    {
      path: "/inbox",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fff">
              <Chat />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/inbox/:username/:conversationId",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fff">
              <Chat />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/gig/checkout/:gigId",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Checkout />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/gig/order/requirement/:gigId",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Requirement />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "/orders/:orderId/activities",
      element: (
        <React.Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#f5f5f5">
              <Order />
            </Layout>
          </ProtectedRoute>
        </React.Suspense>
      )
    },
    {
      path: "*",
      element: (
        <React.Suspense>
          <Error />
        </React.Suspense>
      )
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
