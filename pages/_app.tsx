import { AppProps } from "next/app";
import "../styles/tailwind.css";
import "../styles/global.scss";
import Navbar from "../components/navBar";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 pt-3 pb-12">
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
