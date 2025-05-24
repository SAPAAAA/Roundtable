import React, { useEffect, useState } from 'react';
import { useLoaderData, useNavigation, useParams, useFetcher } from 'react-router';
import Link from "#shared/components/Navigation/Link/Link";
import useAuth from "#hooks/useAuth.jsx";

import './SubtableView.css';
import ListPostPreviewSubtable from '#features/posts/components/ListPostPreviewSubtable/ListPostPreviewSubtable';
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import LoadingSpinner from '#shared/components/UIElement/LoadingSpinner/LoadingSpinner';
import Form from '#shared/components/UIElement/Form/Form';

export default function SubtableView() {
    // --- Hooks ---
    const { detailsData, postsData, iconData, bannerData, loaderError, joinData, login } = useLoaderData();
    // console.log("SubtableView detailsData:", detailsData);
    // console.log("SubtableView postsData:", postsData);
    // console.log("SubtableView loaderError:", loaderError);
    // console.log("SubtableView iconData:", iconData);
    // console.log("SubtableView bannerData:", bannerData);
    const navigation = useNavigation();
    const {user} = useAuth();
    const { subtableName: subtableNameFromParams } = useParams();

    const fetcher = useFetcher();
    const [checkYourSubtable, setCheckYourSubtable] = useState(false); // State to check if the post is from the current user
    const [sortType, setSortType] = useState('hot');

    // --- Render Component ---


    useEffect(() => {
            if(user?.userId && detailsData?.creatorUserId) // Ensure user and author are defined before comparison
            {
                if(user.userId === detailsData.creatorUserId) { // Check if the post is from the current user
        
                        setCheckYourSubtable(true); // Check if the post is from the current user
                    }
                else setCheckYourSubtable(false); // Post is not from the current user    
            }
        })
    console.log("login",login)
    const handleSortChange = (newSortType) => {
        console.log(`Changing sort type to: ${newSortType}`);
        setSortType(newSortType);
    };

    // --- Loading State ---
    const isLoading = navigation.state === 'loading';

    // --- Handle Loader Errors ---
    if (loaderError && !detailsData) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                Error loading subtable: {loaderError}
            </div>
        );
    }
    if (loaderError) {
        console.warn("SubtableView Loader Warning:", loaderError);
    }

    // --- Handle Not Found ---
    if (!isLoading && !detailsData) {
        return (
            <div className="alert alert-warning m-3" role="alert">
                Could not find subtable "{subtableNameFromParams}".
            </div>
        );
    }

    // --- Extract Data ---
    const subtableInfo = detailsData;
    const subtableDisplayName = subtableInfo?.name || subtableNameFromParams || "Subtable";
    const subtableAvatar = iconData;
    const subtableBanner = bannerData;

    // --- Prepare Posts Data using Destructuring (Keeping 'body') ---
    const posts = isLoading ? [] : (postsData || []).map((item) => {
        // Destructure author, and collect the rest into postDetails
        // 'body' will now be part of postDetails if it exists on item
        const { author, ...postDetails } = item;

        // Return the structure expected by ListPostPreviewSubtable/PostPreviewSubtable
        // The 'post' object now contains all properties from 'item' except 'author'
        // including 'body' if it was present.
        return {
            post: postDetails, // Spread the rest of the post properties (includes 'body')
            author: author
        };
    });

    // --- Quick Check: Does PostCore expect 'content' or 'body'? ---
    // Check PostCore.jsx: It looks for props.post.content
    // If PostCore *requires* a 'content' prop, you'll need to adjust PostCore
    // or map 'body' to 'content' here as done previously.
    // If PostCore can be modified to accept 'body', this mapping is fine.
    // Assuming for now PostCore needs 'content', let's revert slightly but keep the destructuring:

    /*
    // Alternative mapping if PostCore strictly needs 'content':
    const posts = isLoading ? [] : (postsData || []).map((item) => {
        const { author, body, ...otherPostDetails } = item; // Extract body explicitly
        return {
            post: { ...otherPostDetails, content: body }, // Map body to content
            author: author
        };
     });
    */
    // Let's proceed with the user's request to keep 'body' and assume PostCore will be adapted or already handles it.

    // --- Render Loading State ---
    if (isLoading) {
        return <LoadingSpinner message={`Loading s/${subtableNameFromParams}...`} />;
    }
    //console.log("subtable",subtableInfo)

    return (
        <Form
            method={joinData ? "delete" : "post"}
            action={`/s/${subtableDisplayName}`}
            preventNavigation={true}
            fetcher={fetcher}
        >

            <input name="subtableId" value={subtableInfo.subtableId} type="hidden" />


            {loaderError && (
                <div className="alert alert-warning alert-sm fs-8 m-3 p-2" role="alert">
                    Warning: {loaderError}
                </div>
            )}

            <div className='card'>
                <div className='Header d-flex justify-content-center align-items-center'>
                    <div className="avatarAndBanner w-100 h-100">
                        {subtableBanner ? (
                            <img src={subtableBanner} className="img-fluid object-fit-cover border rounded sizeBanner"
                                alt={`${subtableDisplayName} banner`} />
                        ) : (
                            <div className="sizeBanner banner-placeholder"></div>
                        )}
                        <div className='bg-white rounded-circle resizeAvatar d-flex justify-content-center align-items-center moveAvatar'>
                            <Avatar src={subtableAvatar} alt={`${subtableDisplayName} icon`} height={90} width={90} />
                        </div>
                        <div className='nameSubtable'>
                            s/{subtableDisplayName}
                        </div>
                        <div className='resizeButton d-flex justify-content-end align-items-center gap-2'>
                            {
                                checkYourSubtable ? (
                                    <>
                                        {login ? (
                                            <Link href={`/s/${subtableNameFromParams}/submit`} className="text-decoration-none">
                                                <Button addClass="designButtonCreatePost d-flex align-items-center">
                                                    <Icon name="plus" size="11px" addClass="me-1" />
                                                    Create Post
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/login" className="text-decoration-none">
                                                <Button addClass="designButtonCreatePost d-flex align-items-center">
                                                    <Icon name="plus" size="11px" addClass="me-1" />
                                                    Create Post
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={`/s/${subtableNameFromParams}/edit`} className="text-decoration-none">
                                            <Button addClass="designButtonCreatePost d-flex align-items-center">
                                                <Icon name="edit" size="11px" addClass="me-1" />
                                                Edit
                                            </Button>
                                        </Link>
                                        
                                    </>


                                ) : (
                                    <>
                                        {login ? (
                                            <Link href={`/s/${subtableNameFromParams}/submit`} className="text-decoration-none">
                                                <Button addClass="designButtonCreatePost d-flex align-items-center">
                                                    <Icon name="plus" size="11px" addClass="me-1" />
                                                    Create Post
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/login" className="text-decoration-none">
                                                <Button addClass="designButtonCreatePost d-flex align-items-center">
                                                    <Icon name="plus" size="11px" addClass="me-1" />
                                                    Create Post
                                                </Button>
                                            </Link>
                                        )}

                                        {/* Join Button */}
                                        {login ? (
                                            <Button addClass="text-white designButtonJoin" type='submit'>
                                                {joinData ? "Joined" : "Join"}
                                            </Button>
                                        ) : (
                                            <Link href="/login">
                                                <Button addClass="text-white designButtonJoin">
                                                    Join
                                                </Button>
                                            </Link>
                                        )}
                                        
                                    </>
                                )

                            }
                            <Button addClass="designButtonMore">
                                <Icon name="three_dots" size="15px" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='card-body'>
                    {/* Sorting/View buttons */}
                    <div className='reSizeButtonSort d-flex justify-content-between align-items-center mb-3'>
                        <div className="btn-group">
                            <Button
                                dataBsToggle="dropdown"
                                dataBsTrigger="hover focus"
                                tooltipTitle="Open sort options"
                                tooltipPlacement="top"
                                padding="2"
                                addClass="mostPost">
                                Best <Icon name="down" size="12px" addClass="ms-1" />
                            </Button>
                            <ul className="dropdown-menu resizeDropdown1">
                                <li className="sort d-flex justify-content-center align-items-center">Sort by</li>
                                {/* <li><a className="dropdown-item item d-flex justify-content-center align-items-center"
                                    href="#">Best</a></li> */}
                                <li><a className="dropdown-item item d-flex justify-content-center align-items-center"
                                    onClick={(e) => {e.preventDefault(); handleSortChange('hot');}} href="#">Hot</a></li>
                                <li><a className="dropdown-item item d-flex justify-content-center align-items-center"
                                    onClick={(e) => {e.preventDefault(); handleSortChange('new');}} href="#">New</a></li>
                                <li><a className="dropdown-item item d-flex justify-content-center align-items-center"
                                    onClick={(e) => {e.preventDefault(); handleSortChange('top');}} href="#">Top</a></li>
                                <li><a className="dropdown-item item d-flex justify-content-center align-items-center"
                                    onClick={(e) => {e.preventDefault(); handleSortChange('rising');}} href="#">Rising</a></li>
                            </ul>
                        </div>
                        <div className="btn-group">
                            <Button
                                dataBsToggle="dropdown"
                                dataBsTrigger="hover focus"
                                tooltipTitle="Change post view"
                                tooltipPlacement="top"
                                padding="2">
                                <Icon addClass="me-1" name="layout" size="15px" />
                                <Icon name="down" size="12px" />
                            </Button>
                            <ul className="dropdown-menu resizeDropdown2">
                                <li className="sort d-flex justify-content-center align-items-center">View</li>
                                <li><a className="dropdown-item item d-flex justify-content-between align-items-center"
                                    href="#">
                                    <Icon name="layout" size="15px" addClass="ms-0" />
                                    <div className="resizeMagin">Card</div>
                                </a></li>
                                <li>
                                    <a className="dropdown-item item d-flex justify-content-between align-items-center"
                                        href="#">
                                        <Icon name="menu" size="15px" addClass="ms-0" /> {/* Changed icon */}
                                        Compact
                                    </a>
                                </li>
                                {/* <li>
                                    <a className="dropdown-item item d-flex justify-content-between align-items-center"
                                        href="#">
                                        <Icon name="list" size="15px" addClass="ms-0" /> 
                                        Classic
                                    </a>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                    {/* Pass the processed posts array */}
                    {posts.length > 0 ? (
                        <ListPostPreviewSubtable posts={posts} />
                    ) : (
                        <p className="text-muted text-center">No posts found in this subtable yet.</p>
                    )}
                </div>
            </div>
        </Form>

    );
}