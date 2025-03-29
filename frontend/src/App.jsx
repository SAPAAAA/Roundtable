import React from 'react';
import Header from '@layout/components/Header/Header';
import Footer from "@layout/components/Footer/Footer";
import Content from "@layout/components/Content/Content";

const App = () => {
    return (
        <div>
            <Header/>
            <Content/>
            <Footer/>
        </div>
    );
};

export default App;