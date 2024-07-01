import { FC } from "react";
import { SellerContext } from "src/features/seller/context/SellerContext";
import {
  IProfileHeaderProps,
  ISellerDocument
} from "src/features/seller/interfaces/seller.interface";

import AboutMe from "./overview/AboutMe";
import Certifications from "./overview/Certifications";
import Description from "./overview/Description";
import Education from "./overview/Education";
import Experience from "./overview/Experience";
import Language from "./overview/Language";
import Skills from "./overview/Skills";
import SocialLinks from "./overview/SocialLinks";

const SellerOverview: FC<IProfileHeaderProps> = ({
  sellerProfile,
  setSellerProfile,
  showEditIcons
}) => {
  return (
    <SellerContext.Provider
      value={{
        showEditIcons,
        setSellerProfile,
        sellerProfile: sellerProfile as ISellerDocument
      }}
    >
      <div className="w-full py-4 lg:w-1/3">
        <Language />
        <AboutMe />
        <SocialLinks />
        <Certifications />
      </div>

      <div className="w-full pl-4 py-4 lg:w-2/3">
        <Description />
        <Experience />
        <Education />
        <Skills />
      </div>
    </SellerContext.Provider>
  );
};

export default SellerOverview;
