import React from "react";
import '../myprofile.css';
import SettingRow from "../SettingRow/SettingRow";

function Setting() {
    return (
        <div className="setting">
            <h3>Setting</h3>
            <table>
                <SettingRow
                    imgUrl="https://images.icon-icons.com/2120/PNG/512/user_account_person_avatar_icon_131248.png"
                    title="Change avatar"
                    describe="Customize your profile"
                    buttonContent="change"
                />
                <SettingRow
                    imgUrl="https://images.icon-icons.com/3361/PNG/512/books_tags_labels_book_mark_banner_tag_label_bookmark_icon_210817.png"
                    title="Change banner"
                    describe="Customize your profile"
                    buttonContent="change"
                />
            </table>
        </div>
    );
}

export default Setting