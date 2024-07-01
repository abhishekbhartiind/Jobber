import React from "react";
import { IHeader } from "src/shared/header/interfaces/header.interface";
import CircularPageLoader from "src/shared/page-loader/CircularPageLoader";
import { saveToSessionStorage } from "src/shared/utils/util.service";

const IndexHeader: React.LazyExoticComponent<React.FC<IHeader>> = React.lazy(
  () => import("src/shared/header/components/Header")
);
const Hero: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./Hero")
);
const GigTabs: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./gig-tabs/GigTabs")
);
const HowItWorks: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./HowItWorks")
);
const Categories: React.LazyExoticComponent<React.FC> = React.lazy(
  () => import("./Categories")
);

const Index: React.FC = (): React.ReactElement => {
  React.useEffect(() => {
    saveToSessionStorage(JSON.stringify(false), JSON.stringify(""));
  }, []);

  return (
    <div className="flex flex-col">
      <React.Suspense fallback={<CircularPageLoader />}>
        <IndexHeader navClass="navbar peer-checked:navbar-active fixed z-20 w-full border-b border-gray-100 bg-white/90 shadow-2xl shadow-gray-600/5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none" />
        <Hero />
        <GigTabs />
        <HowItWorks />
        <hr />
        <Categories />
      </React.Suspense>
    </div>
  );
};

export default Index;
