import { FC, ReactElement, useContext, useState } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { SellerContext } from "src/features/seller/context/SellerContext";
import { ICertificate } from "src/features/seller/interfaces/seller.interface";
import { v4 as uuidv4 } from "uuid";

import CertificateEditFields from "./CertificateEditFields";
import isEqual from "react-fast-compare";

const Certifications: FC = (): ReactElement => {
  const [showCertificateAddForm, setShowCertificateAddForm] =
    useState<boolean>(false);
  const [showCertificateEditForm, setShowCertificateEditForm] =
    useState<boolean>(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<ICertificate>();
  const { sellerProfile, setSellerProfile, showEditIcons } =
    useContext(SellerContext);

  const handleRemove = (certificate: ICertificate) => {
    const indexFoundedCertificate = sellerProfile.certificates.findIndex(
      (item: ICertificate) => isEqual(item, certificate)
    );

    if (indexFoundedCertificate >= 0) {
      const certificates = sellerProfile.certificates.toSpliced(
        indexFoundedCertificate,
        1
      );
      setSellerProfile?.({ ...sellerProfile, certificates });
    }
  };

  return (
    <div className="border-grey mt-6 border bg-white">
      <div className="mb-1 flex justify-between border-b">
        <h4 className="flex py-2.5 pl-3.5 text-sm font-bold text-[#161c2d] md:text-base">
          CERTIFICATIONS
        </h4>
        {showEditIcons &&
          !showCertificateAddForm &&
          !showCertificateEditForm && (
            <span
              onClick={() => {
                setShowCertificateAddForm(!showCertificateAddForm);
                setShowCertificateEditForm(false);
              }}
              className="flex cursor-pointer items-center pr-3.5 text-sm text-[#00698c] md:text-base"
            >
              Add New
            </span>
          )}
      </div>
      <ul className="mb-0 list-none pt-1.5">
        {showCertificateAddForm && (
          <li className="flex justify-between">
            <CertificateEditFields
              type="add"
              setShowCertificateAddForm={setShowCertificateAddForm}
            />
          </li>
        )}
        {!showCertificateAddForm && (
          <>
            {sellerProfile?.certificates.map((certificate: ICertificate) => (
              <li key={uuidv4()} className="mb-2 flex justify-between">
                {!showCertificateEditForm && (
                  <div className="col-span-3 ml-4 flex flex-col pb-3 text-sm md:text-base">
                    <div className="mr-3 font-bold ">{certificate.name}</div>
                    <div className="mr-3 font-normal">
                      {certificate.from} - {certificate.year}
                    </div>
                  </div>
                )}
                {showCertificateEditForm &&
                  isEqual(selectedCertificate, certificate) && (
                    <CertificateEditFields
                      type="edit"
                      selectedCertificate={selectedCertificate}
                      setShowCertificateEditForm={setShowCertificateEditForm}
                    />
                  )}
                {!showCertificateEditForm && showEditIcons && (
                  <div className="mr-4 flex gap-4 mt-1">
                    <FaPencilAlt
                      onClick={() => {
                        setShowCertificateAddForm(false);
                        setShowCertificateEditForm(!showCertificateEditForm);
                        setSelectedCertificate(certificate);
                      }}
                      size="12"
                      className="cursor-pointer"
                    />

                    <FaTrashAlt
                      onClick={() => handleRemove(certificate)}
                      size="12"
                      className="cursor-pointer"
                    />
                  </div>
                )}
              </li>
            ))}
          </>
        )}

        {sellerProfile.certificates.length === 0 &&
          !showCertificateAddForm &&
          !showCertificateEditForm && (
            <li className="flex justify-between mb-2 ml-4">No information</li>
          )}
      </ul>
    </div>
  );
};

export default Certifications;
