
import React, { useEffect } from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptConnection,
  getConnectionRequest,
  getMyConnectionRequest,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth);
  const loggedInUserId = authState.user?._id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(getConnectionRequest({ token }));
    dispatch(getMyConnectionRequest({ token }));
  }, [dispatch]);

  const pendingRequests = (authState.connectionRequests || []).filter(
    (conn) => conn.status === "pending" && conn.userId
  );

  // Connected users: all accepted connections
  const connectedUsers = [
    ...(authState.connections || []),
    ...(authState.connectionRequests || []),
  ]
    .filter(
      (conn) => conn.status === "accepted" && conn.userId && conn.connectionId
    )
    .map((conn) =>
      conn.userId._id === loggedInUserId ? conn.connectionId : conn.userId
    )
    // Remove duplicates
    .filter(
      (user, index, self) =>
        user && user._id && index === self.findIndex((u) => u._id === user._id)
    );

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          {/* Pending Requests (Received/Incoming) */}
          {pendingRequests.length > 0 ? (
            pendingRequests.map(
              (conn, index) =>
                conn.userId && (
                  <div
                    key={index}
                    onClick={() =>
                      router.push(`/view_profile/${conn.userId.username}`)
                    }
                    className={styles.userCard}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1.2rem",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1.2rem",
                        }}
                      >
                        <div className={styles.profilePicture}>
                          <img
                            src={`${BASE_URL}/uploads/${conn.userId.profilePicture}`}
                            alt={conn.userId.name}
                          />
                        </div>
                        <div className={styles.userInfo}>
                          <h3>{conn.userId.name}</h3>
                          <p>@{conn.userId.username}</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className={styles.connectedButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(
                              acceptConnection({
                                connectionId: conn._id,
                                token: localStorage.getItem("token"),
                                action: "accept",
                              })
                            );
                            dispatch(
                              getMyConnectionRequest({
                                token: localStorage.getItem("token"),
                              })
                            );
                          }}
                        >
                          Accept
                        </button>

                        <p
                          className={styles.ignoreButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(
                              acceptConnection({
                                connectionId: conn._id,
                                token: localStorage.getItem("token"),
                                action: "rejected",
                              })
                            );
                          }}
                        >
                          Ignore
                        </p>
                      </div>
                    </div>
                  </div>
                )
            )
          ) : (
            <p
              style={{
                textAlign: "center",
                margin: "2rem 0",
                fontWeight: "bold",
                color: "#6b7280",
              }}
            >
              You have no pending connection requests!!
            </p>
          )}

          {/* Connected Section */}
          {connectedUsers.length > 0 && (
            <div className={styles.connectedSection}>
              <h4 style={{ marginTop: "3rem" }}>My Connections</h4>

              {connectedUsers.map(
                (user) =>
                  user && (
                    <div
                      key={user._id}
                      onClick={() =>
                        router.push(`/view_profile/${user.username}`)
                      }
                      className={styles.userCard}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1.2rem",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1.2rem",
                          }}
                        >
                          <div className={styles.profilePicture}>
                            <img
                              src={`${BASE_URL}/uploads/${user.profilePicture}`}
                              alt={user.name}
                            />
                          </div>
                          <div className={styles.userInfo}>
                            <h3>{user.name}</h3>
                            <p>@{user.username}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}