import React,{useState} from "react";
import '../myprofile.css';
import TabButton from "../TabButton/TabButton";
function Tabs({onTabChange}){
    const [activeTab, setActiveTab] = useState("Overview")
    const changeTab = (newTab) => {
        setActiveTab(newTab)
        onTabChange(newTab);
    }
    return (
        <div className="tabs">
          <TabButton
            key={"Oveview"}
            label="Overview"
            active={activeTab === 'Overview'}
            onClick={() => changeTab('Overview')}
          />
          <TabButton
            key={"Posts"}
            label="Posts"
            active={activeTab === 'Posts'}
            onClick={() => changeTab('Posts')}
          />
          <TabButton
            key={"Comments"}
            label="Comments"
            active={activeTab === 'Comments'}
            onClick={() => changeTab('Comments')}
          />
          <TabButton
            key={"Saved"}
            label="Saved"
            active={activeTab === 'Saved'}
            onClick={() => changeTab('Saved')}
          />
          <TabButton
            key={"Hidden"}
            label="Hidden"
            active={activeTab === 'Hidden'}
            onClick={() => changeTab('Hidden')}
          />
          <TabButton
            key={"Upvoted"}
            label="Upvoted"
            active={activeTab === 'Upvoted'}
            onClick={() => changeTab('Upvoted')}
          />
          <TabButton
            key={"Downvoted"}
            label="Downvoted"
            active={activeTab === 'Downvoted'}
            onClick={() => changeTab('Downvoted')}
          />
        </div>
        );
    }
export default Tabs