import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    // Asegúrate de que returnTo sea correcto y que esté definido
    logout({
      returnTo: window.location.origin, // Asegúrate de que esto sea lo que necesitas
    } as any); // Forzar el tipo como una solución temporal
  };

  return (
    <div className="items-center px-4 py-2 text-white bg-[#d6635f] rounded-2xl hover:bg-[#e76b67] transition duration-300">
      <button onClick={handleLogout} className="px-2 font-bold">
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;