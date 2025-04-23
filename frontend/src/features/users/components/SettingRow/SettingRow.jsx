import React from "react";
import '../myprofile.css';

function SettingRow({imgUrl, title, describe, buttonContent}) {
    return (
        <tr>
            <td style={{width: "30px"}}>
                <img src={imgUrl} alt={title} className="icon_img"/>
            </td>
            <td>
                <div className="profile-info">
                    <h3>{title}</h3>
                    <p>{describe}</p>
                </div>
            </td>
            <td style={{width: "50px"}}>
                <button className="button-8" role="button">{buttonContent}</button>
            </td>
        </tr>
    );
}

export default SettingRow