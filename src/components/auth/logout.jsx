import { useEffect } from "react";
import { logout } from "./authServiceV2";
import { useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import { getCurrentOrg } from '../../components/auth/authServiceV2'

const Logout = () => {
  const router = useRouter();
  const { mode } = useSelector((state) => ({
    mode: state.clientData.mode
  }));

  useEffect(() => {
    const currentOrg = getCurrentOrg();
    if (mode) {
      router.push(`org/${currentOrg?.id}/dashboard`);
      return;
    }
    const redirectURI = "/login";
    logout(redirectURI);
  }, [mode]);

  return null;
};

export default Logout;