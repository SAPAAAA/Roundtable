import './SubtableView.css'
import ListPostReview from '../../../posts/components/ListPostPreview/ListPostPreview'
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import {useParams} from 'react-router'
import subtableService from "#services/subtableService";
import {useState} from 'react'
import { useEffect } from 'react';
export default function SubtableView() {
    const [subtablename, setSubtableName] = useState("")
    const [subtableBanner, setSubtableBanner] = useState("")
    const [subtableAvatar, setSubtableAvatar] = useState("")
    const [posts, setPosts] = useState([])

    // console.log(subtable.banner)
    // console.log(posts)
   const {
        subtableName 
    } = useParams()
    //console.log(subtableName)
    useEffect(() => {
        const fetchSubtableDetails = async () => {
            //console.log("1111111111111111111") 
            try {
                const response = await subtableService.getSubtableDetails(subtableName);
                //console.log("responsellllllllll", response.data[0].subtable.iconURL)
                setSubtableName(response.data[0].subtable.name)
                setSubtableAvatar(response.data[0].subtable.iconUrl)
                setSubtableBanner(response.data[0].subtable.bannerUrl)
                // console.log("response", response.data[0].subtable.icon)
                // console.log("response", response.data[0].subtable.banner)
                const posts = response.data.map((item) => ({
                    
                        title: item.title,
                        content: item.body,
                        voteCount: item.voteCount,
                        authorAvatar: item.author.avatar,
                        authorName: item.author.displayName,

                }))
                setPosts(posts)
                
                //console.log(response.data[0])
                //setPosts(response.data[0].posts)
                //console.log("response", response.data)  
                //setSubtable(response.data)
            } catch (error) {
                console.error("Error fetching subtable details:", error);
            }
        };
        fetchSubtableDetails();
        
    },[]) 
    return (
        <>
            <div className='card'>
                <div className='Header d-flex justify-content-center align-items-center'>
                    <div className="avatarAndBanner w-100 h-100">
                        <img src={subtableBanner} class=" img-fluid object-fit-cover border rounded sizeBanner" alt="ảnh lỗi" />

                        <div className='bg-white rounded-circle resizeAvatar d-flex justify-content-center align-items-center moveAvatar'>
                            <Avatar src={subtableAvatar} alt="ảnh lỗi" height={90} width={90} />
                        </div>
                        <div className='nameSubtable'>
                            {subtablename}
                        </div>

                        <div className='resizeButton d-flex justify-content-between align-items-center'>
                            <Button addClass="designButtonCreatePost">
                                <Icon
                                    name="plus"
                                    size="11px"
                                    addClass="me-1"
                                />
                                Tạo bài đăng
                            </Button>
                            <Button
                                addClass="text-white designButtonJoin"
                            >
                                Tham gia
                            </Button>
                            <Button addClass="designButtonMore">
                                <Icon
                                    name="three_dots"
                                    size="15px"
                                />

                            </Button>
                        </div>

                    </div>





                </div>
                <div className='card-body'>
                    <div className='reSizeButtonSort d-flex justify-content-between align-items-center'>
                        <div className="btn-group">
                            <Button
                                dataBsToggle="dropdown"
                                dataBsTrigger="hover focus"
                                tooltipTitle="Mở tùy chọn sắp xếp"
                                tooltipPlacement="top"
                                padding="2"
                                addClass="mostPost">

                                Hay nhất
                                <Icon
                                    name="down"
                                    size="12px"
                                    addClass="ms-1"
                                />

                            </Button>
                            <ul class="dropdown-menu resizeDropdown1">
                                <li className="sort d-flex justify-content-center align-items-center">Sắp xếp theo</li>
                                <li><a class="dropdown-item item d-flex justify-content-center align-items-center" href="#">Hay nhất</a></li>
                                <li><a class="dropdown-item item d-flex justify-content-center align-items-center" href="#">Hot</a></li>
                                <li><a class="dropdown-item item d-flex justify-content-center align-items-center" href="#">Mới nhất</a></li>
                                <li><a class="dropdown-item item d-flex justify-content-center align-items-center" href="#">Hàng đầu</a></li>
                                <li><a class="dropdown-item item d-flex justify-content-center align-items-center" href="#">Đang nổi</a></li>
                            </ul>

                        </div>
                        <div className="btn-group">
                            <Button
                                dataBsToggle="dropdown"
                                dataBsTrigger="hover focus"
                                tooltipTitle="Thay đổi chế độ xem bài đăng"
                                tooltipPlacement="top"
                                padding="2"
                            >
                                <Icon
                                    addClass="me-1"
                                    name="layout"
                                    size="15px"
                                />
                                <Icon
                                    name="down"
                                    size="12px"
                                />

                            </Button>

                            <ul class="dropdown-menu resizeDropdown2">
                                <li className="sort d-flex justify-content-center align-items-center">Chế độ xem</li>
                                <li><a class="dropdown-item item d-flex justify-content-between align-items-center " href="#">
                                <Icon
                                                        name="layout"
                                                        size="15px"
                                                        addClass="ms-0"
                                                    />
                                <div className="resizeMagin">
                                Thẻ
                                </div>
                                </a></li>
                                <li>
                                    <a class="dropdown-item item d-flex justify-content-between align-items-center " href="#">
                                    <Icon
                                                        name="layout"
                                                        size="15px"
                                                         addClass="ms-0"
                                                    />
                                Thu gọn
                                    </a>
                                </li>
                                

                            </ul>
                        </div>



                    </div>
                    <ListPostReview posts={posts} />
                </div>
            </div>
        </>
    )
}