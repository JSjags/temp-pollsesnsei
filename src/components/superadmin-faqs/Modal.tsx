interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        {children}
        <button
          className="text-red-600 text-sm mt-4"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};