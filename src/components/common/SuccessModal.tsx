import { FiCheckCircle, FiX } from "react-icons/fi";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const SuccessModal = ({ isOpen, onClose, title = "Thành công!", message = "Thao tác đã được thực hiện thành công." }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col items-center p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={20} />
        </button>
        <FiCheckCircle className="text-[#16A34A] w-16 h-16 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-center text-gray-500 mb-6 text-sm">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-5 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
