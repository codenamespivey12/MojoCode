import { FaEllipsisV } from "react-icons/fa";

interface EllipsisButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function EllipsisButton({ onClick }: EllipsisButtonProps) {
  return (
    <button data-testid="ellipsis-button" type="button" onClick={onClick}>
      <FaEllipsisV className="fill-neutral-400" />
    </button>
  );
}
