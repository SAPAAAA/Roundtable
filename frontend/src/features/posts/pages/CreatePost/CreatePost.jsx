import React, {useRef, useState} from "react";
// import TextEdit from "../../../../shared/components/TextEditter/TextEdit";
import TextEdit from "@shared/components/UIElement/TextEditor/TextEditor";
import Button from "@shared/components/UIElement/Button/Button";
import Icon from "@shared/components/UIElement/Icon/Icon";
import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import './CreatePost.css'

export default function CreatePost(props) {
    const [subtable, setSubtable] = useState(false)
    document.addEventListener("mousedown", function (event) {
        let excludedElement = document.getElementById("Subtable"); // Thay thế bằng ID phần tử bạn muốn loại trừ
        if (excludedElement && !excludedElement.contains(event.target)) {
            console.log("Người dùng đã bấm ra ngoài phần tử được chỉ định!");
            setSubtable(false)
        }
    });

    //const [selectSutableID,setSelectSubtableID] = useState(null)
    const [selectSutableName, setSelectSubtableName] = useState(null)
    const [selectSutableSrc, setSelectSubtableSrc] = useState(null)
    const [selectSutable, setSelectSubtable] = useState(false);

    const editorRef = useRef();

    const [subtableInputValue, setSubtableInputValue] = useState("");
    //console.log("Giá trị input:", subtableInputValue);

    const subString = (string) => {
        const sub = []
        for (let i = 0; i < string.length; i++) {
            for (let j = i + 1; j <= string.length; j++) {
                sub.push(string.slice(i, j))
            }
        }
        return sub
    }

    const filteredSubtables = props.subtable.filter((sub) => {
        const list = subString(subtableInputValue); // Hàm tạo danh sách các chuỗi con
        return list.some((element) =>
            sub.namespace.toLowerCase().includes(element.toLowerCase())
        );
    });

    // Loại bỏ trùng theo namespace (nếu cần)
    const uniqueSubtables = Array.from(
        new Map(filteredSubtables.map(item => [item.namespace, item])).values()
    );
    const deleteValue = () => {
        setSubtableInputValue("")
    }

    //console.log("Giá trị của subtable", filteredSubtables)

    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        const content = editorRef.current.getContent();
        const newPost = {
            username: selectSutableName,
            src: selectSutableSrc,
            title: title,
            link: link,
            content: content,
        }
        localStorage.setItem("post", JSON.stringify(newPost));
    }
    return (
        <>
            <form method="post" onSubmit={handleSubmit}>
                <div className="card">
                    <h3 className="front-bold ms-3 fs-6 mt-4"> Tạo bài đăng </h3>
                    {!subtable ? (
                        <Button
                            addClass="ConfigButton"
                            onClick={() => setSubtable(true)}
                        >
                            {selectSutable ? (
                                <>
                                    <Avatar
                                        addClass
                                        src={selectSutableSrc}
                                        alt={`u/KitDevAn`}
                                        width={20}
                                        height={20}/>
                                    <div className="ms-2 me-2">
                                        {`u/${selectSutableName}`}
                                    </div>

                                    <Icon
                                        name="down"
                                        size="10px"
                                    />
                                </>
                            ) : (
                                <>
                                    <Avatar
                                        addClass
                                        src={"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                                        alt={`u/KitDevAn`}
                                        width={20}
                                        height={20}/>
                                    <div className="ms-2  me-2">
                                        u/KitDevAn
                                    </div>

                                    <Icon
                                        name="down"
                                        size="10px"
                                    />
                                </>
                            )
                            }
                        </Button>
                    ) : (
                        <div className="rounded-pill d-flex  configsearch ms-3" id="Subtable">
                            <div className="ms-2 d-flex">
                                <Icon
                                    className="configIcon"
                                    name="search"
                                    size="15px"
                                />
                            </div>
                            <input
                                data-bs-toggle="dropdown"
                                type="text"
                                id="SubtableInput"
                                name="SubtableInput"
                                placeholder="Chọn cộng đồng"
                                className="border-0 configinputsearch "
                                value={subtableInputValue}
                                onChange={(e) => setSubtableInputValue(e.target.value)}
                            />

                            <ul class="dropdown-menu">
                                {
                                    //console.log(props.subtable)
                                    //filteredSubtables.subtable
                                    (uniqueSubtables.length > 0 ? uniqueSubtables : props.subtable).map((subtable, index) => (
                                        <li classname="dropdown-item" key={index}>
                                            <Button
                                                addClass="dissapear-background"
                                                onClick={() => {
                                                    // selectSutableID(1)
                                                    setSelectSubtableName(subtable.namespace)
                                                    setSelectSubtableSrc(subtable.avatar.src)
                                                    setSelectSubtable(true)
                                                    setSubtable(false)
                                                }}
                                            >
                                                <div className="d-flex align-items-center ms-2">
                                                    <Avatar
                                                        src={subtable.avatar.src}
                                                        //alt={`r/${props.comment.alt}`}
                                                        width={30}
                                                        height={30}
                                                    />
                                                    <div className="d-flex flex-column ms-2">
                                                        <div className="fs-7 text-start">
                                                            {subtable.namespace}
                                                        </div>
                                                        <div className="me-3">
                                                            <span className="text-muted fs-7">{subtable.members} thành viên</span>
                                                            &nbsp;•
                                                            <span className="text-muted fs-7">Đã đăng ký</span>

                                                        </div>
                                                    </div>
                                                </div>
                                            </Button>


                                        </li>
                                    ))
                                }
                            </ul>
                            <Button
                                onClick={deleteValue}
                            >
                                <Icon
                                    // className ="configIcon"
                                    name="close_cirle"
                                    size="15px"
                                />

                            </Button>

                        </div>

                    )

                    }

                    <div className="ms-3 me-3 mt-3">
                        <label for="title" class="form-label d-block fs-6">
                            Tiêu đề
                        </label>
                        <input
                            type="text"
                            placeholder="Tiêu đề*"
                            class="form-control d-inline mb-3 rounded-input rounded-pill"
                            id="title"
                            aria-describedby="basic-addon3"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required/>
                    </div>

                    <div className="ms-3 me-3">
                        <label for="title" class="form-label d-block fs-6">
                            Liên kết
                        </label>
                        <input
                            type="text"
                            placeholder="Liên kết*"
                            class="form-control d-inline mb-3 rounded-input rounded-pill"
                            id="link"
                            aria-describedby="basic-addon3"
                            name="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            required/>
                    </div>
                    <TextEdit ref={editorRef}/>
                    <div className="card-footer d-flex justify-content-end">
                        <Button
                            addClass="custom"
                            type="submit"
                        >Đăng</Button>

                    </div>

                </div>

            </form>
        </>
    )

}