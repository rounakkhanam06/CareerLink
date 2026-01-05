import { BASE_URL } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    sendConnectionRequest,
    getConnectionRequest,
    getMyConnectionRequest,
} from "@/config/redux/action/authAction";
import { useRouter } from "next/router";
import { clientServer } from "@/config";

export default function ViewProfilePage({ userProfile }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    const [connectionStatus, setConnectionStatus] = useState("none"); 
    const [recentPost, setRecentPost] = useState(null);

    useEffect(() => {
        const fetchConnections = async () => {
            const token = localStorage.getItem("token");
            await Promise.all([
                dispatch(getConnectionRequest({ token })),
                dispatch(getMyConnectionRequest({ token })),
            ]);
        };
        fetchConnections();
    }, [dispatch]);

    useEffect(() => {
        const allConnections = [
            ...authState.connections,          // outgoing
            ...authState.connectionRequests,  // incoming
        ];

        const connection = allConnections.find(
            (conn) =>
                conn.connectionId?._id === userProfile.userId._id ||
                conn.userId?._id === userProfile.userId._id
        );

        setConnectionStatus(!connection || connection.status === "rejected" ? "none" : connection.status);
    }, [authState.connections, authState.connectionRequests, userProfile.userId._id]);

    const handleSendConnectionRequest = async () => {
        const token = localStorage.getItem("token");
        await dispatch(sendConnectionRequest({ token, user_id: userProfile.userId._id }));
        await Promise.all([
            dispatch(getConnectionRequest({ token })),
            dispatch(getMyConnectionRequest({ token })),
        ]);
    };

    // Fetch recent post
    useEffect(() => {
        if (!userProfile?.userId?._id) return;

        fetch(`${BASE_URL}/recent-post?userId=${userProfile.userId._id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch recent post");
                return res.json();
            })
            .then((data) => setRecentPost(data.data || null))
            .catch((err) => {
                console.error("Error fetching recent post:", err);
                setRecentPost(null);
            });
    }, [userProfile]);
   

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.container}>
                    {/* Backdrop */}
                   
                    <div
                        className={styles.backDropContainer}
                        style={{
                            backgroundImage: userProfile.userId?.backdrop
                                ? `url(${BASE_URL}/uploads/${userProfile.userId.backdrop})`
                                : `url('https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg')`,
                        }}
                    >
                        <img
                            className={styles.backDrop}
                            src={`${BASE_URL}/uploads/${userProfile.userId.profilePicture}`}
                            alt="profile"
                        />
                    </div>

                  

                    {/* Profile Details */}
                    <div className={styles.profileContainer_details}>
                        <div style={{ display: "flex", gap: "0.7rem" }}>
                            <div style={{ flex: "0.8" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <h2 className={styles.name}>{userProfile.userId.name}</h2>
                                    <p style={{ color: "grey", margin: "0.4rem" }}>@{userProfile.userId.username}</p>
                                </div>

                                {/* Connection Button & Resume */}
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    {connectionStatus === "accepted" && (
                                        <button className={styles.connectedButton}>Connected</button>
                                    )}
                                    {connectionStatus === "pending" && (
                                        <button className={styles.pendingButton} disabled>Pending</button>
                                    )}
                                    {connectionStatus === "none" && (
                                        <button onClick={handleSendConnectionRequest} className={styles.connectBtn}>
                                            Connect
                                        </button>
                                    )}

                                    {/* Resume Download */}
                                    <div
                                        onClick={() => window.open(
                                            `${BASE_URL}/user/download_resume?user_id=${userProfile.userId._id}`,
                                            "_blank"
                                        )}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <svg style={{ width: "1.3em" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                    </div>
                                </div>

                                <p className={styles.bio}>{userProfile.bio}</p>
                            </div>

                            {/* Recent Activity */}
                            <div style={{ flex: "0.35" }} className="truncate">
                                <h4 style={{ paddingLeft: "5rem" }}>Recent Activity</h4>
                                {recentPost ? (
                                    <div className={styles.postCard}>
                                        <div className={styles.card}>
                                            <div className={styles.card_profileContainer}>
                                                {recentPost.media ? (
                                                    <img src={`${BASE_URL}/uploads/${recentPost.media}`} alt="recent post" />
                                                ) : (
                                                    <div style={{ width: "3.4rem", height: "3.4rem" }} />
                                                )}
                                            </div>
                                            <p className={styles.truncateText}>{recentPost.body}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: "gray" }}>No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Work History */}
                    {userProfile.pastWork?.length > 0 && (
                        <div className="workHistory">
                            <h4>Work History</h4>
                            <div className={styles.workHistoryContainer}>
                                {userProfile.pastWork.map((work, index) => (
                                    <div key={index} className={styles.workHistoryCard}>
                                        <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                            {work.company} - {work.role}
                                        </p>
                                        <p>{work.years}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {userProfile.education?.length > 0 && (
                        <div className="workHistory">
                            <h4>Education</h4>
                            <div className={styles.workHistoryContainer}>
                                {userProfile.education.map((edu, index) => (
                                    <div key={index} className={styles.workHistoryCard}>
                                        <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                            {edu.institution} - {edu.degree}
                                        </p>
                                        <p>{edu.fieldOfStudy}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}

// Server-side fetch
export async function getServerSideProps(context) {
    const { username } = context.query;

    if (!username || username === "undefined") {
        return { notFound: true };
    }

    try {
        const request = await clientServer.get("/user/get_profile_based_on_username", { params: { username } });
        return { props: { userProfile: request.data.profile } };
    } catch (error) {
        if (error.response?.status === 404) return { notFound: true };
        throw error;
    }
}
