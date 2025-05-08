// src/features/subtables/components/CreateSubtableModal/CreateSubtableModal.jsx
import React, {useCallback, useEffect, useState} from 'react';
import {useFetcher, useNavigate} from 'react-router';

import Modal from '#shared/components/UIElement/Modal/Modal';
import Input from '#shared/components/UIElement/Input/Input';
import Button from '#shared/components/UIElement/Button/Button';
import Form from '#shared/components/UIElement/Form/Form';
import Icon from '#shared/components/UIElement/Icon/Icon';

import './CreateSubtableModal.css';

export default function CreateSubtableModal({isOpen, onClose}) {
    const fetcher = useFetcher(); // Obtain the fetcher instance
    const navigate = useNavigate();
    const isSubmitting = fetcher.state === 'submitting';
    const actionData = fetcher.data;

    // State variables remain the same
    const [currentStep, setCurrentStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [subtableType, setSubtableType] = useState('public');
    const [isNSFW, setIsNSFW] = useState(false);
    const [message, setMessage] = useState(null);
    const [nameError, setNameError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [iconPreview, setIconPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const nameCharacterLimit = 20;
    const descriptionCharacterLimit = 500;

    // useEffect for resetting state when modal opens/closes (including previews)
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setName('');
            setDescription('');
            setSubtableType('public');
            setIsNSFW(false);
            setMessage(null);
            setNameError('');
            setDescriptionError('');
            setIconPreview(null);
            setBannerPreview(null);
            const iconInput = document.getElementById('subtable-icon-file');
            const bannerInput = document.getElementById('subtable-banner-file');
            if (iconInput) {
                iconInput.value = '';
            }
            if (bannerInput) {
                bannerInput.value = '';
            }
            if (fetcher.data) {
                fetcher.data = null;
            }
        } else {
            if (iconPreview) {
                URL.revokeObjectURL(iconPreview);
            }
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
        }
        return () => {
            if (iconPreview) {
                URL.revokeObjectURL(iconPreview);
            }
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [isOpen, fetcher, iconPreview, bannerPreview]);

    // useEffect for handling action results (remains the same)
    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                setMessage({type: 'success', text: actionData.message || 'Cộng đồng đã được tạo thành công!'});
                setTimeout(() => {
                    onClose();
                    const createdSubtable = actionData.subtable || actionData.data;
                    const createdName = createdSubtable?.name || name.trim();
                    if (createdName) {
                        navigate(`/s/${createdName}`);
                    } else {
                        navigate('/');
                    }
                }, 1500);
            } else {
                let errorMessage = actionData.message || 'Không thể tạo cộng đồng.';
                if (actionData.field === 'name') {
                    setNameError(errorMessage);
                } else if (actionData.field === 'description') {
                    setDescriptionError(errorMessage);
                } else {
                    setMessage({type: 'danger', text: errorMessage});
                }
            }
        }
    }, [actionData, onClose, navigate, name]);

    // Input change handlers (name, description) remain the same
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

    // File change handler for previews (remains the same)
    const handleFileChange = (e) => {
        const {name: inputName, files} = e.target;
        if (files && files[0]) {
            const file = files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPEG, PNG, GIF, WEBP).');
                e.target.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.');
                e.target.value = '';
                return;
            }
            const fileUrl = URL.createObjectURL(file);
            if (inputName === 'iconFile') {
                if (iconPreview) {
                    URL.revokeObjectURL(iconPreview);
                }
                setIconPreview(fileUrl);
            } else if (inputName === 'bannerFile') {
                if (bannerPreview) {
                    URL.revokeObjectURL(bannerPreview);
                }
                setBannerPreview(fileUrl);
            }
        } else if (inputName === 'iconFile') {
            if (iconPreview) {
                URL.revokeObjectURL(iconPreview);
            }
            setIconPreview(null);
        } else if (inputName === 'bannerFile') {
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
            setBannerPreview(null);
        }
    };

    // Validation and step navigation handlers (validateStep1, handleNext, handleBack) remain the same
    const validateStep1 = useCallback(() => {
        let isValid = true;
        let currentNameError = '';
        let currentDescriptionError = '';
        let currentName = name.trim();

        if (!currentName) {
            currentNameError = 'Tên cộng đồng là bắt buộc.';
            isValid = false;
        } else if (currentName.length < 3) {
            currentNameError = 'Tên phải dài từ 3 đến 21 ký tự.';
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(currentName)) {
            currentNameError = 'Chỉ bao gồm chữ cái, số và dấu gạch dưới.';
            isValid = false;
        } else if (currentName.length > nameCharacterLimit) {
            currentNameError = `Tên không được vượt quá ${nameCharacterLimit} ký tự.`;
            isValid = false;
        }

        if (description.length > descriptionCharacterLimit) {
            currentDescriptionError = `Mô tả không được vượt quá ${descriptionCharacterLimit} ký tự.`;
            isValid = false;
        }

        setNameError(currentNameError);
        setDescriptionError(currentDescriptionError);
        return isValid;
    }, [name, description, nameCharacterLimit, descriptionCharacterLimit]);

    const handleNext = () => {
        if (validateStep1()) {
            setCurrentStep(2);
            setMessage(null);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setMessage(null);
    };

    // handleSubmit remains the same
    const handleSubmit = (event) => {
        setMessage(null);
        const isStep1DataValid = validateStep1();

        if (!isStep1DataValid && currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 1 && !isStep1DataValid) {
            console.warn("Submit called on Step 1 with invalid data.");
        } else {
            setNameError('');
            setDescriptionError('');
            console.log("Client-side validation check passed or on Step 2. Allowing custom Form to submit.");
        }
        // No event.preventDefault() here; let the Form component handle submission based on its props
    };

    // renderStep1 remains the same (with Vietnamese text)
    const renderStep1 = () => (
        <>
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
                    addonBefore={<Icon name="community" size="16"/>}
                    isInvalid={!!nameError}
                    feedback={nameError}
                />
                <div className="d-flex justify-content-between fs-8 mt-1">
                    <small className="text-muted">
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
                <small className="text-muted d-block text-end fs-8 mt-1">
                    Đây là cách thành viên mới tìm hiểu về cộng đồng của bạn.
                    • {descriptionCharacterLimit - description.length} ký tự còn lại
                </small>
            </div>
        </>
    );

    // renderStep2 remains the same
    const renderStep2 = () => (
        <>
            {/* Hidden inputs to carry over data from step 1 */}
            <input type="hidden" name="name" value={name}/>
            <input type="hidden" name="description" value={description}/>

            <div className="mb-4">
                <h6 className="form-label-group">Giao diện (Tùy chọn)</h6>

                {/* Icon Upload */}
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
                    />
                    {/* Icon Preview */}
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

                {/* Banner Upload */}
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
                    />
                    {/* Banner Preview */}
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

            {/* Community Type */}
            <input type="hidden" name="subtableType" value={subtableType}/>

            {/* NSFW Toggle */}
            <div className="form-check form-switch mb-4 adult-content-switch">
                <input
                    className="form-check-input" type="checkbox" role="switch"
                    id="isNSFW" name="isNSFW" checked={isNSFW}
                    onChange={(e) => setIsNSFW(e.target.checked)}
                    disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="isNSFW">
                    <strong>Nội dung người lớn (18+)</strong>
                </label>
            </div>
        </>
    );

    // modalFooter remains the same (with Vietnamese text)
    const modalFooter = (
        <div className="d-flex justify-content-between gap-2 w-100">
            <Button
                onClick={onClose}
                type="button"
                addClass="btn-outline-secondary px-4 modal-button-custom"
                disabled={isSubmitting}
            >
                Hủy
            </Button>
            <div className="d-flex gap-2">
                {currentStep === 1 && (
                    <Button
                        onClick={handleNext}
                        type="button"
                        addClass="btn-primary px-4 modal-button-custom"
                        disabled={isSubmitting || !name.trim() || !!nameError || name.trim().length < 3 || name.trim().length > nameCharacterLimit || !!descriptionError}
                    >
                        Tiếp theo
                    </Button>
                )}
                {currentStep === 2 && (
                    <>
                        <Button
                            onClick={handleBack}
                            type="button"
                            addClass="btn-outline-secondary px-4 modal-button-custom"
                            disabled={isSubmitting}
                        >
                            Quay lại
                        </Button>
                        <Button
                            type="submit"
                            addClass="btn-primary px-4 modal-button-custom"
                            form="create-subtable-form"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang tạo...' : 'Tạo cộng đồng'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            id="create-subtable-modal"
            isOpen={isOpen}
            onClose={onClose}
            title="Tạo một cộng đồng"
            footer={modalFooter}
        >
            {/* Pass the fetcher instance and preventNavigation=true */}
            <Form
                id="create-subtable-form"
                method="post"
                action="/s"
                preventNavigation={true}
                fetcher={fetcher}
                mainClass="create-subtable-form-content"
                encType="multipart/form-data"
                onSubmit={handleSubmit}
                noValidate
            >
                {message && (
                    <div className={`alert alert-${message.type} mb-3`} role="alert">
                        {message.text}
                    </div>
                )}
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
            </Form>
        </Modal>
    );
}