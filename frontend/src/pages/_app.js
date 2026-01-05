import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "../config/redux/store";

export default function App({ Component, pageProps }) {
  return <>
      <Provider store={store}> 
      <div className="pageWrapper">
        <Component {...pageProps} /> 
      </div>
      </Provider>
  </>
 
}
