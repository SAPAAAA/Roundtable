import React, {useEffect,forwardRef, useImperativeHandle} from "react";
import $ from "jquery";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.min.js";
// import "bootstrap-fileinput/css/fileinput.min.css";
// import "bootstrap-fileinput/js/fileinput.min.js";


// export default function TextEditor() {

//     useEffect(() => {
//         $("#summernote").summernote({
//             placeholder: "Please enter content ",
//             tabsize: 2,
//             height: 200,
//             toolbar: [
//                 // ["style", ["style"]],
//                 ["font", ["bold", "underline", "clear"]],
//                 // ["color", ["color"]],
//                 ["fontsize", ["fontsize"]],
//                 ["fontname", ["fontname"]],
//                 ["para", ["ul", "ol", "paragraph"]],
//                 // ["table", ["table"]],
//                 ["insert", ["link", "picture", "video"]],
//                 ["view", ["codeview", "help"]],
//             ],
//         });

//         return () => {
//             $("#summernote").summernote("destroy");
//         };
//     }, []);
//     return (
//         <>
//             <textarea id="summernote" name="content"></textarea>
//         </>
//     )
// }


const TextEditor = forwardRef((props, ref) => {
    useEffect(() => {
        $("#summernote").summernote({
            placeholder: "Please enter content",
            tabsize: 2,
            height: 200,
            toolbar: [
                ["font", ["bold", "underline", "clear"]],
                ["fontsize", ["fontsize"]],
                ["fontname", ["fontname"]],
                ["para", ["ul", "ol", "paragraph"]],
                ["insert", ["link", "picture", "video"]],
                ["view", ["codeview", "help"]],
            ],
        });

        return () => {
            $("#summernote").summernote("destroy");
        };
    }, []);

    // 👇 expose method getContent() ra bên ngoài
    useImperativeHandle(ref, () => ({
        getContent: () => {
            return $("#summernote").summernote("code");
        },
        reset: () => {
            $("#summernote").summernote("reset");
        }
    }));

    return <textarea id="summernote" name="content" />;
});

export default TextEditor;