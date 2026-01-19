import { useNavigate } from "react-router-dom";
import ClientsView from "@/components/ClientsView";

const Clients = () => {
  const navigate = useNavigate();

  return <ClientsView onBack={() => navigate("/dashboard/income")} />;
};

export default Clients;
