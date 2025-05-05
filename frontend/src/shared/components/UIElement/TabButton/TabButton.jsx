import React from "react";
import './TabButton.css';

function TabButton({label, active, onClick}){
    return(
        <button
            className ={`tab-button${active? ' active':''}`}
            onClick={onClick}>
            {label}
        </button>
    );
};
export default TabButton;