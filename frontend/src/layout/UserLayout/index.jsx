import React from "react";
import NavbarComponent from "@/components/Navbar";

function UserLayout({children}){
    return(
        <div>
         <NavbarComponent/>
             {children} </div>
    )
}

export default UserLayout;