import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface ChangeSurveyStatusProps {
  onClose: () => void;
  openModal: boolean;
  isClosing?: boolean;
  onCloseSurvey?: () => void;
}

const ChangeSurveyStatus: React.FC<ChangeSurveyStatusProps> = ({
  onClose,
  openModal,
  onCloseSurvey,
  isClosing,
}) => {
  return (
    <AlertDialog open={openModal} onOpenChange={onClose}>
      <AlertDialogContent
        className="sm:max-w-[425px] z-[100000]"
        overlayClassName="z-[100000]"
      >
        <AlertDialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                Close survey?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500">
                Are you sure you want to stop this survey from receiving
                responses? Note that this cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end gap-3 pt-4">
          <AlertDialogCancel onClick={onClose} className="hover:bg-gray-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onCloseSurvey}
            disabled={isClosing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isClosing ? "Closing..." : "Close Survey"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeSurveyStatus;
