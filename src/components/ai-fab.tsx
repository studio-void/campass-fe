import { IconX } from '@tabler/icons-react';

interface AIFabProps {
  isOpen: boolean;
  onClick: () => void;
}

function AIFab({ isOpen, onClick }: AIFabProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={onClick}
        className="bg-gradient-to-br from-primary to-secondary text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {isOpen ? (
          <IconX className="h-6 w-6 m-2" />
        ) : (
          <img
            src="/images/campass_white.svg"
            alt="AI Icon"
            className="h-6 w-6 m-2"
          />
        )}
      </button>
    </div>
  );
}

export default AIFab;
