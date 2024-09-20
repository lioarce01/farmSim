import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void;
}
const LogoutButton: React.FC<ButtonProps> = ({children, onClick}) => {



  return (
    <Link href="/api/auth/logout">
      <button onClick={onClick} className="px-4 py-2 bg-red-500 text-white rounded">{children}</button>
    </Link>
  );
};

export default LogoutButton;