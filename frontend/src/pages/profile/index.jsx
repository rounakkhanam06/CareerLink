import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import styles from "./index.module.css";
import { BASE_URL, clientServer } from "@/config";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser } from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ProfilePage() {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const postReducer = useSelector((state) => state.posts);
    const [userProfile, setUserProfile] = useState({});
    const [userPosts, setUserPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputData, setInputData] = useState({ company: "", role: "", years: "" });
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [recentPost, setRecentPost] = useState(null);
    const [educationInput, setEducationInput] = useState({
        institution: "",
        degree: "",
        fieldOfStudy: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [editingWorkIndex, setEditingWorkIndex] = useState(null);
    const [editingEducationIndex, setEditingEducationIndex] = useState(null);

    

    const handleWorkInputChange = (e) => {
        const { name, value } = e.target;
        setInputData({ ...inputData, [name]: value });
    };

    const handleEducationChange = (e) => {
        const { name, value } = e.target;
        setEducationInput({ ...educationInput, [name]: value });
    };

    useEffect(() => {
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        dispatch(getAllPosts());
    }, [dispatch]);

    useEffect(() => {
        if (authState.user && authState.profile) {
            setUserProfile({
                ...authState.profile,
                userId: authState.user,
                backdrop: authState.profile.backdrop || ''
            });

            const posts = postReducer.posts.filter(
                (post) => post.userId?._id === authState.user._id
            );

            setUserPosts(posts);
        }
    }, [authState.user, authState.profile, postReducer.posts]);

    const updateProfilePicture = async (file) => {
        const formData = new FormData();
        formData.append("profilePicture", file);
        formData.append("token", localStorage.getItem("token"));

        const response = await clientServer.post("/upload_profile_picture", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    };

    // Handle backdrop upload
    const updateBackdrop = async (file) => {
        const formData = new FormData();
        formData.append("backdrop", file);
        formData.append("token", localStorage.getItem("token"));

        try {
            await clientServer.post("/upload_backdrop_picture", formData, {  
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        } catch (error) {
            console.error("Failed to update backdrop:", error);
        }
    };

    const handleBackdropChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            updateBackdrop(file);
        }
    }



    const updateProfileData = async (profileData = userProfile) => {
        try {
            const response = await clientServer.post("update_profile_details", {
                token: localStorage.getItem("token"),
                name: profileData.userId.name,
                bio: profileData.bio,
                currentPost: profileData.currentPost,
                pastWork: profileData.pastWork,
                education: profileData.education
            });

            dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        } catch (error) {
            console.error("Failed to update profile:", error);
            throw error;
        }
    };

    //  Handle edit for work
    const handleEditWork = (index) => {
        const work = userProfile.pastWork[index];
        setInputData({ company: work.company, role: work.role, years: work.years });
        setEditingWorkIndex(index);
        setIsModalOpen(true);
    };

//    Handle delete for work
    const handleDeleteWork = async (index) => {
        if (!window.confirm("Are you sure you want to delete this work experience?")) return;
        setIsSaving(true);
        const updatedPastWork = userProfile.pastWork.filter((_, i) => i !== index);
        const updatedProfile = { ...userProfile, pastWork: updatedPastWork };
        setUserProfile(updatedProfile);

        try {
            await updateProfileData(updatedProfile);
        } catch (error) {
            setUserProfile(userProfile); // Revert on failure
            alert("Failed to delete work experience. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    //  Handle edit for education
    const handleEditEducation = (index) => {
        const edu = userProfile.education[index];
        setEducationInput({ institution: edu.institution, degree: edu.degree, fieldOfStudy: edu.fieldOfStudy });
        setEditingEducationIndex(index);
        setIsEducationModalOpen(true);
    };

    // Handle delete for education
    const handleDeleteEducation = async (index) => {
        if (!window.confirm("Are you sure you want to delete this education?")) return;
        setIsSaving(true);
        const updatedEducation = userProfile.education.filter((_, i) => i !== index);
        const updatedProfile = { ...userProfile, education: updatedEducation };
        setUserProfile(updatedProfile);

        try {
            await updateProfileData(updatedProfile);
        } catch (error) {
            setUserProfile(userProfile); // Revert on failure
            alert("Failed to delete education. Please try again.");
        } finally {
            setIsSaving(false);
        }
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
                {userProfile && userProfile.userId && (
                    <div className={styles.container}>
                        {/* Backdrop */}
                        <div className={styles.backDropContainer }
                            style={{
                                backgroundImage: userProfile.userId?.backdrop
                                    ? `url(${BASE_URL}/uploads/${userProfile.userId.backdrop})`
                                    : `url('https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg')`  // Fallback
                            }}>
                            <label htmlFor="backdropUpload" className={styles.backDrop_overlay_full}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    className={styles. backDropEditIcon}
                                >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                            </label>
                            <input
                                hidden
                                type="file"
                                id="backdropUpload"
                                onChange={handleBackdropChange}
                            />
                          
                            <label htmlFor="profilePictureUpload" className={styles.backDrop_overlay}>
                                <p>Edit</p>
                            </label>
                            <input
                                onChange={(e) => {
                                    updateProfilePicture(e.target.files[0]);
                                }}
                                hidden
                                type="file"
                                id="profilePictureUpload"
                            />
                            <img
                                className={styles.backDrop}
                                src={`${BASE_URL}/uploads/${userProfile.userId.profilePicture}`}
                                alt="backdrop"
                            />
                        </div>

                        {/* Profile Details */}
                        <div className={styles.profileContainer_details}>
                            <div style={{ display: "flex", gap: "0.7rem" }}>
                                <div style={{ flex: "0.8" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1.2rem" }}>
                                            <input
                                                className={styles.nameEdit}
                                                type="text"
                                                value={userProfile.userId.name}
                                                onChange={(e) => {
                                                    setUserProfile({ ...userProfile, userId: { ...userProfile.userId, name: e.target.value } });
                                                }}
                                            />
                                        </div>
                                       
                                        {/* <p style={{ color: "grey" }}>@{userProfile.userId.username}</p> */}
                                    </div>

                                    <div>
                                        <textarea
                                                value={userProfile.bio}
                                                placeholder="Add a bio to tell people more about you"
                                            onChange={(e) => {
                                                setUserProfile({ ...userProfile, bio: e.target.value });
                                            }}
                                            rows={Math.max(3, Math.ceil(userProfile.bio.length / 80))}
                                            style={{ width: "100%" }}
                                        />
                                    </div>
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
                       
                            <div className="workHistory">
                                <h4>Work History</h4>
                                <div className={styles.workHistoryContainer}>
                                    {userProfile.pastWork.map((work, index) => (
                                        <div key={index} className={styles.workHistoryCard}>
                                            <p
                                                style={{
                                                    fontWeight: "bold",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.8rem",
                                                }}
                                            >
                                                {work.company} - {work.role}
                                            </p>
                                            <p>{work.years}</p>
                                            {/* New: Edit and Delete buttons */}
                                            <div className={styles.iconActions}>
                                                <button
                                                    onClick={() => handleEditWork(index)}
                                                    className={styles.iconButton}
                                                    title="Edit"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                        className={styles.editIcon}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"
                                                        />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteWork(index)}
                                                    className={styles.iconButton}
                                                    title="Delete"
                                                    disabled={isSaving}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                        className={styles.deleteIcon}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14.25A2.25 2.25 0 0 1 15.75 22h-7.5A2.25 2.25 0 0 1 6 20.25L5 6" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                                                    </svg>
                                                </button>
                                            </div>

                                        </div>
                                    ))}

                                    <button
                                        className={styles.addEducationButton}
                                        onClick={() => {
                                            setIsModalOpen(true);
                                        }}
                                    >
                                       + Add Experience
                                    </button>
                                </div>
                            </div>
                       

                        {/* Education */}
                        
                            <div className={styles.education}>
                                <h4>Education</h4>
                                <div className={styles.educationContainer}>
                                    {userProfile.education.map((edu, index) => (
                                        <div key={index} className={styles.educationCard}>
                                            <p style={{ fontWeight: "bold" }}>
                                                {edu.institution}
                                            </p>
                                            <p>{edu.degree}</p>
                                            <p style={{ color: "gray" }}>{edu.fieldOfStudy}</p>
                                            {/* New: Edit and Delete buttons */}
                                            <div className= {styles.iconActions}>
                                                <button
                                                    onClick={() => handleEditEducation(index)}
                                                    className={styles.iconButton}
                                                    title="Edit"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                        className={styles.editIcon}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"
                                                        />
                                                    </svg>
                                                </button>
                                             
                                                <button
                                                    onClick={() => handleDeleteEducation(index)}
                                                    className={styles.iconButton}
                                                    title="Delete"
                                                    disabled={isSaving}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                        className={styles.deleteIcon}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14.25A2.25 2.25 0 0 1 15.75 22h-7.5A2.25 2.25 0 0 1 6 20.25L5 6" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
                                                    </svg>
                                                </button>
                                             
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        className={styles.addEducationButton}
                                        onClick={() => setIsEducationModalOpen(true)}
                                    >
                                        +  Add Education
                                    </button>
                                </div>
                            </div>
                       
                        {userProfile?.userId?._id === authState.user?._id && (
                            <div onClick={() => { updateProfileData(); }} className={styles.updateprofileBtn}>
                                Update Profile
                            </div>
                        )}
                    </div>
                )}

                {/* Work Modal */}
                {isModalOpen && (
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className={styles.commentsContainer}
                    >
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className={styles.allCommentsContainer}
                        >
                            <input
                                onChange={handleWorkInputChange}
                                name="company"
                                className={styles.inputField}
                                type="text"
                                placeholder="Add Company"
                                value={inputData.company}
                            />
                            <input
                                onChange={handleWorkInputChange}
                                name="role"
                                className={styles.inputField}
                                type="text"
                                placeholder="Your Role"
                                value={inputData.role}
                            />
                            <input
                                onChange={handleWorkInputChange}
                                name="years"
                                className={styles.inputField}
                                type="text"
                                placeholder="Year"
                                value={inputData.years}
                            />

                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    let updatedPastWork;
                                    if (editingWorkIndex !== null) {
                                        // Edit mode
                                        updatedPastWork = [...userProfile.pastWork];
                                        updatedPastWork[editingWorkIndex] = inputData;
                                    } else {
                                        // Add mode
                                        updatedPastWork = [...userProfile.pastWork, inputData];
                                    }
                                    const updatedProfile = { ...userProfile, pastWork: updatedPastWork };
                                    setUserProfile(updatedProfile);

                                    try {
                                        await updateProfileData(updatedProfile);
                                        setIsModalOpen(false);
                                        setInputData({ company: "", role: "", years: "" });
                                        setEditingWorkIndex(null);
                                    } catch (error) {
                                        setUserProfile(userProfile);
                                        alert("Failed to save work experience. Please try again.");
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                className={styles.updateprofileBtn}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : editingWorkIndex !== null ? "Update Work" : "Add Work"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Education Modal */}
                {isEducationModalOpen && (
                    <div
                        onClick={() => setIsEducationModalOpen(false)}
                        className={styles.commentsContainer}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={styles.allCommentsContainer}
                        >
                            <input
                                name="institution"
                                onChange={handleEducationChange}
                                className={styles.inputField}
                                placeholder="Institution"
                                value={educationInput.institution}
                            />

                            <input
                                name="degree"
                                onChange={handleEducationChange}
                                className={styles.inputField}
                                placeholder="Degree"
                                value={educationInput.degree}
                            />

                            <input
                                name="fieldOfStudy"
                                onChange={handleEducationChange}
                                className={styles.inputField}
                                placeholder="Field of Study"
                                value={educationInput.fieldOfStudy}
                            />

                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    let updatedEducation;
                                    if (editingEducationIndex !== null) {
                                        // Edit mode
                                        updatedEducation = [...userProfile.education];
                                        updatedEducation[editingEducationIndex] = educationInput;
                                    } else {
                                        // Add mode
                                        updatedEducation = [...userProfile.education, educationInput];
                                    }
                                    const updatedProfile = { ...userProfile, education: updatedEducation };
                                    setUserProfile(updatedProfile);

                                    try {
                                        await updateProfileData(updatedProfile);
                                        setIsEducationModalOpen(false);
                                        setEducationInput({ institution: "", degree: "", fieldOfStudy: "" });
                                        setEditingEducationIndex(null);
                                    } catch (error) {
                                        setUserProfile(userProfile);
                                        alert("Failed to save education. Please try again.");
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                className={styles.updateprofileBtn}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : editingEducationIndex !== null ? "Update Education" : "Add Education"}
                            </button>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </UserLayout>
    );
}

