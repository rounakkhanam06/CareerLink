
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    getAllUsers,
    sendConnectionRequest,
    getConnectionRequest,
    getMyConnectionRequest,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./index.module.css";
import { useRouter } from "next/navigation";

export default function DiscoverPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const authState = useSelector((state) => state.auth);

   
    useEffect(() => {
        if (!authState.all_profiles_fetched) {
            dispatch(getAllUsers());
        }

        dispatch(getConnectionRequest({ token: localStorage.getItem("token") }));
        dispatch(getMyConnectionRequest({ token: localStorage.getItem("token") }));
    }, []);

    const getConnectionStatus = (userId) => {
        const allConnections = [
            ...authState.connections,
            ...authState.connectionRequests,
        ];

        const connection = allConnections.find(
            (conn) =>
                conn.connectionId?._id === userId ||
                conn.userId?._id === userId
        );

        if (!connection || connection.status === "rejected") {
            return "none";
        }

        return connection.status; // "pending" | "accepted"
    };

  
    const handleSendConnectionRequest = async (e, userId) => {
        e.stopPropagation();

        await dispatch(
            sendConnectionRequest({
                token: localStorage.getItem("token"),
                user_id: userId,
            })
        );

        dispatch(getConnectionRequest({ token: localStorage.getItem("token") }));
        dispatch(getMyConnectionRequest({ token: localStorage.getItem("token") }));
    };

    return (
        <UserLayout>
            <DashboardLayout>
                <div>
                    <h3 style={{paddingTop: "1rem", color: "grey"}}>Let's Discover People</h3>

                    <div className={styles.allUserprofile}>
                        {authState.all_profiles_fetched &&
                            authState.all_users.map((user) => {
                                const status = getConnectionStatus(
                                    user.userId._id
                                );

                                return (
                                    <div
                                        key={user._id}
                                        className={styles.userCard}
                                        onClick={() =>
                                            router.push(
                                                `/view_profile/${user.userId.username}`
                                            )
                                        }
                                    >
                                        <img
                                            className={styles.userCard_image}
                                            src={`${BASE_URL}/uploads/${user.userId.profilePicture}`}
                                            alt="profile"
                                        />

                                        <div>
                                            <h3>{user.userId.name}</h3>
                                            <p className={styles.truncateText}>
                                                {user.bio}
                                            </p>

                                            {/*Connection Button */}
                                            {status === "accepted" && (
                                                <button
                                                    className={
                                                        styles.connectedButton
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    Connected
                                                </button>
                                            )}

                                            {status === "pending" && (
                                                <button
                                                    className={
                                                        styles.pendingButton
                                                    }
                                                    disabled
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    Pending
                                                </button>
                                            )}

                                            {status === "none" && (
                                                <button
                                                    className={
                                                        styles.connectButton
                                                    }
                                                    onClick={(e) =>
                                                        handleSendConnectionRequest(
                                                            e,
                                                            user.userId._id
                                                        )
                                                    }
                                                >
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}
