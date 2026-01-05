import { useRouter } from 'next/router'
import styles from './styles.module.css'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { reset } from '@/config/redux/reducer/authReducer';

export default function navbarComponent(){

    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    return(
      <div className={styles.container}>
        <nav className={styles.navbar}>
            
            <h1 style= {{cursor: "pointer"}} onClick={()=>{
                router.push("/")
            }}>careerLink</h1>

            <div className ={styles.navBarOptionContainer}>

                {authState.profileFetched && <div> 

                    <div style={{display: "flex", gap: "1.2rem"}}>
                    {/* <p>Hyy, {authState.user?.name}</p> */}
                    <p onClick ={()=>{
                        router.push("/profile")
                    }} style={{fontWeight: "bold", cursor: "pointer"}}>Profile</p>
                     <p onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/login");
                        dispatch(reset());

                     }} style={{fontWeight: "bold", cursor: "pointer"}}>Logout</p>
                    </div>

                    </div>}

                {!authState.profileFetched && 
                <div onClick={()=>{
                    router.push("/login")
                }} className={styles.buttonJoin}>
                    <p>Be a part</p>
                </div>
                }

            </div>
        </nav>
      </div>
    )

}

