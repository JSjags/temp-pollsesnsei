import React from "react";
import Image from "next/image";
import ButtonOutline from "../common/ButtonOutline";
import ButtonDelete from "../common/ButtonDelete";
import { Modal } from "flowbite-react";
import close from "./close.svg";

interface PublishFaqProps {
  onClose: () => void;
  openModal: boolean;
  isLoading: boolean;
  onDelete?:()=>void;
}

const PublishFaq: React.FC<PublishFaqProps> = ({ onClose, openModal, onDelete, isLoading }) => {
  return (
    <Modals title="" openModal={openModal} modalSize="lg" onClose={onClose}>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-[#54595E] font-[700]">Publish</h2>
        <p className="text-center text-[#838383] text-[14px]">
          Are you sure you want to publish this?
        </p>
        <div className="mt-3 flex items-center justify-between w-full">
          <ButtonOutline label="No, cancel" onclick={onClose} />

          <ButtonOutline  label={isLoading ? "Waiting...": "Continue"} onclick={onDelete}/>
        </div>
      </div>
    </Modals>
  );
};

export default PublishFaq;

interface ModalsProps {
  title: string;
  openModal: boolean;
  modalSize: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modals: React.FC<ModalsProps> = ({
  title,
  openModal,
  modalSize,
  onClose,
  children,
}) => {
  return (
    <Modal
      show={openModal}
      size={modalSize}
      onClose={onClose}
      style={{
        borderRadius: "5.489px",
        // background: "rgba(0, 0, 0, 0.5)",
        padding: "0",
        zIndex: "100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Modal.Body>
        <div className="w-[450px] h-[225px] px-5 bg-white rounded">
          <div className="flex justify-between py-4">
            <p className="pl-8 text-[20px] font-bold font-Inter">{title}</p>
            <button
              className="bg-[#f9f9f9] rounded-full ring-0"
              onClick={onClose}
            >
              <Image
                src={close}
                alt="Close"
                width={24}
                height={24}
                className="bg-white"
              />
            </button>
          </div>
          {children}
        </div>
      </Modal.Body>
    </Modal>
  );
};
