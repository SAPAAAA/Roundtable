import editCommentAction from './editCommentAction.jsx';

export default async function manageCommentAction({request, params}) {
    const method = request.method.toLowerCase();
    switch (method) {
        case 'patch':
            return editCommentAction({request, params});
        default:
            return null;
    }
}
