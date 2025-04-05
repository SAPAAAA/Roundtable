import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "@pages/Home";
import RightSidebar from "@layout/components/RightSidebar/RightSidebar";
import Login from "@features/auth/pages/Login/Login";
import Register from "@features/auth/pages/Login/Register";


import "./Main.css";

export default function Main(props) {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <div id={props.id} className="d-flex flex-row mx-auto">
                        <main className="container-fluid mx-auto">
                            <Home />
                        </main>
                        <RightSidebar id="right-sidebar-container">
                            <div />
                        </RightSidebar>
                    </div>
                }/>
                <Route path="/comment" element={
                    <div id={props.id} className="d-flex flex-row mx-auto">
                        <main className="container-fluid mx-auto">
                            <Home/>
                        </main>
                        <RightSidebar id="right-sidebar-container">
                            <div/>
                        </RightSidebar>
                    </div>
                }/>
                <Route path="/register" element={
                    <div id={props.id} className="d-flex flex-row mx-auto">
                        <main className="container-fluid mx-auto">
                            <Register />
                        </main>
                    </div>
                }/>
                <Route path="/login" element={
                    <div id={props.id} className="d-flex flex-row mx-auto">
                        <main className="container-fluid mx-auto">
                            <Login />
                        </main>
                    </div>
                }/>
            </Routes>
        </BrowserRouter>
    );
}