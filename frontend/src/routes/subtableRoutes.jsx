import React, {lazy} from 'react';
import createPostLoader from "#features/posts/loaders/createPostLoader.jsx";
import createPostAction from "#features/posts/actions/createPostAction.jsx";
import createSubtableAction from "#features/subtables/components/CreateSubtableModal/createSubtableAction.jsx";
import subtableViewLoader from "#features/subtables/pages/SubtableView/subtableViewLoader.jsx";
import managefollowSubtableViewAction from "#features/subtables/pages/SubtableView/managefollowSubtableAction";
import updateSubtableAction from "#features/subtables/pages/UpdateSubtable/updateSubtableAction.jsx";
import updateSubtableLoader from "#features/subtables/pages/UpdateSubtable/updateSubtableLoader.jsx";

const SubtableView = lazy(() => import('#features/subtables/pages/SubtableView/SubtableView'));
const CreatePost = lazy(() => import('#features/posts/pages/CreatePost/CreatePost'));
const UpdateSubtable = lazy(() => import('#features/subtables/pages/UpdateSubtable/UpdateSubtable.jsx'));

function subtableRoutes() {
    return [
        {
            path: "/s/:subtableName",
            element: <SubtableView/>,
            loader: subtableViewLoader,
            action: managefollowSubtableViewAction
        },
        {
            path: "/s/:subtableName/submit",
            element: <CreatePost/>,
            loader: createPostLoader,
            action: createPostAction,
        },
        {
            path: "/s",
            action: createSubtableAction,
        },
        {
            path: "/s/:subtableName/edit",
            element: <UpdateSubtable/>,
            loader: updateSubtableLoader,
            action: updateSubtableAction
           
        }
    ]

}

export default subtableRoutes;