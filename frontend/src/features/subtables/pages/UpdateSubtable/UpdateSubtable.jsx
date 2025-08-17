
import React, { useEffect, useState } from 'react';
import { useActionData,useLoaderData, useFetcher, useNavigate } from 'react-router';
import Modal from '#shared/components/UIElement/Modal/Modal';
import Input from '#shared/components/UIElement/Input/Input';
import Button from '#shared/components/UIElement/Button/Button';
import Form from '#shared/components/UIElement/Form/Form';
import Icon from '#shared/components/UIElement/Icon/Icon';
import './UpdateSubtable.css';

export default function UpdateSubtable() {


    const [nameError, setNameError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [message, setMessage] = useState(null);
    const nameCharacterLimit = 20;
    const descriptionCharacterLimit = 500;
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state === 'submitting';
    const {detailsData,iconData,bannerData} = useLoaderData();
    const [name, setName] = useState(detailsData.name);
    const [description, setDescription] = useState(detailsData.description);
    const [iconPreview, setIconPreview] = useState(iconData);
    const [bannerPreview, setBannerPreview] = useState(bannerData);
     const actionData = useActionData();
    const navigate = useNavigate();
    const handleNameChange = (e) => {
        let newName = e.target.value;
        if (newName.toLowerCase().startsWith('s/')) {
            newName = newName.substring(2);
        }
        if (newName.length <= nameCharacterLimit) {
            setName(newName);
        }
        if (message) setMessage(null);
        if (nameError) setNameError('');
    };
    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        if (newDescription.length <= descriptionCharacterLimit) {
            setDescription(newDescription);
        }
        if (descriptionError) {
            setDescriptionError('');
        }
        if (message) {
            setMessage(null);
        }
    };
    const handleFileChange = (e) => {
        const { name: inputName, files } = e.target;
        // console.log("inputName:", inputName);
        // console.log("files:", files);
        if (files && files[0]) {
            const file = files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPEG, PNG, GIF, WEBP).');
                e.target.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.');
                e.target.value = '';
                return;
            }
            const fileUrl = URL.createObjectURL(file);

            if (inputName === 'iconFile') {
                if (iconPreview) URL.revokeObjectURL(iconPreview); // Revoke old URL
                setIconPreview(fileUrl);
            } else if (inputName === 'bannerFile') {
                if (bannerPreview) URL.revokeObjectURL(bannerPreview); // Revoke old URL
                setBannerPreview(fileUrl);
            }
        } 
        else {
            if (inputName === 'iconFile') {
                if (iconPreview) URL.revokeObjectURL(iconPreview);
                setIconPreview(null);
            } else if (inputName === 'bannerFile') {
                if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                setBannerPreview(null);
            }
        }
    };
    // Effect for cleaning up Object URLs when previews change or component unmounts.
    useEffect(() => {
        const currentIconPreviewUrl = iconPreview;
        const currentBannerPreviewUrl = bannerPreview;

        return () => {
            if (currentIconPreviewUrl) {
                URL.revokeObjectURL(currentIconPreviewUrl);
            }
            if (currentBannerPreviewUrl) {
                URL.revokeObjectURL(currentBannerPreviewUrl);
            }
        };
    }, [iconPreview, bannerPreview]);

    const handleCancel = () => {
        navigate(-1); // Go back one step in history
    }
    // console.log("detailsDatakkkk:", detailsData);
    // console.log("iconDatakkk:", iconData);
    // console.log("bannerDatakkk:", bannerData);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const description = formData.get('description');
        const iconFile = formData.get('iconFile');
        const bannerFile = formData.get('bannerFile');
        const iconId = formData.get('iconId');
        const bannerId = formData.get('bannerId');
        console.log("name:", name);
        console.log("description:", description);
        console.log("iconFile:", iconFile);
        console.log("bannerFile:", bannerFile);
        console.log("iconId:", iconId);
        console.log("bannerId:", bannerId);

    }
   
    useEffect(() => {
        if (actionData?.status === 'success' && actionData?.redirect) {
            navigate(actionData.redirect);
        }
    }, [actionData, navigate]);


    return (

        <Form
            method="patch"
            encType="multipart/form-data"
            noValidate
            fetcher={fetcher}
            //onSubmit = {handleSubmit}
        >
        <div className="card p-3">
            <h1 className='mt-3 ms-3'>Update Subtable</h1>
            <p className='mt-3 ms-3'>This page will allow you to update an existing subtable.</p>
            {/* <input type="hidden" name="iconPrevious" value={iconData} /> 
            <input type="hidden" name="bannerPrevious" value={bannerData} />   */}
            
            <div>
                <Input
                    id="subtable-name"
                    name="name"
                    type="text"
                    label="Tên cộng đồng"
                    placeholder=" "
                    value={name}
                    onChange={handleNameChange}
                    required
                    disabled={isSubmitting}
                    addonBefore={<Icon name="community" size="16" />}
                    isInvalid={!!nameError}
                    feedback={nameError}
                />
                <div className="d-flex justify-content-between fs-8 mt-1">
                    <small className="text-muted ">
                        Tên cộng đồng bao gồm cả viết hoa không thể thay đổi.
                    </small>
                    <small className="text-muted">
                        s/{name} • {nameCharacterLimit - name.length} ký tự còn lại
                    </small>
                </div>
            </div>
            <div className="mt-3">
                <Input
                    id="subtable-description"
                    name="description"
                    type="textarea"
                    label="Mô tả (Tùy chọn)"
                    placeholder=" "
                    value={description}
                    onChange={handleDescriptionChange}
                    disabled={isSubmitting}
                    isInvalid={!!descriptionError}
                    feedback={descriptionError}
                    rows={4}
                />
                <small className="text-muted d-block text-end fs-8 mt-1 mb-3">
                    Đây là cách thành viên mới tìm hiểu về cộng đồng của bạn.
                    • {descriptionCharacterLimit - description.length} ký tự còn lại
                </small>
            </div>

            <div className="mb-4">
                <div className="border p-3 rounded mb-3">
                    <Input
                        id="subtable-icon-file"
                        name="iconFile"
                        type="file"
                        label="Biểu tượng"
                        showLabelForFile={true}
                        disabled={isSubmitting}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleFileChange}
                        required
                    />
                    {iconPreview && (
                        <div className="mt-2">
                            <img
                                src={iconPreview}
                                alt="Xem trước biểu tượng"
                                className="img-fluid rounded-circle d-block mx-auto create-subtable-icon-preview"
                            />
                        </div>
                    )}
                    <small className="text-muted d-block fs-8 mt-1">Kích thước đề xuất: 256x256px. Tối đa 5MB.</small>
                </div>

                <div className="border p-3 rounded">
                    <Input
                        id="subtable-banner-file"
                        name="bannerFile"
                        type="file"
                        label="Ảnh bìa"
                        showLabelForFile={true}
                        disabled={isSubmitting}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleFileChange}
                        required
                    />
                    {bannerPreview && (
                        <div className="mt-2">
                            <img
                                src={bannerPreview}
                                alt="Xem trước ảnh bìa"
                                className="img-fluid create-subtable-banner-preview"
                            />
                        </div>
                    )}
                    <small className="text-muted d-block fs-8 mt-1">Kích thước đề xuất: 1920x384px. Tối đa 5MB.</small>
                </div>
            </div>

            {/* <input type="hidden" name="subtableType" value={subtableType}/> */}

            {/* <div className="form-check form-switch mb-4 adult-content-switch">
                <input
                    className="form-check-input" type="checkbox" role="switch"
                    id="isNSFW" name="isNSFW" checked={isNSFW}
                    onChange={(e) => setIsNSFW(e.target.checked)}
                //disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="isNSFW">
                    <strong>Nội dung người lớn (18+)</strong>
                </label>
            </div> */}
            <input type="hidden" name="iconId" value={detailsData.icon} />
            <input type="hidden" name="bannerId" value={detailsData.banner} />
            <div className="card-footer justify-content-end d-flex p-2">
                <Button
                    onClick={handleCancel}
                    mainClass="write-comment-button"
                    addClass="cancel-button"
                    type="button"
                    disabled={isSubmitting}
                >
                    Hủy
                </Button>
                &nbsp;
                <Button
                    type="submit"
                    mainClass="write-comment-button"
                    addClass="submit-button"
                    disabled={isSubmitting}
                >
                    
                    {isSubmitting ? "Đang gửi..." : "Cập nhật"}
                </Button>
            </div>

        </div>
            

        </Form>
    );
}