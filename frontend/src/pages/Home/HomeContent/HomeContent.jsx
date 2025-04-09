import React, {useEffect} from "react";

import ListPostPreview from "@features/posts/components/ListPostPreview/ListPostPreview";
import {useSidebar} from '@contexts/SidebarContext.jsx';
import homeSidebar from "@pages/Home/HomeSidebar/HomeSidebar";
import {Helmet} from "react-helmet";

export default function HomeContent() {
    const posts = [
        {
            subtable: {
                namespace: "AskAnything",
                avatar: {
                    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                }
            },
            id: 1,
            time: "1 hr. ago",
            title: "What is the most interesting fact you know?",
            content: "I'm curious to know what interesting facts you all know...",
            upvotes: 500,
            comments: 100,
        },
        {
            subtable: {
                namespace: "CoolTech",
                avatar: {
                    src: "https://images.unsplash.com/photo-1581091012184-7e0cdfbb6791?w=100&q=80"
                }
            },
            id: 2,
            time: "2 hr. ago",
            title: "What is the best tech stack for web development?",
            content: "I'm looking to start a new project and need some advice...",
            upvotes: 1000,
            comments: 200,
        },
        {
            subtable: {
                namespace: "CodeTalk",
                avatar: {
                    src: "https://images.unsplash.com/photo-1587620931283-d91f5f6d9984?w=100&q=80"
                }
            },
            id: 3,
            time: "3 hr. ago",
            title: "What is the best programming language to learn?",
            content: "I'm new to programming and want to learn a new language...",
            upvotes: 750,
            comments: 150,
        },
    ];

    const {setSidebarParts} = useSidebar();

    useEffect(() => {
        const {headerContent, bodyContent, footerContent} = homeSidebar;

        setSidebarParts({
            header: headerContent,
            body: bodyContent,
            footer: footerContent,
        });

        // Clear the sidebar when the component unmounts
        return () => setSidebarParts(null);
    }, [setSidebarParts]);


    return (
        <div>
            <Helmet>
                <title>Home</title>
                <meta name="description" content="Welcome to the home page!"/>
            </Helmet>
            <ListPostPreview posts={posts}/>
        </div>
    )
    //
    // const [formData, setFormData] = useState({
    //     username: '',
    //     password: ''
    // });
    //
    // const [isValid, setIsValid] = useState({
    //     username: false,
    //     password: false
    // });
    //
    // const handleChange = (e) => {
    //     const { id, value } = e.target;
    //     setFormData((prev) => ({
    //         ...prev,
    //         [id]: value
    //     }));
    //
    //     setIsValid((prev) => ({
    //         ...prev,
    //         [id]: value.trim() !== ''
    //     }));
    // };
    //
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     alert(`Logging in as ${formData.username}`);
    // };
    //
    // return (
    //     <Form
    //         id="login-form"
    //         mainClass="w-100 p-4 rounded shadow"
    //         addClass="p-3"
    //         onSubmit={handleSubmit}
    //         style={{ maxWidth: '400px', margin: 'auto' }}
    //     >
    //         <h2 className="mb-3">Login</h2>
    //
    //         <Input
    //             id="username"
    //             type="text"
    //             label="Username"
    //             placeholder="Enter your username"
    //             value={formData.username}
    //             onChange={handleChange}
    //             isValid={isValid.username}
    //             isInvalid={!isValid.username && formData.username !== ''}
    //             feedback="Username is required"
    //             addon={ <Icon name="person" size="20px"/> }
    //             required
    //         />
    //
    //         <Input
    //             id="password"
    //             type="password"
    //             label="Password"
    //             placeholder="Enter your password"
    //             value={formData.password}
    //             onChange={handleChange}
    //             isValid={isValid.password}
    //             isInvalid={!isValid.password && formData.password !== ''}
    //             feedback="Password is required"
    //             addon={ <Icon name="key" size="20px"/> }
    //             required
    //         />
    //
    //         <button type="submit" className="btn btn-primary w-100">
    //             Log In
    //         </button>
    //     </Form>
    // );

    // const handleConfirm = () => {
    //     console.log('Confirmed!');
    // };
    //
    // const handleCancel = () => {
    //     console.log('Cancelled!');
    // };
    //
    // return (
    //     <div>
    //         <Button
    //             id="openModalBtn"
    //             contentType="text"
    //             dataBsToggle="modal"
    //             dataBsTarget="#exampleModal"
    //             background={{ color: 'primary' }}
    //             padding="2"
    //         >
    //             Open Modal
    //         </Button>
    //         <Modal
    //             id="exampleModal"
    //             title="Sample Modal Title"
    //             footerButtons={[
    //                 <Button
    //                     key="cancel"
    //                     contentType="text"
    //                     onClick={handleCancel}
    //                     dataBsDismiss="modal"
    //                     outline={{ color: 'secondary' }}
    //                     padding="2"
    //                 >
    //                     <div className="d-flex align-items-center justify-content-center gap-2 px-2">
    //                         <span className="fs-6">Cancel</span>
    //                     </div>
    //                 </Button>,
    //                 <Button
    //                     key="confirm"
    //                     contentType="text"
    //                     onClick={handleConfirm}
    //                     background={{ color: 'primary' }}
    //                     padding="2"
    //                 >
    //                     <div className="d-flex align-items-center justify-content-center gap-2 px-2">
    //                         <Icon name="floppy" size="15px"/>
    //                         <span className="fs-6">Confirm</span>
    //                     </div>
    //                 </Button>,
    //             ]}
    //         >
    //             <p>This is a sample modal body. You can put any content here including forms, text, or images.</p>
    //         </Modal>
    //     </div>
    // );
}