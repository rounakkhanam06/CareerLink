// import Head from "next/head";
// import Image from "next/image";
// import { Geist, Geist_Mono } from "next/font/google";
import UserLayout from "@/layout/UserLayout";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";


export default function Home() {

  const router = useRouter();
  return (
    <UserLayout>
      <div className= {styles.container}>
        <div className= {styles.mainContainer}>
          
          <div className= {styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>A True social media platform, with no blufs !</p>
            
            <div onClick={ () =>{
              router.push("/login");
            }} className={styles.buttonJoin}>
              <p>Join Now</p>
            </div>

          </div>

          <div className= {styles.mainContainer_right}>
            <img src="images/homemain-connection.jpg"/>

          </div>
        </div>
      </div>

    </UserLayout>
   
  );
}
