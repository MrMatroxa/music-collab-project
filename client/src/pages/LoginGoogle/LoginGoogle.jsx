import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/auth.context";

export function LoginGoogle() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  useEffect(() => {
    if (code) {
      axios
        .post(`${import.meta.env.VITE_SERVER_URL}/api/auth/google`, {
          code,
        })
        .then((res) => {
          storeToken(res.data.authToken);
          authenticateUser();
          navigate("/");
        })
        .catch((err) => console.log(err));
      return;
    }
    window.location.replace(
      `${import.meta.env.VITE_SERVER_URL}/api/auth/google`
    );
  }, [code]);

  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}
